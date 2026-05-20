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

function App() {
  const [allTransactions, setAllTransactions] = useState([]);
  const [debts, setDebts]       = useState([]);
  const [budgets, setBudgets]   = useState([]);
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
        setAllTransactions(result);
        setDebts(dbts);
        setBudgets(bdgs);
        setLoaded(true);
        if (changed) {
          window._fsDoc.set({ transactions: result, debts: dbts, budgets: bdgs });
        }
      } else {
        setAllTransactions(_SEED.transactions);
        setDebts(_SEED.debts);
        setBudgets([]);
        setLoaded(true);
        window._fsDoc.set({ transactions: _SEED.transactions, debts: _SEED.debts, budgets: [] });
      }
    }, err => console.error("Firebase error:", err));

    return () => unsub();
  }, []);

  const persist = useCallback((txns, dbts, bdgs) => {
    if (window._fsDoc) {
      window._fsDoc.set({ transactions: txns, debts: dbts, budgets: bdgs }).catch(console.error);
    }
  }, []);

  // ── Transaction CRUD ──
  const addTransaction = useCallback((tx) => {
    const next = [{ ...tx, id: Date.now() }, ...allTransactions];
    setAllTransactions(next);
    persist(next, debts, budgets);
  }, [allTransactions, debts, budgets, persist]);

  const deleteTransaction = useCallback((id) => {
    const next = allTransactions.filter(t => t.id !== id);
    setAllTransactions(next);
    persist(next, debts, budgets);
  }, [allTransactions, debts, budgets, persist]);

  // ── Debt CRUD ──
  const addDebt = useCallback((debt) => {
    const next = [...debts, { ...debt, id: Date.now() }];
    setDebts(next);
    persist(allTransactions, next, budgets);
  }, [allTransactions, debts, budgets, persist]);

  const deleteDebt = useCallback((id) => {
    const next = debts.filter(d => d.id !== id);
    setDebts(next);
    persist(allTransactions, next, budgets);
  }, [allTransactions, debts, budgets, persist]);

  const settleDebt = useCallback((id) => {
    const next = debts.map(d => d.id === id ? { ...d, settled: true, paidDate: new Date().toISOString() } : d);
    setDebts(next);
    persist(allTransactions, next, budgets);
  }, [allTransactions, debts, budgets, persist]);

  // ── Budget CRUD ──
  const saveBudget = useCallback((cat, cap) => {
    const exists = budgets.some(b => b.cat === cat);
    const next = exists
      ? budgets.map(b => b.cat === cat ? { ...b, cap } : b)
      : [...budgets, { cat, cap }];
    setBudgets(next);
    persist(allTransactions, debts, next);
  }, [allTransactions, debts, budgets, persist]);

  const deleteBudget = useCallback((cat) => {
    const next = budgets.filter(b => b.cat !== cat);
    setBudgets(next);
    persist(allTransactions, debts, next);
  }, [allTransactions, debts, budgets, persist]);

  // Filter transactions for viewed month
  const monthTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const d = new Date(t.date + "T00:00:00");
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });
  }, [allTransactions, viewMonth, viewYear]);

  if (!loaded) {
    return (
      <div style={{
        display: "grid", placeItems: "center", height: "100vh",
        background: "var(--bg)", color: "var(--text-3)", fontSize: 14,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg, #0A84FF, #5E5CE6)",
            display: "grid", placeItems: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>đ</span>
          </div>
          Đang tải dữ liệu...
        </div>
      </div>
    );
  }

  const PageComponents = { overview: Overview, transactions: Transactions, debts: Debts, budget: Budget };
  const PageEl = PageComponents[page];
  const pageProps = {
    transactions:     monthTransactions,
    allTransactions,
    debts,
    budgets,
    viewMonth,
    viewYear,
    monthLabel,
    onAddTransaction:    addTransaction,
    onDeleteTransaction: deleteTransaction,
    onAddDebt:           addDebt,
    onDeleteDebt:        deleteDebt,
    onSettleDebt:        settleDebt,
    onSaveBudget:        saveBudget,
    onDeleteBudget:      deleteBudget,
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
        <PageEl {...pageProps} />
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
