// Shared building blocks — hook declarations here make them available globally to all subsequent files

const { useState, useEffect, useMemo, useRef, useCallback } = React;

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
    <div className="empty">
      <div className="empty-icon"><Icon size={26} /></div>
      <div className="empty-title">{title}</div>
      <div className="empty-text">{text}</div>
    </div>
  );
}

// ====== Money input with thousand-separator formatting ======
function MoneyInput({ value, onChange, placeholder = "0" }) {
  const display = value ? new Intl.NumberFormat('vi-VN').format(value) : "";
  return (
    <div className="input-money">
      <input
        className="input"
        type="text"
        inputMode="numeric"
        value={display}
        placeholder={placeholder}
        onChange={e => {
          const raw = e.target.value.replace(/[^\d]/g, "");
          onChange(raw ? parseInt(raw, 10) : 0);
        }}
      />
    </div>
  );
}

Object.assign(window, { Sidebar, Toolbar, PageHeader, Insight, Empty, MoneyInput });
