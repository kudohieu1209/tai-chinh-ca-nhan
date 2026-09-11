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

function Settings({ theme, onTheme, lang, onLang, authUser, userLabel, userInitial, isOwner, isAdmin, onNavigate }) {
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
          {(isAdmin || isOwner) && (
            <button type="button" className="btn btn-secondary" style={{ width: '100%', marginBottom: 12 }} onClick={() => onNavigate("admin")}>
              <Icons.users size={15} style={{ marginRight: 8 }} />
              {t("Quản trị (Admin)", "Admin")}
            </button>
          )}
          <button type="button" className="btn btn-danger" style={{ width: '100%' }} onClick={() => firebase.auth().signOut()}>
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
          <div className="settings-row settings-language-grid" style={{ display: 'grid', gap: 10 }}>
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

// ============================================================
// AdminPanel — owner-only account management dashboard (read-only)
// ============================================================

function RoleModal({ currentRole, onSave, onCancel }) {
  const t = useT();
  const [role, setRole] = useState(currentRole || "");
  return (
    <Modal title={t("Phân quyền", "Set Role")} onClose={onCancel}>
      <div className="field" style={{ marginBottom: 20 }}>
        <label className="field-label">{t("Tên role", "Role name")}</label>
        <input className="input" type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="admin, moderator, user…" autoFocus />
      </div>
      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-secondary" onClick={onCancel}>{t("Huỷ", "Cancel")}</button>
        <button className="btn" style={{ background: "var(--accent)", color: "#fff", border: "none" }} onClick={() => onSave(role.trim())}>{t("Lưu", "Save")}</button>
      </div>
    </Modal>
  );
}

// Shows the exact CLI command for an admin action (runs on your machine).
function CliModal({ command, note, onClose }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }).catch(() => {});
  };
  return (
    <Modal title={t("Thao tác qua CLI", "Run via CLI")} onClose={onClose}>
      <p style={{ margin: "0 0 12px 0", color: "var(--text-2)", fontSize: 13.5, lineHeight: 1.5 }}>{note}</p>
      <pre className="admin-cli-command" onClick={copy} title={t("Bấm để sao chép", "Click to copy")}>{command}</pre>
      <div className="modal-footer" style={{ padding: 0 }}>
        <button className="btn btn-secondary" onClick={onClose}>{t("Đóng", "Close")}</button>
        <button className="btn" style={{ background: "var(--accent)", color: "#fff", border: "none" }} onClick={copy}>
          {copied ? t("Đã sao chép ✓", "Copied ✓") : t("Sao chép lệnh", "Copy command")}
        </button>
      </div>
    </Modal>
  );
}

