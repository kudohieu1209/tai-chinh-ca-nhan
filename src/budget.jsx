// ============================================================
// budget.jsx
// ============================================================

// Budget — caps per category with peer benchmark + over-limit warnings + edit/delete

function Budget({ budgets, transactions, onSaveBudget, onDeleteBudget, viewMonth, viewYear }) {
  const t = useT();
  const [editingCat, setEditingCat] = useState(null);
  const [editCat, setEditCat] = useState(Object.keys(CATEGORIES)[0]);
  const [editAmt, setEditAmt] = useState(800000);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const formRef = useRef(null);
  const today = new Date();
  const safeViewMonth = Number.isInteger(viewMonth) ? viewMonth : today.getMonth();
  const safeViewYear = Number.isInteger(viewYear) ? viewYear : today.getFullYear();
  const daysInViewedMonth = new Date(safeViewYear, safeViewMonth + 1, 0).getDate();
  const isCurrentView = today.getMonth() === safeViewMonth && today.getFullYear() === safeViewYear;
  const averageDayCount = Math.max(1, isCurrentView ? today.getDate() : daysInViewedMonth);

  const rows = budgets.map(b => {
    const actual = transactions
      .filter(t => t.type === "expense" && t.cat === b.cat)
      .reduce((s, t) => s + t.amount, 0);
    const pct = b.cap > 0 ? (actual / b.cap) * 100 : 0;
    let level = "ok";
    if (pct >= 100) level = "danger";
    else if (pct >= 80) level = "warn";
    return {
      ...b,
      ...(CATEGORIES[b.cat] || { name: b.cat, emoji: "📦", color: "#8E8E93" }),
      actual,
      remaining: b.cap - actual,
      pct,
      level,
      averageDaily: Math.round(actual / averageDayCount),
      averageWeekly: Math.round(actual / (averageDayCount / 7)),
    };
  });

  const totalCap   = rows.reduce((s, r) => s + r.cap, 0);
  const totalSpent = rows.reduce((s, r) => s + r.actual, 0);

  const handleStartEdit = (b) => {
    setEditingCat(b.cat);
    setEditCat(b.cat);
    setEditAmt(b.cap);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const handleCancel = () => {
    setEditingCat(null);
    setEditCat(Object.keys(CATEGORIES)[0]);
    setEditAmt(800000);
  };

  const handleSave = () => {
    if (editAmt <= 0) return;
    onSaveBudget(editCat, editAmt);
    handleCancel();
  };

  const handleDelete = (cat) => {
    onDeleteBudget(cat);
    setConfirmDelete(null);
    if (editingCat === cat) handleCancel();
  };

  return (
    <div className="page fade-in">
      <div className="codex-timeline-header" style={{ marginTop: 12, marginBottom: 16 }}>
        {t("NGÂN SÁCH", "BUDGET")}
      </div>

      {/* === Summary stats === */}
      <div className="card" style={{ marginBottom: 18, padding: "16px 20px" }}>
        <div className="debt-stats-grid">
          <div className="debt-stat-item">
            <div className="debt-stat-label">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-3)" }}></div>
              {t("Tổng", "Total")}
            </div>
            <div className="num debt-stat-value">{fmt(totalCap).replace(/\s*VND/i, "")}</div>
            <div className="debt-stat-sub">{rows.length} {t("danh mục", "categories")}</div>
          </div>
          
          <div className="debt-stat-divider"></div>
          
          <div className="debt-stat-item">
            <div className="debt-stat-label">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-red)" }}></div>
              {t("Đã chi", "Spent")}
            </div>
            <div className="num debt-stat-value">{fmt(totalSpent).replace(/\s*VND/i, "")}</div>
            <div className="debt-stat-sub">
              <span className="num">{totalCap > 0 ? ((totalSpent / totalCap) * 100).toFixed(0) : 0}%</span> {t("ngân sách", "of budget")}
            </div>
          </div>

          <div className="debt-stat-divider"></div>

          <div className="debt-stat-item">
            <div className="debt-stat-label">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: totalCap - totalSpent >= 0 ? "var(--c-green)" : "var(--c-red)" }}></div>
              {t("Còn lại", "Remaining")}
            </div>
            <div className="num debt-stat-value" style={{ color: totalCap - totalSpent >= 0 ? "var(--text)" : "var(--c-red)" }}>
              {fmt(Math.abs(totalCap - totalSpent)).replace(/\s*VND/i, "")}
            </div>
            <div className="debt-stat-sub">{totalCap - totalSpent >= 0 ? t("chưa chi", "unspent") : t("vượt mức", "over budget")}</div>
          </div>
        </div>
      </div>

      {/* === Add/Edit form === */}
      <div ref={formRef} className="card" style={{ marginBottom: 18, scrollMarginTop: 80, padding: "16px 20px", position: "relative" }}>
        <div style={{ marginBottom: 14, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
          {editingCat ? t("Sửa hạn mức", "Edit limit") : t("Thêm / Cập nhật hạn mức", "Add / update limit")}
          <div style={{ fontSize: 12, fontWeight: 400, color: "var(--text-4)", marginTop: 4 }}>
            {editingCat
              ? t(`Đang sửa: ${CATEGORIES[editingCat]?.emoji} ${CATEGORIES[editingCat]?.name}`, `Editing: ${CATEGORIES[editingCat]?.emoji} ${CATEGORIES[editingCat]?.name}`)
              : t("Đặt mức chi tối đa hàng tháng cho từng danh mục", "Set a monthly spending cap for each category")}
          </div>
        </div>
        {editingCat && (
          <button className="btn btn-secondary" style={{ position: "absolute", top: 16, right: 20, height: 28, padding: "0 10px", fontSize: 12 }} onClick={handleCancel}>
            <Icons.x size={12} /> {t("Hủy", "Cancel")}
          </button>
        )}
        <div className="budget-form-grid">
          <div className="field">
            <span className="field-label">{t("Danh mục", "Category")}</span>
            <select className="select" value={editCat} onChange={e => setEditCat(e.target.value)}>
              {Object.values(CATEGORIES).map(c => (
                <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <span className="field-label">{t("Hạn mức / tháng", "Limit / month")}</span>
            <MoneyInput value={editAmt} onChange={setEditAmt} />
          </div>
          <button className="btn" style={{ height: 38 }} onClick={handleSave}>
            <Icons.check size={14} /> {editingCat ? t("Lưu", "Save") : t("Thêm", "Add")}
          </button>
        </div>
      </div>

            {/* === List header === */}
      <div className="codex-timeline-header" style={{ marginTop: 32, marginBottom: 16 }}>
        {t("DANH SÁCH NGÂN SÁCH", "BUDGET LIST")}
      </div>

      {rows.length === 0 ? (
        <div className="card">
          <Empty icon="wallet" title={t("Chưa có ngân sách nào", "No budgets yet")}
            text={t("Thêm danh mục đầu tiên ở phía trên để bắt đầu kiểm soát chi tiêu", "Add your first category above to start controlling spending")} />
        </div>
      ) : (
        <div className="budget-list">
          {rows.map(r => (
            <div className={"budget-row" + (editingCat === r.cat ? " editing" : "")} key={r.cat}>
              <div className="budget-head">
                <div className="budget-cat">
                  <div className="budget-emoji" style={{ background: r.color + "20", color: r.color }}>
                    {r.emoji}
                  </div>
                  <div>
                    <div className="budget-name">{r.name}</div>
                    <div className="budget-sub">
                      {r.level === "danger" ? (
                        <span style={{ color: "var(--c-red)" }}>
                          <Icons.alertTri size={11} style={{ verticalAlign: "middle" }} /> {t("Vượt", "Over")} {fmt(r.actual - r.cap)}
                        </span>
                      ) : r.level === "warn" ? (
                        <span style={{ color: "var(--c-orange)" }}>{t("Còn lại", "Left")} {fmt(r.remaining)}</span>
                      ) : (
                        <span>{t("Còn lại", "Left")} {fmt(r.remaining)}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="budget-right">
                  <div className="budget-amount" style={{ textAlign: "right" }}>
                    <span className="num">{fmt(r.actual)}</span>{" "}
                    <span className="total num">/ {fmt(r.cap)}</span>
                  </div>
                  <div className="budget-actions">
                    <button className="budget-action-btn" title={t("Sửa", "Edit")} onClick={() => handleStartEdit(r)}>
                      <Icons.pencil size={14} />
                    </button>
                    <button className="budget-action-btn danger" title={t("Xóa", "Delete")}
                      onClick={() => setConfirmDelete(r.cat)}>
                      <Icons.trash size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                <div className="budget-track" style={{ flex: 1 }}>
                  <div className={"budget-fill " + r.level} style={{ width: Math.min(100, r.pct) + "%" }} />
                  <div style={{
                    position: "absolute", top: -4, bottom: -4,
                    left: `calc(${Math.min(100, r.benchPct)}% - 1px)`,
                    width: 2, background: "var(--text-2)", borderRadius: 2, pointerEvents: "none",
                  }} title={t(`Trung bình SV cùng nhóm: ${fmt(r.benchmark)}`, `Peer student average: ${fmt(r.benchmark)}`)} />
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)", whiteSpace: "nowrap" }}>
                  <span className="num">{r.pct.toFixed(0)}%</span> {t("đã dùng", "used")}
                </div>
              </div>

              <div className="budget-foot" style={{ marginTop: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "var(--text-3)" }}
                  title={t(`Trung bình đã chi: ${fmt(r.averageDaily)}/ngày, ${fmt(r.averageWeekly)}/tuần`, `Average spent: ${fmt(r.averageDaily)}/day, ${fmt(r.averageWeekly)}/week`)}>
                  <Icons.calendar size={11} />
                  {t("TB", "Avg")}{" "}
                  <span className="num">{fmt(r.averageDaily)}</span>{t("/ngày", "/day")}
                  <span aria-hidden="true">·</span>
                  <span className="num">{fmt(r.averageWeekly)}</span>{t("/tuần", "/week")}
                </span>
              </div>

              {confirmDelete === r.cat && (
                <div className="budget-confirm">
                  <span>{t(<>Xóa ngân sách <b>{r.name}</b>?</>, <>Delete budget <b>{r.name}</b>?</>)}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}
                      onClick={() => setConfirmDelete(null)}>{t("Hủy", "Cancel")}</button>
                    <button className="btn" style={{ padding: "6px 12px", fontSize: 12, background: "var(--c-red)" }}
                      onClick={() => handleDelete(r.cat)}>{t("Xóa", "Delete")}</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

window.Budget = Budget;