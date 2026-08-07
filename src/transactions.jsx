// ============================================================
// transactions.jsx
// ============================================================

// Transactions — 2-column: entry form (left sticky) + tabbed list (right)

const TX_WEEKDAYS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
const TX_WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TX_AMOUNT_STEPS = [5000, 10000, 30000, 50000, 100000];

const txLocalIso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function txDayLabel(iso, t) {
  const tr = t || ((vi) => vi);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (iso === txLocalIso(today)) return tr("Hôm nay", "Today");
  if (iso === txLocalIso(yesterday)) return tr("Hôm qua", "Yesterday");
  const d = new Date(iso + "T00:00:00");
  const weekdays = tr.lang === "en" ? TX_WEEKDAYS_EN : TX_WEEKDAYS;
  return `${weekdays[d.getDay()]}, ${fmtDate(iso)}`;
}

// ====== CategoryManagerModal — add / rename / recolor / delete categories ======
function CategoryManagerModal({ usageCounts, onSave, onClose }) {
  const t = useT();
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
    if (cleaned.some(r => !r.name)) { setError(t("Tên danh mục không được để trống", "Category name can't be empty")); return; }
    const names = cleaned.map(r => r.name);
    if (new Set(names).size !== names.length) { setError(t("Tên danh mục bị trùng nhau", "Category names must be unique")); return; }
    if (names.includes("Thu nhập")) { setError(t("“Thu nhập” là tên dành riêng, không dùng cho danh mục chi", "“Thu nhập” (Income) is reserved and can't be used for an expense category")); return; }
    const renames = {};
    cleaned.forEach(r => { if (r.key && r.key !== r.name) renames[r.key] = r.name; });
    const removed = Object.keys(CATEGORIES).filter(name => !keptKeys.has(name));
    onSave(cleaned.map(({ name, emoji, color }) => ({ name, emoji: emoji || "📦", color })), renames, removed);
    onClose();
  };

  return (
    <Modal
      title={t("Sửa danh mục", "Edit categories")}
      subtitle={t("Đổi tên, biểu tượng, màu hoặc thêm danh mục mới", "Rename, change icon/color, or add a new category")}
      onClose={onClose}
      headerExtra={
        <button className="quick-template-tool" onClick={addRow}>
          <Icons.plus size={13} /> {t("Thêm", "Add")}
        </button>
      }
      footer={
        <>
          {error && <div className="modal-error">{error}</div>}
          <button className="btn btn-secondary modal-btn" onClick={onClose}>{t("Hủy", "Cancel")}</button>
          <button className="btn modal-btn" onClick={handleSave}><Icons.check size={14} /> {t("Lưu", "Save")}</button>
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
                  aria-label={t("Biểu tượng", "Icon")}
                  onChange={e => updateRow(idx, { emoji: e.target.value })}
                />
                <input
                  className="input cat-editor-name"
                  value={r.name}
                  placeholder={t("Tên danh mục", "Category name")}
                  disabled={Boolean(locked)}
                  title={locked ? t("Danh mục hệ thống — không thể đổi tên", "System category — can't be renamed") : undefined}
                  onChange={e => updateRow(idx, { name: e.target.value })}
                />
                <button
                  className="cat-editor-color"
                  style={{ background: r.color }}
                  title={t("Đổi màu", "Change color")}
                  aria-label={t("Đổi màu", "Change color")}
                  onClick={() => setPaletteIdx(p => (p === idx ? null : idx))}
                />
                <span className="cat-editor-usage num" title={usage > 0 ? `${usage} ${t("giao dịch đang dùng", "transactions using this")}` : undefined}>
                  {usage > 0 ? usage : ""}
                </span>
                {locked ? (
                  <span className="cat-editor-lock" title={t("Danh mục hệ thống — không thể xóa", "System category — can't be deleted")} aria-label={t("Danh mục hệ thống", "System category")}>🔒</span>
                ) : (
                  <button className="cat-editor-delete" onClick={() => removeRow(idx)} title={t("Xóa danh mục", "Delete category")}>
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
                      aria-label={t("Màu ", "Color ") + c}
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
            {t(<><b className="num">{movedCount}</b> giao dịch thuộc {removedInUse.map(n => `"${n}"`).join(", ")} sẽ chuyển sang "Khác" khi lưu</>, <><b className="num">{movedCount}</b> transactions in {removedInUse.map(n => `"${n}"`).join(", ")} will move to "Khác" (Other) on save</>)}
          </span>
        </div>
      )}
    </Modal>
  );
}

