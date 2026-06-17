// Custom SVG charts — Apple Health/Stocks aesthetic, no Chart.js

const { useMemo: useMemoC } = React;

function FlowChart({ data, daysInMonth = 31 }) {
  // Y-axis labels live in a fixed CSS gutter outside this viewBox, so the
  // horizontal padding stays small and never collides with them when the
  // SVG stretches (preserveAspectRatio="none").
  const W = 600, H = 220, PAD_L = 8, PAD_R = 10, PAD_T = 14, PAD_B = 28;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const [hoverDay, setHoverDay] = React.useState(null);

  const series = useMemoC(() => {
    const arr = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const m = data.find(x => x.d === d);
      arr.push({ d, inc: m?.inc || 0, exp: m?.exp || 0 });
    }
    return arr;
  }, [data, daysInMonth]);

  const maxV = Math.max(...series.map(s => s.exp), 100);
  const niceMax = Math.ceil(maxV / 500000) * 500000;

  const xOf = (i) => PAD_L + innerW * i / (daysInMonth - 1);
  const yOf = (v) => PAD_T + innerH - innerH * v / niceMax;

  const smooth = (pts) => {
    if (!pts.length) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1], p1 = pts[i];
      const cx = (p0.x + p1.x) / 2;
      path += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return path;
  };

  const expPts = series.map((s, i) => ({ x: xOf(i), y: yOf(s.exp) }));
  const expArea = smooth(expPts) + ` L ${xOf(daysInMonth - 1)} ${yOf(0)} L ${xOf(0)} ${yOf(0)} Z`;
  const xTicks = [1, 7, 14, 21, 28, daysInMonth];

  const handleHoverMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width * W;
    const idx = Math.round((px - PAD_L) / innerW * (daysInMonth - 1));
    setHoverDay(Math.max(0, Math.min(daysInMonth - 1, idx)));
  };
  const hovered = hoverDay != null ? series[hoverDay] : null;

  return (
    <>
      <div className="flow-chart-wrap">
        <div className="flow-y-labels" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => {
            const y = PAD_T + innerH * i / 4;
            const v = niceMax * (1 - i / 4);
            return <span key={i} style={{ top: `${y / H * 100}%` }}>{formatAxisValue(v)}</span>;
          })}
        </div>
        <div className="flow-plot">
        <svg viewBox={`0 0 ${W} ${H}`} className="flow-chart" preserveAspectRatio="none"
          onMouseMove={handleHoverMove} onMouseLeave={() => setHoverDay(null)}>
          <defs>
            <linearGradient id="gradDark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#E84040" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#E84040" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g className="flow-grid">
            {Array.from({ length: 5 }, (_, i) => {
              const y = PAD_T + innerH * i / 4;
              return (
                <g key={i}>
                  <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} />
                </g>
              );
            })}
          </g>
          <path d={expArea} className="flow-area-expense" />
          <path d={smooth(expPts)} className="flow-line-expense" />
          {hovered && (
            <g className="flow-hover" aria-hidden="true">
              <line className="flow-hover-line" x1={xOf(hoverDay)} y1={PAD_T} x2={xOf(hoverDay)} y2={PAD_T + innerH} />
              <circle cx={xOf(hoverDay)} cy={yOf(hovered.exp)} r="4.5" className="flow-dot-expense" />
            </g>
          )}
        </svg>
        <div className="flow-x-labels" aria-hidden="true">
          {xTicks.map(d => (
            <span key={d} style={{ left: `${xOf(d - 1) / W * 100}%` }}>{d}</span>
          ))}
        </div>
        {hovered && (
          <div
            className={"flow-tooltip" + (hoverDay > (daysInMonth - 1) * 0.62 ? " flip" : "")}
            style={{ left: `${xOf(hoverDay) / W * 100}%` }}
          >
            <div className="flow-tooltip-day">Ngày {hovered.d}</div>
            <div className="flow-tooltip-row expense"><span />Chi <b className="num">{fmt(hovered.exp)}</b></div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}

function formatCurrency(value) {
  const n = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + 'đ';
}

function formatPercent(value) {
  const n = Number.isFinite(value) ? value : 0;
  return n.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
}

function formatAxisValue(value) {
  const n = Number.isFinite(value) ? value : 0;
  if (n === 0) return '0';
  if (n >= 1e6) {
    const m = n / 1e6;
    return (Number.isInteger(m) ? String(m) : m.toFixed(1).replace(/\.0$/, '')) + 'M';
  }
  if (n >= 1e3) return Math.round(n / 1e3) + 'K';
  return String(Math.round(n));
}

function calculateChangePercent(current, previous) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

function formatChangeText(label, current, previous) {
  const change = calculateChangePercent(current, previous);
  if (change == null) return null;
  if (Math.abs(change) < 0.05) return `${label} không đổi so với tháng trước`;
  return `${label} ${change > 0 ? 'tăng' : 'giảm'} ${formatPercent(Math.abs(change))} so với tháng trước`;
}

function getSpendingRatioMessage(ratio, income, expense) {
  if (income <= 0 && expense > 0) return 'Chi tiêu đã vượt thu nhập tháng này.';
  if (ratio <= 50) return 'Bạn đang sử dụng dưới một nửa thu nhập trong tháng này.';
  if (ratio <= 70) return 'Chi tiêu đang ở mức ổn so với thu nhập tháng này.';
  if (ratio <= 90) return 'Chi tiêu chiếm phần lớn thu nhập tháng này.';
  if (ratio <= 100) return 'Chi tiêu gần bằng thu nhập tháng này.';
  return 'Chi tiêu đã vượt thu nhập tháng này.';
}

function getSpendingRatioTone(ratio) {
  if (ratio <= 50) return "low";
  if (ratio <= 70) return "medium";
  if (ratio <= 90) return "high";
  if (ratio <= 100) return "near";
  return "over";
}

function SixMonthBars({ data, currentLabel }) {
  const values = data.flatMap(m => [m.inc || 0, m.exp || 0]);
  const maxV = Math.max(...values, 0);
  const step = maxV > 0 ? Math.max(1000000, Math.ceil(maxV / 4 / 1000000) * 1000000) : 1000000;
  const niceMax = step * 4;
  const ticks = Array.from({ length: 5 }, (_, i) => niceMax - step * i);

  return (
    <div className="month-chart">
      <div className="month-y-axis" aria-hidden="true">
        {ticks.map((tick, i) => (
          <span key={tick} style={{ top: `${i / (ticks.length - 1) * 100}%` }}>{formatAxisValue(tick)}</span>
        ))}
      </div>
      <div className="month-plot">
        <div className="month-grid" aria-hidden="true">
          {ticks.map((tick, i) => (
            <span key={tick} style={{ top: `${i / (ticks.length - 1) * 100}%` }} />
          ))}
        </div>
        <div className="month-bars">
          {data.map(m => {
            const isCurrent = m.label === currentLabel;
            const inc = m.inc || 0;
            const exp = m.exp || 0;
            const incH = niceMax > 0 ? inc / niceMax * 100 : 0;
            const expH = niceMax > 0 ? exp / niceMax * 100 : 0;
            const hasData = inc > 0 || exp > 0;
            return (
              <div
                className={"mb-col" + (hasData ? " has-data" : " is-empty")}
                key={m.label}
                data-tooltip={`${m.label} · Thu ${formatCurrency(inc)} · Chi ${formatCurrency(exp)}`}
              >
                <div className="mb-bars-inner">
                  {inc > 0 && (
                    <div className={"mb-bar income" + (isCurrent ? " current" : "")}
                      style={{ height: incH + "%" }} title={`${m.label} · Thu ${formatCurrency(inc)} · Chi ${formatCurrency(exp)}`} />
                  )}
                  {exp > 0 && (
                    <div className={"mb-bar expense" + (isCurrent ? " current" : "")}
                      style={{ height: expH + "%" }} title={`${m.label} · Thu ${formatCurrency(inc)} · Chi ${formatCurrency(exp)}`} />
                  )}
                </div>
                <span className={"mb-label" + (isCurrent ? " current" : "")}>{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BenchmarkBar({ value, benchmark, max }) {
  const mePct = Math.min(100, value / max * 100);
  const avgPct = Math.min(100, benchmark / max * 100);
  return (
    <div className="benchmark-bar">
      <div className="me" style={{ width: mePct + "%" }} />
      <div className="avg" style={{ left: `calc(${avgPct}% - 1px)` }}
        title={"TB sinh viên: " + fmt(benchmark)} />
    </div>
  );
}

// ====== BalanceSparkline — cumulative balance line inside the hero card ======
function BalanceSparkline({ points, totalDays = 31, className = "hero-sparkline" }) {
  if (!points || points.length < 2) return null;
  const W = 600, H = 150, PAD = 12;
  const vals = points.map(p => p.v);
  const min = Math.min(...vals), max = Math.max(...vals);
  const flat = max === min;
  const xOf = (p) => W * p.d / totalDays;
  const yOf = (v) => flat ? H * 0.55 : PAD + (H - PAD * 2) * (1 - (v - min) / (max - min));
  const pts = points.map(p => ({ x: xOf(p), y: yOf(p.v) }));
  let line = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 1], p1 = pts[i];
    const cx = (p0.x + p1.x) / 2;
    line += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  const last = pts[pts.length - 1];
  const area = line + ` L ${last.x} ${H} L ${pts[0].x} ${H} Z`;
  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="heroSparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#heroSparkFill)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeOpacity="0.55" strokeWidth="2"
        vectorEffect="non-scaling-stroke" strokeLinecap="round" />
    </svg>
  );
}

// ====== CategoryDonut — spending share ring for the overview category card ======
function CategoryDonut({ data, total, activeId, onHover, onSelect }) {
  const SIZE = 200, R = 78, STROKE = 24, STROKE_ACTIVE = 30;
  const C = 2 * Math.PI * R;
  const GAP = data.length > 1 ? 5 : 0;

  // Clamp tiny slices to a visible/hoverable arc, then rescale the rest
  const segments = useMemoC(() => {
    if (!data.length || total <= 0) return [];
    const MIN_LEN = 7;
    const usable = C - GAP * data.length;
    const raw = data.map(c => Math.max(MIN_LEN, usable * c.amount / total));
    const scale = usable / raw.reduce((s, v) => s + v, 0);
    let start = 0;
    return data.map((c, i) => {
      const len = raw[i] * scale;
      const seg = { ...c, len, start };
      start += len + GAP;
      return seg;
    });
  }, [data, total]);

  const active = activeId != null ? data.find(c => c.id === activeId) : null;

  return (
    <div className="cat-donut">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Tỷ trọng chi tiêu theo danh mục">
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {segments.map(s => (
            <circle
              key={s.id}
              className={"cat-donut-seg" + (activeId == null ? "" : activeId === s.id ? " is-active" : " is-dimmed")}
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={activeId === s.id ? STROKE_ACTIVE : STROKE}
              strokeDasharray={`${s.len} ${C - s.len}`}
              strokeDashoffset={-s.start}
              tabIndex={0}
              aria-label={`${s.name} · ${s.pct.toFixed(0)}%`}
              onMouseEnter={() => onHover && onHover(s.id)}
              onMouseLeave={() => onHover && onHover(null)}
              onFocus={() => onHover && onHover(s.id)}
              onBlur={() => onHover && onHover(null)}
              onClick={() => onSelect && onSelect(s.id)}
              onKeyDown={e => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect && onSelect(s.id);
                }
              }}
            >
              <title>{`${s.name} · ${s.pct.toFixed(0)}%`}</title>
            </circle>
          ))}
        </g>
      </svg>
      <div className="cat-donut-center" aria-hidden="true">
        {active ? (
          <>
            <span className="cat-donut-center-label">{active.emoji} {active.name}</span>
            <span className="cat-donut-center-value num" style={{ color: active.color }}>{fmtShort(active.amount)}</span>
            <span className="cat-donut-center-sub">{active.pct.toFixed(0)}% tổng chi</span>
          </>
        ) : (
          <>
            <span className="cat-donut-center-label">Tổng chi</span>
            <span className="cat-donut-center-value num">{fmtShort(total)}</span>
            <span className="cat-donut-center-sub">{data.length} danh mục</span>
          </>
        )}
      </div>
    </div>
  );
}

// ====== DebtDonut — open-debt share ring for the overview debt card ======
function DebtDonut({ data, total, activeId, onHover, onSelect, centerLabel = "Tổng nợ", centerCount }) {
  const SIZE = 200, R = 78, STROKE = 22, STROKE_ACTIVE = 28;
  const C = 2 * Math.PI * R;
  const GAP = data.length > 1 ? 5 : 0;

  const segments = useMemoC(() => {
    if (!data.length || total <= 0) return [];
    const MIN_LEN = 7;
    const usable = C - GAP * data.length;
    const raw = data.map(c => Math.max(MIN_LEN, usable * c.amount / total));
    const scale = usable / raw.reduce((s, v) => s + v, 0);
    let start = 0;
    return data.map((c, i) => {
      const len = raw[i] * scale;
      const seg = { ...c, len, start };
      start += len + GAP;
      return seg;
    });
  }, [data, total]);

  const active = activeId != null ? data.find(c => c.id === activeId) : null;

  return (
    <div className="cat-donut">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label="Tỷ trọng nợ theo khoản">
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {segments.map(s => (
            <circle
              key={s.id}
              className={"cat-donut-seg" + (activeId == null ? "" : activeId === s.id ? " is-active" : " is-dimmed")}
              cx={SIZE / 2} cy={SIZE / 2} r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={activeId === s.id ? STROKE_ACTIVE : STROKE}
              strokeDasharray={`${s.len} ${C - s.len}`}
              strokeDashoffset={-s.start}
              onMouseEnter={() => onHover && onHover(s.id)}
              onMouseLeave={() => onHover && onHover(null)}
              onClick={() => onSelect && onSelect(s.id)}
              style={{ cursor: onSelect ? "pointer" : "default" }}
            >
              <title>{`${s.name} · ${s.pct.toFixed(0)}%`}</title>
            </circle>
          ))}
        </g>
      </svg>
      <div className="cat-donut-center" aria-hidden="true">
        {active ? (
          <>
            <span className="cat-donut-center-label">{active.name}</span>
            <span className="cat-donut-center-value num" style={{ color: active.color }}>{fmtShort(active.amount)}</span>
            <span className="cat-donut-center-sub">{active.pct.toFixed(0)}%{active.count > 1 ? ` · ${active.count} khoản` : ""}</span>
          </>
        ) : (
          <>
            <span className="cat-donut-center-label">{centerLabel}</span>
            <span className="cat-donut-center-value num">{fmtShort(total)}</span>
            <span className="cat-donut-center-sub">{centerCount != null ? centerCount : data.length} khoản</span>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, {
  FlowChart,
  CategoryDonut,
  DebtDonut,
  SixMonthBars,
  BenchmarkBar,
  BalanceSparkline,
  formatCurrency,
  formatPercent,
  calculateChangePercent,
  formatChangeText,
  getSpendingRatioMessage,
  getSpendingRatioTone,
});
