// Shared building blocks — hook declarations here make them available globally to all subsequent files

const { useState, useEffect, useMemo, useRef, useCallback } = React;

// ====== useCountup — animates a number from 0 to target on mount/change ======
function useCountup(target, duration = 850) {
  const [value, setValue] = useState(0);
  const rafRef  = useRef(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const from  = fromRef.current;
    const start = performance.now();
    const tick  = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      const cur = Math.round(from + (target - from) * eased);
      setValue(cur);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

// ====== AppSkeleton — shown while Firebase loads ======
function AppSkeleton() {
  return (
    <div className="app">
      <aside className="sidebar" style={{ paddingTop: 24 }}>
        <div style={{ padding: "0 10px 20px", display: "flex", alignItems: "center", gap: 10 }}>
          <div className="skeleton" style={{ width: 28, height: 28, borderRadius: 7, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 11, width: "65%", marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 9,  width: "40%" }} />
          </div>
        </div>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 10px", marginBottom: 3 }}>
            <div className="skeleton" style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0 }} />
            <div className="skeleton" style={{ flex: 1, height: 11 }} />
          </div>
        ))}
      </aside>
      <main className="main">
        <div className="toolbar">
          <div className="skeleton" style={{ width: 80, height: 14, borderRadius: 6 }} />
          <div className="skeleton" style={{ width: 164, height: 30, borderRadius: 999 }} />
        </div>
        <div className="page">
          <div style={{ marginBottom: 26 }}>
            <div className="skeleton" style={{ height: 11, width: 180, marginBottom: 10, borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 28, width: 260, borderRadius: 8 }} />
          </div>
          <div className="stat-grid" style={{ marginBottom: 14 }}>
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 116, borderRadius: 22 }} />)}
          </div>
          <div className="grid-2">
            <div className="skeleton" style={{ height: 290, borderRadius: 22 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="skeleton" style={{ height: 180, borderRadius: 22 }} />
              <div className="skeleton" style={{ height: 100, borderRadius: 22 }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ====== Sidebar ======
function Sidebar({ active, onChange, theme, onTheme, debts = [] }) {
  const openDebtCount = debts.filter(d => !d.settled).length;

  const navItems = [
    { id: "overview",     label: "Tổng quan",  icon: "squareGrid",    badge: null },
    { id: "transactions", label: "Giao dịch",  icon: "arrowLeftRight", badge: null },
    { id: "debts",        label: "Nợ vay",     icon: "creditCard",     badge: openDebtCount > 0 ? openDebtCount : null },
    { id: "budget",       label: "Ngân sách",  icon: "wallet",         badge: null },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0A84FF" />
                <stop offset="100%" stopColor="#5E5CE6" />
              </linearGradient>
            </defs>
            <rect width="28" height="28" rx="7" fill="url(#brandGrad)" />
            <rect x="6.5" y="15" width="3.2" height="7" rx="1.2" fill="white" opacity="0.7" />
            <rect x="12.4" y="11" width="3.2" height="11" rx="1.2" fill="white" opacity="0.85" />
            <rect x="18.3" y="6" width="3.2" height="16" rx="1.2" fill="white" />
          </svg>
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Hiewu</span>
          <span className="sidebar-brand-sub">Finance</span>
        </div>
      </div>

      <div className="sidebar-section-label">Quản lý</div>
      {navItems.map(item => {
        const Icon = Icons[item.icon];
        return (
          <div
            key={item.id}
            className={"nav-item" + (active === item.id ? " active" : "")}
            onClick={() => onChange(item.id)}
          >
            <Icon size={17} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
            {item.badge != null && <span className="nav-badge">{item.badge}</span>}
          </div>
        );
      })}

      <div className="sidebar-section-label">Khám phá</div>
      <div className="nav-item">
        <Icons.sparkle size={17} className="nav-icon" />
        <span className="nav-label">Gợi ý AI</span>
        <span className="nav-badge" style={{ background: "rgba(94,92,230,0.15)", color: "#5E5CE6" }}>3</span>
      </div>
      <div className="nav-item">
        <Icons.users size={17} className="nav-icon" />
        <span className="nav-label">Cộng đồng SV</span>
      </div>

      <div className="sidebar-footer">
        <div className="theme-toggle">
          <button className={theme === "light" ? "active" : ""} onClick={() => onTheme("light")} title="Light mode">
            <Icons.sun size={12} /> Sáng
          </button>
          <button className={theme === "dark" ? "active" : ""} onClick={() => onTheme("dark")} title="Dark mode">
            <Icons.moon size={12} /> Tối
          </button>
        </div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">H</div>
          <div className="sidebar-user-meta">
            <span className="sidebar-user-name">Hiếu Vũ</span>
            <span className="sidebar-user-role">Sinh viên · K22</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

// ====== Toolbar ======
function Toolbar({ activePage, month, onMonthChange }) {
  const pageTitle = {
    overview: "Tổng quan",
    transactions: "Giao dịch",
    debts: "Nợ vay",
    budget: "Ngân sách",
  }[activePage];

  return (
    <div className="toolbar">
      <div className="toolbar-title">{pageTitle}</div>
      <div className="toolbar-right">
        <div className="month-picker">
          <button onClick={() => onMonthChange(1)}><Icons.chevLeft size={14} /></button>
          <span className="label">{month}</span>
          <button onClick={() => onMonthChange(-1)}><Icons.chevRight size={14} /></button>
        </div>
      </div>
    </div>
  );
}

// ====== Page header ======
function PageHeader({ greet, title, children }) {
  if (!greet && !title && !children) return null;
  return (
    <div className={"page-header" + (title ? "" : " page-header-slim")}>
      <div>
        {greet && <div className="page-greet">{greet}</div>}
        {title && <h1 className="page-title">{title}</h1>}
      </div>
      {children && <div>{children}</div>}
    </div>
  );
}

// ====== Insight card ======
function Insight({ tone = "blue", icon = "lightbulb", title, children }) {
  const colorMap = {
    blue: "#0A84FF", green: "#34C759", orange: "#FF9500",
    red: "#FF3B30", purple: "#AF52DE", indigo: "#5856D6",
  };
  const Icon = Icons[icon];
  return (
    <div className="insight fade-in">
      <div className="insight-icon" style={{ background: colorMap[tone] }}>
        <Icon size={16} />
      </div>
      <div className="insight-body">
        <div className="insight-title">{title}</div>
        <div className="insight-text">{children}</div>
      </div>
    </div>
  );
}

// ====== Empty state ======
function Empty({ icon = "inbox", title, text }) {
  const Icon = Icons[icon];
  return (
    <div className="empty fade-in">
      <div className="empty-icon"><Icon size={26} /></div>
      <div className="empty-title">{title}</div>
      {text && <div className="empty-text">{text}</div>}
    </div>
  );
}

// ====== Money input — raw digits while typing, formatted when blurred ======
function MoneyInput({ value, onChange, placeholder = "0" }) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw]         = useState("");

  const handleFocus = () => {
    setFocused(true);
    setRaw(value ? String(value) : "");
  };
  const handleChange = (e) => {
    const digits = e.target.value.replace(/[^\d]/g, "");
    setRaw(digits);
    onChange(digits ? parseInt(digits, 10) : 0);
  };
  const handleBlur = () => setFocused(false);

  const display = focused
    ? raw
    : value ? new Intl.NumberFormat('vi-VN').format(value) : "";

  return (
    <div className="input-money">
      <input
        className="input"
        type="text"
        inputMode="numeric"
        value={display}
        placeholder={placeholder}
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    </div>
  );
}

Object.assign(window, { Sidebar, Toolbar, PageHeader, Insight, Empty, MoneyInput });
