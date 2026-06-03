// Transactions — 2-column: form+summary (left sticky) + tabbed list (right)

function Transactions({ transactions, onAddTransaction, onUpdateTransaction, onDeleteTransaction, monthLabel, viewMonth, viewYear, openingBalance = 0, periodBalance, closingBalance }) {
  const [mode, setMode] = useState("expense");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [cat, setCat] = useState("Ăn uống");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortMode, setSortMode] = useState("date-desc");
  const [justAdded, setJustAdded] = useState(false);
  const [btnSuccess, setBtnSuccess] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const formRef = useRef(null);
  const firstExpenseCat = Object.keys(CATEGORIES)[0] || cat;
  const incomeCat = "Thu nhập";

  const incomeList = transactions.filter(t => t.type === "income");
  const expenseList = transactions.filter(t => t.type === "expense");
  const list = mode === "income" ? incomeList : expenseList;
  const categoryCounts = useMemo(() => {
    const counts = {};
    expenseList.forEach(t => {
      if (!t.cat) return;
      counts[t.cat] = (counts[t.cat] || 0) + 1;
    });
    return counts;
  }, [transactions]);
  const categoryOptions = useMemo(() =>
    Object.values(CATEGORIES).filter(c => categoryCounts[c.name]),
  [categoryCounts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byDateDesc = (a, b) => (b.date || "").localeCompare(a.date || "") || String(b.id).localeCompare(String(a.id));
    const byDateAsc = (a, b) => (a.date || "").localeCompare(b.date || "") || String(a.id).localeCompare(String(b.id));
    const next = list.filter(t => {
      const matchesSearch = !q ||
        (t.desc || "").toLowerCase().includes(q) ||
        (t.cat && t.cat.toLowerCase().includes(q));
      const matchesCategory = mode !== "expense" ||
        categoryFilter === "all" ||
        t.cat === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    return [...next].sort((a, b) => {
      if (sortMode === "date-asc") return byDateAsc(a, b);
      if (sortMode === "amount-desc") return (b.amount - a.amount) || byDateDesc(a, b);
      if (sortMode === "amount-asc") return (a.amount - b.amount) || byDateDesc(a, b);
      return byDateDesc(a, b);
    });
  }, [search, list, mode, categoryFilter, sortMode]);

  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(t => {
      const k = t.date;
      g[k] = g[k] || [];
      g[k].push(t);
    });
    return Object.entries(g).sort(([a], [b]) => {
      if (sortMode === "date-asc") {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
      }
      if (b > a) return 1;
      if (b < a) return -1;
      return 0;
    });
  }, [filtered, sortMode]);

  const totalIn  = incomeList.reduce((s, t) => s + t.amount, 0);
  const totalOut = expenseList.reduce((s, t) => s + t.amount, 0);
  const monthlyBalance = periodBalance ?? (totalIn - totalOut);
  const finalBalance = closingBalance ?? (openingBalance + monthlyBalance);
  const today = new Date();
  const isCurrentView = today.getMonth() === viewMonth && today.getFullYear() === viewYear;
  const balanceLabel = isCurrentView ? "Hiện tại" : "Cuối tháng";
  const filteredTotal = filtered.reduce((s, t) => s + t.amount, 0);
  const hasListFilters = Boolean(search.trim()) ||
    (mode === "expense" && categoryFilter !== "all") ||
    sortMode !== "date-desc";
  const quickTemplateStorageKey = "fintrack-quick-templates-v1";

  const defaultQuickTemplates = useMemo(() => {
    const cats = Object.keys(CATEGORIES);
    return [
      { id: "lunch", label: "Ăn trưa", type: "expense", desc: "Ăn trưa", amount: 35000, cat: cats[0] || firstExpenseCat },
      { id: "water", label: "Nước", type: "expense", desc: "Nước uống", amount: 10000, cat: cats[0] || firstExpenseCat },
      { id: "grab", label: "Grab", type: "expense", desc: "Grab", amount: 25000, cat: cats[1] || firstExpenseCat },
      { id: "badminton", label: "Cầu lông", type: "expense", desc: "Cầu lông", amount: 80000, cat: cats[8] || firstExpenseCat },
      { id: "mom-transfer", label: "Mẹ chuyển", type: "income", desc: "Mẹ chuyển", amount: 1000000, cat: incomeCat },
    ];
  }, [firstExpenseCat, incomeCat]);
  const [savedQuickTemplates, setSavedQuickTemplates] = useState(null);
  const [editingQuickTemplates, setEditingQuickTemplates] = useState(false);
  const quickTemplates = savedQuickTemplates || defaultQuickTemplates;

  const normalizeQuickTemplate = (tpl, idx = 0) => {
    const type = tpl.type === "income" ? "income" : "expense";
    const label = String(tpl.label || tpl.desc || "Mẫu mới").trim() || "Mẫu mới";
    return {
      id: tpl.id || `${Date.now()}-${idx}`,
      label,
      type,
      desc: String(tpl.desc || label).trim() || label,
      amount: Number(tpl.amount) || 0,
      cat: type === "income" ? incomeCat : (tpl.cat || firstExpenseCat),
    };
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem(quickTemplateStorageKey);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed)) {
        setSavedQuickTemplates(parsed.map(normalizeQuickTemplate));
      }
    } catch (_) {
      setSavedQuickTemplates(null);
    }
  }, []);

  useEffect(() => {
    if (!savedQuickTemplates) return;
    try {
      localStorage.setItem(quickTemplateStorageKey, JSON.stringify(savedQuickTemplates));
    } catch (_) {}
  }, [savedQuickTemplates]);

  useEffect(() => {
    if (mode === "income" && categoryFilter !== "all") {
      setCategoryFilter("all");
    }
  }, [mode, categoryFilter]);

  const updateQuickTemplate = (id, patch) => {
    setSavedQuickTemplates((current) => {
      const base = current || defaultQuickTemplates;
      return base.map((tpl, idx) => {
        if (tpl.id !== id) return normalizeQuickTemplate(tpl, idx);
        const next = { ...tpl, ...patch };
        if (patch.label != null && patch.desc == null) next.desc = patch.label;
        if (patch.type === "income") next.cat = incomeCat;
        if (patch.type === "expense" && tpl.type === "income") next.cat = firstExpenseCat;
        return normalizeQuickTemplate(next, idx);
      });
    });
  };

  const addQuickTemplate = () => {
    setSavedQuickTemplates((current) => [
      ...(current || defaultQuickTemplates).map(normalizeQuickTemplate),
      normalizeQuickTemplate({
        id: `tpl-${Date.now()}`,
        label: "Mẫu mới",
        type: mode,
        desc: "Mẫu mới",
        amount: 10000,
        cat: mode === "expense" ? cat : incomeCat,
      }),
    ]);
    setEditingQuickTemplates(true);
  };

  const deleteQuickTemplate = (id) => {
    setSavedQuickTemplates((current) => (current || defaultQuickTemplates)
      .filter(tpl => tpl.id !== id)
      .map(normalizeQuickTemplate));
  };

  const clearDraft = () => {
    setDesc("");
    setAmount(0);
    setEditingTx(null);
  };

  const applyTemplate = (tpl) => {
    setEditingTx(null);
    setMode(tpl.type);
    setDesc(tpl.desc || tpl.label || "");
    setAmount(Number(tpl.amount) || 0);
    if (tpl.type === "expense") setCat(tpl.cat || firstExpenseCat);
    setDate(new Date().toISOString().slice(0, 10));
  };

  const startEdit = (tx) => {
    setEditingTx(tx);
    setMode(tx.type || "expense");
    setDesc(tx.desc || "");
    setAmount(tx.amount || 0);
    setCat(tx.type === "expense" ? (tx.cat || firstExpenseCat) : firstExpenseCat);
    setDate(tx.date || new Date().toISOString().slice(0, 10));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const cancelEdit = () => clearDraft();

  const handleSubmit = () => {
    if (!desc.trim() || amount <= 0) return;
    if (editingTx) {
      onUpdateTransaction && onUpdateTransaction(editingTx.id, {
        type: mode,
        desc: desc.trim(),
        amount,
        cat: mode === "expense" ? cat : incomeCat,
        date,
      });
      clearDraft();
      return;
    }
    onAddTransaction({
      type: mode,
      desc: desc.trim(),
      amount,
      cat: mode === "expense" ? cat : incomeCat,
      date,
    });
    setDesc("");
    setAmount(0);
    setJustAdded(true);
    setBtnSuccess(true);
    setTimeout(() => setJustAdded(false), 700);
    setTimeout(() => setBtnSuccess(false), 650);
  };

  const clearListFilters = () => {
    setSearch("");
    setCategoryFilter("all");
    setSortMode("date-desc");
  };

  return (
    <div className="page tx-page fade-in">
      <PageHeader greet={`${monthLabel} · ${transactions.length} giao dịch`} />

      <div className="tx-layout">
        {/* ===== LEFT: form + summary ===== */}
        <aside className="tx-aside">
          <div ref={formRef} className="card tx-form-card" style={{ scrollMarginTop: 80 }}>
            <div className="card-header" style={{ marginBottom: 14 }}>
              <div>
                <div className="card-title">{editingTx ? "Sửa giao dịch" : "Thêm giao dịch"}</div>
                <div className="card-subtitle">{editingTx ? "Cập nhật lại thông tin giao dịch" : "Ghi lại ngay để không quên"}</div>
              </div>
              {editingTx && (
                <button className="btn btn-secondary tx-cancel-edit" onClick={cancelEdit}>
                  <Icons.x size={14} /> Hủy
                </button>
              )}
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
              <div className="quick-templates">
                <div className="quick-template-head">
                  <div className="quick-template-label">Mẫu nhanh</div>
                  <div className="quick-template-tools">
                    {editingQuickTemplates && (
                      <button className="quick-template-tool" onClick={addQuickTemplate}>
                        <Icons.plus size={13} /> Thêm
                      </button>
                    )}
                    <button
                      className="quick-template-tool"
                      onClick={() => setEditingQuickTemplates(v => !v)}
                    >
                      {editingQuickTemplates ? <Icons.check size={13} /> : <Icons.pencil size={13} />}
                      {editingQuickTemplates ? "Xong" : "Sửa"}
                    </button>
                  </div>
                </div>
                {editingQuickTemplates ? (
                  <div className="quick-template-editor">
                    {quickTemplates.map(tpl => (
                      <div className={"quick-template-edit-row " + tpl.type} key={tpl.id}>
                        <input
                          className="input quick-template-name"
                          value={tpl.label}
                          onChange={e => updateQuickTemplate(tpl.id, { label: e.target.value })}
                        />
                        <select
                          className="select quick-template-type"
                          value={tpl.type}
                          onChange={e => updateQuickTemplate(tpl.id, { type: e.target.value })}
                        >
                          <option value="expense">Chi</option>
                          <option value="income">Thu</option>
                        </select>
                        <MoneyInput
                          value={tpl.amount}
                          onChange={value => updateQuickTemplate(tpl.id, { amount: value })}
                        />
                        {tpl.type === "expense" && (
                          <select
                            className="select quick-template-cat"
                            value={tpl.cat}
                            onChange={e => updateQuickTemplate(tpl.id, { cat: e.target.value })}
                          >
                            {Object.values(CATEGORIES).map(c => (
                              <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
                            ))}
                          </select>
                        )}
                        <button className="quick-template-delete" onClick={() => deleteQuickTemplate(tpl.id)} title="Xóa mẫu">
                          <Icons.trash size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="quick-template-list">
                    {quickTemplates.map(tpl => (
                      <button
                        key={tpl.id}
                        className={"quick-template-btn " + tpl.type}
                        onClick={() => applyTemplate(tpl)}
                      >
                        <span>{tpl.label}</span>
                        <span className="num">{fmtShort(tpl.amount)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="field">
                <span className="field-label">Mô tả</span>
                <input
                  className="input" type="text"
                  placeholder={mode === "income" ? "VD: Lương, mẹ chuyển..." : "VD: Cơm tấm, Grab, sách..."}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
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
              <button
                className={"btn" + (btnSuccess ? " btn-success" : "")}
                style={{ width: "100%", height: 44 }}
                onClick={handleSubmit}
              >
                {btnSuccess || editingTx ? <Icons.check size={15} /> : <Icons.plus size={15} />}
                {editingTx ? "Lưu thay đổi" : (btnSuccess ? "Đã thêm!" : "Thêm giao dịch")}
              </button>
            </div>
          </div>

          {/* Monthly summary */}
          <div className="card tx-summary-card">
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
                  <Icons.wallet size={12} /> Đầu tháng
                </div>
                <div className="mini-value num">
                  {fmt(openingBalance)}
                </div>
              </div>
              <div>
                <div className="mini-label">
                  <Icons.wallet size={12} /> {balanceLabel}
                </div>
                <div className="mini-value num" style={{ color: finalBalance >= 0 ? "var(--c-green)" : "var(--c-red)" }}>
                  {fmt(finalBalance)}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 8, paddingTop: 16, borderTop: "0.5px solid var(--divider)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  Tỉ lệ tiết kiệm
                </span>
                <span className="num" style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--c-green)" }}>
                  {totalIn === 0 ? "0" : Math.max(0, Math.round((monthlyBalance / totalIn) * 100))}%
                </span>
              </div>
              <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: (totalIn === 0 ? 0 : Math.max(0, Math.min(100, (monthlyBalance / totalIn) * 100))) + "%",
                  background: "linear-gradient(90deg, var(--c-green), #2ABF52)",
                  borderRadius: 3, transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          </div>
        </aside>

        {/* ===== RIGHT: list ===== */}
        <div className="tx-main">
          <div className="search-bar">
            <Icons.search size={15} style={{ color: "var(--text-3)" }} />
            <input
              placeholder={`Tìm ${mode === "income" ? "thu nhập" : "chi tiêu"}, danh mục...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <span className="search-meta">{filtered.length} / {list.length}</span>
          </div>

          <div className="tx-filter-panel">
            <div className="tx-filter-top">
              <div className="tx-filter-summary">
                <Icons.filter size={13} />
                <span>Tổng đang xem</span>
                <b className="num">{fmt(filteredTotal)}</b>
              </div>
              <div className="tx-filter-actions">
                <select className="select tx-sort-select" value={sortMode} onChange={e => setSortMode(e.target.value)}>
                  <option value="date-desc">Mới nhất</option>
                  <option value="date-asc">Cũ nhất</option>
                  <option value="amount-desc">Tiền cao</option>
                  <option value="amount-asc">Tiền thấp</option>
                </select>
                {hasListFilters && (
                  <button className="tx-clear-filter" onClick={clearListFilters}>
                    <Icons.x size={13} /> Xóa lọc
                  </button>
                )}
              </div>
            </div>
            {mode === "expense" && categoryOptions.length > 0 && (
              <div className="tx-category-chips">
                <button
                  className={"tx-filter-chip" + (categoryFilter === "all" ? " active" : "")}
                  onClick={() => setCategoryFilter("all")}
                >
                  Tất cả <span>{expenseList.length}</span>
                </button>
                {categoryOptions.map(c => (
                  <button
                    key={c.name}
                    className={"tx-filter-chip" + (categoryFilter === c.name ? " active" : "")}
                    onClick={() => setCategoryFilter(c.name)}
                  >
                    <span className="tx-filter-emoji">{c.emoji}</span>
                    {c.name}
                    <span>{categoryCounts[c.name]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 18 }}>
            {list.length === 0 ? (
              <Empty icon="inbox" title="Chưa có giao dịch"
                text={`Thêm ${mode === "income" ? "thu nhập" : "chi tiêu"} đầu tiên ở panel bên trái`} />
            ) : filtered.length === 0 ? (
              <Empty icon="search" title="Không tìm thấy" text="Thử từ khóa khác hoặc xóa bộ lọc" />
            ) : (
              grouped.map(([day, items], groupIdx) => {
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
                      {items.map((t, itemIdx) => {
                        const catInfo = t.cat ? CATEGORIES[t.cat] : null;
                        const bg = catInfo ? catInfo.color + "20" : "rgba(52,199,89,0.15)";
                        const fg = catInfo ? catInfo.color : "var(--c-green)";
                        const isNew = justAdded && groupIdx === 0 && itemIdx === 0;
                        return (
                          <div className={"tx-row" + (isNew ? " tx-row-new" : "")} key={t.id}>
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
                            <div className="tx-actions">
                              <button className="tx-edit" title="Sửa"
                                onClick={() => startEdit(t)}>
                                <Icons.pencil size={14} />
                              </button>
                              <button className="tx-delete" title="Xóa"
                                onClick={() => onDeleteTransaction && onDeleteTransaction(t.id)}>
                                <Icons.trash size={14} />
                              </button>
                            </div>
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
