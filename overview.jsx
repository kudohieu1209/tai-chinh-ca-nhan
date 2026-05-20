// Overview — hero stats, category breakdown, flow chart, goals, debts, 6-month

const GOAL_COLORS = ["#0A84FF","#FF9500","#34C759","#FF2D55","#5856D6","#AF52DE","#FF3B30","#00C7BE","#FFCC00","#A2845E"];
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
      {/* Emoji picker + name */}
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

      {/* Emoji presets */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {GOAL_EMOJIS.map(e => (
          <button key={e} onClick={() => setEmoji(e)} style={{
            width: 30, height: 30, borderRadius: 8, fontSize: 16,
            background: emoji === e ? "var(--accent-tint)" : "var(--surface-2)",
            border: emoji === e ? "1.5px solid var(--accent)" : "0.5px solid var(--border)",
          }}>{e}</button>
        ))}
      </div>

      {/* Color swatches */}
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

      {/* Amounts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
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

      {/* ETA preview */}
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

function Overview({ transactions, allTransactions, debts, goals, viewMonth, viewYear, monthLabel, onNavigate, onSaveGoal, onDeleteGoal }) {
  const [editingGoal, setEditingGoal] = useState(null); // null = closed, "new" = add form, goal obj = edit form

  const income = useMemo(() =>
    transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const expense = useMemo(() =>
    transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const remaining = income - expense;
  const savingsRate = income > 0 ? Math.round((remaining / income) * 100) : 0;
  const incomeCount = transactions.filter(t => t.type === "income").length;
  const expenseCount = transactions.filter(t => t.type === "expense").length;

  const catRows = useMemo(() => {
    const spend = {};
    transactions.filter(t => t.type === "expense").forEach(t => {
      spend[t.cat] = (spend[t.cat] || 0) + t.amount;
    });
    return Object.entries(spend)
      .map(([cat, amount]) => ({
        id: cat, name: cat,
        emoji: CATEGORIES[cat]?.emoji || "📦",
        color: CATEGORIES[cat]?.color || "#8E8E93",
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
  const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();

  const openOwe   = debts.filter(d => d.type === "owe"  && !d.settled).reduce((s, d) => s + d.amount, 0);
  const openOwed  = debts.filter(d => d.type === "lend" && !d.settled).reduce((s, d) => s + d.amount, 0);
  const openDebts = debts.filter(d => !d.settled);

  const handleSaveGoal = (g) => {
    onSaveGoal(g);
    setEditingGoal(null);
  };

  return (
    <div className="page fade-in">
      <PageHeader greet="Xin chào, Hiếu 👋" title={monthLabel}>
        <button className="btn" onClick={() => onNavigate && onNavigate("transactions")}>
          <Icons.plus size={15} /> Thêm giao dịch
        </button>
      </PageHeader>

      {/* === Hero stats === */}
      <div className="stat-grid">
        <div className="stat">
          <div className="stat-label" style={{ color: "var(--c-green)" }}>
            <Icons.arrowDownLeft size={13} /> Thu nhập
          </div>
          <div className="stat-value num">{fmt(income)}</div>
          <div className="stat-sub">
            <span style={{ color: "var(--c-green)" }}>{incomeCount}</span> giao dịch ·
            TB <span className="num">{" "}{incomeCount > 0 ? fmtShort(income / incomeCount) : "0"}</span>/lần
          </div>
        </div>
        <div className="stat">
          <div className="stat-label" style={{ color: "var(--c-red)" }}>
            <Icons.arrowUpRight size={13} /> Chi tiêu
          </div>
          <div className="stat-value num">{fmt(expense)}</div>
          <div className="stat-sub">
            <span style={{ color: "var(--c-red)" }}>{expenseCount}</span> giao dịch ·
            TB <span className="num">{" "}{expenseCount > 0 ? fmtShort(expense / expenseCount) : "0"}</span>/lần
          </div>
        </div>
        <div className="stat">
          <div className="stat-label"><Icons.wallet size={13} /> Số dư còn lại</div>
          <div className="stat-value num">{fmt(remaining)}</div>
          <div className="stat-sub">
            Tiết kiệm {savingsRate}% thu nhập
            {savingsRate >= 5 && (
              <span className="pill"><Icons.check size={11} /> Đạt mục tiêu 5%</span>
            )}
          </div>
        </div>
      </div>

      {/* === Breakdown + Flow + Goals === */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Chi tiêu theo danh mục</div>
              <div className="card-subtitle">{fmt(expense)} · {expenseCount} giao dịch</div>
            </div>
            <button className="card-action" onClick={() => onNavigate && onNavigate("transactions")}>Xem tất cả</button>
          </div>
          {catRows.length === 0 ? (
            <Empty icon="pieChart" title="Chưa có chi tiêu" text="Thêm giao dịch để xem phân tích" />
          ) : (
            <>
              <div className="cat-stack">
                {catRows.map(c => (
                  <div key={c.id} style={{ width: c.pct + "%", background: c.color }}
                    title={`${c.name}: ${c.pct.toFixed(0)}%`} />
                ))}
              </div>
              <div className="cat-list">
                {catRows.map(c => (
                  <div className="cat-row" key={c.id}>
                    <span className="cat-dot" style={{ background: c.color }} />
                    <div className="cat-name">
                      <span>{c.emoji} {c.name}</span>
                      <span className="cat-pct">{c.pct.toFixed(0)}% tổng chi</span>
                    </div>
                    <span className="cat-amount num">{fmt(c.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="col">
          <div className="card">
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

          {/* === Goals card === */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Mục tiêu tiết kiệm</div>
                <div className="card-subtitle">
                  {goals.length > 0 ? `${goals.length} mục tiêu đang chạy` : "Chưa có mục tiêu nào"}
                </div>
              </div>
              <button className="card-action" onClick={() => setEditingGoal(editingGoal === "new" ? null : "new")}>
                {editingGoal === "new" ? "Hủy" : "+ Thêm"}
              </button>
            </div>

            {/* Add form */}
            {editingGoal === "new" && (
              <GoalForm
                onSave={handleSaveGoal}
                onCancel={() => setEditingGoal(null)}
              />
            )}

            {/* Goals list */}
            {goals.length === 0 && editingGoal !== "new" ? (
              <Empty icon="flag" title="Chưa có mục tiêu" text="Bấm + Thêm để tạo mục tiêu tiết kiệm đầu tiên" />
            ) : (
              <div className="goals" style={{ marginTop: editingGoal === "new" ? 14 : 0 }}>
                {goals.map(g => (
                  editingGoal?.id === g.id ? (
                    <GoalForm key={g.id} goal={g}
                      onSave={handleSaveGoal}
                      onCancel={() => setEditingGoal(null)} />
                  ) : (
                    <GoalRow key={g.id} goal={g}
                      onEdit={g => setEditingGoal(g)}
                      onDelete={id => onDeleteGoal(id)} />
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* === Six months + Debts === */}
      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">So sánh 6 tháng gần nhất</div>
            <div style={{ display: "flex", gap: 14, fontSize: 12, color: "var(--text-3)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: "var(--c-green)" }} /> Thu
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: "#8E8E93" }} /> Chi
              </span>
            </div>
          </div>
          <SixMonthBars data={sixMonths} currentLabel={currentLabel} />
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Nợ vay</div>
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
          <div className="debt-list">
            {openDebts.length === 0 ? (
              <Empty icon="check" title="Sạch nợ!" text="Không có khoản nợ nào đang mở" />
            ) : (
              openDebts.slice(0, 4).map(d => {
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