function AdminPanel({ onNavigate }) {
  const t = useT();
  const [status, setStatus]       = useState("loading");
  const [rows, setRows]           = useState([]);
  const [errorMsg, setErrorMsg]   = useState("");
  const [query, setQuery]         = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [expandedUid, setExpandedUid] = useState(null);

  // Action state
  const [roleModal, setRoleModal] = useState(null); // { row }
  const [cliModal, setCliModal]   = useState(null); // { command, note }

  // ── Load user list ───────────────────────────────────────

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
          return { uid: doc.id, email: d.ownerEmail || "", createdAt: created, txns: d.transactions || [], debts: d.debts || [], ...summarizeUserDoc(d) };
        });
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

  // ── CLI command helpers ───────────────────────────────────

  const cliCommand = (cmd, row) => `cd admin && node users.mjs ${cmd} "${row.email || row.uid}"`;

  const showCli = (cmd, row, note) => setCliModal({ command: cliCommand(cmd, row), note });

  // ── Detail expand ─────────────────────────────────────────

  const toggleDetail = (uid) => {
    setExpandedUid(prev => prev === uid ? null : uid);
  };

  // ── Filter & sort ────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = rows;
    const q = query.trim().toLowerCase();
    if (q) list = list.filter(r => r.email.toLowerCase().includes(q) || r.uid.toLowerCase().includes(q));
    return list;
  }, [rows, query]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => b.balance - a.balance), [filtered]);

  // ── Totals ───────────────────────────────────────────────

  const totals = useMemo(() => sorted.reduce((acc, r) => ({
    users:   acc.users + 1,
    balance: acc.balance + r.balance,
    income:  acc.income + r.income,
    expense: acc.expense + r.expense,
    owe:     acc.owe + r.owe,
    lend:    acc.lend + r.lend,
    txCount: acc.txCount + r.txCount,
  }), { users: 0, balance: 0, income: 0, expense: 0, owe: 0, lend: 0, txCount: 0 }), [sorted]);

  const dateFmt = (d) => d
    ? d.toLocaleDateString(t.lang === "en" ? "en-US" : "vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "—";

  // ── Activity stats ───────────────────────────────────────

  const activity = useMemo(() => {
    const now = new Date();
    const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}`;

    const activeUsersThis = new Set();
    const activeUsersLast = new Set();
    let txTotal = 0;

    for (const r of rows) {
      for (const tx of (r.txns || [])) {
        txTotal++;
        const tKey = String(tx.date || "").slice(0, 7);
        if (tKey === thisMonthKey) activeUsersThis.add(r.uid);
        if (tKey === lastMonthKey) activeUsersLast.add(r.uid);
      }
    }

    return {
      txTotal,
      activeThisMonth: activeUsersThis.size,
      activeLastMonth: activeUsersLast.size,
    };
  }, [rows, t.lang]);

  const stats = [
    { label: t("Tài khoản", "Accounts"),     value: String(totals.users),        tone: "neutral" },
    { label: t("Tổng số dư", "Total balance"), value: formatCurrency(totals.balance), tone: totals.balance < 0 ? "negative" : "positive" },
    { label: t("Tổng thu", "Total income"),   value: formatCurrency(totals.income),  tone: "positive" },
    { label: t("Tổng chi", "Total expense"),  value: formatCurrency(totals.expense), tone: "negative" },
  ];

  // ── Render ───────────────────────────────────────────────

  return (
    <div className="page fade-in admin-page">
      <PageHeader greet="Admin" title={t("Quản lý tài khoản", "Account management")}>
        {onNavigate && (
          <button
            type="button"
            className="btn btn-secondary admin-back"
            onClick={() => onNavigate("settings")}
            style={{ marginRight: 8 }}
          >
            <Icons.chevLeft size={14} /> {t("Cài đặt", "Settings")}
          </button>
        )}
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

      {status === "ready" && rows.length > 0 && (
        <div className="admin-activity">
          <div className="card admin-activity-card">
            <div className="card-header">
              <div className="card-title">{t("Thống kê hoạt động", "Activity stats")}</div>
            </div>
            <div className="admin-activity-grid">
              {/* Active users */}
              <div className="admin-activity-item">
                <div className="admin-activity-label"><span className="admin-dot dot-blue" />{t("User hoạt động", "Active users")}</div>
                <div className="admin-activity-big">
                  {activity.activeThisMonth}
                  <span className="admin-activity-sub">
                    {activity.activeLastMonth > 0
                      ? (activity.activeThisMonth >= activity.activeLastMonth ? "▲" : "▼") + " " + activity.activeLastMonth
                      : t("tháng này", "this month")}
                  </span>
                </div>
                <div className="admin-activity-text">{t("có giao dịch trong tháng này", "with transactions this month")}</div>
              </div>

              {/* Total transactions */}
              <div className="admin-activity-item">
                <div className="admin-activity-label"><span className="admin-dot dot-orange" />{t("Tổng giao dịch", "Total transactions")}</div>
                <div className="admin-activity-big">{activity.txTotal}</div>
                <div className="admin-activity-text">{t("của mọi tài khoản", "across all accounts")}</div>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {sorted.length}/{rows.length} {t("tài khoản", "accounts")}
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
                  <th>{t("Thao tác", "Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(r => {
                  const isOwnerRow = r.email.toLowerCase() === OWNER_EMAIL;
                  return (
                    <React.Fragment key={r.uid}>
                      <tr
                        className={(isOwnerRow ? "admin-row-owner " : "") + (expandedUid === r.uid ? "admin-row-expanded" : "")}
                        onClick={() => toggleDetail(r.uid)}
                        style={{ cursor: "pointer" }}
                      >
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
                        <td onClick={e => e.stopPropagation()}>
                          {!isOwnerRow && (
                            <div className="admin-actions">
                              <button
                                className="admin-action-btn admin-action-toggle"
                                title={t("Khoá tài khoản (CLI)", "Disable (CLI)")}
                                onClick={() => showCli("disable", r, t(
                                  "Chạy lệnh này trên máy bạn (thư mục dự án FinTrack) để khoá đăng nhập tài khoản này:",
                                  "Run this on your machine (FinTrack project folder) to block sign-in for this account:"
                                ))}
                              >
                                <Icons.eyeOff size={14} />
                              </button>
                              <button
                                className="admin-action-btn admin-action-role"
                                title={t("Phân quyền (CLI)", "Set role (CLI)")}
                                onClick={() => setRoleModal({ row: r })}
                              >
                                <Icons.gear size={14} />
                              </button>
                              <button
                                className="admin-action-btn admin-action-reset"
                                title={t("Đặt lại mật khẩu (CLI)", "Reset password (CLI)")}
                                onClick={() => showCli("reset", r, t(
                                  "Chạy lệnh này trên máy bạn để tạo link đặt lại mật khẩu cho tài khoản này:",
                                  "Run this on your machine to generate a password reset link for this account:"
                                ))}
                              >
                                <Icons.bell size={14} />
                              </button>
                              <button
                                className="admin-action-btn admin-action-delete"
                                title={t("Xoá tài khoản (CLI)", "Delete account (CLI)")}
                                onClick={() => showCli("delete", r, t(
                                  "Chạy lệnh này trên máy bạn để xoá tài khoản. Thêm --with-data nếu muốn xoá luôn dữ liệu Firestore:",
                                  "Run this on your machine to delete this account. Add --with-data to also remove Firestore data:"
                                ))}
                              >
                                <Icons.trash size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {expandedUid === r.uid && (
                        <tr className="admin-detail-row">
                          <td colSpan={9}>
                            <div className="admin-detail-panel">
                              <div className="admin-detail-grid">
                                <div className="admin-detail-item"><strong>UID:</strong> {r.uid}</div>
                                <div className="admin-detail-item"><strong>Email:</strong> {r.email || "—"}</div>
                                <div className="admin-detail-item"><strong>{t("Số giao dịch", "Transactions")}:</strong> {r.txCount}</div>
                                <div className="admin-detail-item"><strong>{t("Ngày tạo", "Created")}:</strong> {dateFmt(r.createdAt)}</div>
                                <div className="admin-detail-item"><strong>{t("Đang nợ", "Owes")}:</strong> {formatCurrency(r.owe)}</div>
                                <div className="admin-detail-item"><strong>{t("Cho vay", "Lent")}:</strong> {formatCurrency(r.lend)}</div>
                              </div>
                              <div className="admin-detail-cli">
                                {t("Xem chi tiết đầy đủ (role, trạng thái, lần đăng nhập cuối…) qua CLI:", "See full details (role, status, last login…) via CLI:")}
                                <code className="admin-cli-inline" onClick={() => { navigator.clipboard?.writeText(cliCommand("get", r)).catch(() => {}); }}>
                                  cd admin && node users.mjs get "{r.email || r.uid}"
                                </code>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Role Modal */}
      {roleModal && (
        <RoleModal
          currentRole={""}
          onSave={(role) => {
            if (role) showCli("set-role " + role, roleModal.row, t(
              "Chạy lệnh này trên máy bạn để gán role \"" + role + "\" cho tài khoản này:",
              "Run this on your machine to assign the role \"" + role + "\" to this account:"
            ));
            setRoleModal(null);
          }}
          onCancel={() => setRoleModal(null)}
        />
      )}

      {/* CLI command modal */}
      {cliModal && (
        <CliModal command={cliModal.command} note={cliModal.note} onClose={() => setCliModal(null)} />
      )}
    </div>
  );
}