// ====== QuickTemplateModal — edit quick-entry templates in a dialog ======
function QuickTemplateModal({ templates, normalize, onSave, onClose }) {
  const t = useT();
  const [rows, setRows] = useState(() => templates.map(tpl => ({ ...tpl })));
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
    onSave(rows.map((tpl, i) => normalize(tpl, i)));
    onClose();
  };

  return (
    <Modal
      title={t("Sửa mẫu nhanh", "Edit quick templates")}
      subtitle={t("Mẫu giúp điền sẵn form chỉ với một chạm", "Templates prefill the form with a single tap")}
      onClose={onClose}
      headerExtra={
        <button className="quick-template-tool" onClick={addRow}>
          <Icons.plus size={13} /> {t("Thêm", "Add")}
        </button>
      }
      footer={
        <>
          <button className="btn btn-secondary modal-btn" onClick={onClose}>{t("Hủy", "Cancel")}</button>
          <button className="btn modal-btn" onClick={handleSave}><Icons.check size={14} /> {t("Lưu", "Save")}</button>
        </>
      }
    >
      {rows.length === 0 ? (
        <Empty icon="inbox" title={t("Chưa có mẫu nào", "No templates yet")} text={t("Bấm Thêm để tạo mẫu đầu tiên", "Tap Add to create your first one")} />
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
                placeholder={t("Tên mẫu", "Template name")}
                onChange={e => updateRow(tpl.id, { label: e.target.value })}
              />
              <select
                className="select quick-template-type"
                value={tpl.type}
                onChange={e => updateRow(tpl.id, { type: e.target.value })}
              >
                <option value="expense">{t("Chi", "Expense")}</option>
                <option value="income">{t("Thu", "Income")}</option>
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
              <button className="quick-template-delete" onClick={() => removeRow(tpl.id)} title={t("Xóa mẫu", "Delete template")}>
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
  { value: "date-desc", vi: "Mới nhất", en: "Newest" },
  { value: "date-asc",  vi: "Cũ nhất", en: "Oldest" },
  { value: "amount-desc", vi: "Tiền cao", en: "Highest" },
  { value: "amount-asc",  vi: "Tiền thấp", en: "Lowest" },
];

function SortDropdown({ value, onChange }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef(null);
  const selected = SORT_OPTIONS.find(o => o.value === value);
  const label = selected ? t(selected.vi, selected.en) : t("Sắp xếp", "Sort");

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
          {t(o.vi, o.en)}
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

function Transactions({ transactions, allTransactions = [], onAddTransaction, onUpdateTransaction, onDeleteTransaction, onSaveCategories, monthLabel, onMonthChange }) {
  const t = useT();
  const [mode, setMode] = useState("expense");
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [cat, setCat] = useState("Ăn uống");
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
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

  const sourceTxs = (fromDate || toDate) ? allTransactions : transactions;
  const filteredSourceTxs = useMemo(() => {
    if (!fromDate && !toDate) return sourceTxs;
    return sourceTxs.filter(t => {
      if (fromDate && t.date < fromDate) return false;
      if (toDate && t.date > toDate) return false;
      return true;
    });
  }, [sourceTxs, fromDate, toDate]);

  const incomeList = filteredSourceTxs.filter(t => t.type === "income");
  const expenseList = filteredSourceTxs.filter(t => t.type === "expense");
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
      <div className="codex-timeline-header" style={{ marginTop: 12, marginBottom: 12 }}>
        {t("GIAO DỊCH", "TRANSACTIONS")}
      </div>

      <div className="tx-layout">
        {/* ===== LEFT: form + summary ===== */}
        <aside className="tx-aside">
          <div ref={formRef} className="card tx-form-card stagger stagger-1" style={{ scrollMarginTop: 80 }}>
            <div className="card-header" style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div className="card-title">{editingTx ? t("Sửa giao dịch", "Edit transaction") : t("Thêm giao dịch", "Add transaction")}</div>
                
                <div className="hero-month-picker">
                    <button onClick={() => onMonthChange && onMonthChange(1)} aria-label={t("Tháng trước", "Previous month")}>
                      <Icons.chevLeft size={13} />
                    </button>
                    <span className="hero-month-label">{monthLabel}</span>
                    <button onClick={() => onMonthChange && onMonthChange(-1)} aria-label={t("Tháng sau", "Next month")}>
                      <Icons.chevRight size={13} />
                    </button>
                  </div>
              </div>
              {editingTx && (
                <button className="btn btn-secondary tx-cancel-edit" onClick={cancelEdit}>
                  <Icons.x size={14} /> {t("Hủy", "Cancel")}
                </button>
              )}
            </div>

            <TabBar
              tabs={[
                { id: "income", label: t("Thu nhập", "Income"), icon: Icons.arrowDownLeft, cls: "income", btnStyle: { flex: 1, justifyContent: "center" } },
                { id: "expense", label: t("Chi tiêu", "Expense"), icon: Icons.arrowUpRight, cls: "expense", btnStyle: { flex: 1, justifyContent: "center" } }
              ]}
              active={mode}
              onChange={setMode}
              style={{ marginBottom: 14, width: "100%" }}
            />

            <div className="tx-form-vertical">
              <div className="quick-templates">
                <div className="quick-template-head">
                  <div className="quick-template-label">{t("Mẫu nhanh", "Quick templates")}</div>
                  <div className="quick-template-tools">
                    <button className="quick-template-tool" onClick={() => setShowTemplateModal(true)}>
                      <Icons.pencil size={13} /> {t("Sửa", "Edit")}
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
                      <span>{tpl.label || tpl.desc || t("Mẫu mới", "New template")}</span>
                      <span className="num">{fmtShort(tpl.amount)}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <span className="field-label">{t("Mô tả", "Description")}</span>
                <input
                  className="input" type="text"
                  placeholder={mode === "income" ? t("VD: Lương, mẹ chuyển...", "e.g. Salary, transfer...") : t("VD: Cơm tấm, Grab, sách...", "e.g. Lunch, Grab, books...")}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </div>
              <div className="field tx-amount-field">
                <span className="field-label">{t("Số tiền", "Amount")}</span>
                <MoneyInput value={amount} onChange={setAmount} />
              </div>
              {mode === "expense" && (
                <div className="field">
                  <div className="field-label-row">
                    <span className="field-label">{t("Danh mục", "Category")}</span>
                    <button className="quick-template-tool" style={{ flex: "0 0 auto" }} onClick={() => setShowCatModal(true)}>
                      <Icons.pencil size={12} /> {t("Sửa", "Edit")}
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
                <span className="field-label">{t("Ngày", "Date")}</span>
                <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <button
                className={"btn tx-submit-btn" + (btnSuccess ? " btn-success" : "")}
                onClick={handleSubmit}
              >
                {btnSuccess || editingTx ? <Icons.check size={15} /> : <Icons.plus size={15} />}
                {editingTx ? t("Lưu thay đổi", "Save changes") : (btnSuccess ? t("Đã thêm!", "Added!") : t("Thêm giao dịch", "Add transaction"))}
              </button>
            </div>
          </div>

        </aside>

        {/* ===== RIGHT: list ===== */}
        <div className="tx-main">
          <div className="codex-timeline-header" style={{ marginTop: 18, marginBottom: 0 }}>
            {t("LỊCH SỬ GIAO DỊCH", "TRANSACTION HISTORY")}
          </div>
          <div className="search-bar stagger stagger-2" style={{ marginBottom: 14 }}>
            <Icons.search size={15} style={{ color: "var(--text-3)" }} />
            <input
              placeholder={t(`Tìm ${mode === "income" ? "thu nhập" : "chi tiêu"}, danh mục...`, `Search ${mode === "income" ? "income" : "expenses"}, category...`)}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            
            <div className="date-range-filter-inline">
              <span className="date-label">{t("Từ", "From")}</span>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="date-input" />
              <span className="date-label">{t("đến", "To")}</span>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="date-input" />
              {(fromDate || toDate) && (
                <button className="date-clear-btn" onClick={() => { setFromDate(""); setToDate(""); }}>
                  <Icons.x size={13} />
                </button>
              )}
            </div>

            <SortDropdown value={sortMode} onChange={setSortMode} />
            {hasListFilters && (
              <button className="tx-clear-filter" onClick={clearListFilters} title={t("Xóa lọc", "Clear filters")}>
                <Icons.x size={13} />
              </button>
            )}
            <span className="search-meta">{filtered.length} / {list.length}</span>
          </div>

          <div className="card tx-list-card stagger stagger-3">
            {list.length === 0 ? (
              <Empty icon="inbox" title={t("Chưa có giao dịch", "No transactions yet")}
                text={t(`Thêm ${mode === "income" ? "thu nhập" : "chi tiêu"} đầu tiên ở panel bên trái`, `Add your first ${mode === "income" ? "income" : "expense"} in the panel on the left`)} />
            ) : filtered.length === 0 ? (
              <Empty icon="search" title={t("Không tìm thấy", "No results")} text={t("Thử từ khóa khác hoặc xóa bộ lọc", "Try a different keyword or clear the filters")} />
            ) : (
              grouped.map(([day, items], groupIdx) => {
                const total = items.reduce((s, t) => s + t.amount, 0);
                const barPct = maxDayTotal > 0 ? (total / maxDayTotal) * 100 : 0;
                return (
                  <div key={day}>
                    <div className={"tx-day-head" + (mode === "income" ? " income" : "")}>
                      <div className="tx-day-label">
                        <span className="tx-day-name">{txDayLabel(day, t)}</span>
                        <span className={"num tx-day-total" + (mode === "income" ? " in" : "")}>
                          {mode === "income" ? "+" : ""}{fmt(total)}
                        </span>
                      </div>
                      <div className="tx-day-bar" aria-hidden="true">
                        <span style={{ width: barPct + "%" }} />
                      </div>
                    </div>
                    <div className="tx-list">
                      {items.map((tx, itemIdx) => {
                        const catInfo = tx.cat ? CATEGORIES[tx.cat] : null;
                        const bg = catInfo ? catInfo.color + "20" : "rgba(52,199,89,0.15)";
                        const fg = catInfo ? catInfo.color : "var(--c-green)";
                        const isNew = justAdded && groupIdx === 0 && itemIdx === 0;
                        const isEditing = editingTx && editingTx.id === tx.id;
                        return (
                          <div
                            className={"tx-row" + (isNew ? " tx-row-new" : "") + (isEditing ? " is-editing" : "")}
                            key={tx.id}
                            style={{ "--row-tint": catInfo ? catInfo.color + "14" : "rgba(52,199,89,0.10)" }}
                          >
                            <div className="tx-icon" style={{ background: bg, color: fg }}>
                              {catInfo ? catInfo.emoji : "💰"}
                            </div>
                            <div className="tx-info">
                              <span className="tx-desc">{tx.desc}</span>
                              <span className="tx-meta">{catInfo ? catInfo.name : t("Thu nhập", "Income")}</span>
                            </div>
                            <span className={"tx-amount " + (mode === "income" ? "in" : "out")}>
                              {mode === "income" ? "+" : "−"}{fmt(tx.amount)}
                            </span>
                            <div className="tx-actions">
                              <button className="tx-edit" title={t("Sửa", "Edit")}
                                onClick={() => startEdit(tx)}>
                                <Icons.pencil size={14} />
                              </button>
                              <button className="tx-delete" title={t("Xóa", "Delete")}
                                onClick={() => onDeleteTransaction && onDeleteTransaction(tx.id)}>
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