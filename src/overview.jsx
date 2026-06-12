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

function Overview({ transactions, allTransactions, debts, budgets = [], goals, viewMonth, viewYear, monthLabel, openingBalance = 0, periodBalance, closingBalance, onNavigate, onSaveGoal, onDeleteGoal }) {
  const [editingGoal, setEditingGoal] = useState(null);
  const [hoverCat, setHoverCat] = useState(null);
  const [pinnedCat, setPinnedCat] = useState(null);
  const activeCat = hoverCat ?? pinnedCat;
  const togglePinnedCat = (id) => setPinnedCat(p => (p === id ? null : id));

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

  const handleSaveGoal = (g) => {
    onSaveGoal(g);
    setEditingGoal(null);
  };

  return (
    <div className="page overview-page">
      <div className="overview-hero">
        <section className="hero-balance stagger stagger-1" aria-label={balanceLabel}>
          <div className="hero-bg" aria-hidden="true" />
          <BalanceSparkline points={balanceSeries} totalDays={daysInMonth} />
          <div className="hero-balance-head">
            <div className="hero-balance-label"><Icons.wallet size={13} /> {balanceLabel}</div>
            {income > 0 && (
              <span className={"hero-pill" + (remaining < 0 ? " negative" : "")}>
                {remaining < 0 ? "Chi vượt thu" : `Giữ lại ${savingsRate}% thu nhập`}
              </span>
            )}
          </div>
          <div className="hero-balance-value num">{fmt(closingBalanceAnim)}</div>
          <div className="hero-balance-sub">
            {finalBalance >= 0 ? "Còn lại sau chi tiêu" : "Đang âm sau chi tiêu"} · {monthLabel}
          </div>
          <div className="hero-chips">
            <div className="hero-chip">
              <span className="hero-chip-label"><Icons.wallet size={12} /> Dư đầu tháng</span>
              <span className="hero-chip-value num">{fmt(openingBalanceAnim)}</span>
              <span className="hero-chip-sub">Chuyển từ các tháng trước</span>
            </div>
            <div className="hero-chip">
              <span className="hero-chip-label"><Icons.arrowDownLeft size={12} /> Thu tháng này</span>
              <span className="hero-chip-value num">{fmt(incomeAnim)}</span>
              <span className="hero-chip-sub">
                {incomeCount} giao dịch · TB {incomeCount > 0 ? fmtShort(income / incomeCount) : "0"}/lần
              </span>
            </div>
            <div className="hero-chip">
              <span className="hero-chip-label"><Icons.arrowUpRight size={12} /> Chi tháng này</span>
              <span className="hero-chip-value num">{fmt(expenseAnim)}</span>
              <span className="hero-chip-sub">
                {expenseCount} giao dịch · TB {expenseCount > 0 ? fmtShort(expense / expenseCount) : "0"}/lần
              </span>
            </div>
          </div>
        </section>

        <div className="overview-insights overview-hero-insights">
        <Insight tone={insightTone} icon={remaining < 0 ? "alertTri" : "wallet"} title="Dòng tiền tháng">
          {income > 0 ? (
            <>Bạn đang giữ lại <b>{savingsRate}%</b> thu nhập tháng này.</>
          ) : (
            <>Chưa có thu nhập trong tháng này. Dư đầu tháng không tính là thu nhập mới.</>
          )}
        </Insight>
        <Insight tone={paceTone} icon="trendUp" title="Nhịp chi tiêu">
          {expense > 0 ? (
            <>Nếu giữ nhịp này, cuối tháng chi khoảng <b>{fmt(projectedExpense)}</b>.</>
          ) : (
            <>Chưa có chi tiêu để dự báo nhịp tháng này.</>
          )}
        </Insight>
        <Insight tone={budgetTone} icon={budgetWatch ? "bell" : "check"} title="Ngân sách">
          {budgetWatch ? (
            <><b>{budgetWatch.cat}</b> đã dùng {budgetWatch.pct.toFixed(0)}% hạn mức.</>
          ) : (
            <>Chưa có danh mục nào chạm ngưỡng 80%.</>
          )}
        </Insight>
        </div>
      </div>

      <div className="overview-dashboard-grid">
        <div className="card category-card overview-area-category stagger stagger-4">
          <div className="card-header">
            <div>
              <div className="card-title">Chi tiêu theo danh mục</div>
              <div className="card-subtitle">{fmt(expense)} · {expenseCount} giao dịch</div>
            </div>
            <button className="card-action" onClick={() => onNavigate && onNavigate("transactions")}>Xem tất cả</button>
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
                    onClick={() => togglePinnedCat(c.id)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        togglePinnedCat(c.id);
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

        <div className="card flow-card overview-area-flow stagger stagger-5">
            <div className="card-header">
              <div>
                <div className="card-title">Dòng tiền theo ngày</div>
                <div className="card-subtitle">{monthLabel} · {incomeCount + expenseCount} giao dịch</div>
              </div>
            </div>
            {dailyFlow.length === 0 ? (
              <Empty icon="trendUp" title="Chưa có dữ liệu" text="Thêm giao dịch để xem dòng tiền" />
            ) : (
              <FlowChart data={dailyFlow} daysInMonth={daysInMonth} />
            )}
          </div>

        <div className="card trend-card overview-area-trend stagger stagger-6">
          <div className="card-header trend-header">
            <div className="card-title">So sánh thu chi 6 tháng gần nhất</div>
            <div className="trend-legend">
              <span><i className="income" /> Thu</span>
              <span><i className="expense" /> Chi</span>
            </div>
          </div>
          <div className="trend-body">
            <div className="trend-chart-panel">
              <SixMonthBars data={sixMonths} currentLabel={currentLabel} />
            </div>
            <aside className="trend-insight">
              <div className="trend-insight-label">Tỷ lệ chi tiêu</div>
              <div className="trend-ratio num">{spendingRatioLabel}</div>
              <div className="trend-ratio-caption">Chi / Thu tháng này</div>
              <div className={"trend-progress " + spendingRatioTone} aria-hidden="true">
                <span style={{ width: spendingProgress + "%" }} />
              </div>
              <div className="trend-message">{spendingRatioMessage}</div>
              {(incomeChangeText || expenseChangeText) && (
                <div className="trend-compare">
                  <div className="trend-compare-title">So với tháng trước</div>
                  {incomeChangeText && <div>{incomeChangeText}</div>}
                  {expenseChangeText && <div>{expenseChangeText}</div>}
                </div>
              )}
            </aside>
          </div>
        </div>

        <div className="card overview-debt-card overview-area-debt stagger stagger-7">
          <div className="card-header">
            <div className="card-title">Nợ &amp; Cho Vay</div>
            <button className="card-action" onClick={() => onNavigate && onNavigate("debts")}>Quản lý</button>
          </div>
          <div className="debt-split">
            <div className="debt-card owe">
              <div className="debt-card-label"><Icons.arrowUpRight size={11} /> Bạn đang nợ</div>
              <div className="debt-card-value num">{fmt(openOwe)}</div>
              <div className="debt-card-sub">{debts.filter(d => d.type === "owe" && !d.settled).length} khoản đang nợ</div>
            </div>
            <div className="debt-card owed">
              <div className="debt-card-label"><Icons.arrowDownLeft size={11} /> Người khác nợ bạn</div>
              <div className="debt-card-value num">{fmt(openOwed)}</div>
              <div className="debt-card-sub">{debts.filter(d => d.type === "lend" && !d.settled).length} khoản chưa thu</div>
            </div>
          </div>
          <div className="debt-list overview-debt-list">
            {openDebts.length === 0 ? (
              <Empty icon="check" title="Sạch nợ!" text="Không có khoản nợ nào đang mở" />
            ) : (
              openDebts.map(d => {
                const initials = d.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                const color = debtColor(d.id);
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
        </div>
      </div>
    </div>
  );
}

window.Overview = Overview;
