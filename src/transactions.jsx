// Transactions — 2-column: entry form (left sticky) + tabbed list (right)

const TX_WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const TX_AMOUNT_STEPS = [10000, 20000, 50000, 100000];

const txLocalIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function txDayLabel(iso) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (iso === txLocalIso(today)) return "Hôm nay";
  if (iso === txLocalIso(yesterday)) return "Hôm qua";
  const d = new Date(iso + "T00:00:00");
  return `${TX_WEEKDAYS[d.getDay()]}, ${fmtDate(iso)}`;
}

// ====== CategoryManagerModal — add / rename / recolor / delete categories ======
function CategoryManagerModal({ usageCounts, onSave, onClose }) {
  const [rows, setRows] = useState(() =>
    Object.values(CATEGORIES).map(c => ({ key: c.name, name: c.name, emoji: c.emoji, color: c.color }))
  );
  const [paletteIdx, setPaletteIdx] = useState(null);
  const [error, setError] = useState("");
  const pendingFocusIdx = useRef(null);
  const lockedSet = new Set(SYSTEM_CATEGORIES);

  useEffect(() => {
    if (pendingFocusIdx.current == null) return;
    const idx = pendingFocusIdx.current;
    requestAnimationFrame(() => {
      const row = document.querySelector(`[data-cat-row="${idx}"]`);
      const input = row?.querySelector(".cat-editor-name");
      if (input) {
        input.focus();
        input.scrollIntoView({ block: "nearest" });
      }
      pendingFocusIdx.current = null;
    });
  }, [rows.length]);

  const updateRow = (idx, patch) => {
    setError("");
    setRows(rs => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  };
  const addRow = () => {
    setError("");
    pendingFocusIdx.current = rows.length;
    setRows(rs => [...rs, { key: null, name: "", emoji: "📦", color: CAT_PALETTE[rs.length % CAT_PALETTE.length] }]);
  };
  const removeRow = (idx) => {
    setError("");
    setPaletteIdx(null);
    setRows(rs => rs.filter((_, i) => i !== idx));
  };

  const keptKeys = new Set(rows.filter(r => r.key).map(r => r.key));
  const removedInUse = Object.keys(CATEGORIES)
    .filter(name => !keptKeys.has(name) && (usageCounts[name] || 0) > 0);
  const movedCount = removedInUse.reduce((s, name) => s + usageCounts[name], 0);

  const handleSave = () => {
    const cleaned = rows.map(r => ({ ...r, name: r.name.trim() }));
    if (cleaned.some(r => !r.name)) { setError("Tên danh mục không được để trống"); return; }
    const names = cleaned.map(r => r.name);
    if (new Set(names).size !== names.length) { setError("Tên danh mục bị trùng nhau"); return; }
    if (names.includes("Thu nhập")) { setError("“Thu nhập” là tên dành riêng, không dùng cho danh mục chi"); return; }
    const renames = {};
    cleaned.forEach(r => { if (r.key && r.key !== r.name) renames[r.key] = r.name; });
    const removed = Object.keys(CATEGORIES).filter(name => !keptKeys.has(name));
    onSave(cleaned.map(({ name, emoji, color }) => ({ name, emoji: emoji || "📦", color })), renames, removed);
    onClose();
  };

  return (
    <Modal
      title="Sửa danh mục"
      subtitle="Đổi tên, biểu tượng, màu hoặc thêm danh mục mới"
      onClose={onClose}
      headerExtra={
        <button className="quick-template-tool" onClick={addRow}>
          <Icons.plus size={13} /> Thêm
        </button>
      }
      footer={
        <>
          {error && <div className="modal-error">{error}</div>}
          <button className="btn btn-secondary modal-btn" onClick={onClose}>Hủy</button>
          <button className="btn modal-btn" onClick={handleSave}><Icons.check size={14} /> Lưu</button>
        </>
      }
    >
      <div className="cat-editor">
        {rows.map((r, idx) => {
          const locked = r.key && lockedSet.has(r.key);
          const usage = r.key ? usageCounts[r.key] || 0 : 0;
          return (
            <React.Fragment key={r.key || `new-${idx}`}>
              <div className="cat-editor-row" data-cat-row={idx}>
                <input
                  className="input cat-editor-emoji"
                  value={r.emoji}
                  maxLength={4}
                  aria-label="Biểu tượng"
                  onChange={e => updateRow(idx, { emoji: e.target.value })}
                />
                <input
                  className="input cat-editor-name"
                  value={r.name}
                  placeholder="Tên danh mục"
                  disabled={Boolean(locked)}
                  title={locked ? "Danh mục hệ thống — không thể đổi tên" : undefined}
                  onChange={e => updateRow(idx, { name: e.target.value })}
                />
                <button
                  className="cat-editor-color"
                  style={{ background: r.color }}
                  title="Đổi màu"
                  aria-label="Đổi màu"
                  onClick={() => setPaletteIdx(p => (p === idx ? null : idx))}
                />
                <span className="cat-editor-usage num" title={usage > 0 ? `${usage} giao dịch đang dùng` : undefined}>
                  {usage > 0 ? usage : ""}
                </span>
                {locked ? (
                  <span className="cat-editor-lock" title="Danh mục hệ thống — không thể xóa" aria-label="Danh mục hệ thống">🔒</span>
                ) : (
                  <button className="cat-editor-delete" onClick={() => removeRow(idx)} title="Xóa danh mục">
                    <Icons.trash size={13} />
                  </button>
                )}
              </div>
              {paletteIdx === idx && (
                <div className="cat-editor-palette">
                  {CAT_PALETTE.map(c => (
                    <button
                      key={c}
                      className={"cat-swatch" + (r.color === c ? " active" : "")}
                      style={{ background: c }}
                      aria-label={"Màu " + c}
                      onClick={() => { updateRow(idx, { color: c }); setPaletteIdx(null); }}
                    />
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      {removedInUse.length > 0 && (
        <div className="cat-editor-warning">
          <Icons.alertTri size={13} />
          <span>
            <b className="num">{movedCount}</b> giao dịch thuộc {removedInUse.map(n => `"${n}"`).join(", ")} sẽ chuyển sang "Khác" khi lưu
          </span>
        </div>
      )}
    </Modal>
  );
}

// ====== QuickTemplateModal — edit quick-entry templates in a dialog ======
function QuickTemplateModal({ templates, normalize, onSave, onClose }) {
  const [rows, setRows] = useState(() => templates.map(t => ({ ...t })));
  const pendingFocusId = useRef(null);

  useEffect(() => {
    if (!pendingFocusId.current) return;
    const id = pendingFocusId.current;
    requestAnimationFrame(() => {
      const row = document.querySelector(`[data-quick-template-id="${id}"]`);
      const input = row?.querySelector(".quick-template-name");
      if (input) {
        input.focus();
        input.select();
        input.scrollIntoView({ block: "nearest" });
      }
      pendingFocusId.current = null;
    });
  }, [rows.length]);

  const updateRow = (id, patch) => {
    setRows(rs => rs.map(r => {
      if (r.id !== id) return r;
      const next = { ...r, ...patch };
      if (patch.label != null && patch.desc == null) next.desc = patch.label;
      if (patch.type === "income") next.cat = "Thu nhập";
      if (patch.type === "expense" && r.type === "income") next.cat = Object.keys(CATEGORIES)[0] || "Khác";
      return next;
    }));
  };
  const addRow = () => {
    const id = `tpl-${Date.now()}`;
    pendingFocusId.current = id;
    setRows(rs => [...rs, { id, label: "", type: "expense", desc: "", amount: 10000, cat: Object.keys(CATEGORIES)[0] || "Khác" }]);
  };
  const removeRow = (id) => setRows(rs => rs.filter(r => r.id !== id));

  const handleSave = () => {
    onSave(rows.map((t, i) => normalize(t, i)));
    onClose();
  };

  return (
    <Modal
      title="Sửa mẫu nhanh"
      subtitle="Mẫu giúp điền sẵn form chỉ với một chạm"
      onClose={onClose}
      headerExtra={
        <button className="quick-template-tool" onClick={addRow}>
          <Icons.plus size={13} /> Thêm
        </button>
      }
      footer={
        <>
          <button className="btn btn-secondary modal-btn" onClick={onClose}>Hủy</button>
          <button className="btn modal-btn" onClick={handleSave}><Icons.check size={14} /> Lưu</button>
        </>
      }
    >
      {rows.length === 0 ? (
        <Empty icon="inbox" title="Chưa có mẫu nào" text="Bấm Thêm để tạo mẫu đầu tiên" />
      ) : (
        <div className="quick-template-editor">
          {rows.map(tpl => (
            <div
              className={"quick-template-edit-row " + tpl.type}
              key={tpl.id}
              data-quick-template-id={tpl.id}
            >
              <input
                className="input quick-template-name"
                value={tpl.label}
                placeholder="Tên mẫu"
                onChange={e => updateRow(tpl.id, { label: e.target.value })}
              />
              <select
                className="select quick-template-type"
                value={tpl.type}
                onChange={e => updateRow(tpl.id, { type: e.target.value })}
              >
                <option value="expense">Chi</option>
                <option value="income">Thu</option>
              </select>
              <MoneyInput
                value={tpl.amount}
                onChange={value => updateRow(tpl.id, { amount: value })}
              />
              {tpl.type === "expense" && (
                <select
                  className="select quick-template-cat"
                  value={tpl.cat}
                  onChange={e => updateRow(tpl.id, { cat: e.target.value })}
                >
                  {Object.values(CATEGORIES).map(c => (
                    <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
                  ))}
                </select>
              )}
              <button className="quick-template-delete" onClick={() => removeRow(tpl.id)} title="Xóa mẫu">
                <Icons.trash size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

const SORT_OPTIONS = [
  { value: "date-desc", label: "Mới nhất" },
  { value: "date-asc",  label: "Cũ nhất" },
  { value: "amount-desc", label: "Tiền cao" },
  { value: "amount-asc",  label: "Tiền thấp" },
];

function SortDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const label = SORT_OPTIONS.find(o => o.value === value)?.label ?? "Sắp xếp";

  const openMenu = () => {
    if (btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setMenuPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const menu = open && ReactDOM.createPortal(
    <div
      className="sort-dropdown-menu"
      style={{ top: menuPos.top, right: menuPos.right }}
      onMouseDown={e => e.stopPropagation()}
    >
      {SORT_OPTIONS.map(o => (
        <button
          key={o.value}
          className={"sort-dropdown-item" + (o.value === value ? " active" : "")}
          onClick={() => { onChange(o.value); setOpen(false); }}
        >
          {o.label}
        </button>
      ))}
    </div>,
    document.body
  );

  return (
    <>
      <button className="sort-dropdown-btn" ref={btnRef} onClick={openMenu}>
        {label} <Icons.chevDown size={11} />
      </button>
      {menu}
    </>
  );
}

function Transactions({ transactions, allTransactions = [], onAddTransaction, onUpdateTransaction, onDeleteTransaction, onSaveCategories, monthLabel }) {
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
  const [showCatModal, setShowCatModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
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

  const filteredTotal = filtered.reduce((s, t) => s + t.amount, 0);
  const maxDayTotal = useMemo(() =>
    grouped.reduce((max, [, items]) => Math.max(max, items.reduce((s, t) => s + t.amount, 0)), 0),
  [grouped]);
  const hasListFilters = Boolean(search.trim()) ||
    (mode === "expense" && categoryFilter !== "all") ||
    sortMode !== "date-desc";
  const quickTemplateStorageKey = "fintrack-quick-templates-v1";

  const catUsageCounts = useMemo(() => {
    const counts = {};
    allTransactions.forEach(t => {
      if (!t.cat || t.cat === incomeCat) return;
      counts[t.cat] = (counts[t.cat] || 0) + 1;
    });
    return counts;
  }, [allTransactions]);

  // Keep form/filter selections valid after categories are renamed or deleted
  useEffect(() => {
    if (!CATEGORIES[cat]) setCat(Object.keys(CATEGORIES)[0] || "Khác");
    if (categoryFilter !== "all" && !CATEGORIES[categoryFilter]) setCategoryFilter("all");
  });

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
  const quickTemplates = savedQuickTemplates || defaultQuickTemplates;

  const normalizeQuickTemplate = (tpl, idx = 0, options = {}) => {
    const { allowEmptyLabel = false } = options;
    const type = tpl.type === "income" ? "income" : "expense";
    const rawLabel = String(tpl.label ?? tpl.desc ?? "");
    const label = allowEmptyLabel ? rawLabel : (rawLabel.trim() || "Mẫu mới");
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

  const clearDraft = () => {
    setDesc("");
    setAmount(0);
    setDate(new Date().toISOString().slice(0, 10));
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
          <div ref={formRef} className="card tx-form-card stagger stagger-1" style={{ scrollMarginTop: 80 }}>
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
                    <button className="quick-template-tool" onClick={() => setShowTemplateModal(true)}>
                      <Icons.pencil size={13} /> Sửa
                    </button>
                  </div>
                </div>
                <div className="quick-template-list">
                  {quickTemplates.map(tpl => (
                    <button
                      key={tpl.id}
                      className={"quick-template-btn " + tpl.type}
                      onClick={() => applyTemplate(tpl)}
                    >
                      <span>{tpl.label || tpl.desc || "Mẫu mới"}</span>
                      <span className="num">{fmtShort(tpl.amount)}</span>
                    </button>
                  ))}
                </div>
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
              <div className="field tx-amount-field">
                <span className="field-label">Số tiền</span>
                <MoneyInput value={amount} onChange={setAmount} />
                <div className="amount-quick-row">
                  {TX_AMOUNT_STEPS.map(step => (
                    <button
                      key={step}
                      className="amount-quick-chip num"
                      onClick={() => setAmount(a => a + step)}
                    >
                      +{fmtShort(step)}
                    </button>
                  ))}
                </div>
              </div>
              {mode === "expense" && (
                <div className="field">
                  <div className="field-label-row">
                    <span className="field-label">Danh mục</span>
                    <button className="quick-template-tool" onClick={() => setShowCatModal(true)}>
                      <Icons.pencil size={12} /> Sửa
                    </button>
                  </div>
                  <div className="cat-grid">
                    {Object.values(CATEGORIES).map(c => (
                      <button
                        key={c.name}
                        className={"cat-grid-chip" + (cat === c.name ? " active" : "")}
                        style={{ "--cat-color": c.color, "--cat-tint": c.color + "26" }}
                        onClick={() => setCat(c.name)}
                      >
                        <span aria-hidden="true">{c.emoji}</span>
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="field">
                <span className="field-label">Ngày</span>
                <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <button
                className={"btn tx-submit-btn" + (btnSuccess ? " btn-success" : "")}
                onClick={handleSubmit}
              >
                {btnSuccess || editingTx ? <Icons.check size={15} /> : <Icons.plus size={15} />}
                {editingTx ? "Lưu thay đổi" : (btnSuccess ? "Đã thêm!" : "Thêm giao dịch")}
              </button>
            </div>
          </div>

        </aside>

        {/* ===== RIGHT: list ===== */}
        <div className="tx-main">
          <div className="search-bar stagger stagger-2">
            <Icons.search size={15} style={{ color: "var(--text-3)" }} />
            <input
              placeholder={`Tìm ${mode === "income" ? "thu nhập" : "chi tiêu"}, danh mục...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <SortDropdown value={sortMode} onChange={setSortMode} />
            {hasListFilters && (
              <button className="tx-clear-filter" onClick={clearListFilters} title="Xóa lọc">
                <Icons.x size={13} />
              </button>
            )}
            <span className="search-meta">{filtered.length} / {list.length}</span>
          </div>

          <div className="card tx-list-card stagger stagger-3">
            {list.length === 0 ? (
              <Empty icon="inbox" title="Chưa có giao dịch"
                text={`Thêm ${mode === "income" ? "thu nhập" : "chi tiêu"} đầu tiên ở panel bên trái`} />
            ) : filtered.length === 0 ? (
              <Empty icon="search" title="Không tìm thấy" text="Thử từ khóa khác hoặc xóa bộ lọc" />
            ) : (
              grouped.map(([day, items], groupIdx) => {
                const total = items.reduce((s, t) => s + t.amount, 0);
                const barPct = maxDayTotal > 0 ? (total / maxDayTotal) * 100 : 0;
                return (
                  <div key={day}>
                    <div className={"tx-day-head" + (mode === "income" ? " income" : "")}>
                      <div className="tx-day-label">
                        <span className="tx-day-name">{txDayLabel(day)}</span>
                        <span className={"num tx-day-total" + (mode === "income" ? " in" : "")}>
                          {mode === "income" ? "+" : ""}{fmt(total)}
                        </span>
                      </div>
                      <div className="tx-day-bar" aria-hidden="true">
                        <span style={{ width: barPct + "%" }} />
                      </div>
                    </div>
                    <div className="tx-list">
                      {items.map((t, itemIdx) => {
                        const catInfo = t.cat ? CATEGORIES[t.cat] : null;
                        const bg = catInfo ? catInfo.color + "20" : "rgba(52,199,89,0.15)";
                        const fg = catInfo ? catInfo.color : "var(--c-green)";
                        const isNew = justAdded && groupIdx === 0 && itemIdx === 0;
                        const isEditing = editingTx && editingTx.id === t.id;
                        return (
                          <div
                            className={"tx-row" + (isNew ? " tx-row-new" : "") + (isEditing ? " is-editing" : "")}
                            key={t.id}
                            style={{ "--row-tint": catInfo ? catInfo.color + "14" : "rgba(52,199,89,0.10)" }}
                          >
                            <div className="tx-icon" style={{ background: bg, color: fg }}>
                              {catInfo ? catInfo.emoji : "💰"}
                            </div>
                            <div className="tx-info">
                              <span className="tx-desc">{t.desc}</span>
                              <span className="tx-meta">{catInfo ? catInfo.name : "Thu nhập"}</span>
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

      {showCatModal && (
        <CategoryManagerModal
          usageCounts={catUsageCounts}
          onSave={(list, renames, removed) => onSaveCategories && onSaveCategories(list, renames, removed)}
          onClose={() => setShowCatModal(false)}
        />
      )}
      {showTemplateModal && (
        <QuickTemplateModal
          templates={quickTemplates}
          normalize={normalizeQuickTemplate}
          onSave={setSavedQuickTemplates}
          onClose={() => setShowTemplateModal(false)}
        />
      )}
    </div>
  );
}

window.Transactions = Transactions;
