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
    { id: 1778822737101, name: "Shopee Easy", amount: 371061, type: "owe",  note: "",                                           settled: false },
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

function isDebtSettlementTransactionForDebt(t, debt) {
  if (!t || !debt) return false;

  const debtId = String(debt.id);
  if (t.debtId != null && String(t.debtId) === debtId) return true;

  const txId = String(t.id ?? "");
  if (txId === `settle-${debtId}` || txId === `settle-backfill-${debtId}`) return true;

  const expectedType = debt.type === "owe" ? "expense" : "income";
  const expectedCat = debt.type === "owe" ? "Trả nợ" : "Thu nhập";
  const expectedDesc = debt.type === "owe" ? `Trả nợ ${debt.name}` : `Thu nợ ${debt.name}`;
  return (
    t.type === expectedType &&
    t.cat === expectedCat &&
    String(t.desc || "").trim() === expectedDesc &&
    (Number(t.amount) || 0) === (Number(debt.amount) || 0)
  );
}

function getMonthlyBalance(transactions, viewYear, viewMonth) {
  const monthStart = new Date(viewYear, viewMonth, 1);
  const nextMonthStart = new Date(viewYear, viewMonth + 1, 1);
  let openingBalance = 0;
  let income = 0;
  let expense = 0;

  transactions.forEach(t => {
    const d = new Date((t.date || "") + "T00:00:00");
    if (Number.isNaN(d.getTime())) return;

    const amount = Number(t.amount) || 0;
    const signedAmount = t.type === "income" ? amount : t.type === "expense" ? -amount : 0;

    if (d < monthStart) {
      openingBalance += signedAmount;
      return;
    }

    if (d >= monthStart && d < nextMonthStart) {
      if (t.type === "income") income += amount;
      if (t.type === "expense") expense += amount;
    }
  });

  const periodBalance = income - expense;
  return {
    openingBalance,
    periodBalance,
    closingBalance: openingBalance + periodBalance,
  };
}

function App() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [debts, setDebts]       = useState([]);
  const [budgets, setBudgets]   = useState([]);
  const [goals, setGoals]       = useState([]);
  const [notes, setNotes]       = useState("");
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
        const nts  = d.notes   || "";
        const openDebtSettlements = result.filter(t =>
          dbts.some(debt => !debt.settled && isDebtSettlementTransactionForDebt(t, debt))
        );
        const cleanedResult = openDebtSettlements.length
          ? result.filter(t => !dbts.some(debt => !debt.settled && isDebtSettlementTransactionForDebt(t, debt)))
          : result;
        const missingSettlementTxs = dbts
          .filter(debt => debt.settled && debt.paidDate && !cleanedResult.some(t => isDebtSettlementTransactionForDebt(t, debt)))
          .map(debt => debtSettlementTransaction(debt, debt.paidDate, "settle-backfill"));
        const txns = missingSettlementTxs.length ? [...missingSettlementTxs, ...cleanedResult] : cleanedResult;
        setAllTransactions(txns);
        setDebts(dbts);
        setBudgets(bdgs);
        setGoals(gls);
        setNotes(nts);
        setLoaded(true);
        if (changed || missingSettlementTxs.length || openDebtSettlements.length) {
          window._fsDoc.set({ transactions: txns, debts: dbts, budgets: bdgs, goals: gls, notes: nts }, { merge: true });
        }
      } else {
        setAllTransactions(_SEED.transactions);
        setDebts(_SEED.debts);
        setBudgets([]);
        setGoals(DEFAULT_GOALS);
        setNotes("");
        setLoaded(true);
        window._fsDoc.set({ transactions: _SEED.transactions, debts: _SEED.debts, budgets: [], goals: DEFAULT_GOALS, notes: "" });
      }
    }, err => console.error("Firebase error:", err));

    return () => unsub();
  }, []);

  const persist = useCallback((txns, dbts, bdgs, gls) => {
    if (window._fsDoc) {
      window._fsDoc.set({ transactions: txns, debts: dbts, budgets: bdgs, goals: gls }, { merge: true }).catch(console.error);
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
    const debt = debts.find(d => d.id === id);
    const next = debts.filter(d => d.id !== id);
    const nextTransactions = debt
      ? allTransactions.filter(t => !isDebtSettlementTransactionForDebt(t, debt))
      : allTransactions.filter(t => t.debtId !== id);
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
    const nextTransactions = allTransactions.filter(t => !isDebtSettlementTransactionForDebt(t, debt));

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
    const nextTransactions = allTransactions.some(t => isDebtSettlementTransactionForDebt(t, debt))
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

  const saveNotes = useCallback((nextNotes) => {
    setNotes(nextNotes);
    if (window._fsDoc) {
      window._fsDoc.set({ notes: nextNotes }, { merge: true }).catch(console.error);
    }
  }, []);

  // Filter transactions for viewed month
  const monthTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const d = new Date(t.date + "T00:00:00");
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });
  }, [allTransactions, viewMonth, viewYear]);

  const monthlyBalance = useMemo(() => (
    getMonthlyBalance(allTransactions, viewYear, viewMonth)
  ), [allTransactions, viewYear, viewMonth]);

  if (!loaded) return <AppSkeleton />;

  const PageComponents = { overview: Overview, transactions: Transactions, debts: Debts, budget: Budget, notes: Notes };
  const PageEl = PageComponents[page];
  const pageProps = {
    transactions:     monthTransactions,
    allTransactions,
    debts,
    budgets,
    goals,
    notes,
    viewMonth,
    viewYear,
    monthLabel,
    openingBalance:      monthlyBalance.openingBalance,
    periodBalance:       monthlyBalance.periodBalance,
    closingBalance:      monthlyBalance.closingBalance,
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
    onSaveNotes:         saveNotes,
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
