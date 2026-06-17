// Overview — hero balance, insights, category breakdown, flow chart, 6-month trend, debts

const GOAL_COLORS = ["#0A84FF","#FF9500","#34C759","#FF2D55","#5856D6","#AF52DE","#FF3B30","#00C7BE","#FFCC00","#A2845E"];
const FIXED_PACE_CATEGORIES = new Set(["Thuê trọ", "Trả nợ"]);
const GOAL_EMOJIS = ["🎯","💻","🏖️","🚗","📚","🏠","✈️","💍","🎓","📱","💪","🏋️","🎸","🌍","🐶"];

function GoalForm({ goal, onSave, onCancel }) {
  const [name, setName]       = useState(goal?.name    || "");
  const [emoji, setEmoji]     = useState(goal?.emoji   || "🎯");
  const [color, setColor]     = useState(goal?.color   || "#0A84FF");
  const [current, setCurrent] = useState(goal?.current || 0);
  const [target, setTarget]   = useState(goal?.target  || 0);
  const [monthly, setMonthly] = useState(goal?.monthly || 0);

  const handleSave = () => {
    if (!name.trim() || target <= 0) return;
    onSave({ id: goal?.id || Date.now(), name: name.trim(), emoji, color, current, target, monthly });
  };

  return (
    <div style={{
      marginTop: 14, padding: "14px 16px",
      background: "var(--surface-2)", borderRadius: "var(--r-lg)",
      border: "0.5px solid var(--border)",
      display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
        <div className="field" style={{ width: 70 }}>
          <span className="field-label">Icon</span>
          <input className="input" style={{ textAlign: "center", fontSize: 20, padding: "6px 8px" }}
            value={emoji} maxLength={2}
            onChange={e => setEmoji(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <span className="field-label">Tên mục tiêu</span>
          <input className="input" type="text" placeholder="VD: MacBook, Du lịch Nhật..."
            value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSave()} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {GOAL_EMOJIS.map(e => (
          <button key={e} onClick={() => setEmoji(e)} style={{
            width: 30, height: 30, borderRadius: 8, fontSize: 16,
            background: emoji === e ? "var(--accent-tint)" : "var(--surface-2)",
            border: emoji === e ? "1.5px solid var(--accent)" : "0.5px solid var(--border)",
          }}>{e}</button>
        ))}
      </div>

      <div>
        <div className="field-label" style={{ marginBottom: 6 }}>Màu</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {GOAL_COLORS.map(c => (
            <button key={c} onClick={() => setColor(c)} style={{
              width: 26, height: 26, borderRadius: "50%", background: c,
              border: color === c ? "2.5px solid var(--text)" : "2px solid transparent",
              outline: color === c ? "2px solid var(--surface-solid)" : "none",
              outlineOffset: 1,
            }} />
          ))}
        </div>
      </div>

      <div className="goal-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div className="field">
          <span className="field-label">Đã có</span>
          <MoneyInput value={current} onChange={setCurrent} />
        </div>
        <div className="field">
          <span className="field-label">Mục tiêu</span>
          <MoneyInput value={target} onChange={setTarget} />
        </div>
        <div className="field">
          <span className="field-label">Tiết kiệm/tháng</span>
          <MoneyInput value={monthly} onChange={setMonthly} />
        </div>
      </div>

      {target > 0 && monthly > 0 && (
        <div style={{ fontSize: 12, color: "var(--text-3)" }}>
          Ước tính còn <b style={{ color: "var(--text-2)" }}>
            ~{Math.ceil(Math.max(0, target - current) / monthly)} tháng
          </b> nữa để đạt mục tiêu
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn" style={{ flex: 1, height: 38 }} onClick={handleSave}>
          <Icons.check size={14} /> {goal ? "Lưu thay đổi" : "Thêm mục tiêu"}
        </button>
        <button className="btn btn-secondary" style={{ height: 38, padding: "0 14px" }} onClick={onCancel}>
          <Icons.x size={14} />
        </button>
      </div>
    </div>
  );
}

function GoalRow({ goal, onEdit, onDelete }) {
  const { emoji, color, name, current, target, monthly } = goal;
  const pct       = Math.min(100, current / target * 100);
  const remaining = Math.max(0, target - current);
  const etaMonths = monthly > 0 ? Math.ceil(remaining / monthly) : null;
  const R = 22, C = 2 * Math.PI * R;
  return (
    <div className="goal" style={{ position: "relative" }}>
      <div className="goal-ring">
        <svg width="56" height="56" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r={R} stroke="var(--surface-2)" strokeWidth="5" fill="none" />
          <circle cx="28" cy="28" r={R} stroke={color} strokeWidth="5" fill="none"
            strokeLinecap="round" strokeDasharray={C}
            strokeDashoffset={C * (1 - pct / 100)}
            transform="rotate(-90 28 28)"
            style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        </svg>
        <div className="goal-emoji">{emoji}</div>
      </div>
      <div className="goal-body">
        <div className="goal-head">
          <span className="goal-name">{name}</span>
          <span className="goal-pct num" style={{ color }}>{pct.toFixed(0)}%</span>
        </div>
        <div className="goal-meta">
          <span className="num">{fmt(current)}</span>
          <span className="goal-sep">·</span>
          <span>còn <span className="num">{fmt(remaining)}</span></span>
          {etaMonths != null && (
            <>
              <span className="goal-sep">·</span>
              <span>~{etaMonths} tháng nữa</span>
            </>
          )}
        </div>
      </div>
      <div className="goal-actions">
        <button className="goal-action-btn" onClick={() => onEdit(goal)} title="Sửa">
          <Icons.pencil size={13} />
        </button>
        <button className="goal-action-btn danger" onClick={() => onDelete(goal.id)} title="Xóa">
          <Icons.trash size={13} />
        </button>
      </div>
    </div>
  );
}

function Overview({ transactions, allTransactions, debts, budgets = [], goals, notes = "", onSaveNotes, viewMonth, viewYear, monthLabel, onMonthChange, openingBalance = 0, periodBalance, closingBalance, onNavigate, onAddTransaction, onUpdateTransaction, onDeleteTransaction, onSaveBudget, onSaveGoal, onDeleteGoal, theme, onTheme, lang, onLang }) {
  const [editingGoal, setEditingGoal] = useState(null);
  const [hoverCat, setHoverCat] = useState(null);
  const [pinnedCat, setPinnedCat] = useState(null);
  const [hoverDebt, setHoverDebt] = useState(null);
  const [debtView, setDebtView] = useState("owe");
  const [editTx, setEditTx] = useState(null);
  const [editDesc, setEditDesc] = useState("");
  const [editAmount, setEditAmount] = useState(0);
  const [editCat, setEditCat] = useState("");
  const [editDate, setEditDate] = useState("");
  const [chartView, setChartView] = useState("day");
  const [noteOpen, setNoteOpen] = useState(false);
  const [debtModalOpen, setDebtModalOpen] = useState(false);
  const [noteText, setNoteText] = useState(notes);
  const [showAddTx, setShowAddTx] = useState(false);
  const [addTxType, setAddTxType] = useState("expense");
  const [addTxDesc, setAddTxDesc] = useState("");
  const [addTxAmount, setAddTxAmount] = useState(0);
  const [addTxCat, setAddTxCat] = useState(() => Object.keys(CATEGORIES)[0] || "Ăn uống");
  const [addTxDate, setAddTxDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [showIncome, setShowIncome] = useState(false);
  const [incDesc, setIncDesc] = useState("");
  const [incAmount, setIncAmount] = useState(0);
  const [incDate, setIncDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [incomeTab, setIncomeTab] = useState("add");
  const [expenseTab, setExpenseTab] = useState("add");
  const [selectedCat, setSelectedCat] = useState(null);
  const [budgetModalOpen, setBudgetModalOpen] = useState(false);
  const [addingBudget, setAddingBudget] = useState(false);
  const [newBudgetCat, setNewBudgetCat] = useState("");
  const [newBudgetCap, setNewBudgetCap] = useState(0);
  const [quickTemplates, setQuickTemplates] = useState(() => {
    try {
      const raw = localStorage.getItem("fintrack-quick-templates-v1");
      return raw ? JSON.parse(raw) : [
        { desc: "Ăn trưa", amount: 35000, cat: "Ăn uống" },
        { desc: "Nước", amount: 10000, cat: "Ăn uống" },
        { desc: "Bánh mỳ", amount: 15000, cat: "Ăn uống" },
      ];
    } catch { return []; }
  });
  const [editingTemplates, setEditingTemplates] = useState(false);
  const [newTplDesc, setNewTplDesc] = useState("");
  const [newTplAmount, setNewTplAmount] = useState(0);
  const activeCat = hoverCat ?? pinnedCat;
  const togglePinnedCat = (id) => setPinnedCat(p => (p === id ? null : id));
  const saveQuickTemplates = (tpls) => {
    setQuickTemplates(tpls);
    try { localStorage.setItem("fintrack-quick-templates-v1", JSON.stringify(tpls)); } catch (_) {}
  };

  useEffect(() => {
    setHoverCat(null);
    setPinnedCat(null);
  }, [viewMonth, viewYear]);

  const income = useMemo(() =>
    transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const expense = useMemo(() =>
    transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const remaining = periodBalance ?? (income - expense);
  const finalBalance = closingBalance ?? (openingBalance + remaining);
  const savingsRate = income > 0 ? Math.round((remaining / income) * 100) : 0;
  const incomeCount = transactions.filter(t => t.type === "income").length;
  const expenseCount = transactions.filter(t => t.type === "expense").length;

  const openingBalanceAnim = useCountup(openingBalance);
  const incomeAnim    = useCountup(income);
  const expenseAnim   = useCountup(expense);
  const closingBalanceAnim = useCountup(finalBalance);

  const catRows = useMemo(() => {
    const spend = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      spend[t.cat] = (spend[t.cat] || 0) + t.amount;
    });
    return Object.entries(spend)
      .map(([cat, amount]) => ({
        id: cat, name: cat,
        color: CATEGORIES[cat]?.color || "#8E8E93",
        emoji: CATEGORIES[cat]?.emoji || "📦",
        amount,
        pct: expense > 0 ? (amount / expense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions, expense]);

  const dailyFlow = useMemo(() => {
    const flow = {};
    transactions.forEach(t => {
      const day = new Date(t.date + 'T00:00:00').getDate();
      if (!flow[day]) flow[day] = { d: day, inc: 0, exp: 0 };
      if (t.type === "income") flow[day].inc += t.amount;
      else flow[day].exp += t.amount;
    });
    return Object.values(flow).sort((a, b) => a.d - b.d);
  }, [transactions]);

  const sixMonths = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(viewYear, viewMonth - (5 - i), 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const label = `T${m + 1}/${String(y).slice(2)}`;
      const txns = allTransactions.filter(t => {
        const td = new Date(t.date + 'T00:00:00');
        return td.getMonth() === m && td.getFullYear() === y;
      });
      return {
        label,
        inc: txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
        exp: txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [allTransactions, viewMonth, viewYear]);

  const currentLabel = `T${viewMonth + 1}/${String(viewYear).slice(2)}`;
  const currentMonthIndex = sixMonths.findIndex(m => m.label === currentLabel);
  const currentMonthSummary = sixMonths.find(m => m.label === currentLabel) || { inc: 0, exp: 0 };
  const previousMonthSummary = currentMonthIndex > 0 ? sixMonths[currentMonthIndex - 1] : null;
  const spendingRatio = currentMonthSummary.inc > 0
    ? (currentMonthSummary.exp / currentMonthSummary.inc) * 100
    : (currentMonthSummary.exp > 0 ? 101 : 0);
  const spendingRatioLabel = currentMonthSummary.inc > 0
    ? formatPercent(spendingRatio)
    : (currentMonthSummary.exp > 0 ? ">100%" : "0,0%");
  const spendingProgress = Math.min(100, Math.max(0, spendingRatio));
  const spendingRatioTone = getSpendingRatioTone(spendingRatio);
  const spendingRatioMessage = getSpendingRatioMessage(spendingRatio, currentMonthSummary.inc, currentMonthSummary.exp);
  const incomeChangeText = previousMonthSummary ? formatChangeText("Thu", currentMonthSummary.inc, previousMonthSummary.inc) : null;
  const expenseChangeText = previousMonthSummary ? formatChangeText("Chi", currentMonthSummary.exp, previousMonthSummary.exp) : null;
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();

  const openOwe   = debts.filter(d => d.type === "owe"  && !d.settled).reduce((s, d) => s + d.amount, 0);
  const openOwed  = debts.filter(d => d.type === "lend" && !d.settled).reduce((s, d) => s + d.amount, 0);
  const openDebts = debts.filter(d => !d.settled);
  // Each ring shows ONE honest direction. "owe" (what you owe) and "lend"
  // (what others owe you) are opposites — mixing them into one total
  // double-counts and misleads, so the segmented control flips between them
  // instead. Group by counterparty so three Shopee instalments read as one
  // "Shopee Easy · 3 khoản" slice. Individual debts stay listed in the modal.
  const groupDebts = (type) => {
    const open = debts.filter(d => d.type === type && !d.settled && d.amount > 0);
    const total = open.reduce((s, d) => s + d.amount, 0);
    // One meaningful hue per direction (red = you owe, green = owed to you);
    // slices are shades of that hue, not unrelated colours. Largest = strongest.
    const base = type === "lend" ? "var(--c-green)" : "var(--c-red)";
    const byName = new Map();
    open.forEach(d => {
      const g = byName.get(d.name) || { name: d.name, type, amount: 0, count: 0 };
      g.amount += d.amount;
      g.count += 1;
      byName.set(d.name, g);
    });
    const rows = [...byName.values()]
      .sort((a, b) => b.amount - a.amount)
      .map((g, i) => ({
        id: type + "-" + g.name + "-" + i,
        name: g.name,
        type,
        color: base,
        shade: Math.max(0.4, 1 - i * 0.2),
        amount: g.amount,
        count: g.count,
        pct: total > 0 ? g.amount / total * 100 : 0,
      }));
    return { rows, total, accountCount: open.length };
  };
  const oweGroup  = useMemo(() => groupDebts("owe"),  [debts]);
  const lendGroup = useMemo(() => groupDebts("lend"), [debts]);
  const activeDebtView = debtView === "lend" && lendGroup.rows.length > 0 ? "lend"
    : (oweGroup.rows.length > 0 ? "owe" : (lendGroup.rows.length > 0 ? "lend" : "owe"));
  const activeGroup = activeDebtView === "lend" ? lendGroup : oweGroup;
  const debtRows = activeGroup.rows;
  const debtTotal = activeGroup.total;
  const debtAccountCount = activeGroup.accountCount;
  const debtCenterLabel = activeDebtView === "lend" ? "Người khác nợ bạn" : "Bạn đang nợ";
  const debtAmountColor = activeDebtView === "lend" ? "var(--c-green)" : "var(--c-red)";
  const debtAmountSign  = activeDebtView === "lend" ? "+" : "−";
  const today = new Date();
  const isCurrentView = today.getMonth() === viewMonth && today.getFullYear() === viewYear;
  const balanceLabel = isCurrentView ? "Số dư hiện tại" : "Số dư cuối tháng";
  const daysElapsed = isCurrentView ? Math.max(1, Math.min(today.getDate(), daysInMonth)) : daysInMonth;
  const balanceSeries = useMemo(() => {
    const byDay = new Map(dailyFlow.map(f => [f.d, f]));
    let running = openingBalance;
    const pts = [{ d: 0, v: running }];
    for (let day = 1; day <= daysElapsed; day++) {
      const f = byDay.get(day);
      if (f) running += (f.inc || 0) - (f.exp || 0);
      pts.push({ d: day, v: running });
    }
    return pts;
  }, [dailyFlow, openingBalance, daysElapsed]);
  const fixedPaceExpense = transactions
    .filter(t => t.type === "expense" && FIXED_PACE_CATEGORIES.has(t.cat))
    .reduce((s, t) => s + t.amount, 0);
  const variablePaceExpense = Math.max(0, expense - fixedPaceExpense);
  const dailyPace = variablePaceExpense > 0 ? variablePaceExpense / daysElapsed : 0;
  const projectedExpense = expense > 0 ? fixedPaceExpense + dailyPace * daysInMonth : 0;
  const budgetWatch = budgets
    .map(b => {
      const actual = transactions
        .filter(t => t.type === "expense" && t.cat === b.cat)
        .reduce((s, t) => s + t.amount, 0);
      return { ...b, actual, pct: b.cap > 0 ? (actual / b.cap) * 100 : 0 };
    })
    .filter(b => b.pct >= 80)
    .sort((a, b) => b.pct - a.pct)[0];
  const insightTone = remaining < 0 ? "red" : savingsRate >= 20 ? "green" : savingsRate >= 5 ? "blue" : "orange";
  const paceTone = projectedExpense > income && income > 0 ? "orange" : "indigo";
  const budgetTone = budgetWatch?.pct >= 100 ? "red" : budgetWatch ? "orange" : "green";

  // Balance-card insight rows — fills the lower half of the hero balance card
  const avgDailySpend = daysElapsed > 0 ? expense / daysElapsed : 0;
  const expenseMoM = previousMonthSummary && previousMonthSummary.exp > 0
    ? (currentMonthSummary.exp - previousMonthSummary.exp) / previousMonthSummary.exp * 100
    : null;
  const balanceInsights = [
    { key: "avg", icon: "clock", label: "TB chi mỗi ngày", value: fmtShort(avgDailySpend), tone: "plain" },
    isCurrentView
      ? { key: "proj", icon: "sparkle", label: "Dự chi cuối tháng", value: fmtShort(projectedExpense), tone: projectedExpense > income && income > 0 ? "orange" : "plain" }
      : { key: "final", icon: "wallet", label: "Số dư cuối tháng", value: fmtShort(finalBalance), tone: finalBalance < 0 ? "red" : "plain" },
    expenseMoM != null && { key: "mom", icon: expenseMoM >= 0 ? "arrowUp" : "arrowDown", label: "Chi so tháng trước", value: `${expenseMoM >= 0 ? "+" : ""}${expenseMoM.toFixed(0)}%`, tone: expenseMoM > 0 ? "red" : "green" },
  ].filter(Boolean);

  const handleAddQuickTx = () => {
    if (!addTxDesc.trim() || addTxAmount <= 0) return;
    if (onAddTransaction) {
      onAddTransaction({
        type: addTxType,
        desc: addTxDesc.trim(),
        amount: addTxAmount,
        cat: addTxType === "expense" ? addTxCat : "Thu nhập",
        date: addTxDate,
      });
    }
    setAddTxDesc("");
    setAddTxAmount(0);
    setAddTxCat(Object.keys(CATEGORIES)[0] || "Ăn uống");
    setAddTxDate(new Date().toISOString().slice(0, 10));
    setShowAddTx(false);
  };

  const incomeTxns = useMemo(() =>
    transactions
      .filter(t => t.type === "income")
      .slice()
      .sort((a, b) => (b.date || "").localeCompare(a.date || "") || String(b.id).localeCompare(String(a.id))),
    [transactions]
  );

  const expenseTxns = useMemo(() =>
    transactions
      .filter(t => t.type === "expense")
      .slice()
      .sort((a, b) => (b.date || "").localeCompare(a.date || "") || String(b.id).localeCompare(String(a.id))),
    [transactions]
  );

  const handleAddIncome = () => {
    if (!incDesc.trim() || incAmount <= 0) return;
    if (onAddTransaction) {
      onAddTransaction({
        type: "income",
        desc: incDesc.trim(),
        amount: incAmount,
        cat: "Thu nhập",
        date: incDate,
      });
    }
    setIncDesc("");
    setIncAmount(0);
    setIncDate(new Date().toISOString().slice(0, 10));
  };

  const handleSaveGoal = (g) => {
    onSaveGoal(g);
    setEditingGoal(null);
  };

  // ── Inline edit of a history transaction (floating panel beside the modal) ──
  const openEditTx = (t) => {
    setEditTx(t);
    setEditDesc(t.desc || "");
    setEditAmount(t.amount || 0);
    setEditCat(t.cat || "");
    setEditDate(t.date || new Date().toISOString().slice(0, 10));
  };
  const closeEditTx = () => setEditTx(null);
  const saveEditTx = () => {
    if (!editTx || !editDesc.trim() || editAmount <= 0) return;
    onUpdateTransaction && onUpdateTransaction(editTx.id, {
      desc: editDesc.trim(),
      amount: editAmount,
      cat: editTx.type === "expense" ? editCat : "Thu nhập",
      date: editDate,
    });
    closeEditTx();
  };
  const deleteEditTx = () => {
    if (!editTx) return;
    onDeleteTransaction && onDeleteTransaction(editTx.id);
    closeEditTx();
  };
  const editTxPanel = editTx ? (
    <div className="tx-edit-panel" role="dialog" aria-label="Sửa giao dịch">
      <div className="tx-edit-panel-head">
        <div className="tx-edit-panel-title">
          {editTx.type === "expense" ? "Sửa chi tiêu" : "Sửa thu nhập"}
        </div>
        <button className="modal-close" onClick={closeEditTx} aria-label="Đóng" title="Đóng">
          <Icons.x size={14} />
        </button>
      </div>
      <div className="tx-edit-panel-body">
        <div className="field">
          <span className="field-label">MÔ TẢ</span>
          <input
            className="input" type="text" value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            onKeyDown={e => e.key === "Enter" && saveEditTx()}
            autoFocus
          />
        </div>
        <div className="field">
          <span className="field-label">SỐ TIỀN</span>
          <MoneyInput value={editAmount} onChange={setEditAmount} />
        </div>
        {editTx.type === "expense" && (
          <div>
            <div style={{ marginBottom: 8 }}><span className="field-label">DANH MỤC</span></div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.values(CATEGORIES).map(c => (
                <button
                  key={c.name}
                  onClick={() => setEditCat(c.name)}
                  style={{
                    padding: "6px 12px", borderRadius: 99, fontSize: 13,
                    background: editCat === c.name ? c.color + "22" : "var(--surface-2)",
                    color: editCat === c.name ? c.color : "var(--text)",
                    border: editCat === c.name ? `1.5px solid ${c.color}` : "0.5px solid var(--border)",
                    cursor: "pointer", fontWeight: editCat === c.name ? 600 : 400, whiteSpace: "nowrap",
                  }}
                >
                  {c.emoji} {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="field">
          <span className="field-label">NGÀY</span>
          <input className="input" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
        </div>
      </div>
      <div className="tx-edit-panel-foot">
        <button className="btn btn-secondary tx-edit-delete" onClick={deleteEditTx}>
          <Icons.trash size={14} /> Xóa
        </button>
        <button className="btn" onClick={saveEditTx} disabled={!editDesc.trim() || editAmount <= 0}>
          Lưu thay đổi
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div className="page overview-page">
      <div className="overview-hero">
        <section className="hero-balance stagger stagger-1" aria-label={balanceLabel}>
          <div className="hero-bg" aria-hidden="true" />
          <div className="hero-balance-head">
            <button className="hero-balance-nav" onClick={() => onNavigate && onNavigate("transactions")} aria-label="Đến giao dịch">
              <div className="hero-balance-label"><Icons.wallet size={13} /> {balanceLabel}</div>
              <Icons.chevRight size={14} className="hero-nav-chevron" />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {onMonthChange && (
                <div className="hero-month-picker">
                  <button onClick={() => onMonthChange(1)} aria-label="Tháng trước"><Icons.chevLeft size={13} /></button>
                  <span className="hero-month-label">{monthLabel}</span>
                  <button onClick={() => onMonthChange(-1)} aria-label="Tháng sau"><Icons.chevRight size={13} /></button>
                </div>
              )}
            </div>
          </div>
          <div className="hero-balance-main">
            <div className="hero-balance-value num">{fmt(closingBalanceAnim)}</div>
            <button
              className="hero-note-btn"
              onClick={() => { setNoteText(notes); setNoteOpen(true); }}
              title="Ghi chú tháng"
              aria-label="Ghi chú tháng"
            >
              <Icons.pencil size={18} />
            </button>
          </div>
          <div className="hero-chips">
            <div className="hero-chip">
              <span className="hero-chip-label"><Icons.wallet size={12} /> Dư đầu tháng</span>
              <span className="hero-chip-value num">{fmt(openingBalanceAnim)}</span>
              <span className="hero-chip-sub">Chuyển từ các tháng trước</span>
            </div>
            <div className="hero-chip" role="button" tabIndex={0} style={{ cursor: "pointer" }}
                 onClick={() => { setIncDate(new Date().toISOString().slice(0, 10)); setShowIncome(true); }}
                 onKeyDown={e => (e.key === "Enter" || e.key === " ") && (setIncDate(new Date().toISOString().slice(0, 10)), setShowIncome(true))}>
              <span className="hero-chip-label">
                <Icons.arrowDownLeft size={12} /> Thu tháng này
                <Icons.chevRight size={11} style={{ marginLeft: 3, opacity: 0.55 }} />
              </span>
              <span className="hero-chip-value num">{fmt(incomeAnim)}</span>
              <span className="hero-chip-sub">
                {incomeCount} giao dịch · TB {incomeCount > 0 ? fmtShort(income / incomeCount) : "0"}/lần
              </span>
            </div>
            <div className="hero-chip" role="button" tabIndex={0} style={{ cursor: "pointer" }}
                 onClick={() => { setAddTxType("expense"); setAddTxDate(new Date().toISOString().slice(0, 10)); setShowAddTx(true); }}
                 onKeyDown={e => (e.key === "Enter" || e.key === " ") && (setAddTxType("expense"), setShowAddTx(true))}>
              <span className="hero-chip-label">
                <Icons.arrowUpRight size={12} /> Chi tháng này
                <Icons.chevRight size={11} style={{ marginLeft: 3, opacity: 0.55 }} />
              </span>
              <span className="hero-chip-value num">{fmt(expenseAnim)}</span>
              <span className="hero-chip-sub">
                {expenseCount} giao dịch · TB {expenseCount > 0 ? fmtShort(expense / expenseCount) : "0"}/lần
              </span>
            </div>
          </div>
          {balanceInsights.length > 0 && (
            <div className="hero-insights">
              {balanceInsights.map(it => {
                const Icon = Icons[it.icon];
                return (
                  <div className="hero-insight-row" key={it.key}>
                    <span className="hero-insight-label">{Icon && <Icon size={13} />} {it.label}</span>
                    <span className={"hero-insight-value num tone-" + it.tone}>{it.value}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="card overview-debt-card overview-hero-debt stagger stagger-3">
          <div className="card-header">
            <div className="card-title">Nợ &amp; Cho Vay</div>
            <button className="card-action" onClick={() => setDebtModalOpen(true)}>Quản lý</button>
          </div>
          <div className="hero-chips overview-debt-chips" style={{ marginTop: 12, gridTemplateColumns: "1fr 1fr" }} role="tablist" aria-label="Chiều nợ">
            <button
              type="button"
              role="tab"
              aria-selected={activeDebtView === "owe"}
              className={"hero-chip debt-toggle-chip" + (activeDebtView === "owe" ? " is-active" : "")}
              style={{ border: "1px solid var(--border)", boxShadow: activeDebtView === "owe" ? "inset 0 0 0 1.5px var(--c-red)" : "none" }}
              onClick={() => setDebtView("owe")}
            >
              <span className="hero-chip-label" style={{ color: "var(--text)" }}><Icons.arrowUpRight size={12} style={{ marginRight: 2 }} /> Bạn đang nợ</span>
              <span className="hero-chip-value num" style={{ color: "var(--text)" }}>{fmt(openOwe)}</span>
              <span className="hero-chip-sub">{oweGroup.accountCount} khoản đang nợ</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeDebtView === "lend"}
              className={"hero-chip debt-toggle-chip" + (activeDebtView === "lend" ? " is-active" : "")}
              style={{ border: "1px solid var(--border)", boxShadow: activeDebtView === "lend" ? "inset 0 0 0 1.5px var(--c-green)" : "none" }}
              onClick={() => setDebtView("lend")}
            >
              <span className="hero-chip-label" style={{ color: "var(--text)" }}><Icons.arrowDownLeft size={12} style={{ marginRight: 2 }} /> Người khác nợ bạn</span>
              <span className="hero-chip-value num" style={{ color: "var(--text)" }}>{fmt(openOwed)}</span>
              <span className="hero-chip-sub">{lendGroup.accountCount} khoản chưa thu</span>
            </button>
          </div>
          {debtRows.length > 0 ? (
            <div className="cat-donut-layout debt-donut-layout">
              <DebtDonut
                data={debtRows}
                total={debtTotal}
                centerLabel={debtCenterLabel}
                centerCount={debtAccountCount}
                activeId={hoverDebt}
                onHover={setHoverDebt}
                onSelect={() => setDebtModalOpen(true)}
              />
              <div className="cat-list debt-legend">
                {debtRows.slice(0, 6).map(d => (
                  <div
                    className={"debt-legend-row" + (hoverDebt == null ? "" : hoverDebt === d.id ? " is-active" : " is-dimmed")}
                    key={d.id}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoverDebt(d.id)}
                    onMouseLeave={() => setHoverDebt(null)}
                    onFocus={() => setHoverDebt(d.id)}
                    onBlur={() => setHoverDebt(null)}
                    onClick={() => setDebtModalOpen(true)}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDebtModalOpen(true); } }}
                  >
                    <span className="debt-legend-dot" style={{ background: d.color, opacity: d.shade != null ? d.shade : 1 }} aria-hidden="true" />
                    <span className="debt-legend-name">
                      <span className="debt-legend-name-text">{d.name}</span>
                      {d.count > 1 && <span className="debt-legend-count">{d.count} khoản</span>}
                    </span>
                    <span className="debt-legend-pct">{d.pct.toFixed(0)}%</span>
                    <span className="debt-legend-amount num" style={{ color: debtAmountColor }}>
                      {debtAmountSign}{fmtShort(d.amount)}
                    </span>
                  </div>
                ))}
                {debtRows.length > 6 && (
                  <button className="debt-legend-more" onClick={() => setDebtModalOpen(true)}>
                    +{debtRows.length - 6} {activeDebtView === "lend" ? "người khác" : "chủ nợ khác"}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="debt-donut-empty">
              <Icons.check size={26} />
              <span>{activeDebtView === "lend" ? "Chưa có ai nợ bạn" : "Bạn không nợ ai cả"}</span>
            </div>
          )}
        </div>
        {noteOpen && (
          <Modal
            title="Ghi chú tháng này"
            onClose={() => setNoteOpen(false)}
            width={460}
            footer={
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button className="btn btn-secondary" onClick={() => setNoteOpen(false)}>Hủy</button>
                <button className="btn" onClick={() => {
                  if (onSaveNotes) onSaveNotes(noteText);
                  setNoteOpen(false);
                }}>Lưu</button>
              </div>
            }
          >
            <textarea
              style={{
                width: "100%", minHeight: 140, resize: "vertical",
                background: "var(--surface-2)", border: "0.5px solid var(--border)",
                borderRadius: "var(--r-md)", padding: "10px 12px",
                fontSize: 14, color: "var(--text)", outline: "none",
                fontFamily: "inherit", lineHeight: 1.6, boxSizing: "border-box",
              }}
              placeholder="Ghi chú nhanh về tháng này…"
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
            />
          </Modal>
        )}
        {debtModalOpen && (
          <Modal
            title="Chi tiết Nợ & Cho Vay"
            onClose={() => setDebtModalOpen(false)}
            width={500}
          >
            <div className="debt-list" style={{ marginTop: -10 }}>
              {openDebts.length === 0 ? (
                <Empty icon="check" title="Sạch nợ!" text="Không có khoản nợ nào đang mở" />
              ) : (
                openDebts.map(d => {
                  const initials = d.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  const color = debtColor(d.name);
                  return (
                    <div className="debt-row" key={d.id}>
                      <div className="debt-avatar" style={{ background: color }}>{initials}</div>
                      <div className="debt-info">
                        <span className="debt-name">{d.name}</span>
                        <span className="debt-note">{d.note}</span>
                      </div>
                      <span className={"debt-amount num " + (d.type === "owe" ? "owe" : "owed")}>{fmt(d.amount)}</span>
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
               <button className="btn btn-secondary" onClick={() => { setDebtModalOpen(false); if (onNavigate) onNavigate("debts"); }}>Đi đến trang quản lý</button>
            </div>
          </Modal>
        )}
        {showAddTx && (
          <Modal
            title="Thêm giao dịch"
            onClose={() => { setShowAddTx(false); setEditingTemplates(false); setExpenseTab("add"); setEditTx(null); }}
            width={440}
            sidePanel={editTxPanel}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Tab toggle */}
              <div style={{
                display: "flex", background: "var(--surface-2)", borderRadius: 10,
                padding: 4, gap: 4,
              }}>
                <button
                  onClick={() => setExpenseTab("add")}
                  style={{
                    flex: 1, height: 36, borderRadius: 8, border: "none",
                    background: expenseTab === "add" ? "var(--surface)" : "transparent",
                    color: expenseTab === "add" ? "var(--text)" : "var(--text-2)",
                    fontWeight: expenseTab === "add" ? 600 : 400,
                    fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: expenseTab === "add" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <Icons.arrowUpRight size={13} /> Chi tiêu
                </button>
                <button
                  onClick={() => setExpenseTab("history")}
                  style={{
                    flex: 1, height: 36, borderRadius: 8, border: "none",
                    background: expenseTab === "history" ? "var(--surface)" : "transparent",
                    color: expenseTab === "history" ? "var(--text)" : "var(--text-2)",
                    fontWeight: expenseTab === "history" ? 600 : 400,
                    fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: expenseTab === "history" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <Icons.clock size={13} /> Lịch sử
                </button>
              </div>

              {expenseTab === "add" ? (
                <>
                  {/* MẪU NHANH */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span className="field-label">MẪU NHANH</span>
                      <button
                        className="btn btn-secondary"
                        style={{ height: 26, padding: "0 10px", fontSize: 12, gap: 4, minWidth: 0 }}
                        onClick={() => { setEditingTemplates(e => !e); setNewTplDesc(""); setNewTplAmount(0); }}
                      >
                        <Icons.pencil size={11} /> {editingTemplates ? "Xong" : "Sửa"}
                      </button>
                    </div>
                    {editingTemplates ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {quickTemplates.map((tpl, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--r-md)" }}>
                            <span style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>
                              {tpl.desc} · <span className="num">{fmtShort(tpl.amount)}</span>
                            </span>
                            <button className="goal-action-btn danger" title="Xóa" onClick={() => saveQuickTemplates(quickTemplates.filter((_, j) => j !== i))}>
                              <Icons.trash size={12} />
                            </button>
                          </div>
                        ))}
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            className="input"
                            type="text"
                            placeholder="Tên mẫu…"
                            value={newTplDesc}
                            onChange={e => setNewTplDesc(e.target.value)}
                            style={{ flex: 2 }}
                            onKeyDown={e => {
                              if (e.key === "Enter" && newTplDesc.trim() && newTplAmount > 0) {
                                saveQuickTemplates([...quickTemplates, { desc: newTplDesc.trim(), amount: newTplAmount, cat: addTxCat }]);
                                setNewTplDesc(""); setNewTplAmount(0);
                              }
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <MoneyInput value={newTplAmount} onChange={setNewTplAmount} />
                          </div>
                          <button
                            className="btn"
                            style={{ height: 38, padding: "0 12px", flexShrink: 0 }}
                            disabled={!newTplDesc.trim() || newTplAmount <= 0}
                            onClick={() => {
                              if (!newTplDesc.trim() || newTplAmount <= 0) return;
                              saveQuickTemplates([...quickTemplates, { desc: newTplDesc.trim(), amount: newTplAmount, cat: addTxCat }]);
                              setNewTplDesc(""); setNewTplAmount(0);
                            }}
                          >
                            <Icons.plus size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {quickTemplates.length === 0 ? (
                          <span style={{ fontSize: 13, color: "var(--text-3)" }}>Nhấn Sửa để thêm mẫu nhanh.</span>
                        ) : quickTemplates.map((tpl, i) => (
                          <button
                            key={i}
                            onClick={() => { setAddTxDesc(tpl.desc); setAddTxAmount(tpl.amount); if (tpl.cat && CATEGORIES[tpl.cat]) setAddTxCat(tpl.cat); }}
                            style={{
                              padding: "6px 12px", borderRadius: 99, fontSize: 13,
                              background: "var(--surface-2)", color: "var(--text)",
                              border: "0.5px solid var(--border)", cursor: "pointer", whiteSpace: "nowrap",
                            }}
                          >
                            {tpl.desc} <span className="num" style={{ color: "var(--text-2)" }}>{fmtShort(tpl.amount)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* MÔ TẢ */}
                  <div className="field">
                    <span className="field-label">MÔ TẢ</span>
                    <input
                      className="input"
                      type="text"
                      placeholder="VD: Cơm tấm, Grab, sách…"
                      value={addTxDesc}
                      onChange={e => setAddTxDesc(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleAddQuickTx()}
                      autoFocus
                    />
                  </div>

                  {/* SỐ TIỀN */}
                  <div className="field">
                    <span className="field-label">SỐ TIỀN</span>
                    <MoneyInput value={addTxAmount} onChange={setAddTxAmount} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 8 }}>
                      {[10000, 20000, 50000, 100000].map(amt => (
                        <button key={amt} className="btn btn-secondary" style={{ height: 34, fontSize: 13 }}
                          onClick={() => setAddTxAmount(v => (v || 0) + amt)}>
                          +{fmtShort(amt)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* DANH MỤC */}
                  <div>
                    <div style={{ marginBottom: 8 }}>
                      <span className="field-label">DANH MỤC</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {Object.values(CATEGORIES).map(c => (
                        <button
                          key={c.name}
                          onClick={() => setAddTxCat(c.name)}
                          style={{
                            padding: "6px 12px", borderRadius: 99, fontSize: 13,
                            background: addTxCat === c.name ? c.color + "22" : "var(--surface-2)",
                            color: addTxCat === c.name ? c.color : "var(--text)",
                            border: addTxCat === c.name ? `1.5px solid ${c.color}` : "0.5px solid var(--border)",
                            cursor: "pointer", fontWeight: addTxCat === c.name ? 600 : 400, whiteSpace: "nowrap",
                          }}
                        >
                          {c.emoji} {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* NGÀY */}
                  <div className="field">
                    <span className="field-label">NGÀY</span>
                    <input
                      className="input"
                      type="date"
                      value={addTxDate}
                      onChange={e => setAddTxDate(e.target.value)}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    className="btn"
                    onClick={handleAddQuickTx}
                    disabled={!addTxDesc.trim() || addTxAmount <= 0}
                    style={{ height: 50, fontSize: 16, fontWeight: 700, opacity: (!addTxDesc.trim() || addTxAmount <= 0) ? 0.5 : 1 }}
                  >
                    <Icons.plus size={16} /> Thêm giao dịch
                  </button>
                </>
              ) : (
                /* Lịch sử tab */
                <div className="quick-history-panel">
                  {expenseTxns.length === 0 ? (
                    <Empty icon="inbox" title="Chưa có chi tiêu" text="Thêm giao dịch đầu tiên của tháng" />
                  ) : (() => {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const yest = new Date(); yest.setDate(yest.getDate() - 1);
                    const yestStr = yest.toISOString().slice(0, 10);
                    const dayLabel = (d) => {
                      if (d === todayStr) return "HÔM NAY";
                      if (d === yestStr) return "HÔM QUA";
                      const dt = new Date(d + "T00:00:00");
                      return ["CN","T2","T3","T4","T5","T6","T7"][dt.getDay()] + ", " + dt.getDate() + "/" + (dt.getMonth()+1);
                    };
                    const groups = {};
                    expenseTxns.forEach(t => { const d = t.date || todayStr; if (!groups[d]) groups[d] = []; groups[d].push(t); });
                    return (
                      <div className="quick-history-scroll">
                        {Object.keys(groups).sort((a,b) => b.localeCompare(a)).map(d => {
                          const txs = groups[d];
                          const dayTotal = txs.reduce((s,t) => s + t.amount, 0);
                          return (
                            <div className="quick-history-day" key={d}>
                              <div className="quick-history-day-head">
                                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.04em" }}>{dayLabel(d)}</span>
                                <span className="num" style={{ fontSize: 11, color: "var(--text-3)" }}>{fmtShort(dayTotal)}</span>
                              </div>
                              <div className="quick-history-list">
                                {txs.map(t => {
                                  const cat = CATEGORIES[t.cat] || CATEGORIES[Object.keys(CATEGORIES)[0]];
                                  return (
                                    <div key={t.id}
                                      className={"tx-history-row" + (editTx && editTx.id === t.id ? " is-active" : "")}
                                      role="button" tabIndex={0}
                                      onClick={() => openEditTx(t)}
                                      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEditTx(t); } }}
                                    >
                                      <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:28, height:28, flexShrink:0, borderRadius:"50%", background:(cat.color||"#888")+"22", fontSize:13 }}>{cat.emoji||"💸"}</span>
                                      <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ fontSize:13, fontWeight:500, color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.desc||"Chi tiêu"}</div>
                                        <div style={{ fontSize:11, color:"var(--text-2)" }}>{t.cat}</div>
                                      </div>
                                      <div className="num" style={{ fontSize:13, fontWeight:600, color:"var(--c-red)" }}>-{fmtShort(t.amount)}</div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </Modal>
        )}
        {showIncome && (
          <Modal
            title="Thêm giao dịch"
            onClose={() => { setShowIncome(false); setIncomeTab("add"); setEditingTemplates(false); setEditTx(null); }}
            width={440}
            sidePanel={editTxPanel}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Tab toggle */}
              <div style={{
                display: "flex", background: "var(--surface-2)", borderRadius: 10,
                padding: 4, gap: 4,
              }}>
                <button
                  onClick={() => setIncomeTab("add")}
                  style={{
                    flex: 1, height: 36, borderRadius: 8, border: "none",
                    background: incomeTab === "add" ? "var(--surface)" : "transparent",
                    color: incomeTab === "add" ? "var(--text)" : "var(--text-2)",
                    fontWeight: incomeTab === "add" ? 600 : 400,
                    fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: incomeTab === "add" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <Icons.arrowDownLeft size={13} /> Thu nhập
                </button>
                <button
                  onClick={() => setIncomeTab("history")}
                  style={{
                    flex: 1, height: 36, borderRadius: 8, border: "none",
                    background: incomeTab === "history" ? "var(--surface)" : "transparent",
                    color: incomeTab === "history" ? "var(--text)" : "var(--text-2)",
                    fontWeight: incomeTab === "history" ? 600 : 400,
                    fontSize: 14, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    boxShadow: incomeTab === "history" ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  <Icons.clock size={13} /> Lịch sử
                </button>
              </div>

              {incomeTab === "add" ? (
                <>
                  {/* MẪU NHANH */}
                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span className="field-label">MẪU NHANH</span>
                      <button
                        className="btn btn-secondary"
                        style={{ height: 26, padding: "0 10px", fontSize: 12, gap: 4, minWidth: 0 }}
                        onClick={() => { setEditingTemplates(e => !e); setNewTplDesc(""); setNewTplAmount(0); }}
                      >
                        <Icons.pencil size={11} /> {editingTemplates ? "Xong" : "Sửa"}
                      </button>
                    </div>
                    {editingTemplates ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {quickTemplates.map((tpl, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--r-md)" }}>
                            <span style={{ flex: 1, fontSize: 13, color: "var(--text)" }}>
                              {tpl.desc} · <span className="num">{fmtShort(tpl.amount)}</span>
                            </span>
                            <button className="goal-action-btn danger" title="Xóa" onClick={() => saveQuickTemplates(quickTemplates.filter((_, j) => j !== i))}>
                              <Icons.trash size={12} />
                            </button>
                          </div>
                        ))}
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            className="input"
                            type="text"
                            placeholder="Tên mẫu…"
                            value={newTplDesc}
                            onChange={e => setNewTplDesc(e.target.value)}
                            style={{ flex: 2 }}
                            onKeyDown={e => {
                              if (e.key === "Enter" && newTplDesc.trim() && newTplAmount > 0) {
                                saveQuickTemplates([...quickTemplates, { desc: newTplDesc.trim(), amount: newTplAmount }]);
                                setNewTplDesc(""); setNewTplAmount(0);
                              }
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <MoneyInput value={newTplAmount} onChange={setNewTplAmount} />
                          </div>
                          <button
                            className="btn"
                            style={{ height: 38, padding: "0 12px", flexShrink: 0 }}
                            disabled={!newTplDesc.trim() || newTplAmount <= 0}
                            onClick={() => {
                              if (!newTplDesc.trim() || newTplAmount <= 0) return;
                              saveQuickTemplates([...quickTemplates, { desc: newTplDesc.trim(), amount: newTplAmount }]);
                              setNewTplDesc(""); setNewTplAmount(0);
                            }}
                          >
                            <Icons.plus size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {quickTemplates.length === 0 ? (
                          <span style={{ fontSize: 13, color: "var(--text-3)" }}>Nhấn Sửa để thêm mẫu nhanh.</span>
                        ) : quickTemplates.map((tpl, i) => (
                          <button
                            key={i}
                            onClick={() => { setIncDesc(tpl.desc); setIncAmount(tpl.amount); }}
                            style={{
                              padding: "6px 12px", borderRadius: 99, fontSize: 13,
                              background: "var(--surface-2)", color: "var(--text)",
                              border: "0.5px solid var(--border)", cursor: "pointer", whiteSpace: "nowrap",
                            }}
                          >
                            {tpl.desc} <span className="num" style={{ color: "var(--text-2)" }}>{fmtShort(tpl.amount)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* MÔ TẢ */}
                  <div className="field">
                    <span className="field-label">MÔ TẢ</span>
                    <input
                      className="input"
                      type="text"
                      placeholder="VD: Lương, mẹ chuyển…"
                      value={incDesc}
                      onChange={e => setIncDesc(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleAddIncome()}
                      autoFocus
                    />
                  </div>

                  {/* SỐ TIỀN */}
                  <div className="field">
                    <span className="field-label">SỐ TIỀN</span>
                    <MoneyInput value={incAmount} onChange={setIncAmount} />
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 8 }}>
                      {[10000, 20000, 50000, 100000].map(amt => (
                        <button key={amt} className="btn btn-secondary" style={{ height: 34, fontSize: 13 }}
                          onClick={() => setIncAmount(v => (v || 0) + amt)}>
                          +{fmtShort(amt)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* NGÀY */}
                  <div className="field">
                    <span className="field-label">NGÀY</span>
                    <input
                      className="input"
                      type="date"
                      value={incDate}
                      onChange={e => setIncDate(e.target.value)}
                    />
                  </div>

                  {/* Submit */}
                  <button
                    className="btn"
                    onClick={handleAddIncome}
                    disabled={!incDesc.trim() || incAmount <= 0}
                    style={{ height: 50, fontSize: 16, fontWeight: 700, opacity: (!incDesc.trim() || incAmount <= 0) ? 0.5 : 1 }}
                  >
                    <Icons.plus size={16} /> Thêm giao dịch
                  </button>
                </>
              ) : (
                /* Lịch sử tab */
                <div>
                  {incomeTxns.length === 0 ? (
                    <Empty icon="inbox" title="Chưa có thu nhập" text="Thêm khoản thu đầu tiên của tháng" />
                  ) : (() => {
                    const todayStr = new Date().toISOString().slice(0, 10);
                    const yest = new Date(); yest.setDate(yest.getDate() - 1);
                    const yestStr = yest.toISOString().slice(0, 10);
                    const dayLabel = (d) => {
                      if (d === todayStr) return "HÔM NAY";
                      if (d === yestStr) return "HÔM QUA";
                      const dt = new Date(d + "T00:00:00");
                      return ["CN","T2","T3","T4","T5","T6","T7"][dt.getDay()] + ", " + dt.getDate() + "/" + (dt.getMonth()+1);
                    };
                    const groups = {};
                    incomeTxns.forEach(t => { const d = t.date || todayStr; if (!groups[d]) groups[d] = []; groups[d].push(t); });
                    return (
                      <div style={{ maxHeight: 400, overflowY: "auto" }}>
                        {Object.keys(groups).sort((a,b) => b.localeCompare(a)).map(d => {
                          const txs = groups[d];
                          const dayTotal = txs.reduce((s,t) => s + t.amount, 0);
                          return (
                            <div key={d} style={{ marginBottom: 10 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom: 6, marginBottom: 6, borderBottom: "1px solid var(--border)" }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", letterSpacing: "0.04em" }}>{dayLabel(d)}</span>
                                <span className="num" style={{ fontSize: 11, color: "var(--text-3)" }}>{fmtShort(dayTotal)}</span>
                              </div>
                              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {txs.map(t => (
                                  <div key={t.id}
                                    className={"tx-history-row" + (editTx && editTx.id === t.id ? " is-active" : "")}
                                    role="button" tabIndex={0}
                                    onClick={() => openEditTx(t)}
                                    onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEditTx(t); } }}
                                    style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", background:"var(--surface-2)", border:"0.5px solid var(--border)", borderRadius:"var(--r-md)" }}>
                                    <span style={{ display:"flex", alignItems:"center", justifyContent:"center", width:28, height:28, flexShrink:0, borderRadius:"50%", background:"rgba(52,199,89,0.14)", color:"var(--c-green)" }}>
                                      <Icons.arrowDownLeft size={13} />
                                    </span>
                                    <div style={{ flex:1, minWidth:0 }}>
                                      <div style={{ fontSize:13, fontWeight:500, color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.desc||"Thu nhập"}</div>
                                      <div style={{ fontSize:11, color:"var(--text-2)" }}>Thu nhập</div>
                                    </div>
                                    <div className="num" style={{ fontSize:13, fontWeight:600, color:"var(--c-green)" }}>+{fmtShort(t.amount)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </Modal>
        )}
        {selectedCat && (() => {
          const catTxns = transactions
            .filter(t => t.type === "expense" && t.cat === selectedCat.id)
            .slice()
            .sort((a, b) => (b.date || "").localeCompare(a.date || "") || String(b.id).localeCompare(String(a.id)));
          return (
            <Modal
              title={`${selectedCat.emoji} ${selectedCat.name}`}
              subtitle={`${catTxns.length} giao dịch · ${fmt(selectedCat.amount)}`}
              onClose={() => setSelectedCat(null)}
              width={440}
            >
              {catTxns.length === 0 ? (
                <Empty icon="inbox" title="Chưa có giao dịch" text="Không có giao dịch nào trong danh mục này" />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 420, overflowY: "auto" }}>
                  {catTxns.map(t => (
                    <div
                      key={t.id}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px",
                        background: "var(--surface-2)", border: "0.5px solid var(--border)",
                        borderRadius: "var(--r-md)",
                      }}
                    >
                      <span style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 30, height: 30, flexShrink: 0, fontSize: 15,
                        borderRadius: "50%", background: selectedCat.color + "26",
                      }}>
                        {selectedCat.emoji}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {t.desc || t.cat || "Chi tiêu"}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                          {new Date(t.date + "T00:00:00").toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </div>
                      </div>
                      <div className="num" style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                        -{fmt(t.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Modal>
          );
        })()}
      {budgetModalOpen && (() => {
        const allBudgetRows = budgets.map(b => {
          const actual = transactions
            .filter(t => t.type === "expense" && t.cat === b.cat)
            .reduce((s, t) => s + t.amount, 0);
          const pct = b.cap > 0 ? (actual / b.cap) * 100 : 0;
          const isFixed = FIXED_PACE_CATEGORIES.has(b.cat);
          const dailyAvg = !isFixed && daysElapsed > 0 && actual > 0 ? actual / daysElapsed : null;
          const weeklyAvg = dailyAvg != null ? dailyAvg * 7 : null;
          return { ...b, actual, pct, isFixed, dailyAvg, weeklyAvg };
        }).sort((a, b) => b.pct - a.pct);
        const budgetedCats = new Set(budgets.map(b => b.cat));
        const availableCats = Object.values(CATEGORIES).filter(c => !budgetedCats.has(c.name) && c.name !== "Trả nợ");
        return (
          <Modal
            title="Ngân sách"
            subtitle={monthLabel}
            onClose={() => { setBudgetModalOpen(false); setAddingBudget(false); setNewBudgetCap(0); }}
            width={480}
            headerExtra={
              <button
                className="btn btn-secondary"
                style={{ height: 30, padding: "0 12px", fontSize: 13, gap: 4 }}
                onClick={() => {
                  setAddingBudget(a => !a);
                  setNewBudgetCap(0);
                  if (availableCats.length > 0) setNewBudgetCat(availableCats[0].name);
                }}
                title="Thêm ngân sách"
              >
                <Icons.plus size={13} /> Thêm
              </button>
            }
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {addingBudget && (
                <div style={{ padding: "14px 16px", background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--r-lg)", display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Thêm ngân sách mới</div>
                  {availableCats.length === 0 ? (
                    <div style={{ fontSize: 13, color: "var(--text-3)" }}>Tất cả danh mục đã có ngân sách.</div>
                  ) : (
                    <>
                      <div style={{ display: "flex", gap: 10 }}>
                        <div className="field" style={{ flex: 1 }}>
                          <span className="field-label">Danh mục</span>
                          <select className="input" value={newBudgetCat} onChange={e => setNewBudgetCat(e.target.value)} style={{ cursor: "pointer" }}>
                            {availableCats.map(c => (
                              <option key={c.name} value={c.name}>{c.emoji} {c.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="field" style={{ flex: 1 }}>
                          <span className="field-label">Hạn mức / tháng</span>
                          <MoneyInput value={newBudgetCap} onChange={setNewBudgetCap} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button className="btn" style={{ flex: 1, height: 38 }}
                          disabled={!newBudgetCat || newBudgetCap <= 0}
                          onClick={() => {
                            if (!newBudgetCat || newBudgetCap <= 0) return;
                            onSaveBudget && onSaveBudget(newBudgetCat, newBudgetCap);
                            setAddingBudget(false);
                            setNewBudgetCap(0);
                          }}>
                          <Icons.check size={14} /> Lưu
                        </button>
                        <button className="btn btn-secondary" style={{ height: 38, padding: "0 14px" }} onClick={() => setAddingBudget(false)}>
                          <Icons.x size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {allBudgetRows.length === 0 ? (
                <Empty icon="inbox" title="Chưa có ngân sách" text="Nhấn + Thêm để đặt hạn mức chi tiêu" />
              ) : (
                allBudgetRows.map(b => {
                  const cat = CATEGORIES[b.cat];
                  const color = cat?.color || "#8E8E93";
                  const barColor = b.pct >= 100 ? "var(--c-red)" : b.pct >= 80 ? "var(--c-orange)" : "var(--c-green)";
                  const barWidth = Math.min(100, b.pct);
                  return (
                    <div key={b.cat} style={{ padding: "16px 18px", background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--r-lg)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, flexShrink: 0, fontSize: 20, borderRadius: "50%", background: color + "26" }}>
                          {cat?.emoji || "📦"}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{b.cat}</div>
                          <div style={{ fontSize: 12, color: "var(--text-2)" }}>
                            <span className="num">{fmt(b.actual)}</span> / <span className="num">{fmt(b.cap)}</span>
                          </div>
                        </div>
                        <div className="num" style={{ fontSize: 20, fontWeight: 700, color: b.pct >= 100 ? "var(--c-red)" : b.pct >= 80 ? "var(--c-orange)" : "var(--text-2)" }}>
                          {b.pct.toFixed(0)}%
                        </div>
                      </div>
                      <div style={{ height: 8, borderRadius: 99, background: "var(--surface-3, var(--border))", overflow: "hidden", marginBottom: 8 }}>
                        <div style={{ height: "100%", width: barWidth + "%", background: barColor, borderRadius: 99, transition: "width 0.4s ease" }} />
                      </div>
                      {b.pct >= 80 && (
                        <div style={{ fontSize: 12, color: b.pct >= 100 ? "var(--c-red)" : "var(--c-orange)", marginBottom: b.dailyAvg != null ? 6 : 0 }}>
                          {b.pct >= 100 ? `Vượt hạn mức ${fmt(b.actual - b.cap)}` : `Còn ${fmt(b.cap - b.actual)} trước hạn mức`}
                        </div>
                      )}
                      {b.dailyAvg != null && (
                        <div style={{ display: "flex", gap: 16, marginTop: b.pct < 80 ? 4 : 0 }}>
                          <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                            TB/ngày: <b className="num" style={{ color: "var(--text-2)" }}>{fmtShort(Math.round(b.dailyAvg))}</b>
                          </span>
                          <span style={{ fontSize: 12, color: "var(--text-3)" }}>
                            TB/tuần: <b className="num" style={{ color: "var(--text-2)" }}>{fmtShort(Math.round(b.weeklyAvg))}</b>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Modal>
        );
      })()}
      </div>

      <div className="overview-dashboard-grid">
        <div className="card category-card overview-area-category stagger stagger-4">
          <div className="card-header">
            <div>
              <div className="card-title">Chi tiêu theo danh mục</div>
              <div className="card-subtitle">{fmt(expense)} · {expenseCount} giao dịch</div>
            </div>
            <button className="card-action" onClick={() => setBudgetModalOpen(true)} style={{ display: "flex", alignItems: "center", gap: 3, color: "var(--text)" }}>
              Ngân sách <Icons.chevRight size={12} />
            </button>
          </div>
          {catRows.length === 0 ? (
            <Empty icon="inbox" title="Chưa có chi tiêu" text="Thêm giao dịch để xem phân tích" />
          ) : (
            <div className="cat-donut-layout">
              <CategoryDonut
                data={catRows}
                total={expense}
                activeId={activeCat}
                onHover={setHoverCat}
                onSelect={togglePinnedCat}
              />
              <div className="cat-list">
                {catRows.map(c => (
                  <div
                    className={"cat-row" + (activeCat == null ? "" : activeCat === c.id ? " is-active" : " is-dimmed")}
                    key={c.id}
                    style={{ "--cat-color": c.color, "--cat-tint": c.color + "26" }}
                    role="button"
                    tabIndex={0}
                    onMouseEnter={() => setHoverCat(c.id)}
                    onMouseLeave={() => setHoverCat(null)}
                    onFocus={() => setHoverCat(c.id)}
                    onBlur={() => setHoverCat(null)}
                    onClick={() => setSelectedCat(c)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedCat(c);
                      }
                    }}
                  >
                    <span className="cat-chip" aria-hidden="true">{c.emoji}</span>
                    <div className="cat-name-text">{c.name}</div>
                    <div className="cat-pct">{c.pct.toFixed(0)}%</div>
                    <div className="cat-amount num">{fmt(c.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card overview-area-charts stagger stagger-5">
          <div className="card-header">
            <div>
              <div className="card-title">
                {chartView === "day" ? "Chi tiêu theo ngày" : "Chi tiêu theo tháng"}
              </div>
              <div className="card-subtitle">
                {chartView === "day"
                  ? `${monthLabel} · ${incomeCount + expenseCount} giao dịch`
                  : "6 tháng gần nhất"}
              </div>
            </div>
            <div className="chart-view-toggle">
              <button
                className={"chart-toggle-btn" + (chartView === "day" ? " active" : "")}
                onClick={() => setChartView("day")}
              >Ngày</button>
              <button
                className={"chart-toggle-btn" + (chartView === "month" ? " active" : "")}
                onClick={() => setChartView("month")}
              >Tháng</button>
            </div>
          </div>
          {chartView === "day" ? (
            dailyFlow.length === 0 ? (
              <Empty icon="trendUp" title="Chưa có dữ liệu" text="Thêm giao dịch để xem dòng tiền" />
            ) : (
              <FlowChart data={dailyFlow} daysInMonth={daysInMonth} />
            )
          ) : (
            <SixMonthBars data={sixMonths} currentLabel={currentLabel} />
          )}
        </div>

      </div>
    </div>
  );
}

window.Overview = Overview;
