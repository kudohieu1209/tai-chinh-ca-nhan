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

const LOCAL_DATA_KEY = "fintrack-local-data-v1";

function seedData() {
  return {
    transactions: _SEED.transactions,
    debts: _SEED.debts,
    budgets: [],
    goals: DEFAULT_GOALS,
    notes: "",
  };
}

function readLocalData() {
  try {
    const raw = localStorage.getItem(LOCAL_DATA_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.warn("Local data unavailable:", err);
    return null;
  }
}

function saveLocalData(data) {
  try {
    localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn("Local data save failed:", err);
  }
}

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
  // Where the currently shown data came from: "remote" (live Firestore),
  // "local" (cached backup), or "seed" (built-in sample — DB unreachable).
  const [dataSource, setDataSource] = useState("remote");
  const [page, setPage]         = useState("overview");
  const [theme, setTheme]       = useState(() => localStorage.getItem("hieu-theme") || "light");
  const [lang, setLang]         = useState(() => localStorage.getItem("hieu-lang") || "vi");
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month
  // Bumped whenever the shared CATEGORIES map is rebuilt so all pages re-render
  const [, setCatsVersion] = useState(0);

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
    localStorage.setItem("hieu-lang", lang);
  }, [lang]);

  useEffect(() => {
    // persistLocal: only cache to localStorage when the data is trustworthy
    // (live remote data, or the user's own local backup). Never overwrite the
    // local backup with built-in seed data — that would destroy the only
    // surviving copy if the database is temporarily unreachable.
    const hydrate = (data = {}, { persistLocal = true } = {}) => {
      setCategories(data.categories);
      setCatsVersion(v => v + 1);
      const { result, changed } = migrateCats(data.transactions || []);
      const dbts = data.debts   || [];
      const bdgs = data.budgets || [];
      const gls  = data.goals   || DEFAULT_GOALS;
      const nts  = data.notes   || "";
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
      if (persistLocal) {
        saveLocalData({ categories: Object.values(CATEGORIES), transactions: txns, debts: dbts, budgets: bdgs, goals: gls, notes: nts });
      }
      return { txns, dbts, bdgs, gls, nts, changed, missingSettlementTxs, openDebtSettlements };
    };

    try { firebase.initializeApp(firebaseConfig); } catch (_) { /* already initialized */ }
    const db = firebase.firestore();
    window._fsDoc = db.collection("fintrack").doc("hiewu");

    const unsub = window._fsDoc.onSnapshot(snap => {
      if (snap.exists) {
        setDataSource("remote");
        const { txns, dbts, bdgs, gls, nts, changed, missingSettlementTxs, openDebtSettlements } = hydrate(snap.data());
        if (changed || missingSettlementTxs.length || openDebtSettlements.length) {
          window._fsDoc.set({ transactions: txns, debts: dbts, budgets: bdgs, goals: gls, notes: nts }, { merge: true });
        }
      } else {
        // Document genuinely absent (first run). Seed from a local backup if
        // one exists, otherwise from the built-in sample, and create the doc.
        const local = readLocalData();
        const fallback = local || seedData();
        setDataSource(local ? "local" : "seed");
        hydrate(fallback, { persistLocal: !!local });
        window._fsDoc.set(fallback);
      }
    }, err => {
      // Database unreachable (often: Firestore security rules expired/blocked).
      // Show the last good local copy if we have one, otherwise the sample —
      // but NEVER write seed over the local backup or to Firestore here.
      console.error("Firebase error:", err);
      const local = readLocalData();
      setDataSource(local ? "local" : "seed");
      hydrate(local || seedData(), { persistLocal: false });
    });

    return () => unsub();
  }, []);

  const persist = useCallback((txns, dbts, bdgs, gls) => {
    // While showing built-in sample data (database unreachable), do not write
    // anything: persisting here would overwrite the real local backup — and
    // the real remote data once the connection returns — with sample data.
    if (dataSource === "seed") return;
    saveLocalData({ categories: Object.values(CATEGORIES), transactions: txns, debts: dbts, budgets: bdgs, goals: gls, notes });
    if (window._fsDoc) {
      window._fsDoc.set({ transactions: txns, debts: dbts, budgets: bdgs, goals: gls }, { merge: true }).catch(console.error);
    }
  }, [notes, dataSource]);

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

  // ── Category management ──
  // Applies the new list, renames categories on existing transactions/budgets,
  // and reassigns transactions of deleted categories to "Khác".
  const saveCategories = useCallback((nextList, renames = {}, removed = []) => {
    if (dataSource === "seed") return;
    const removedSet = new Set(removed);
    const mapCat = (catName) => {
      if (renames[catName]) return renames[catName];
      if (removedSet.has(catName)) return "Khác";
      return catName;
    };

    const needsMigration = Object.keys(renames).length > 0 || removedSet.size > 0;
    const nextTransactions = needsMigration
      ? allTransactions.map(t => {
          if (!t.cat || t.cat === "Thu nhập") return t;
          const mapped = mapCat(t.cat);
          return mapped === t.cat ? t : { ...t, cat: mapped };
        })
      : allTransactions;

    const nextBudgets = [];
    budgets.forEach(b => {
      if (removedSet.has(b.cat)) return;
      const cat = renames[b.cat] || b.cat;
      if (!nextBudgets.some(x => x.cat === cat)) nextBudgets.push({ ...b, cat });
    });

    setCategories(nextList);
    setCatsVersion(v => v + 1);
    setAllTransactions(nextTransactions);
    setBudgets(nextBudgets);
    saveLocalData({ categories: Object.values(CATEGORIES), transactions: nextTransactions, debts, budgets: nextBudgets, goals, notes });
    if (window._fsDoc) {
      window._fsDoc.set({
        categories: Object.values(CATEGORIES),
        transactions: nextTransactions,
        budgets: nextBudgets,
      }, { merge: true }).catch(console.error);
    }
  }, [allTransactions, budgets, debts, goals, notes, dataSource]);

  const saveNotes = useCallback((nextNotes) => {
    setNotes(nextNotes);
    if (dataSource === "seed") return;
    saveLocalData({ categories: Object.values(CATEGORIES), transactions: allTransactions, debts, budgets, goals, notes: nextNotes });
    if (window._fsDoc) {
      window._fsDoc.set({ notes: nextNotes }, { merge: true }).catch(console.error);
    }
  }, [allTransactions, debts, budgets, goals, dataSource]);

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
    onMonthChange:       (d) => setMonthOffset(m => Math.max(0, m + d)),
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
    onSaveCategories:    saveCategories,
    onNavigate:          setPage,
    theme,
    onTheme:             setTheme,
    lang,
    onLang:              setLang,
  };

  return (
    <div className="app">
      <main className="main">
        {dataSource !== "remote" && (
          <div className="data-warning" role="alert">
            <Icons.bell size={15} />
            <span>
              {dataSource === "seed"
                ? "Chưa kết nối được cơ sở dữ liệu — đang hiển thị dữ liệu mẫu. ĐỪNG thêm/sửa giao dịch lúc này. Dữ liệu thật của bạn vẫn an toàn trên server; kiểm tra kết nối/Firestore rồi tải lại."
                : "Chưa kết nối được cơ sở dữ liệu — đang hiển thị bản sao lưu cục bộ. Thay đổi sẽ không được đồng bộ cho tới khi kết nối lại."}
            </span>
          </div>
        )}
        <Toolbar
          activePage={page}
          month={monthLabel}
          onMonthChange={(d) => setMonthOffset(m => Math.max(0, m + d))}
          closingBalance={monthlyBalance.closingBalance}
          viewMonth={viewMonth}
          viewYear={viewYear}
          theme={theme}
          onTheme={setTheme}
          lang={lang}
          onLang={setLang}
        />
        <PageEl key={page} {...pageProps} />
      </main>
      <BottomNav activePage={page} onChange={setPage} debts={debts} lang={lang} />
    </div>
  );
}

