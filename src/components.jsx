// Shared building blocks — hook declarations here make them available globally to all subsequent files

const { useState, useEffect, useMemo, useRef, useCallback } = React;

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
      const eased = 1 - Math.pow(1 - t, 3);
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

function AppSkeleton() {
  return (
    <div className="app">
      <main className="main">
        <div className="page">
          <div style={{ marginBottom: 26 }}>
            <div className="skeleton" style={{ height: 11, width: 180, marginBottom: 10, borderRadius: 6 }} />
            <div className="skeleton" style={{ height: 28, width: 260, borderRadius: 8 }} />
          </div>
          <div className="grid-2" style={{ marginBottom: 14 }}>
            <div className="skeleton" style={{ height: 240, borderRadius: 28 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ flex: 1, borderRadius: 16 }} />)}
            </div>
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

function Toolbar({ activePage, month, onMonthChange, closingBalance = 0, viewMonth, viewYear, theme, onTheme, lang, onLang }) {
  const balanceAnim = useCountup(closingBalance);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const settingsRef = useRef(null);

  useEffect(() => {
    if (!settingsOpen) return;
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [settingsOpen]);

  const isOverview = activePage === "overview";
  const showMonthPicker = activePage !== "notes" && activePage !== "overview";
  const today = new Date();
  const isCurrentMonth = today.getMonth() === viewMonth && today.getFullYear() === viewYear;
  const balanceLabel = isCurrentMonth
    ? (lang === "en" ? "Current balance" : "Số dư hiện tại")
    : (lang === "en" ? "End-of-month balance" : "Số dư cuối tháng");

  const pageTitles = {
    transactions: lang === "en" ? "Transactions" : "Giao dịch",
    debts:        lang === "en" ? "Debts"        : "Nợ vay",
    budget:       lang === "en" ? "Budget"       : "Ngân sách",
    notes:        "Note",
  };

  if (isOverview) return null;

  return (
    <div className={"toolbar" + (isOverview ? " toolbar-overview" : "")}>
      <div className="toolbar-left">
        {isOverview ? (
          <div className="toolbar-balance">
            <span className={"toolbar-balance-value num" + (balanceAnim < 0 ? " negative" : "")}>
              {fmt(balanceAnim)}
            </span>
            <span className="toolbar-balance-label">{balanceLabel}</span>
          </div>
        ) : (
          <div className="toolbar-title">{pageTitles[activePage]}</div>
        )}
      </div>
      <div className="toolbar-right">
        {showMonthPicker && (
          <div className="month-picker">
            <button onClick={() => onMonthChange(1)}><Icons.chevLeft size={14} /></button>
            <span className="label">{month}</span>
            <button onClick={() => onMonthChange(-1)}><Icons.chevRight size={14} /></button>
          </div>
        )}
        <div className="toolbar-settings-wrap" ref={settingsRef}>
          <button
            className={"toolbar-settings-btn" + (settingsOpen ? " active" : "")}
            onClick={() => setSettingsOpen(o => !o)}
            aria-label="Settings"
            title="Cài đặt"
          >
            <Icons.gear size={16} />
          </button>
          {settingsOpen && (
            <div className="settings-dropdown">
              <div className="settings-section-label">
                {lang === "en" ? "Appearance" : "Giao diện"}
              </div>
              <div className="settings-row">
                <button
                  className={"settings-opt-btn" + (theme === "light" ? " active" : "")}
                  onClick={() => onTheme("light")}
                >
                  <Icons.sun size={13} /> {lang === "en" ? "Light" : "Sáng"}
                </button>
                <button
                  className={"settings-opt-btn" + (theme === "dark" ? " active" : "")}
                  onClick={() => onTheme("dark")}
                >
                  <Icons.moon size={13} /> {lang === "en" ? "Dark" : "Tối"}
                </button>
                <button
                  className={"settings-opt-btn" + (theme === "glass" ? " active" : "")}
                  onClick={() => onTheme("glass")}
                >
                  <Icons.sparkle size={13} /> Liquid
                </button>
              </div>
              <div className="settings-divider" />
              <div className="settings-section-label">
                {lang === "en" ? "Language" : "Ngôn ngữ"}
              </div>
              <div className="settings-row">
                <button
                  className={"settings-opt-btn" + (lang === "vi" ? " active" : "")}
                  onClick={() => onLang("vi")}
                >
                  🇻🇳 Tiếng Việt
                </button>
                <button
                  className={"settings-opt-btn" + (lang === "en" ? " active" : "")}
                  onClick={() => onLang("en")}
                >
                  🇺🇸 English
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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

// ====== Modal — centered dialog with overlay, Escape/backdrop close ======
// Rendered through a portal: page-level entrance animations keep a transform
// (fill-mode: forwards), which would otherwise trap position:fixed inside the page.
function Modal({ title, subtitle, onClose, children, footer, headerExtra, sidePanel, width = 560 }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return ReactDOM.createPortal(
    <div className="modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div className="modal-head-text">
            <div className="modal-title">{title}</div>
            {subtitle && <div className="modal-subtitle">{subtitle}</div>}
          </div>
          <div className="modal-head-tools">
            {headerExtra}
            <button className="modal-close" onClick={onClose} aria-label="Đóng" title="Đóng">
              <Icons.x size={15} />
            </button>
          </div>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
        {sidePanel}
      </div>
    </div>,
    document.body
  );
}

// ====== TabBar — segmented control with sliding indicator ======
function TabBar({ tabs, active, onChange, style, className }) {
  const indicRef = useRef(null);
  const barRef   = useRef(null);

  useEffect(() => {
    const indic = indicRef.current;
    const bar   = barRef.current;
    if (!indic || !bar) return;
    const el = bar.querySelector(`[data-tab="${active}"]`);
    if (!el) return;
    indic.style.left    = el.offsetLeft + 'px';
    indic.style.width   = el.offsetWidth + 'px';
    indic.style.opacity = '1';
  }, [active]);

  return (
    <div className={"tx-tabs " + (className || "")} ref={barRef} style={style}>
      <div className="tab-indicator" ref={indicRef} style={{ opacity: 0 }} />
      {tabs.map(t => (
        <button
          key={t.id}
          data-tab={t.id}
          className={"tx-tab" + (active === t.id ? " active" : "") + (t.cls ? " " + t.cls : "")}
          onClick={() => onChange(t.id)}
          style={t.btnStyle}
        >
          {t.icon && <t.icon size={13} />}
          {t.label}
          {t.count != null && <span className="tx-tab-count">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

function Sidebar({ activePage, onChange, debts = [], theme, onTheme, lang, onLang }) {
  const openDebtCount = debts.filter(d => !d.settled).length;
  const items = [
    { id: "overview",     label: lang === "en" ? "Overview" : "Tổng quan",      icon: Icons.squareGrid },
    { id: "transactions", label: lang === "en" ? "Transactions" : "Giao dịch",  icon: Icons.arrowLeftRight },
    { id: "debts",        label: lang === "en" ? "Debts" : "Nợ vay",            icon: Icons.creditCard,    badge: openDebtCount > 0 ? openDebtCount : null },
    { id: "budget",       label: lang === "en" ? "Budget" : "Ngân sách",        icon: Icons.wallet },
    { id: "notes",        label: "Note",                                        icon: Icons.pencil },
  ];
  const activeIndex = items.findIndex(item => item.id === activePage);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="28" height="28">
            <rect width="100" height="100" rx="22" fill="#007AFF" />
            <text x="50" y="68" font-family="-apple-system,sans-serif" font-size="60" font-weight="700" fill="white" text-anchor="middle">đ</text>
          </svg>
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">FinTrack</span>
          <span className="sidebar-brand-sub">Tài chính của Hiếu</span>
        </div>
      </div>

      <div className="sidebar-section-label">{lang === "en" ? "Menu" : "Danh mục"}</div>
      <nav className="nav-list" aria-label="Sidebar navigation">
        <div className="nav-pill" style={activeIndex !== -1 ? { top: activeIndex * 40 } : { display: "none" }} />
        {items.map(item => {
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              className={"nav-item" + (active ? " active" : "")}
              onClick={() => onChange(item.id)}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="nav-icon" size={18} />
              <span className="nav-label">{item.label}</span>
              {item.badge != null && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <img src="avatar.jpg" alt="User avatar" />
          </div>
          <div className="sidebar-user-meta">
            <span className="sidebar-user-name">Hieu Nguyen</span>
            <span className="sidebar-user-role">{lang === "en" ? "Student" : "Sinh viên"}</span>
          </div>
        </div>

        <div className="theme-toggle">
          <button className={theme === "light" ? "active" : ""} onClick={() => onTheme("light")}>
            <Icons.sun size={12} /> {lang === "en" ? "Light" : "Sáng"}
          </button>
          <button className={theme === "dark" ? "active" : ""} onClick={() => onTheme("dark")}>
            <Icons.moon size={12} /> {lang === "en" ? "Dark" : "Tối"}
          </button>
          <button className={theme === "glass" ? "active" : ""} onClick={() => onTheme("glass")}>
            <Icons.sparkle size={12} /> Liquid
          </button>
        </div>
      </div>
    </aside>
  );
}

Object.assign(window, { Sidebar, Toolbar, PageHeader, Insight, Empty, MoneyInput, Modal, TabBar });
