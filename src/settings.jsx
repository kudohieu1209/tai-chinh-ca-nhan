// ============================================================
// Admin — owner-only account management dashboard (read-only)
// ============================================================

// Mirrors the app's money math: balance = income − expense (see admin/users.mjs).
function summarizeUserDoc(data) {
  const txns  = Array.isArray(data?.transactions) ? data.transactions : [];
  const debts = Array.isArray(data?.debts) ? data.debts : [];
  const goals = Array.isArray(data?.goals) ? data.goals : [];
  const sum = (items, pred) => items.filter(pred).reduce((s, it) => s + (Number(it.amount) || 0), 0);
  const income  = sum(txns, t => t.type === "income");
  const expense = sum(txns, t => t.type === "expense");
  return {
    income,
    expense,
    balance: income - expense,
    owe:  sum(debts, d => d.type === "owe"  && !d.settled),
    lend: sum(debts, d => d.type === "lend" && !d.settled),
    goalSaved: goals.reduce((s, g) => s + (Number(g.current) || 0), 0),
    txCount: txns.length,
  };
}

function Settings({ theme, onTheme, lang, onLang, authUser, userLabel, userInitial, isOwner, onNavigate }) {
  const t = useT();
  return (
    <div className="page settings-page slide-up">
      <div className="codex-timeline-header" style={{ marginTop: 12, marginBottom: 16 }}>
        {t("CÀI ĐẶT", "SETTINGS")}
      </div>
      <div className="settings-content">
        <div className="card">
          <div className="card-header"><div className="card-title">{t("Tài khoản", "Account")}</div></div>
          <div className="account-settings-user" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, marginBottom: 16 }}>
            <div className="toolbar-avatar" style={{ width: 48, height: 48 }}>
              {authUser?.photoURL ? <img src={authUser.photoURL} alt="" /> : <span style={{ display: 'grid', placeItems: 'center', width: '100%', height: '100%', background: 'var(--surface-2)', borderRadius: '50%' }}>{userInitial}</span>}
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: 16 }}>{userLabel}</strong>
              <span style={{ color: 'var(--text-3)' }}>{authUser?.email || ""}</span>
            </div>
          </div>
          {isOwner && (
            <button type="button" className="btn btn-secondary" style={{ width: '100%', marginBottom: 12 }} onClick={() => onNavigate("admin")}>
              <Icons.users size={15} style={{ marginRight: 8 }} />
              {t("Quản trị (Admin)", "Admin")}
            </button>
          )}
          <button type="button" className="btn btn-primary" style={{ width: '100%', background: 'var(--c-green)', color: '#0b100e', fontWeight: 600, border: 'none' }} onClick={() => firebase.auth().signOut()}>
            {t("Đăng xuất", "Log out")}
          </button>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header"><div className="card-title">{t("Giao diện", "Appearance")}</div></div>
          
          <div className="settings-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button className={"settings-opt-btn" + (theme !== "codex" ? " active" : "")} onClick={() => onTheme(theme === "codex" ? "dark" : theme)}>
              Apple
            </button>
            <button className={"settings-opt-btn" + (theme === "codex" ? " active" : "")} onClick={() => onTheme("codex")}>
              <Icons.squareGrid size={13} style={{ marginRight: 6 }} /> Codex
            </button>
          </div>
          
          {theme !== "codex" && (
            <div className="settings-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 10 }}>
              <button className={"settings-opt-btn" + (theme === "light" ? " active" : "")} onClick={() => onTheme("light")}>
                <Icons.sun size={13} style={{ marginRight: 6 }} /> {t("Sáng", "Light")}
              </button>
              <button className={"settings-opt-btn" + (theme === "dark" ? " active" : "")} onClick={() => onTheme("dark")}>
                <Icons.moon size={13} style={{ marginRight: 6 }} /> {t("Tối", "Dark")}
              </button>
              <button className={"settings-opt-btn" + (theme === "glass" ? " active" : "")} onClick={() => onTheme("glass")}>
                <Icons.sparkle size={13} style={{ marginRight: 6 }} /> Liquid
              </button>
            </div>
          )}
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header"><div className="card-title">{t("Ngôn ngữ", "Language")}</div></div>
          <div className="settings-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button className={"settings-opt-btn" + (lang === "vi" ? " active" : "")} onClick={() => onLang("vi")}>
              {t("Tiếng Việt", "Vietnamese")}
            </button>
            <button className={"settings-opt-btn" + (lang === "en" ? " active" : "")} onClick={() => onLang("en")}>
              {t("Tiếng Anh", "English")}
            </button>
            <button className={"settings-opt-btn" + (lang === "zh" ? " active" : "")} onClick={() => onLang("zh")}>
              {t("Tiếng Trung", "Chinese")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminPanel() {
  const t = useT();
  const [status, setStatus]     = useState("loading"); // loading | ready | error
  const [rows, setRows]         = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [query, setQuery]       = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorMsg("");
    getFirebaseApp();
    firebase.firestore().collection("fintrackUsers").get()
      .then(snap => {
        if (cancelled) return;
        const list = snap.docs.map(doc => {
          const d = doc.data() || {};
          const created = d.createdAt && typeof d.createdAt.toDate === "function"
            ? d.createdAt.toDate()
            : null;
          return { uid: doc.id, email: d.ownerEmail || "", createdAt: created, ...summarizeUserDoc(d) };
        });
        list.sort((a, b) => b.balance - a.balance);
        setRows(list);
        setStatus("ready");
      })
      .catch(err => {
        if (cancelled) return;
        console.error("Admin load failed:", err);
        setErrorMsg(err?.code || err?.message || "unknown");
        setStatus("error");
      });
    return () => { cancelled = true; };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => r.email.toLowerCase().includes(q) || r.uid.toLowerCase().includes(q));
  }, [rows, query]);

  const totals = useMemo(() => filtered.reduce((acc, r) => ({
    users:   acc.users + 1,
    balance: acc.balance + r.balance,
    income:  acc.income + r.income,
    expense: acc.expense + r.expense,
    owe:     acc.owe + r.owe,
    lend:    acc.lend + r.lend,
    txCount: acc.txCount + r.txCount,
  }), { users: 0, balance: 0, income: 0, expense: 0, owe: 0, lend: 0, txCount: 0 }), [filtered]);

  const dateFmt = (d) => d
    ? d.toLocaleDateString(t.lang === "en" ? "en-US" : "vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  const stats = [
    { label: t("Tài khoản", "Accounts"),     value: String(totals.users),        tone: "neutral" },
    { label: t("Tổng số dư", "Total balance"), value: formatCurrency(totals.balance), tone: totals.balance < 0 ? "negative" : "positive" },
    { label: t("Tổng thu", "Total income"),   value: formatCurrency(totals.income),  tone: "positive" },
    { label: t("Tổng chi", "Total expense"),  value: formatCurrency(totals.expense), tone: "negative" },
  ];

  return (
    <div className="page fade-in admin-page">
      <PageHeader greet="Admin" title={t("Quản lý tài khoản", "Account management")}>
        <button
          className="btn btn-secondary admin-refresh"
          onClick={() => setReloadKey(k => k + 1)}
          disabled={status === "loading"}
        >
          <Icons.clock size={14} /> {t("Tải lại", "Refresh")}
        </button>
      </PageHeader>

      <div className="admin-stats">
        {stats.map(s => (
          <div key={s.label} className={"admin-stat admin-stat-" + s.tone}>
            <span className="admin-stat-value num">{s.value}</span>
            <span className="admin-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {status === "error" ? (
        <section className="card admin-error" role="alert">
          <div className="admin-error-title">
            <Icons.alertTri size={16} /> {t("Không đọc được danh sách tài khoản", "Couldn't load the account list")}
          </div>
          <p className="admin-error-text">
            {t(
              "Firestore đang chặn việc đọc dữ liệu của các tài khoản khác. Thêm quyền cho chủ tài khoản trong Firestore Rules rồi bấm Tải lại:",
              "Firestore is blocking reads of other accounts' data. Grant the owner read access in your Firestore Rules, then press Refresh:"
            )}
          </p>
          <pre className="admin-rule">{`match /fintrackUsers/{uid} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
  allow read: if request.auth != null
    && request.auth.token.email == "${OWNER_EMAIL}";
}`}</pre>
          <p className="admin-error-code">{t("Mã lỗi", "Error code")}: {errorMsg}</p>
        </section>
      ) : status === "loading" ? (
        <section className="card admin-loading">{t("Đang tải…", "Loading…")}</section>
      ) : rows.length === 0 ? (
        <Empty icon="users" title={t("Chưa có tài khoản nào", "No accounts yet")} />
      ) : (
        <section className="card admin-table-card">
          <div className="admin-table-head">
            <div className="admin-search">
              <Icons.search size={14} />
              <input
                className="input"
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t("Tìm theo email hoặc UID…", "Search by email or UID…")}
              />
            </div>
            <span className="admin-count">
              {filtered.length}/{rows.length} {t("tài khoản", "accounts")}
            </span>
          </div>
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t("Tài khoản", "Account")}</th>
                  <th className="num">{t("Số dư", "Balance")}</th>
                  <th className="num">{t("Thu", "Income")}</th>
                  <th className="num">{t("Chi", "Expense")}</th>
                  <th className="num">{t("Đang nợ", "Owes")}</th>
                  <th className="num">{t("Cho vay", "Lent")}</th>
                  <th className="num">{t("GD", "Txns")}</th>
                  <th>{t("Tạo lúc", "Created")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const isOwnerRow = r.email.toLowerCase() === OWNER_EMAIL;
                  return (
                    <tr key={r.uid} className={isOwnerRow ? "admin-row-owner" : ""}>
                      <td>
                        <div className="admin-user">
                          <span className="admin-user-email">{r.email || t("(không có email)", "(no email)")}</span>
                          {isOwnerRow && <span className="admin-badge">Owner</span>}
                          <span className="admin-user-uid">{r.uid}</span>
                        </div>
                      </td>
                      <td className={"num" + (r.balance < 0 ? " negative" : "")}>{formatCurrency(r.balance)}</td>
                      <td className="num">{formatCurrency(r.income)}</td>
                      <td className="num">{formatCurrency(r.expense)}</td>
                      <td className="num">{r.owe ? formatCurrency(r.owe) : "—"}</td>
                      <td className="num">{r.lend ? formatCurrency(r.lend) : "—"}</td>
                      <td className="num">{r.txCount}</td>
                      <td className="admin-date">{dateFmt(r.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}