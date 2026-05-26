// Debts — friend/service ledger

function Debts({ debts, onAddDebt, onUpdateDebt, onDeleteDebt, onSettleDebt, onReopenDebt }) {
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
    if (!name.trim() || amt <= 0) return;
    onAddDebt({ name: name.trim(), amount: amt, type, note: note.trim(), settled: false });
    setName(""); setAmt(0); setNote("");
  };

  const startEdit = (debt) => {
    setEditingDebt(debt);
    setEditName(debt.name || "");
    setEditAmt(debt.amount || 0);
    setEditType(debt.type || "owe");
    setEditNote(debt.note || "");
  };

  const cancelEdit = () => {
    setEditingDebt(null);
    setEditName("");
    setEditAmt(0);
    setEditType("owe");
    setEditNote("");
  };

  const saveEdit = () => {
    if (!editingDebt || !editName.trim() || editAmt <= 0) return;
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
      <PageHeader greet="Sổ nợ vay với bạn bè & dịch vụ" />

      {/* === Hero stats === */}
      <div className="stat-grid">
        <div className="stat" style={{ background: "linear-gradient(135deg, #FF3B30, #FF2D55)", color: "#fff", borderColor: "transparent" }}>
          <div className="hero-bg" />
          <div className="stat-label" style={{ color: "rgba(255,255,255,0.85)" }}>
            <Icons.arrowUpRight size={13} /> Bạn đang nợ
          </div>
          <div className="stat-value num">{fmt(openOwe)}</div>
          <div className="stat-sub" style={{ color: "rgba(255,255,255,0.8)" }}>
            {oweCount} khoản cần trả
          </div>
        </div>

        <div className="stat">
          <div className="stat-label" style={{ color: "var(--c-green)" }}>
            <Icons.arrowDownLeft size={13} /> Người khác nợ bạn
          </div>
          <div className="stat-value num">{fmt(openOwed)}</div>
          <div className="stat-sub">{owedCount} khoản chờ thu</div>
        </div>

        <div className="stat">
          <div className="stat-label">
            <Icons.check size={13} /> Đã xong
          </div>
          <div className="stat-value num">{paidCount}</div>
          <div className="stat-sub">khoản trong tháng</div>
        </div>
      </div>

      {/* === Add form === */}
      <div className="card" style={{ marginBottom: 18 }}>
        <div className="card-header">
          <div>
            <div className="card-title">Ghi nhận khoản nợ mới</div>
            <div className="card-subtitle">Theo dõi ai nợ ai để không quên</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 10, alignItems: "end" }}>
          <div className="field">
            <span className="field-label">Tên người</span>
            <input className="input" type="text" placeholder="VD: Nam, Hân, Shopee..."
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="field">
            <span className="field-label">Số tiền</span>
            <MoneyInput value={amt} onChange={setAmt} />
          </div>
          <div className="field">
            <span className="field-label">Loại</span>
            <select className="select" value={type} onChange={e => setType(e.target.value)}>
              <option value="owe">Mình nợ họ</option>
              <option value="lend">Họ nợ mình</option>
            </select>
          </div>
          <div className="field">
            <span className="field-label">Ghi chú</span>
            <input className="input" type="text" placeholder="VD: Tiền ăn hôm qua"
              value={note} onChange={e => setNote(e.target.value)} />
          </div>
          <button className="btn" style={{ height: 41 }} onClick={handleAdd}>
            <Icons.plus size={15} /> Thêm
          </button>
        </div>
      </div>

      {/* === Filter tabs === */}
      <div className="tx-tabs" style={{ marginBottom: 14 }}>
        <button className={"tx-tab" + (filter === "all"  ? " active" : "")} onClick={() => setFilter("all")}>
          Tất cả ({debts.length})
        </button>
        <button className={"tx-tab" + (filter === "owe"  ? " active" : "")} onClick={() => setFilter("owe")}>
          Mình nợ ({oweCount})
        </button>
        <button className={"tx-tab" + (filter === "owed" ? " active" : "")} onClick={() => setFilter("owed")}>
          Họ nợ mình ({owedCount})
        </button>
        <button className={"tx-tab" + (filter === "paid" ? " active" : "")} onClick={() => setFilter("paid")}>
          Đã xong ({paidCount})
        </button>
      </div>

      {/* === List === */}
      <div className="card" style={{ padding: 14 }}>
        {filtered.length === 0 ? (
          <Empty icon="inbox" title="Không có khoản nợ" text="Tuyệt! Bạn đang sạch nợ." />
        ) : (
          <div className="debt-list">
            {filtered.map(d => {
              const initials = d.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
              const color = debtColor(d.id);
              const isPaid = !!d.settled;
              const isEditing = editingDebt?.id === d.id;
              if (isEditing) {
                return (
                  <div className="debt-edit-item" key={d.id}>
                    <div className="debt-edit-grid">
                      <input className="input" type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                      <MoneyInput value={editAmt} onChange={setEditAmt} />
                      <select className="select" value={editType} onChange={e => setEditType(e.target.value)}>
                        <option value="owe">Mình nợ họ</option>
                        <option value="lend">Họ nợ mình</option>
                      </select>
                      <input className="input" type="text" value={editNote} onChange={e => setEditNote(e.target.value)} placeholder="Ghi chú" />
                      <div className="debt-actions">
                        <button className="btn" style={{ padding: "8px 12px", fontSize: 12 }} onClick={saveEdit}>Lưu</button>
                        <button className="btn-secondary btn" style={{ padding: "8px 12px", fontSize: 12 }} onClick={cancelEdit}>Hủy</button>
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
                        <Icons.check size={10} style={{ verticalAlign: "middle" }} /> Xong
                      </span>
                      <button className="btn-secondary btn debt-small-btn" onClick={() => onReopenDebt && onReopenDebt(d.id)}>
                        Mở lại
                      </button>
                      <button className="debt-icon-btn" title="Sửa" onClick={() => startEdit(d)}>
                        <Icons.pencil size={13} />
                      </button>
                    </div>
                  ) : (
                    <div className="debt-actions">
                      <button className="btn-secondary btn debt-small-btn" onClick={() => onSettleDebt && onSettleDebt(d.id)}>
                        {d.type === "owe" ? "Trả" : "Thu"}
                      </button>
                      <button className="debt-icon-btn" title="Sửa" onClick={() => startEdit(d)}>
                        <Icons.pencil size={13} />
                      </button>
                      <button className="tx-delete" title="Xóa"
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

      {/* Insight */}
      {openOwe > openOwed && openOwe > 0 && (
        <div style={{ marginTop: 18 }}>
          <Insight tone="orange" icon="alertTri" title="Bạn đang nợ nhiều hơn người khác nợ bạn">
            Khoản nợ ròng <b>{fmt(openOwe - openOwed)}</b>. Cân nhắc dành dụm để trả sớm nhé.
          </Insight>
        </div>
      )}
    </div>
  );
}

window.Debts = Debts;
