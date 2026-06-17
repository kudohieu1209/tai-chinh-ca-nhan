// Data layer — categories, helpers, benchmarks
// All amounts in VND. No mock transaction data; real data lives in Firestore.

const DEFAULT_CATEGORIES = {
  'Ăn uống':  { name: 'Ăn uống',  emoji: '🍜', color: '#FF9500' },
  'Đi lại':   { name: 'Đi lại',   emoji: '🛵', color: '#00C7BE' },
  'Thuê trọ': { name: 'Thuê trọ', emoji: '🏠', color: '#A2845E' },
  'Mua sắm':  { name: 'Mua sắm',  emoji: '🛍️', color: '#FFCC00' },
  'Giải trí': { name: 'Giải trí', emoji: '🎮', color: '#FF2D55' },
  'Sức khỏe': { name: 'Sức khỏe', emoji: '💊', color: '#30B0C7' },
  'Học tập':  { name: 'Học tập',  emoji: '📚', color: '#5AC8FA' },
  'Du lịch':  { name: 'Du lịch',  emoji: '✈️', color: '#5856D6' },
  'Cầu lông':   { name: 'Cầu lông',   emoji: '🏸', color: '#34C759' },
  'Trả nợ':     { name: 'Trả nợ',     emoji: '💳', color: '#FF3B30' },
  'AI':         { name: 'AI',         emoji: '✨', color: '#D97757' },
  'Khác':       { name: 'Khác',       emoji: '📦', color: '#8E8E93' },
};

// Working category map — every page reads this global at render time.
// User-defined categories from Firestore replace its contents via setCategories.
const CATEGORIES = { ...DEFAULT_CATEGORIES };

// "Khác" is the fallback target when a category is deleted; "Trả nợ" is
// hardcoded into the debt settlement logic. Both must always exist.
const SYSTEM_CATEGORIES = ['Khác', 'Trả nợ'];

const setCategories = (list) => {
  const entries = Array.isArray(list) && list.length
    ? list
    : Object.values(DEFAULT_CATEGORIES);
  Object.keys(CATEGORIES).forEach(k => { delete CATEGORIES[k]; });
  entries.forEach(c => {
    const name = String(c.name || '').trim();
    if (!name) return;
    CATEGORIES[name] = { name, emoji: c.emoji || '📦', color: c.color || '#8E8E93' };
  });
  SYSTEM_CATEGORIES.forEach(name => {
    if (!CATEGORIES[name]) CATEGORIES[name] = { ...DEFAULT_CATEGORIES[name] };
  });
};

const CAT_PALETTE = ['#FF9500','#00C7BE','#A2845E','#FFCC00','#FF2D55','#30B0C7','#5AC8FA','#5856D6','#34C759','#FF3B30','#AF52DE','#0A84FF','#8E8E93'];

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

// No green/red here: those are reserved as semantic colours in the debt card
// (green = money owed to you, red = money you owe). Lender slice colours must
// stay categorical so a slice never reads as a direction.
const DEBT_PALETTE = ['#FF9500','#5856D6','#007AFF','#AF52DE','#FFCC00','#00C7BE','#A2845E','#5AC8FA','#BF5AF2','#FF6FB5'];
const debtColor = (id) => {
  const n = String(id).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return DEBT_PALETTE[Math.abs(n) % DEBT_PALETTE.length];
};

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' VND';
const fmtShort = (n) => {
  const value = Math.round(Number(n) || 0);
  const sign = value < 0 ? '-' : '';
  const abs = Math.abs(value);
  if (abs >= 1e9) return sign + (abs / 1e9).toFixed(1).replace(/\.0$/, '') + 'tỷ';
  if (abs >= 1e6) return sign + (abs / 1e6).toFixed(abs >= 1e7 ? 0 : 1).replace(/\.0$/, '') + 'M';
  if (abs >= 1e3) return sign + (abs / 1e3).toFixed(0) + 'K';
  return sign + String(abs);
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

Object.assign(window, { DEFAULT_CATEGORIES, CATEGORIES, SYSTEM_CATEGORIES, setCategories, CAT_PALETTE, CAT_BENCHMARKS, DEBT_PALETTE, debtColor, fmt, fmtShort, fmtNum, fmtDate, migrateCats });
