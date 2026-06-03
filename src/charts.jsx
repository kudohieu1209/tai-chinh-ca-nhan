// Custom SVG charts — Apple Health/Stocks aesthetic, no Chart.js

const { useMemo: useMemoC } = React;

// ====== Daily cash flow — overlaid area chart ======
function FlowChart({ data, daysInMonth = 31 }) {
  const W = 600, H = 220, PAD_L = 40, PAD_R = 12, PAD_T = 14, PAD_B = 28;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;

  const series = useMemoC(() => {
    const arr = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const m = data.find(x => x.d === d);
      arr.push({ d, inc: m?.inc || 0, exp: m?.exp || 0 });
    }
    return arr;
  }, [data, daysInMonth]);

  const maxV = Math.max(...series.flatMap(s => [s.inc, s.exp]), 100);
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

  const incPts = series.map((s, i) => ({ x: xOf(i), y: yOf(s.inc) }));
  const expPts = series.map((s, i) => ({ x: xOf(i), y: yOf(s.exp) }));
  const incArea = smooth(incPts) + ` L ${xOf(daysInMonth - 1)} ${yOf(0)} L ${xOf(0)} ${yOf(0)} Z`;
  const expArea = smooth(expPts) + ` L ${xOf(daysInMonth - 1)} ${yOf(0)} L ${xOf(0)} ${yOf(0)} Z`;
  const xTicks = [1, 7, 14, 21, 28, daysInMonth];

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
        <svg viewBox={`0 0 ${W} ${H}`} className="flow-chart" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--c-green)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--c-green)" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--c-red)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--c-red)" stopOpacity="0" />
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
          <path d={incArea} className="flow-area-income" />
          <path d={smooth(expPts)} className="flow-line-expense" />
          <path d={smooth(incPts)} className="flow-line-income" />
          {series.map((s, i) => s.inc > 0 && (
            <circle key={"i" + i} cx={xOf(i)} cy={yOf(s.inc)} r="3" className="flow-dot-income" />
          ))}
          {series.map((s, i) => s.exp > 0 && (
            <circle key={"e" + i} cx={xOf(i)} cy={yOf(s.exp)} r="3" className="flow-dot-expense" />
          ))}
        </svg>
        <div className="flow-x-labels" aria-hidden="true">
          {xTicks.map(d => (
            <span key={d} style={{ left: `${xOf(d - 1) / W * 100}%` }}>{d}</span>
          ))}
        </div>
      </div>
      <div className="legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "var(--c-green)" }} /> Thu nhập
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: "var(--c-red)" }} /> Chi tiêu
        </div>
      </div>
    </>
  );
}

// ====== Category spend donut ======
function DonutChart({ segments, total }) {
  const [tooltip, setTooltip] = React.useState(null);
  const R   = 86;
  const SW  = 24;
  const C   = 2 * Math.PI * R;
  const GAP = 2.5;

  let accumulated = 0;
  const arcs = segments.map(s => {
    const len    = total > 0 ? (s.amount / total) * C - GAP : 0;
    const offset = C * 0.25 - accumulated;
    accumulated += len + GAP;
    return { ...s, len: Math.max(len, 0), offset };
  });

  const cx = R + SW / 2 + 4;
  const size = cx * 2;
  const updateTooltip = (event, segment) => {
    const svg = event.currentTarget.ownerSVGElement;
    const bounds = svg.getBoundingClientRect();
    setTooltip({
      segment,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  };
  const tooltipPct = tooltip && total > 0 ? Math.round(tooltip.segment.amount / total * 100) : 0;

  return (
    <div className="cat-donut-chart">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cx} r={R} fill="none"
          stroke="var(--surface-2)" strokeWidth={SW} />
        {arcs.map((s, i) => (
          <circle key={s.id}
            className="cat-donut-segment"
            cx={cx} cy={cx} r={R}
            fill="none"
            stroke={s.color}
            strokeWidth={SW}
            strokeLinecap="butt"
            strokeDasharray={`${s.len} ${C - s.len}`}
            strokeDashoffset={s.offset}
            tabIndex="0"
            role="img"
            aria-label={`${s.name}: ${total > 0 ? Math.round(s.amount / total * 100) : 0}%, ${fmt(s.amount)}`}
            onMouseEnter={e => updateTooltip(e, s)}
            onMouseMove={e => updateTooltip(e, s)}
            onMouseLeave={() => setTooltip(null)}
            onFocus={() => setTooltip({ segment: s, x: size / 2, y: size / 2 })}
            onBlur={() => setTooltip(null)}
            style={{
              transition: `stroke-dasharray var(--dur-reveal) var(--spring-snappy), stroke-dashoffset var(--dur-reveal) var(--spring-snappy), opacity var(--dur-quick) var(--spring-crisp), filter var(--dur-quick) var(--spring-crisp)`,
              animationDelay: `${i * 40}ms`,
            }}
          />
        ))}
      </svg>
      {tooltip && (
        <div className="cat-donut-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          <div className="cat-donut-tooltip-name">
            <span style={{ background: tooltip.segment.color }} />
            {tooltip.segment.name}
          </div>
          <div className="cat-donut-tooltip-meta">
            <b>{tooltipPct}%</b>
            <span>{fmt(tooltip.segment.amount)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ====== Six-month bar comparison ======
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

Object.assign(window, {
  FlowChart,
  DonutChart,
  SixMonthBars,
  BenchmarkBar,
  formatCurrency,
  formatPercent,
  calculateChangePercent,
  formatChangeText,
  getSpendingRatioMessage,
  getSpendingRatioTone,
});
