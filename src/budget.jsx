// Budget — caps per category with peer benchmark + over-limit warnings + edit/delete

function Budget({ budgets, transactions, onSaveBudget, onDeleteBudget, viewMonth, viewYear }) {
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
    const benchmark = CAT_BENCHMARKS[b.cat] || Math.round(b.cap * 0.9);
    const benchPct = b.cap > 0 ? (benchmark / b.cap) * 100 : 0;
    let level = "ok";
    if (pct >= 100) level = "danger";
    else if (pct >= 80) level = "warn";
    return {
      ...b,
      ...(CATEGORIES[b.cat] || { name: b.cat, emoji: "📦", color: "#8E8E93" }),
      actual,
      remaining: b.cap - actual,
      pct,
      benchPct,
      level,
      averageDaily: Math.round(actual / averageDayCount),
      vsBench: actual - benchmark,
      benchmark,
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
      <PageHeader greet="Đặt giới hạn — sống trong khả năng">
        <button className="btn" onClick={() => { handleCancel(); formRef.current?.scrollIntoView({ behavior: "smooth" }); }}>
          <Icons.plus size={15} /> Tạo ngân sách
        </button>
      </PageHeader>

      {/* === Summary stats === */}
      <div className="budget-stats">
        <div className="stat">
          <div className="stat-label"><Icons.wallet size={13} /> Tổng ngân sách</div>
          <div className="stat-value num">{fmt(totalCap)}</div>
          <div className="stat-sub">{rows.length} danh mục</div>
        </div>
        <div className="stat">
          <div className="stat-label" style={{ color: "var(--c-red)" }}>
            <Icons.arrowUpRight size={13} /> Đã chi
          </div>
          <div className="stat-value num">{fmt(totalSpent)}</div>
          <div className="stat-sub">
            <span className="num">{totalCap > 0 ? ((totalSpent / totalCap) * 100).toFixed(0) : 0}%</span> ngân sách
          </div>
        </div>
        <div className="stat">
          <div className="stat-label" style={{ color: totalCap - totalSpent >= 0 ? "var(--c-green)" : "var(--c-red)" }}>
            <Icons.flag size={13} /> Còn lại
          </div>
          <div className="stat-value num" style={{ color: totalCap - totalSpent >= 0 ? "inherit" : "var(--c-red)" }}>
            {fmt(Math.abs(totalCap - totalSpent))}
          </div>
          <div className="stat-sub">{totalCap - totalSpent >= 0 ? "chưa chi" : "vượt mức"}</div>
        </div>
      </div>

      {/* === Add/Edit form === */}
      <div ref={formRef} className="card" style={{ marginBottom: 18, scrollMarginTop: 80 }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              {editingCat ? "Sửa hạn mức" : "Thêm / Cập nhật hạn mức"}
            </div>
            <div className="card-subtitle">
              {editingCat
                ? `Đang sửa: ${CATEGORIES[editingCat]?.emoji} ${editingCat}`
                : "Đặt mức chi tối đa hàng tháng cho từng danh mục"}
            </div>
          </div>
          {editingCat && (
            <button className="btn btn-secondary" onClick={handleCancel}>
              <Icons.x size={14} /> Hủy
            </button>
          )}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
          <div className="field">
            <span className="field-label">Danh mục</span>
            <select className="select" value={editCat} onChange={e => setEditCat(e.target.value)}>
              {Object.values(CATEGORIES).map(c => (
                <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <span className="field-label">Hạn mức / tháng</span>
            <MoneyInput value={editAmt} onChange={setEditAmt} />
          </div>
          <button className="btn" style={{ height: 41 }} onClick={handleSave}>
            <Icons.check size={15} /> {editingCat ? "Lưu thay đổi" : "Lưu ngân sách"}
          </button>
        </div>
      </div>

      {/* === List header === */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Ngân sách tháng này</h2>
        <span style={{ fontSize: 12, color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icons.users size={12} /> Có so sánh với SV cùng nhóm
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="card">
          <Empty icon="wallet" title="Chưa có ngân sách nào"
            text="Thêm danh mục đầu tiên ở phía trên để bắt đầu kiểm soát chi tiêu" />
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
                          <Icons.alertTri size={11} style={{ verticalAlign: "middle" }} /> Vượt {fmt(r.actual - r.cap)}
                        </span>
                      ) : r.level === "warn" ? (
                        <span style={{ color: "var(--c-orange)" }}>Còn lại {fmt(r.remaining)}</span>
                      ) : (
                        <span>Còn lại {fmt(r.remaining)}</span>
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
                    <button className="budget-action-btn" title="Sửa" onClick={() => handleStartEdit(r)}>
                      <Icons.pencil size={14} />
                    </button>
                    <button className="budget-action-btn danger" title="Xóa"
                      onClick={() => setConfirmDelete(r.cat)}>
                      <Icons.trash size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="budget-track">
                <div className={"budget-fill " + r.level} style={{ width: Math.min(100, r.pct) + "%" }} />
                <div style={{
                  position: "absolute", top: -4, bottom: -4,
                  left: `calc(${Math.min(100, r.benchPct)}% - 1px)`,
                  width: 2, background: "var(--text-2)", borderRadius: 2, pointerEvents: "none",
                }} title={`Trung bình SV cùng nhóm: ${fmt(r.benchmark)}`} />
              </div>

              <div className="budget-foot">
                <span><span className="num">{r.pct.toFixed(0)}%</span> đã dùng</span>
                <span className="budget-benchmark lower"
                  title={`Trung bình đã chi mỗi ngày: ${fmt(r.averageDaily)}/ngày`}>
                  <Icons.calendar size={11} />
                  TB{" "}
                  <span className="num">{fmt(r.averageDaily)}</span>/ngày
                </span>
              </div>

              {confirmDelete === r.cat && (
                <div className="budget-confirm">
                  <span>Xóa ngân sách <b>{r.name}</b>?</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}
                      onClick={() => setConfirmDelete(null)}>Hủy</button>
                    <button className="btn" style={{ padding: "6px 12px", fontSize: 12, background: "var(--c-red)" }}
                      onClick={() => handleDelete(r.cat)}>Xóa</button>
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