function BottomNav({ activePage, onChange, debts = [], lang = "vi" }) {
  const openDebtCount = debts.filter(d => !d.settled).length;
  const items = [
    { id: "overview",     label: lang === "en" ? "Overview"     : "Tổng quan", icon: "squareGrid" },
    { id: "transactions", label: lang === "en" ? "Transactions" : "Giao dịch", icon: "arrowLeftRight" },
    { id: "debts",        label: lang === "en" ? "Debts"        : "Nợ vay",    icon: "creditCard", badge: openDebtCount > 0 ? openDebtCount : null },
    { id: "budget",       label: lang === "en" ? "Budget"       : "Ngân sách", icon: "wallet" },
    { id: "notes",        label: "Note",                                        icon: "pencil" },
  ];
  return (
    <nav className="bottom-nav" aria-label="Page navigation">
      {items.map(item => {
        const Icon = Icons[item.icon];
        const active = activePage === item.id;
        return (
          <button
            key={item.id}
            className={"bottom-nav-item" + (active ? " active" : "")}
            onClick={() => onChange(item.id)}
            aria-current={active ? "page" : undefined}
          >
            <span className="bottom-nav-icon-wrap">
              <Icon size={20} />
              {item.badge != null && <span className="bottom-nav-badge">{item.badge}</span>}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
