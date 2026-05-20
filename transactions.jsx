// Transactions — 2-column: form+summary (left sticky) + tabbed list (right)

function Transactions({ transactions, onAddTransaction, onDeleteTransaction, monthLabel }) {
  const [mode, setMode] = useState("expense");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [cat, setCat] = useState("Ăn uống");
  const [search, setSearch] = useState("");

  const incomeList = transactions.filter(t => t.type === "income");
  const expenseList = transactions.filter(t => t.type === "expense");
  const list = mode === "income" ? incomeList : expenseList;

  const filtered = useMemoTx(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(t =>
      t.desc.toLowerCase().includes(q) ||
      (t.cat && t.cat.toLowerCase().includes(q))
    );
  }, [search, list]);

  const grouped = useMemoTx(() => {
    const g = {};
    filtered.forEach(t => {
      const k = t.date;
      g[k] = g[k] || [];
      g[k].push(t);
    });
    return Object.entries(g).sort(([a], [b]) => {
      if (b > a) return 1;
      if (b < a) return -1;
      return 0;
    });
  }, [filtered]);

  const totalIn  = incomeList.reduce((s, t) => s + t.amount, 0);
  const totalOut = expenseList.reduce((s, t) => s + t.amount, 0);

  const handleAdd = () => {
    if (!desc.trim() || amount <= 0) return;
    onAddTransaction({
      type: mode,
      desc: desc.trim(),
      amount,
      cat: mode === "expense" ? cat : "Thu nhập",
      date,
    });
    setDesc("");
    setAmount(0);
  };

  return (
    <div className="page tx-page fade-in">
      <PageHeader greet={`${monthLabel} · ${transactions.length} giao dịch`} />

      <div className="tx-layout">
        {/* ===== LEFT: form + summary ===== */}
        <aside className="tx-aside">
          <div className="card" style={{ padding: 18 }}>
            <div className="card-header" style={{ marginBottom: 14 }}>
              <div>
                <div className="card-title">Thêm giao dịch</div>
                <div className="card-subtitle">Ghi lại ngay để không quên</div>
              </div>
            </div>

            <div className="tx-tabs" style={{ marginBottom: 14, width: "100%" }}>
              <button
                className={"tx-tab" + (mode === "income" ? " active income" : "")}
                onClick={() => setMode("income")}
                style={{ flex: 1, justifyContent: "center" }}
              >
                <Icons.arrowDownLeft size={13} /> Thu nhập
              </button>
              <button
                className={"tx-tab" + (mode === "expense" ? " active expense" : "")}
                onClick={() => setMode("expense")}
                style={{ flex: 1, justifyContent: "center" }}
              >
                <Icons.arrowUpRight size={13} /> Chi tiêu
              </button>
            </div>

            <div className="tx-form-vertical">
              <div className="field">
                <span className="field-label">Mô tả</span>
                <input
                  className="input" type="text"
                  placeholder={mode === "income" ? "VD: Lương, mẹ chuyển..." : "VD: Cơm tấm, Grab, sách..."}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAdd()}
                />
              </div>
              <div className="tx-row-fields">
                <div className="field">
                  <span className="field-label">Số tiền</span>
                  <MoneyInput value={amount} onChange={setAmount} />
                </div>
                {mode === "expense" && (
                  <div className="field">
                    <span className="field-label">Danh mục</span>
                    <select className="select" value={cat} onChange={e => setCat(e.target.value)}>
                      {Object.values(CATEGORIES).map(c => (
                        <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="field">
                <span className="field-label">Ngày</span>
                <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <button className="btn" style={{ width: "100%", height: 44 }} onClick={handleAdd}>
                <Icons.plus size={15} /> Thêm giao dịch
              </button>
            </div>
          </div>

          {/* Monthly summary */}
          <div className="card" style={{ padding: 18, flex: 1, display: "flex", flexDirection: "column" }}>
            <div className="card-header" style={{ marginBottom: 14 }}>
              <div>
                <div className="card-title">Tóm tắt tháng</div>
                <div className="card-subtitle">{monthLabel}</div>
              </div>
            </div>
            <div className="mini-summary mini-summary-list" style={{ flex: 1, alignContent: "center" }}>
              <div>
                <div className="mini-label">
                  <Icons.arrowDownLeft size={12} style={{ color: "var(--c-green)" }} /> Thu
                </div>
                <div className="mini-value num">{fmt(totalIn)}</div>
              </div>
              <div>
                <div className="mini-label">
                  <Icons.arrowUpRight size={12} style={{ color: "var(--c-red)" }} /> Chi
                </div>
                <div className="mini-value num">{fmt(totalOut)}</div>
              </div>
              <div>
                <div className="mini-label">
                  <Icons.wallet size={12} /> Dư
                </div>
                <div className="mini-value num" style={{ color: "var(--c-green)" }}>
                  {fmt(totalIn - totalOut)}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 8, paddingTop: 16, borderTop: "0.5px solid var(--divider)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Tỉ lệ tiết kiệm
                </span>
                <span className="num" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--c-green)" }}>
                  {totalIn === 0 ? "0" : Math.max(0, Math.round(((totalIn - totalOut) / totalIn) * 100))}%
                </span>
              </div>
              <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: (totalIn === 0 ? 0 : Math.max(0, Math.min(100, ((totalIn - totalOut) / totalIn) * 100))) + "%",
                  background: "linear-gradient(90deg, var(--c-green), #2ABF52)",
                  borderRadius: 3, transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          </div>
        </aside>

        {/* ===== RIGHT: list ===== */}
        <div className="tx-main">
          <div className="tx-tabs" style={{ marginBottom: 14 }}>
            <button className={"tx-tab" + (mode === "income" ? " active income" : "")} onClick={() => setMode("income")}>
              <Icons.arrowDownLeft size={13} />
              Thu nhập
              <span className="tx-tab-count">{incomeList.length}</span>
            </button>
            <button className={"tx-tab" + (mode === "expense" ? " active expense" : "")} onClick={() => setMode("expense")}>
              <Icons.arrowUpRight size={13} />
              Chi tiêu
              <span className="tx-tab-count">{expenseList.length}</span>
            </button>
          </div>

          <div className="search-bar">
            <Icons.search size={15} style={{ color: "var(--text-3)" }} />
            <input
              placeholder={`Tìm ${mode === "income" ? "thu nhập" : "chi tiêu"}, danh mục...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="search-meta">{filtered.length} / {list.length}</span>
          </div>

          <div className="card" style={{ padding: 18 }}>
            {list.length === 0 ? (
              <Empty icon="inbox" title="Chưa có giao dịch"
                text={`Thêm ${mode === "income" ? "thu nhập" : "chi tiêu"} đầu tiên ở panel bên trái`} />
            ) : filtered.length === 0 ? (
              <Empty icon="search" title="Không tìm thấy" text="Thử từ khóa khác hoặc xóa bộ lọc" />
            ) : (
              grouped.map(([day, items]) => {
                const total = items.reduce((s, t) => s + t.amount, 0);
                return (
                  <div key={day}>
                    <div className="tx-day-label">
                      <span>Ngày {fmtDate(day)}</span>
                      <span className="num" style={{ color: mode === "income" ? "var(--c-green)" : "var(--text-3)" }}>
                        {mode === "income" ? "+" : ""}{fmt(total)}
                      </span>
                    </div>
                    <div className="tx-list">
                      {items.map(t => {
                        const catInfo = t.cat ? CATEGORIES[t.cat] : null;
                        const bg = catInfo ? catInfo.color + "20" : "rgba(52,199,89,0.15)";
                        const fg = catInfo ? catInfo.color : "var(--c-green)";
                        return (
                          <div className="tx-row" key={t.id}>
                            <div className="tx-icon" style={{ background: bg, color: fg }}>
                              {catInfo ? catInfo.emoji : "💰"}
                            </div>
                            <div className="tx-info">
                              <span className="tx-desc">{t.desc}</span>
                              <span className="tx-meta">
                                {catInfo ? catInfo.name : "Thu nhập"} · {fmtDate(t.date)}
                              </span>
                            </div>
                            <span className={"tx-amount " + (mode === "income" ? "in" : "out")}>
                              {mode === "income" ? "+" : "−"}{fmt(t.amount)}
                            </span>
                            <button className="tx-delete" title="Xóa"
                              onClick={() => onDeleteTransaction && onDeleteTransaction(t.id)}>
                              <Icons.trash size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.Transactions = Transactions;
