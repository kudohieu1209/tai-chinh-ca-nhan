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
            const v = niceMax * (1 - i / 4);
            return (
              <g key={i}>
                <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} />
                <text x={PAD_L - 8} y={y + 3} textAnchor="end">{fmtShort(v)}</text>
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
        <g>
          {xTicks.map(d => (
            <text key={d} x={xOf(d - 1)} y={H - 10} textAnchor="middle">{d}</text>
          ))}
        </g>
      </svg>
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

// ====== Six-month bar comparison ======
function SixMonthBars({ data, currentLabel }) {
  const maxV = Math.max(...data.flatMap(m => [m.inc, m.exp]), 100);
  return (
    <div className="month-bars" style={{ height: "250px" }}>
      {data.map(m => {
        const isCurrent = m.label === currentLabel;
        const incH = m.inc / maxV * 100;
        const expH = m.exp / maxV * 100;
        const hasData = m.inc > 0 || m.exp > 0;
        return (
          <div className="mb-col" key={m.label}>
            <div className="mb-bars">
              {hasData ? (
                <>
                  <div className={"mb-bar income" + (isCurrent ? " current" : "")}
                    style={{ height: incH + "%" }} title={"Thu: " + fmt(m.inc)} />
                  <div className={"mb-bar expense" + (isCurrent ? " current" : "")}
                    style={{ height: expH + "%" }} title={"Chi: " + fmt(m.exp)} />
                </>
              ) : (
                <div style={{
                  flex: 1, alignSelf: "stretch", borderRadius: 6,
                  background: "repeating-linear-gradient(45deg, var(--surface-2), var(--surface-2) 4px, transparent 4px, transparent 8px)",
                  opacity: 0.7, display: "grid", placeItems: "center",
                  fontSize: 10, color: "var(--text-4)"
                }}>—</div>
              )}
            </div>
            <span className={"mb-label" + (isCurrent ? " current" : "")}>{m.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ====== Benchmark mini bar ======
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

Object.assign(window, { FlowChart, SixMonthBars, BenchmarkBar });
