// ============================================================
// debts.jsx
// ============================================================

// Debts — friend/service ledger

function Debts({ debts, onAddDebt, onUpdateDebt, onDeleteDebt, onSettleDebt, onReopenDebt }) {
  const t = useT();
  const [filter, setFilter] = useState("all");
  const [name, setName] = useState("");
  const [amt, setAmt] = useState(0);
  const [type, setType] = useState("owe");
  const [note, setNote] = useState("");
  const [editingDebt, setEditingDebt] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAmt, setEditAmt] = useState(0);
  const [editType, setEditType] = useState("owe");
  const [editNote, setEditNote] = useState("");
  const [addErrors, setAddErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [shakeAdd, setShakeAdd] = useState(null);
  const [shakeEdit, setShakeEdit] = useState(null);

  const filtered = useMemo(() => {
    if (filter === "all")    return debts;
    if (filter === "paid")   return debts.filter(d => d.settled);
    if (filter === "owe")    return debts.filter(d => d.type === "owe"  && !d.settled);
    if (filter === "owed")   return debts.filter(d => d.type === "lend" && !d.settled);
    return debts;
  }, [filter, debts]);

  const openOwe  = debts.filter(d => d.type === "owe"  && !d.settled).reduce((s, d) => s + d.amount, 0);
  const openOwed = debts.filter(d => d.type === "lend" && !d.settled).reduce((s, d) => s + d.amount, 0);
  const paidCount = debts.filter(d => d.settled).length;
  const oweCount  = debts.filter(d => d.type === "owe"  && !d.settled).length;
  const owedCount = debts.filter(d => d.type === "lend" && !d.settled).length;

  const handleAdd = () => {
    const errors = {};
    if (!name.trim()) errors.name = t("Hãy nhập tên người.", "Please enter a person's name.");
    if (amt <= 0) errors.amt = t("Hãy nhập số tiền hợp lệ.", "Please enter a valid amount.");
    if (Object.keys(errors).length > 0) {
      setAddErrors(errors);
      const first = Object.keys(errors)[0];
      setShakeAdd(first);
      setTimeout(() => setShakeAdd(null), 500);
      return;
    }
    onAddDebt({ name: name.trim(), amount: amt, type, note: note.trim(), settled: false });
    setName(""); setAmt(0); setNote("");
    setAddErrors({});
  };

  const startEdit = (debt) => {
    setEditingDebt(debt);
    setEditName(debt.name || "");
    setEditAmt(debt.amount || 0);
    setEditType(debt.type || "owe");
    setEditNote(debt.note || "");
    setEditErrors({});
  };

  const cancelEdit = () => {
    setEditingDebt(null);
    setEditName("");
    setEditAmt(0);
    setEditType("owe");
    setEditNote("");
    setEditErrors({});
  };

  const saveEdit = () => {
    if (!editingDebt) return;
    const errors = {};
    if (!editName.trim()) errors.name = t("Hãy nhập tên người.", "Please enter a person's name.");
    if (editAmt <= 0) errors.amt = t("Hãy nhập số tiền hợp lệ.", "Please enter a valid amount.");
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      const first = Object.keys(errors)[0];
      setShakeEdit(first);
      setTimeout(() => setShakeEdit(null), 500);
      return;
    }
    onUpdateDebt && onUpdateDebt(editingDebt.id, {
      name: editName.trim(),
      amount: editAmt,
      type: editType,
      note: editNote.trim(),
    });
    cancelEdit();
  };

  return (
    <div className="page fade-in">
      <div className="codex-timeline-header" style={{ marginBottom: 14 }}>
        {t("SỔ GHI NỢ", "DEBT LEDGER")}
      </div>

      {/* === Hero stats === */}
      <div className="card" style={{ marginBottom: 18, padding: "16px 20px" }}>
        <div className="debt-stats-grid">
          <div className="debt-stat-item">
            <div className="debt-stat-label">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-orange)" }}></div>
              {t("Bạn đang nợ", "You owe")}
            </div>
            <div className="num debt-stat-value">{fmt(openOwe).replace(/\s*VND/i, "")}</div>
            <div className="debt-stat-sub">{oweCount} {t("khoản cần trả", "to pay")}</div>
          </div>
          
          <div className="debt-stat-divider"></div>
          
          <div className="debt-stat-item">
            <div className="debt-stat-label">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--c-green)" }}></div>
              {t("Người khác nợ", "Owed to you")}
            </div>
            <div className="num debt-stat-value">{fmt(openOwed).replace(/\s*VND/i, "")}</div>
            <div className="debt-stat-sub">{owedCount} {t("khoản chờ thu", "to collect")}</div>
          </div>

          <div className="debt-stat-divider"></div>

          <div className="debt-stat-item" style={{ flex: 0.55 }}>
            <div className="debt-stat-label">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--text-3)" }}></div>
              {t("Đã xong", "Settled")}
            </div>
            <div className="num debt-stat-value">{paidCount}</div>
            <div className="debt-stat-sub">{t("khoản nợ", "debts")}</div>
          </div>
        </div>
      </div>

      {/* === Add form === */}
      <div className="card" style={{ marginBottom: 18, padding: "16px 20px" }}>
        <div style={{ marginBottom: 14, fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
          {t("Ghi nhận khoản nợ mới", "Record a new debt")}
        </div>
        <div className={"field" + (addErrors.name ? " field-error" : "") + (shakeAdd === "name" ? " field-shake" : "")} style={{ marginBottom: 14 }}>
          <span className="field-label">{t("Tên người", "Person")}</span>
          <input className="input" type="text" placeholder={t("VD: Nam, Hân...", "e.g. Nam, Han...")}
            value={name}
            onChange={e => { if (addErrors.name) setAddErrors(f => ({ ...f, name: undefined })); setName(e.target.value); }} />
          {addErrors.name && <span className="field-error-msg">{addErrors.name}</span>}
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 14 }}>
          <div className="field" style={{ flex: 1 }}>
            <span className="field-label">{t("Loại", "Type")}</span>
            <select className="select" value={type} onChange={e => setType(e.target.value)}>
              <option value="owe">{t("Mình nợ họ", "I owe them")}</option>
              <option value="lend">{t("Họ nợ mình", "They owe me")}</option>
            </select>
          </div>
          <div className={"field" + (addErrors.amt ? " field-error" : "") + (shakeAdd === "amt" ? " field-shake" : "")} style={{ flex: 1 }}>
            <span className="field-label">{t("Số tiền", "Amount")}</span>
            <MoneyInput value={amt} onChange={v => { setAmt(v); if (addErrors.amt) setAddErrors(f => ({ ...f, amt: undefined })); }} />
            {addErrors.amt && <span className="field-error-msg">{addErrors.amt}</span>}
          </div>
        </div>
        <div className="field" style={{ marginBottom: 14 }}>
          <span className="field-label">{t("Ghi chú", "Note")}</span>
          <input className="input" type="text" placeholder={t("Không bắt buộc", "Optional")}
            value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <button className="btn" style={{ height: 38, width: "100%" }} onClick={handleAdd}>
          <Icons.plus size={14} /> {t("Thêm", "Add")}
        </button>
      </div>

      <div className="codex-timeline-header" style={{ marginTop: 32, marginBottom: 14 }}>
        {t("LỊCH SỬ GHI NỢ", "DEBT HISTORY")}
      </div>
      {/* === Filter tabs === */}
      <TabBar
        tabs={[
          { id: "all", label: t("Tất cả", "All"), count: debts.length },
          { id: "owe", label: t("Mình nợ", "I owe"), count: oweCount },
          { id: "owed", label: t("Họ nợ mình", "Owed to me"), count: owedCount },
          { id: "paid", label: t("Đã xong", "Settled"), count: paidCount }
        ]}
        active={filter}
        onChange={setFilter}
        style={{ marginBottom: 14 }}
      />

      {/* === List === */}
      <div className="card" style={{ padding: 14 }}>
        {filtered.length === 0 ? (
          <Empty icon="inbox" title={t("Không có khoản nợ", "No debts")} text={t("Tuyệt! Bạn đang sạch nợ.", "Nice! You're debt-free.")} />
        ) : (
          <div className="debt-list">
            {filtered.map(d => {
              const initials = d.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              const color = debtColor(d.name);
              const isPaid = !!d.settled;
              const isEditing = editingDebt?.id === d.id;
              if (isEditing) {
                return (
                  <div className="debt-edit-item" key={d.id}>
                    <div className={"debt-edit-grid" + (editErrors.name || editErrors.amt ? " has-error" : "")}>
                      <div className={"debt-edit-cell" + (editErrors.name ? " field-error" : "") + (shakeEdit === "name" ? " field-shake" : "")}>
                        <input className="input" type="text" value={editName} onChange={e => { if (editErrors.name) setEditErrors(f => ({ ...f, name: undefined })); setEditName(e.target.value); }} />
                        {editErrors.name && <span className="field-error-msg">{editErrors.name}</span>}
                      </div>
                      <div className={"debt-edit-cell" + (editErrors.amt ? " field-error" : "") + (shakeEdit === "amt" ? " field-shake" : "")}>
                        <MoneyInput value={editAmt} onChange={v => { setEditAmt(v); if (editErrors.amt) setEditErrors(f => ({ ...f, amt: undefined })); }} />
                        {editErrors.amt && <span className="field-error-msg">{editErrors.amt}</span>}
                      </div>
                      <select className="select" value={editType} onChange={e => setEditType(e.target.value)}>
                        <option value="owe">{t("Mình nợ họ", "I owe them")}</option>
                        <option value="lend">{t("Họ nợ mình", "They owe me")}</option>
                      </select>
                      <input className="input" type="text" value={editNote} onChange={e => setEditNote(e.target.value)} placeholder={t("Ghi chú", "Note")} />
                      <div className="debt-actions">
                        <button className="btn" style={{ padding: "8px 12px", fontSize: 12 }} onClick={saveEdit}>{t("Lưu", "Save")}</button>
                        <button className="btn-secondary btn" style={{ padding: "8px 12px", fontSize: 12 }} onClick={cancelEdit}>{t("Hủy", "Cancel")}</button>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <div className={"debt-row" + (isPaid ? " paid" : "")} key={d.id}>
                  <div className="debt-avatar" style={{ background: color, opacity: isPaid ? 0.5 : 1 }}>
                    {initials}
                  </div>
                  <div className="debt-info">
                    <span className="debt-name">{d.name}</span>
                    <span className="debt-note">{d.note}</span>
                  </div>
                  <span className={"debt-amount num " + (d.type === "owe" ? "owe" : "owed")}>
                    {isPaid ? null : (d.type === "owe" ? "−" : "+")}{fmt(d.amount)}
                  </span>
                  {isPaid ? (
                    <div className="debt-actions">
                      <span className="debt-status-pill paid">
                        <Icons.check size={10} style={{ verticalAlign: "middle" }} /> {t("Xong", "Done")}
                      </span>
                      <button className="btn-secondary btn debt-small-btn" onClick={() => onReopenDebt && onReopenDebt(d.id)}>
                        {t("Mở lại", "Reopen")}
                      </button>
                      <button className="debt-icon-btn" title={t("Sửa", "Edit")} onClick={() => startEdit(d)}>
                        <Icons.pencil size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="debt-actions">
                      <button className="btn-secondary btn debt-small-btn" onClick={() => onSettleDebt && onSettleDebt(d.id)}>
                        {d.type === "owe" ? t("Trả", "Pay") : t("Thu", "Collect")}
                      </button>
                      <button className="debt-icon-btn" title={t("Sửa", "Edit")} onClick={() => startEdit(d)}>
                        <Icons.pencil size={13} />
                      </button>
                      <button className="tx-delete" title={t("Xóa", "Delete")}
                        onClick={() => onDeleteDebt && onDeleteDebt(d.id)}
                        style={{ opacity: 1, width: 28, height: 28 }}>
                        <Icons.trash size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>


    </div>
  );
}

window.Debts = Debts;