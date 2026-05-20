// Data layer — categories, helpers, benchmarks
// All amounts in VND. No mock transaction data; real data lives in Firestore.

const CATEGORIES = {
  'Ăn uống':  { name: 'Ăn uống',  emoji: '🍜', color: '#FF9500' },
  'Đi lại':   { name: 'Đi lại',   emoji: '🛵', color: '#00C7BE' },
  'Thuê trọ': { name: 'Thuê trọ', emoji: '🏠', color: '#A2845E' },
  'Mua sắm':  { name: 'Mua sắm',  emoji: '🛍️', color: '#FFCC00' },
  'Giải trí': { name: 'Giải trí', emoji: '🎮', color: '#FF2D55' },
  'Sức khỏe': { name: 'Sức khỏe', emoji: '💊', color: '#30B0C7' },
  'Học tập':  { name: 'Học tập',  emoji: '📚', color: '#5AC8FA' },
  'Du lịch':  { name: 'Du lịch',  emoji: '✈️', color: '#5856D6' },
  'Cầu lông': { name: 'Cầu lông', emoji: '🏸', color: '#34C759' },
  'Trả nợ':   { name: 'Trả nợ',   emoji: '💳', color: '#FF3B30' },
  'Khác':     { name: 'Khác',     emoji: '📦', color: '#8E8E93' },
};

// Anonymous peer benchmarks (Vietnamese students, same income tier)
const CAT_BENCHMARKS = {
  'Ăn uống':   900000,
  'Đi lại':    180000,
  'Thuê trọ': 1800000,
  'Mua sắm':   250000,
  'Giải trí':  300000,
  'Sức khỏe':  100000,
  'Học tập':   300000,
  'Du lịch':   500000,
  'Cầu lông':   80000,
  'Trả nợ':    200000,
  'Khác':      150000,
};

const DEBT_PALETTE = ['#FF9500','#5856D6','#34C759','#FF2D55','#5AC8FA','#FFCC00','#AF52DE','#00C7BE','#A2845E','#FF3B30'];
const debtColor = (id) => {
  const n = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return DEBT_PALETTE[Math.abs(n) % DEBT_PALETTE.length];
};

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
const fmtShort = (n) => {
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace(/\.0$/, '') + 'tỷ';
  if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'tr';
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'k';
  return String(n);
};
const fmtNum = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n));

// Format ISO date → "d/m"
const fmtDate = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

// Category migration for legacy Firestore data
const CAT_RENAMED = { 'Nhà ở': 'Thuê trọ' };
const migrateCats = (txs) => {
  let changed = false;
  const result = txs.map(t => {
    if (CAT_RENAMED[t.cat]) { changed = true; return { ...t, cat: CAT_RENAMED[t.cat] }; }
    if (t.debtId && t.cat === 'Khác') { changed = true; return { ...t, cat: 'Trả nợ' }; }
    return t;
  });
  return { result, changed };
};

Object.assign(window, { CATEGORIES, CAT_BENCHMARKS, DEBT_PALETTE, debtColor, fmt, fmtShort, fmtNum, fmtDate, migrateCats });
