// Root app — Firebase connection + state management
// (useState, useEffect, useMemo, useRef, useCallback are globally declared in components.jsx)

const _SEED = {
  transactions: [
    { id: 1778822968346, type: "expense", desc: "tiền trọ, điện, nước, điều hòa, dịch vụ", amount: 2150000, cat: "Thuê trọ",  date: "2026-05-15" },
    { id: 1778822564137, type: "income",  desc: "tiền tài khoản từ trước đó",               amount: 2126000, cat: "Thu nhập", date: "2026-05-15" },
    { id: 1778820901654, type: "income",  desc: "đổi từ tài khoản ra tiền mặt",             amount:  300000, cat: "Thu nhập", date: "2026-05-15" },
    { id: 1778820850607, type: "income",  desc: "anh chị cho",                               amount:  200000, cat: "Thu nhập", date: "2026-05-15" },
    { id: 1778820461601, type: "income",  desc: "bố chuyển",                                 amount: 3000000, cat: "Thu nhập", date: "2026-05-15" },
    { id: 1778820411461, type: "expense", desc: "du lịch Hạ Long",                           amount: 2856000, cat: "Du lịch",  date: "2026-05-15" },
    { id: 1778818830478, type: "expense", desc: "Tiktok",                                     amount:   20000, cat: "Mua sắm",  date: "2026-05-15" },
    { id: 1778818766842, type: "expense", desc: "Claude AI",                                  amount:  600000, cat: "Học tập",  date: "2026-05-15" },
    { id: 1778818538887, type: "expense", desc: "bún chả, nước lọc",                         amount:   50000, cat: "Ăn uống",  date: "2026-05-15" },
    { id: 1778781242777, type: "income",  desc: "tiền còn dư từ tháng trc",                  amount:    3220, cat: "Thu nhập", date: "2026-05-15" },
    { id: 1778781183955, type: "expense", desc: "mỳ tôm, nước lọc, sữa fami",               amount:   50000, cat: "Ăn uống",  date: "2026-05-15" },
    { id: 1778781118116, type: "expense", desc: "Bún cá",                                     amount:   25000, cat: "Ăn uống",  date: "2026-05-15" },
    { id: 1778781069446, type: "income",  desc: "Mama Bank",                                  amount: 1000000, cat: "Thu nhập", date: "2026-05-15" },
  ],
  debts: [
    { id: 1778822737101, name: "Shopee Easy", amount: 370080, type: "owe",  note: "",                                           settled: false },
    { id: 1778781331331, name: "Ngân Thuân",  amount: 1356000, type: "owe", note: "tiền du lịch Hạ Long còn thiếu",            settled: false },
    { id: 1778781003635, name: "Phú Sen",     amount: 140000,  type: "owe", note: "Tiền ăn + nước trên Vịnh Hạ Long",         settled: false },
    { id: 1778780911964, name: "Hân",         amount: 77000,   type: "lend", note: "50k phở hồ Gươm, 12k nước cam, 15k kem",  settled: false },
  ],
};

const firebaseConfig = {
  apiKey:            "AIzaSyATjEaKR5cpIhWTLTzmdKIiMV0ZDPT07xI",
  authDomain:        "taichinhhiewu.firebaseapp.com",
  projectId:         "taichinhhiewu",
  storageBucket:     "taichinhhiewu.firebasestorage.app",
  messagingSenderId: "742826409088",
  appId:             "1:742826409088:web:b072bdc22a9acc0ec4fa65",
};

const DEFAULT_GOALS = [
  { id: 1, emoji: "💻", color: "#0A84FF", name: "MacBook Air M4",       current: 3200000, target: 28000000, monthly: 500000 },
  { id: 2, emoji: "🏖️", color: "#FF9500", name: "Đi Đà Lạt cuối năm", current: 1100000, target: 3500000,  monthly: 600000 },
];

