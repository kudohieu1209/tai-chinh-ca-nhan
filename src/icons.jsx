// Apple SF Symbols-inspired SVG icon set

const I = ({ d, size = 18, className = "", style, viewBox = "0 0 24 24", strokeWidth = 1.7, fill = "none", children }) => (
  <svg
    width={size} height={size} viewBox={viewBox}
    fill={fill} stroke="currentColor" strokeWidth={strokeWidth}
    strokeLinecap="round" strokeLinejoin="round"
    className={className} style={style} aria-hidden="true"
  >
    {d ? <path d={d} /> : children}
  </svg>
);

const Icons = {
  squareGrid: (p) => (
    <I {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </I>
  ),
  arrowLeftRight: (p) => (
    <I {...p}>
      <path d="M7 7h13" /><path d="M16 3l4 4-4 4" />
      <path d="M17 17H4" /><path d="M8 21l-4-4 4-4" />
    </I>
  ),
  creditCard: (p) => (
    <I {...p}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10h18" /><path d="M7 15h4" />
    </I>
  ),
  wallet: (p) => (
    <I {...p}>
      <path d="M20 7H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1Z" />
      <path d="M16 14h.01" /><path d="M17 7V5a1 1 0 0 0-1.4-.9L4.6 8" />
    </I>
  ),
  chevLeft:  (p) => <I {...p} d="M15 18l-6-6 6-6" />,
  chevRight: (p) => <I {...p} d="M9 18l6-6-6-6" />,
  chevDown:  (p) => <I {...p} d="M6 9l6 6 6-6" />,
  search: (p) => (
    <I {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></I>
  ),
  plus: (p) => <I {...p} d="M12 5v14M5 12h14" />,
  trash: (p) => (
    <I {...p}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
    </I>
  ),
  arrowUp:        (p) => <I {...p} d="M12 19V5M5 12l7-7 7 7" />,
  arrowDown:      (p) => <I {...p} d="M12 5v14M5 12l7 7 7-7" />,
  arrowUpRight:   (p) => <I {...p} d="M7 17L17 7M7 7h10v10" />,
  arrowDownRight: (p) => <I {...p} d="M7 7l10 10M17 7v10H7" />,
  arrowDownLeft:  (p) => <I {...p} d="M17 7L7 17M17 17H7V7" />,
  trendUp: (p) => (
    <I {...p}><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></I>
  ),
  trendDown: (p) => (
    <I {...p}><path d="M3 7l6 6 4-4 8 8" /><path d="M14 17h7v-7" /></I>
  ),
  flag: (p) => (
    <I {...p}><path d="M4 22V4" /><path d="M4 4h12l-2 4 2 4H4" /></I>
  ),
  sparkle: (p) => (
    <I {...p}>
      <path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3Z" />
      <path d="M19 17l.6 1.8L21 19.4l-1.4.6L19 21.6l-.6-1.6L17 19.4l1.4-.6L19 17Z" />
    </I>
  ),
  bell: (p) => (
    <I {...p}>
      <path d="M6 8a6 6 0 0 1 12 0c0 6.3 2 8 2 8H4s2-1.7 2-8" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </I>
  ),
  sun: (p) => (
    <I {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </I>
  ),
  moon: (p) => <I {...p} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />,
  eye: (p) => (
    <I {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </I>
  ),
  eyeOff: (p) => (
    <I {...p}>
      <path d="M9.9 5.1A9.8 9.8 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 3.9" />
      <path d="M6.1 6.1A17 17 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 3.9-.8" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      <path d="M3 3l18 18" />
    </I>
  ),
  user: (p) => (
    <I {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></I>
  ),
  users: (p) => (
    <I {...p}>
      <circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0" />
      <path d="M16 3.5a4 4 0 0 1 0 7.7" /><path d="M22 21a7 7 0 0 0-6-6.9" />
    </I>
  ),
  pieChart: (p) => (
    <I {...p}>
      <path d="M12 3v9l8 4A9 9 0 1 1 12 3Z" />
      <path d="M21 12A9 9 0 0 0 12 3v9h9Z" />
    </I>
  ),
  calendar: (p) => (
    <I {...p}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </I>
  ),
  alertTri: (p) => (
    <I {...p}>
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </I>
  ),
  lightbulb: (p) => (
    <I {...p}>
      <path d="M9 21h6" /><path d="M10 17h4" />
      <path d="M15 14a5 5 0 1 0-6 0c1 1 1 2 1 3h4c0-1 0-2 1-3Z" />
    </I>
  ),
  inbox: (p) => (
    <I {...p}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 14h5l2 3h4l2-3h5" />
    </I>
  ),
  check:  (p) => <I {...p} d="M5 12l5 5L20 7" />,
  x:      (p) => <I {...p} d="M6 6l12 12M18 6L6 18" />,
  filter: (p) => <I {...p} d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" />,
  pencil: (p) => (
    <I {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </I>
  ),
  gear: (p) => (
    <I {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </I>
  ),
  clock: (p) => (
    <I {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></I>
  ),
};

window.Icons = Icons;