function localDateKey(dateLike = new Date()) {
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return localDateKey(new Date());
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function debtSettlementTransaction(debt, paidDate = new Date(), idPrefix = "settle") {
  return {
    id: `${idPrefix}-${debt.id}`,
    debtId: debt.id,
    type: debt.type === "owe" ? "expense" : "income",
    desc: debt.type === "owe" ? `Trả nợ ${debt.name}` : `Thu nợ ${debt.name}`,
    amount: debt.amount,
    cat: debt.type === "owe" ? "Trả nợ" : "Thu nhập",
    date: localDateKey(paidDate),
  };
}

function App() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [debts, setDebts]       = useState([]);
  const [budgets, setBudgets]   = useState([]);
  const [goals, setGoals]       = useState([]);
  const [loaded, setLoaded]     = useState(false);
  const [page, setPage]         = useState("overview");
  const [theme, setTheme]       = useState(() => localStorage.getItem("hieu-theme") || "light");
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month

  // Compute viewed month
  const now = new Date();
  const viewDate  = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const viewMonth = viewDate.getMonth();
  const viewYear  = viewDate.getFullYear();
  const monthLabel = `Tháng ${viewMonth + 1}, ${viewYear}`;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("hieu-theme", theme);
  }, [theme]);

  useEffect(() => {
    try { firebase.initializeApp(firebaseConfig); } catch (_) { /* already initialized */ }
    const db = firebase.firestore();
    window._fsDoc = db.collection("fintrack").doc("hiewu");

    const unsub = window._fsDoc.onSnapshot(snap => {
      if (snap.exists) {
        const d = snap.data();
        const { result, changed } = migrateCats(d.transactions || []);
        const dbts = d.debts   || [];
        const bdgs = d.budgets || [];
        const gls  = d.goals   || DEFAULT_GOALS;
        const missingSettlementTxs = dbts
          .filter(debt => debt.settled && debt.paidDate && !result.some(t => t.debtId === debt.id))
          .map(debt => debtSettlementTransaction(debt, debt.paidDate, "settle-backfill"));
        const txns = missingSettlementTxs.length ? [...missingSettlementTxs, ...result] : result;
        setAllTransactions(txns);
        setDebts(dbts);
        setBudgets(bdgs);
        setGoals(gls);
        setLoaded(true);
        if (changed || missingSettlementTxs.length) {
          window._fsDoc.set({ transactions: txns, debts: dbts, budgets: bdgs, goals: gls });
        }
      } else {
        setAllTransactions(_SEED.transactions);
        setDebts(_SEED.debts);
        setBudgets([]);
        setGoals(DEFAULT_GOALS);
        setLoaded(true);
        window._fsDoc.set({ transactions: _SEED.transactions, debts: _SEED.debts, budgets: [], goals: DEFAULT_GOALS });
      }
    }, err => console.error("Firebase error:", err));

    return () => unsub();
  }, []);

  const persist = useCallback((txns, dbts, bdgs, gls) => {
    if (window._fsDoc) {
      window._fsDoc.set({ transactions: txns, debts: dbts, budgets: bdgs, goals: gls }).catch(console.error);
    }
  }, []);

  // ── Transaction CRUD ──
  const addTransaction = useCallback((tx) => {
    const next = [{ ...tx, id: Date.now() }, ...allTransactions];
    setAllTransactions(next);
    persist(next, debts, budgets, goals);
  }, [allTransactions, debts, budgets, goals, persist]);

  const updateTransaction = useCallback((id, patch) => {
    const next = allTransactions.map(t => (
      t.id === id ? { ...t, ...patch, amount: Number(patch.amount) || t.amount } : t
    ));
    setAllTransactions(next);
    persist(next, debts, budgets, goals);
  }, [allTransactions, debts, budgets, goals, persist]);

  const deleteTransaction = useCallback((id) => {
    const next = allTransactions.filter(t => t.id !== id);
    setAllTransactions(next);
    persist(next, debts, budgets, goals);
  }, [allTransactions, debts, budgets, goals, persist]);

  // ── Debt CRUD ──
  const addDebt = useCallback((debt) => {
    const next = [...debts, { ...debt, id: Date.now() }];
    setDebts(next);
    persist(allTransactions, next, budgets, goals);
  }, [allTransactions, debts, budgets, goals, persist]);

  const deleteDebt = useCallback((id) => {
    const next = debts.filter(d => d.id !== id);
    const nextTransactions = allTransactions.filter(t => t.debtId !== id);
    setDebts(next);
    setAllTransactions(nextTransactions);
    persist(nextTransactions, next, budgets, goals);
  }, [allTransactions, debts, budgets, goals, persist]);

  const updateDebt = useCallback((id, patch) => {
    const current = debts.find(d => d.id === id);
    if (!current) return;

    const updated = { ...current, ...patch, amount: Number(patch.amount) || current.amount };
    const nextDebts = debts.map(d => d.id === id ? updated : d);
    const nextTransactions = allTransactions.map(t => (
      t.debtId === id
        ? {
            ...t,
            type: updated.type === "owe" ? "expense" : "income",
            desc: updated.type === "owe" ? `Trả nợ ${updated.name}` : `Thu nợ ${updated.name}`,
            amount: updated.amount,
            cat: updated.type === "owe" ? "Trả nợ" : "Thu nhập",
          }
        : t
    ));

    setDebts(nextDebts);
    setAllTransactions(nextTransactions);
    persist(nextTransactions, nextDebts, budgets, goals);
  }, [allTransactions, debts, budgets, goals, persist]);

  const reopenDebt = useCallback((id) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;

    const nextDebts = debts.map(d => (
      d.id === id ? { ...d, settled: false, paidDate: null } : d
    ));
    const nextTransactions = allTransactions.filter(t => t.debtId !== id);

    setDebts(nextDebts);
    setAllTransactions(nextTransactions);
    persist(nextTransactions, nextDebts, budgets, goals);
  }, [allTransactions, debts, budgets, goals, persist]);

  const settleDebt = useCallback((id) => {
    const debt = debts.find(d => d.id === id);
    if (!debt || debt.settled) return;

    const now = new Date();
    const settlementTx = debtSettlementTransaction(debt, now);
    const nextDebts = debts.map(d => d.id === id ? { ...d, settled: true, paidDate: now.toISOString() } : d);
    const nextTransactions = allTransactions.some(t => t.debtId === id)
      ? allTransactions
      : [settlementTx, ...allTransactions];

    setDebts(nextDebts);
    setAllTransactions(nextTransactions);
    persist(nextTransactions, nextDebts, budgets, goals);
  }, [allTransactions, debts, budgets, goals, persist]);

  // ── Budget CRUD ──
  const saveBudget = useCallback((cat, cap) => {
    const exists = budgets.some(b => b.cat === cat);
    const next = exists
      ? budgets.map(b => b.cat === cat ? { ...b, cap } : b)
      : [...budgets, { cat, cap }];
    setBudgets(next);
    persist(allTransactions, debts, next, goals);
  }, [allTransactions, debts, budgets, goals, persist]);

  const deleteBudget = useCallback((cat) => {
    const next = budgets.filter(b => b.cat !== cat);
    setBudgets(next);
    persist(allTransactions, debts, next, goals);
  }, [allTransactions, debts, budgets, goals, persist]);

  // ── Goal CRUD ──
  const saveGoal = useCallback((goal) => {
    const exists = goals.some(g => g.id === goal.id);
    const next = exists
      ? goals.map(g => g.id === goal.id ? goal : g)
      : [...goals, goal];
    setGoals(next);
    persist(allTransactions, debts, budgets, next);
  }, [allTransactions, debts, budgets, goals, persist]);

  const deleteGoal = useCallback((id) => {
    const next = goals.filter(g => g.id !== id);
    setGoals(next);
    persist(allTransactions, debts, budgets, next);
  }, [allTransactions, debts, budgets, goals, persist]);

  // Filter transactions for viewed month
  const monthTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const d = new Date(t.date + "T00:00:00");
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });
  }, [allTransactions, viewMonth, viewYear]);

  if (!loaded) return <AppSkeleton />;

  const PageComponents = { overview: Overview, transactions: Transactions, debts: Debts, budget: Budget };
  const PageEl = PageComponents[page];
  const pageProps = {
    transactions:     monthTransactions,
    allTransactions,
    debts,
    budgets,
    goals,
    viewMonth,
    viewYear,
    monthLabel,
    onAddTransaction:    addTransaction,
    onUpdateTransaction: updateTransaction,
    onDeleteTransaction: deleteTransaction,
    onAddDebt:           addDebt,
    onUpdateDebt:        updateDebt,
    onDeleteDebt:        deleteDebt,
    onSettleDebt:        settleDebt,
    onReopenDebt:        reopenDebt,
    onSaveBudget:        saveBudget,
    onDeleteBudget:      deleteBudget,
    onSaveGoal:          saveGoal,
    onDeleteGoal:        deleteGoal,
    onNavigate:          setPage,
  };

  return (
    <div className="app">
      <Sidebar active={page} onChange={setPage} theme={theme} onTheme={setTheme} debts={debts} />
      <main className="main">
        <Toolbar
          activePage={page}
          month={monthLabel}
          onMonthChange={(d) => setMonthOffset(m => Math.max(0, m + d))}
        />
        <PageEl key={page} {...pageProps} />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
