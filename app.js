const CAT_COLORS = {'Ăn uống':'#0071e3','Đi lại':'#34c759','Thuê trọ':'#af52de','Mua sắm':'#ff9500','Giải trí':'#ff2d55','Sức khỏe':'#30b0c7','Học tập':'#5856d6','Du lịch':'#00b4d8','Cầu lông':'#06d6a0','Trả nợ':'#d94040','Khác':'#8e8e93'};
const CAT_BG = {'Ăn uống':'#e8f0fe','Đi lại':'#e9fbe8','Thuê trọ':'#f5e9ff','Mua sắm':'#fff4e5','Giải trí':'#ffe9ec','Sức khỏe':'#e5f7fa','Học tập':'#eeeeff','Du lịch':'#e0f7ff','Cầu lông':'#e0fdf4','Trả nợ':'#ffe5e5','Khác':'#f5f5f7'};
const MONTHS = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

let transactions = [];
let debts = [];
let budgets = [];
let currentType = 'income';
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let donutChart = null;
let flowChart = null;
let trendChart = null;
let pendingDelete = null;
let pendingPay = null;
let txSearch = '';
let debtSearch = '';

// ── Firebase ──────────────────────────────────────────────
const _SEED = {"transactions":[{"id":1778822968346,"type":"expense","desc":"tiền trọ, điện, nước, điều hòa, dịch vụ","amount":2150000,"cat":"Thuê trọ","date":"2026-05-15"},{"id":1778822564137,"type":"income","desc":"tiền tài khoản từ trước đó","amount":2126000,"cat":"Thu nhập","date":"2026-05-15"},{"id":1778820901654,"type":"income","desc":"đổi từ tài khoản ra tiền mặt","amount":300000,"cat":"Thu nhập","date":"2026-05-15"},{"id":1778820850607,"type":"income","desc":"anh chị cho","amount":200000,"cat":"Thu nhập","date":"2026-05-15"},{"id":1778820461601,"type":"income","desc":"bố chuyển","amount":3000000,"cat":"Thu nhập","date":"2026-05-15"},{"id":1778820411461,"type":"expense","desc":"du lịch Hạ Long","amount":2856000,"cat":"Giải trí","date":"2026-05-15"},{"id":1778818830478,"type":"expense","desc":"Tiktok","amount":20000,"cat":"Mua sắm","date":"2026-05-15"},{"id":1778818766842,"type":"expense","desc":"Claude AI","amount":600000,"cat":"Mua sắm","date":"2026-05-15"},{"id":1778818538887,"type":"expense","desc":"bún chả, nước lọc","amount":50000,"cat":"Ăn uống","date":"2026-05-15"},{"id":1778781242777,"type":"income","desc":"tiền còn dư từ tháng trc","amount":3220,"cat":"Thu nhập","date":"2026-05-15"},{"id":1778781183955,"type":"expense","desc":"mỳ tôm, nước lọc, 1 dây sữa fami","amount":50000,"cat":"Ăn uống","date":"2026-05-15"},{"id":1778781118116,"type":"expense","desc":"Bún cá","amount":25000,"cat":"Ăn uống","date":"2026-05-15"},{"id":1778781069446,"type":"income","desc":"Mama Bank","amount":1000000,"cat":"Thu nhập","date":"2026-05-15"}],"debts":[{"id":1778822737101,"name":"Shopee Easy","amount":370080,"paid":0,"type":"owe","note":"","settled":false},{"id":1778781331331,"name":"Ngân Thuân","amount":1356000,"type":"owe","note":"tiền du lịch Hạ Long còn thiếu"},{"id":1778781003635,"name":"Phú Sen","amount":140000,"type":"owe","note":"Tiền ăn + nước trên Vịnh Hạ Long"},{"id":1778780911964,"name":"Hân","amount":77000,"type":"lend","note":"50k phở hồ Gươm, 12k nước cam, 15k kem"}]};

const firebaseConfig = {
  apiKey: "AIzaSyATjEaKR5cpIhWTLTzmdKIiMV0ZDPT07xI",
  authDomain: "taichinhhiewu.firebaseapp.com",
  projectId: "taichinhhiewu",
  storageBucket: "taichinhhiewu.firebasestorage.app",
  messagingSenderId: "742826409088",
  appId: "1:742826409088:web:b072bdc22a9acc0ec4fa65"
};

firebase.initializeApp(firebaseConfig);
const _db = firebase.firestore();
window._fsDoc = _db.collection('fintrack').doc('hiewu');

window._fsDoc.onSnapshot(snap => {
  if (snap.exists) {
    const d = snap.data();
    const { result, changed } = migrateCats(d.transactions || []);
    transactions = result;
    debts = d.debts || [];
    budgets = d.budgets || [];
    if (changed) save();
  } else {
    transactions = _SEED.transactions;
    debts = _SEED.debts;
    window._fsDoc.set({ transactions, debts, budgets });
  }
  renderAll();
}, err => console.error('Firebase error:', err));

// ── Migration danh mục ────────────────────────────────────
const CAT_RENAMED = {'Nhà ở': 'Thuê trọ'};
function migrateCats(txs) {
  let changed = false;
  const result = txs.map(t => {
    if (CAT_RENAMED[t.cat]) { changed = true; return {...t, cat: CAT_RENAMED[t.cat]}; }
    if (t.debtId && t.cat === 'Khác') { changed = true; return {...t, cat: 'Trả nợ'}; }
    return t;
  });
  return { result, changed };
}

// ── Lưu ──────────────────────────────────────────────────
function save() {
  if (window._fsDoc) {
    window._fsDoc.set({ transactions, debts, budgets }).catch(console.error);
  }
}

// ── Tiền tệ ───────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat('vi-VN').format(Math.round(n)) + ' ₫';
}
function fmtShort(n) {
  if (n >= 1e9) return (n/1e9).toFixed(1).replace('.0','') + ' tỷ';
  if (n >= 1e6) return (n/1e6).toFixed(1).replace('.0','') + 'tr';
  if (n >= 1e3) return (n/1e3).toFixed(0) + 'k';
  return n + '';
}
function parseMoneyInput(idOrEl) {
  const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
  return Number((el?.value || '').replace(/\D/g,''));
}
function handleMoneyFocus(el) {
  el.value = (el.value || '').replace(/\D/g, '');
  const hint = document.getElementById(el.id + '-hint');
  if (hint) hint.textContent = '';
}
function handleMoneyInput(el) {
  const pos = el.selectionStart;
  const oldVal = el.value;
  const raw = oldVal.replace(/\D/g, '');
  if (oldVal !== raw) {
    const nonDigitsBefore = (oldVal.slice(0, pos).match(/\D/g) || []).length;
    el.value = raw;
    el.setSelectionRange(pos - nonDigitsBefore, pos - nonDigitsBefore);
  }
  const hint = document.getElementById(el.id + '-hint');
  if (hint) hint.textContent = raw ? fmt(Number(raw)) : '';
}
function formatMoneyInput(el) {
  const raw = (el.value || '').replace(/\D/g, '');
  el.value = raw ? new Intl.NumberFormat('vi-VN').format(Number(raw)) : '';
  const hint = document.getElementById(el.id + '-hint');
  if (hint) hint.textContent = raw ? fmt(Number(raw)) : '';
}

// ── Tháng ─────────────────────────────────────────────────
function updateMonthLabel() {
  document.getElementById('month-label').textContent = MONTHS[currentMonth] + ', ' + currentYear;
}
function changeMonth(d) {
  currentMonth += d;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  updateMonthLabel();
  renderAll();
}
function monthTxs() {
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
}

// ── Điều hướng ────────────────────────────────────────────
function switchPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  const tabs = ['dashboard','transactions','debts','budget'];
  document.querySelectorAll('.nav-tab')[tabs.indexOf(name)].classList.add('active');
  document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
  const bn = document.getElementById('bn-' + name);
  if (bn) bn.classList.add('active');
  renderAll();
}

// ── Tìm kiếm ─────────────────────────────────────────────
function normText(v) {
  return (v || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
}
function setTxSearch(v) { txSearch = v || ''; renderTransactions(); }
function setDebtSearch(v) { debtSearch = v || ''; renderDebts(); }

// ── Giao dịch ─────────────────────────────────────────────
function setType(t) {
  currentType = t;
  document.getElementById('btn-inc').classList.toggle('active', t === 'income');
  document.getElementById('btn-exp').classList.toggle('active', t === 'expense');
  document.getElementById('cat-group').style.display = t === 'expense' ? 'flex' : 'none';
  renderTransactions();
}
function addTransaction() {
  const desc = document.getElementById('f-desc').value.trim();
  const amount = parseMoneyInput('f-amount');
  const cat = document.getElementById('f-cat').value;
  const date = document.getElementById('f-date').value;
  if (!desc || !amount || !date) { shake('f-desc'); return; }
  transactions.unshift({id:Date.now(), type:currentType, desc, amount, cat: currentType==='income'?'Thu nhập':cat, date});
  save();
  document.getElementById('f-desc').value = '';
  document.getElementById('f-amount').value = '';
  document.getElementById('f-amount-hint').textContent = '';
  renderAll();
}
function catIcon(cat) {
  const m = {'Ăn uống':'ti-bowl','Đi lại':'ti-car','Thuê trọ':'ti-home','Mua sắm':'ti-shopping-bag','Giải trí':'ti-device-gamepad-2','Sức khỏe':'ti-pill','Học tập':'ti-book','Du lịch':'ti-plane','Cầu lông':'ti-ball-tennis','Trả nợ':'ti-credit-card','Khác':'ti-package'};
  return m[cat] || 'ti-circle';
}
function txItemHTML(t) {
  const isInc = t.type === 'income';
  const iconColor = isInc ? '#1d9954' : (CAT_COLORS[t.cat]||'#8e8e93');
  const iconBg = isInc ? '#e9fbe8' : (CAT_BG[t.cat]||'#f5f5f7');
  const icon = isInc ? 'ti-trending-up' : catIcon(t.cat);
  const d = new Date(t.date);
  const dateStr = d.getDate() + '/' + (d.getMonth()+1);
  return `<div class="tx-item">
    <div class="tx-icon-wrap" style="background:${iconBg}"><i class="ti ${icon}" style="color:${iconColor}"></i></div>
    <div class="tx-info">
      <div class="tx-name">${t.desc}</div>
      <div class="tx-meta">${t.cat} · ${dateStr}</div>
    </div>
    <div class="tx-right">
      <div class="tx-amount ${isInc?'pos':'neg'}">${isInc?'+':'-'}${fmt(t.amount)}</div>
    </div>
    <button class="tx-del" onclick="confirmDelete('tx',${t.id},'${t.desc.replace(/'/g,"\\'")}')"><i class="ti ti-trash"></i></button>
  </div>`;
}
function renderTransactions() {
  const txs = monthTxs().filter(t => t.type === currentType);
  const q = normText(txSearch);
  const filtered = q ? txs.filter(t => normText(`${t.desc} ${t.cat} ${t.type} ${t.amount}`).includes(q)) : txs;
  const titleType = currentType === 'income' ? 'Thu nhập' : 'Chi tiêu';
  document.getElementById('tx-section-title').textContent = titleType + ' - ' + MONTHS[currentMonth] + ', ' + currentYear;
  document.getElementById('tx-count').textContent = filtered.length + '/' + txs.length + ' giao dịch';
  const countEl = document.getElementById('tx-search-count');
  if (countEl) countEl.textContent = q ? filtered.length + ' kết quả' : txs.length + ' giao dịch';
  const el = document.getElementById('tx-list');
  if (!filtered.length) {
    const emptyText = currentType === 'income' ? 'Không có thu nhập phù hợp' : 'Không có chi tiêu phù hợp';
    el.innerHTML = `<div class="empty-state"><div class="empty-icon"><i class="ti ti-receipt-off"></i></div><div class="empty-text">${emptyText}</div></div>`;
    return;
  }
  el.innerHTML = filtered.map(t => txItemHTML(t)).join('');
}

// ── Nợ vay ────────────────────────────────────────────────
function addDebt() {
  const name = document.getElementById('d-name').value.trim();
  const amount = parseMoneyInput('d-amount');
  const type = document.getElementById('d-type').value;
  const note = document.getElementById('d-note').value.trim();
  if (!name || !amount) { shake('d-name'); return; }
  debts.unshift({id:Date.now(), name, amount, paid:0, type, note, settled:false});
  save();
  document.getElementById('d-name').value = '';
  document.getElementById('d-amount').value = '';
  document.getElementById('d-amount-hint').textContent = '';
  document.getElementById('d-note').value = '';
  renderAll();
}
function openPayModal(id) {
  const d = debts.find(x => x.id === id);
  if (!d) return;
  pendingPay = id;
  const remaining = d.amount - (d.paid||0);
  document.getElementById('pay-modal-desc').textContent = (d.type==='owe'?'Trả cho ':'Nhận từ ') + d.name + ' — còn ' + fmt(remaining);
  document.getElementById('pay-amount').value = '';
  document.getElementById('pay-amount-hint').textContent = '';
  document.getElementById('pay-ok').onclick = () => confirmPay();
  document.getElementById('pay-modal').classList.add('open');
  setTimeout(() => document.getElementById('pay-amount').focus(), 100);
}
function confirmPay() {
  const amount = parseMoneyInput('pay-amount');
  if (!amount || amount <= 0) return;
  const d = debts.find(x => x.id === pendingPay);
  if (!d) return;
  const remainingBefore = d.amount - (d.paid||0);
  const paidNow = Math.min(amount, remainingBefore);
  d.paid = Math.min((d.paid||0) + paidNow, d.amount);
  if (d.paid >= d.amount) d.settled = true;
  transactions.unshift({
    id: Date.now()+1,
    type: d.type==='owe' ? 'expense' : 'income',
    desc: (d.type==='owe' ? 'Trả nợ: ' : 'Thu nợ: ') + d.name,
    amount: paidNow,
    cat: d.type==='owe' ? 'Trả nợ' : 'Thu nhập',
    date: new Date().toISOString().slice(0,10),
    debtId: d.id
  });
  save(); renderAll(); closePayModal();
}
function closePayModal() {
  document.getElementById('pay-modal').classList.remove('open');
  pendingPay = null;
}
function renderDebts() {
  const q = normText(debtSearch);
  const filtered = q ? debts.filter(d => normText(`${d.name} ${d.note||''} ${d.type} ${d.settled?'xong':''} ${d.amount}`).includes(q)) : debts;
  document.getElementById('debt-count').textContent = filtered.length + '/' + debts.length + ' khoản';
  const countEl = document.getElementById('debt-search-count');
  if (countEl) countEl.textContent = q ? filtered.length + ' kết quả' : debts.length + ' khoản';
  const el = document.getElementById('debt-list');
  if (!filtered.length) {
    el.innerHTML = '<div class="empty-state"><div class="empty-icon"><i class="ti ti-hand-stop"></i></div><div class="empty-text">Không có khoản nợ phù hợp</div></div>';
    return;
  }
  el.innerHTML = filtered.map(d => {
    const paid = d.paid||0;
    const remaining = d.amount - paid;
    const pct = Math.round(paid/d.amount*100);
    const color = d.settled ? '#aeaeb2' : (d.type==='owe' ? '#d94040' : '#1d9954');
    const initials = d.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
    return `<div class="debt-item${d.settled?' settled':''}">
      <div class="debt-avatar ${d.settled?'':d.type}" style="${d.settled?'background:#f5f5f7;color:#aeaeb2':''}">${initials}</div>
      <div class="debt-info">
        <div class="debt-name">${d.name}${d.settled?'<span style="font-size:11px;font-weight:500;background:#f0fff5;color:#1d9954;padding:1px 7px;border-radius:980px;margin-left:6px">Xong</span>':''}</div>
        ${d.note ? `<div class="debt-note">${d.note}</div>` : ''}
        ${!d.settled&&paid>0 ? `<div class="debt-mini-bar"><div class="debt-mini-fill" style="width:${pct}%;background:${color}"></div></div>` : ''}
      </div>
      <div class="debt-right">
        <div class="debt-amount ${d.settled?'settled':d.type}">${fmt(d.settled?d.amount:remaining)}</div>
        ${!d.settled&&paid>0 ? `<div class="debt-paid-label">đã ${d.type==='owe'?'trả':'thu'} ${fmt(paid)}</div>` : ''}
      </div>
      <div class="debt-actions">
        ${!d.settled ? `<button class="debt-pay-btn" onclick="openPayModal(${d.id})">${d.type==='owe'?'Trả':'Thu'}</button>` : ''}
        <button class="debt-del" onclick="confirmDelete('debt',${d.id},'${d.name.replace(/'/g,"\\'")}')"><i class="ti ti-trash"></i></button>
      </div>
    </div>`;
  }).join('');
}

// ── Xóa ───────────────────────────────────────────────────
function confirmDelete(type, id, label) {
  pendingDelete = {type, id};
  document.getElementById('modal-body').textContent = 'Xóa "' + label + '"? Không thể hoàn tác.';
  document.getElementById('modal-ok').onclick = () => { doDelete(); closeModal(); };
  document.getElementById('modal').classList.add('open');
}
function doDelete() {
  if (!pendingDelete) return;
  if (pendingDelete.type === 'tx') transactions = transactions.filter(t => t.id !== pendingDelete.id);
  if (pendingDelete.type === 'debt') debts = debts.filter(d => d.id !== pendingDelete.id);
  if (pendingDelete.type === 'budget') budgets = budgets.filter(b => b.id !== pendingDelete.id);
  save(); renderAll();
}
function closeModal() {
  document.getElementById('modal').classList.remove('open');
  pendingDelete = null;
}
function shake(id) {
  const el = document.getElementById(id);
  el.style.borderColor = '#d94040';
  el.style.boxShadow = '0 0 0 3px rgba(217,64,64,0.15)';
  el.focus();
  setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 1500);
}

// ── Dashboard ─────────────────────────────────────────────
function renderDashboard() {
  const txs = monthTxs();
  const income = txs.filter(t => t.type==='income').reduce((s,t) => s+t.amount, 0);
  const expense = txs.filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0);

  // Last month for trend comparison
  const lastM = currentMonth === 0 ? 11 : currentMonth - 1;
  const lastY = currentMonth === 0 ? currentYear - 1 : currentYear;
  const lastTxs = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === lastM && d.getFullYear() === lastY;
  });
  const lastIncome = lastTxs.filter(t => t.type==='income').reduce((s,t) => s+t.amount, 0);
  const lastExpense = lastTxs.filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0);
  const trendBadge = (current, prev, isPositiveGood) => {
    if (!prev) return '';
    const pct = Math.round((current - prev) / prev * 100);
    if (pct === 0) return '<span class="sum-trend-badge neutral">—</span>';
    const isUp = pct > 0;
    const isGood = isPositiveGood ? isUp : !isUp;
    return `<span class="sum-trend-badge ${isGood ? 'good' : 'bad'}">${isUp ? '↑' : '↓'} ${Math.abs(pct)}%</span>`;
  };

  document.getElementById('d-income').textContent = fmt(income);
  document.getElementById('d-expense').textContent = fmt(expense);
  const balEl = document.getElementById('d-balance');
  balEl.textContent = fmt(Math.abs(income - expense));
  balEl.style.color = '#1d1d1f';
  document.getElementById('d-income-count').textContent = txs.filter(t => t.type==='income').length + ' giao dịch';
  document.getElementById('d-expense-count').textContent = txs.filter(t => t.type==='expense').length + ' giao dịch';
  document.getElementById('d-balance-note').textContent = income >= expense ? 'dư tháng này' : 'thâm hụt tháng này';
  document.getElementById('d-income-trend').innerHTML = trendBadge(income, lastIncome, true);
  document.getElementById('d-expense-trend').innerHTML = trendBadge(expense, lastExpense, false);
  const savingsRateEl = document.getElementById('d-savings-rate');
  if (savingsRateEl && income > 0) {
    const rate = Math.round((income - expense) / income * 100);
    savingsRateEl.innerHTML = `<span class="sum-trend-badge ${rate >= 0 ? 'good' : 'bad'}">Tiết kiệm ${rate}%</span>`;
  } else if (savingsRateEl) {
    savingsRateEl.innerHTML = '';
  }

  const catMap = {};
  txs.filter(t => t.type==='expense').forEach(t => { catMap[t.cat] = (catMap[t.cat]||0) + t.amount; });
  const cats = Object.entries(catMap).sort((a,b) => b[1]-a[1]);

  if (donutChart) { donutChart.destroy(); donutChart = null; }
  if (cats.length > 0) {
    const ctx = document.getElementById('donutChart').getContext('2d');
    donutChart = new Chart(ctx, {
      type:'doughnut',
      data:{labels:cats.map(c=>c[0]),datasets:[{data:cats.map(c=>c[1]),backgroundColor:cats.map(c=>CAT_COLORS[c[0]]||'#8e8e93'),borderWidth:0,hoverOffset:3}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>' '+ctx.label+': '+fmt(ctx.raw)}}},cutout:'68%'}
    });
  }

  const progEl = document.getElementById('cat-progress');
  if (!cats.length) {
    progEl.innerHTML = '<div style="text-align:center;padding:24px 12px;color:#aeaeb2;font-size:13px">Chưa có chi tiêu nào tháng này</div>';
  } else {
    progEl.innerHTML = cats.map(([cat,amt]) => {
      const pct = expense > 0 ? Math.round(amt/expense*100) : 0;
      return `<div class="cat-item" style="margin-bottom:12px">
        <div class="cat-row"><div class="cat-name">${cat}</div><div class="cat-amounts">${fmt(amt)}</div></div>
        <div class="cat-bar"><div class="cat-fill" style="width:${pct}%;background:${CAT_COLORS[cat]||'#8e8e93'}"></div></div>
        <div class="cat-pct">${pct}% tổng chi</div>
      </div>`;
    }).join('');
  }

  const daysInMonth = new Date(currentYear, currentMonth+1, 0).getDate();
  const dayLabels = Array.from({length:daysInMonth}, (_,i) => String(i+1));
  const dailyIncome = Array(daysInMonth).fill(0);
  const dailyExpense = Array(daysInMonth).fill(0);
  txs.forEach(t => {
    const day = new Date(t.date).getDate() - 1;
    if (day < 0 || day >= daysInMonth) return;
    if (t.type==='income') dailyIncome[day] += t.amount;
    if (t.type==='expense') dailyExpense[day] += t.amount;
  });
  if (flowChart) { flowChart.destroy(); flowChart = null; }
  const flowCtx = document.getElementById('flowChart').getContext('2d');
  flowChart = new Chart(flowCtx, {
    type:'bar',
    data:{labels:dayLabels,datasets:[
      {label:'Thu',data:dailyIncome,backgroundColor:'rgba(29,153,84,0.78)',borderRadius:4,borderSkipped:false},
      {label:'Chi',data:dailyExpense,backgroundColor:'rgba(217,64,64,0.78)',borderRadius:4,borderSkipped:false}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,boxHeight:10,font:{size:11}}},tooltip:{callbacks:{label:ctx=>' '+ctx.dataset.label+': '+fmt(ctx.raw)}}},scales:{x:{grid:{display:false},ticks:{font:{size:10},maxRotation:0,autoSkip:true,maxTicksLimit:12}},y:{grid:{color:'#f5f5f7'},ticks:{callback:v=>fmtShort(v),font:{size:10}}}},barPercentage:.75,categoryPercentage:.72}
  });

  const activeOwe = debts.filter(d => d.type==='owe' && !d.settled);
  const activeLend = debts.filter(d => d.type==='lend' && !d.settled);
  const totalOweD = activeOwe.reduce((s,d) => s+(d.amount-(d.paid||0)), 0);
  const totalLendD = activeLend.reduce((s,d) => s+(d.amount-(d.paid||0)), 0);
  document.getElementById('dd-owe').textContent = fmt(totalOweD);
  document.getElementById('dd-lend').textContent = fmt(totalLendD);
  document.getElementById('dd-owe-count').textContent = activeOwe.length + ' khoản đang nợ';
  document.getElementById('dd-lend-count').textContent = activeLend.length + ' khoản chưa thu';

  const barsEl = document.getElementById('debt-bars-wrap');
  if (barsEl) {
    const allActive = [...activeOwe, ...activeLend].sort((a,b) => {
      if (a.type !== b.type) return a.type === 'owe' ? -1 : 1;
      return (b.amount-(b.paid||0)) - (a.amount-(a.paid||0));
    });
    if (allActive.length) {
      barsEl.innerHTML = `<div class="dd-list">${allActive.map(d => {
        const remaining = d.amount - (d.paid||0);
        const isOwe = d.type === 'owe';
        const color = isOwe ? '#d94040' : '#1d9954';
        const sublabel = d.note || (isOwe ? 'Mình nợ' : 'Người nợ bạn');
        return `<div class="dd-item">
          <div class="dd-dot" style="background:${color}"></div>
          <div class="dd-info">
            <div class="dd-item-name">${d.name}</div>
            <div class="dd-item-note">${sublabel}</div>
          </div>
          <div class="dd-item-amt ${d.type}">${fmt(remaining)}</div>
        </div>`;
      }).join('')}</div>`;
    } else {
      barsEl.innerHTML = '<div class="dd-empty">Không có khoản nợ nào</div>';
    }
  }

  const dashDebtWrap = document.getElementById('dash-debt-chart-wrap');
  dashDebtWrap.style.display = debts.length ? 'block' : 'none';

  // Budget health widget
  const bhCard = document.getElementById('budget-health-card');
  const bhBody = document.getElementById('budget-health-body');
  if (bhCard && bhBody) {
    if (!budgets.length) {
      bhCard.style.display = 'none';
    } else {
      bhCard.style.display = '';
      const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
      const totalSpent = budgets.reduce((s, b) => s + budgetSpent(b.cat), 0);
      const rawPct = totalBudgeted > 0 ? Math.round(totalSpent / totalBudgeted * 100) : 0;
      const barPct = Math.min(rawPct, 100);
      const barColor = rawPct > 100 ? '#d94040' : rawPct > 75 ? '#ff9500' : '#1d9954';
      const onTrack = budgets.filter(b => budgetSpent(b.cat) / b.amount <= 0.75).length;
      const nearLimit = budgets.filter(b => { const p = budgetSpent(b.cat) / b.amount; return p > 0.75 && p <= 1; }).length;
      const overBudget = budgets.filter(b => budgetSpent(b.cat) > b.amount).length;
      bhBody.innerHTML = `
        <div class="bh-row"><span class="bh-label">${fmt(totalSpent)} / ${fmt(totalBudgeted)}</span><span class="bh-pct" style="color:${barColor}">${rawPct}%</span></div>
        <div class="bh-bar-track"><div class="bh-bar-fill" style="width:${barPct}%;background:${barColor}"></div></div>
        <div class="bh-chips">
          ${onTrack > 0 ? `<span class="bh-chip good"><i class="ti ti-check"></i> ${onTrack} trong ngân sách</span>` : ''}
          ${nearLimit > 0 ? `<span class="bh-chip warn"><i class="ti ti-alert-triangle"></i> ${nearLimit} gần hết</span>` : ''}
          ${overBudget > 0 ? `<span class="bh-chip over"><i class="ti ti-x"></i> ${overBudget} vượt mức</span>` : ''}
        </div>`;
    }
  }
}

// ── Biểu đồ 6 tháng ──────────────────────────────────────
function renderTrendChart() {
  const labels = [], incomeData = [], expenseData = [], balanceData = [];

  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m < 0) { m += 12; y--; }

    labels.push('T' + (m + 1) + '/' + String(y).slice(2));

    const mTxs = transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === m && d.getFullYear() === y;
    });
    const inc = mTxs.filter(t => t.type==='income').reduce((s,t) => s+t.amount, 0);
    const exp = mTxs.filter(t => t.type==='expense').reduce((s,t) => s+t.amount, 0);
    incomeData.push(inc);
    expenseData.push(exp);
    balanceData.push(inc - exp);
  }

  if (trendChart) { trendChart.destroy(); trendChart = null; }
  const ctx = document.getElementById('trendChart').getContext('2d');
  trendChart = new Chart(ctx, {
    data: {
      labels,
      datasets: [
        { type:'bar', label:'Thu nhập', data:incomeData, backgroundColor:'rgba(29,153,84,0.72)', borderRadius:6, borderSkipped:false, order:2 },
        { type:'bar', label:'Chi tiêu', data:expenseData, backgroundColor:'rgba(217,64,64,0.72)', borderRadius:6, borderSkipped:false, order:2 },
        { type:'line', label:'Còn lại', data:balanceData, borderColor:'#0071e3', backgroundColor:'rgba(0,113,227,0.07)', borderWidth:2.5, pointBackgroundColor:'#0071e3', pointRadius:4, pointHoverRadius:6, fill:true, tension:0.35, order:1 }
      ]
    },
    options: {
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend:{ position:'bottom', labels:{ boxWidth:12, boxHeight:12, font:{size:12}, padding:16 } },
        tooltip:{ callbacks:{ label: c => ' ' + c.dataset.label + ': ' + fmt(c.raw) } }
      },
      scales:{
        x:{ grid:{display:false}, ticks:{font:{size:12}} },
        y:{ grid:{color:'#f5f5f7'}, ticks:{callback:v=>fmtShort(v), font:{size:11}} }
      },
      barPercentage:0.65, categoryPercentage:0.8
    }
  });

  // Insight stats
  const maxExp = Math.max(...expenseData);
  const maxExpIdx = expenseData.indexOf(maxExp);
  const maxSave = Math.max(...balanceData);
  const maxSaveIdx = balanceData.indexOf(maxSave);
  const prevExp = expenseData[4], curExp = expenseData[5];
  const expChange = prevExp > 0 ? Math.round((curExp - prevExp) / prevExp * 100) : 0;
  const trend = expChange > 0 ? `<span style="color:#d94040">↑ ${expChange}% so với tháng trước</span>`
              : expChange < 0 ? `<span style="color:#1d9954">↓ ${Math.abs(expChange)}% so với tháng trước</span>`
              : `<span style="color:#8e8e93">Không đổi so với tháng trước</span>`;

  document.getElementById('trend-insights').innerHTML = `
    <div class="trend-stat"><div class="trend-stat-label">Chi tiêu nhiều nhất</div><div class="trend-stat-val">${labels[maxExpIdx]}</div><div class="trend-stat-sub">${fmt(maxExp)}</div></div>
    <div class="trend-stat"><div class="trend-stat-label">Dư nhiều nhất</div><div class="trend-stat-val">${labels[maxSaveIdx]}</div><div class="trend-stat-sub">${fmt(maxSave)}</div></div>
    <div class="trend-stat"><div class="trend-stat-label">Xu hướng chi tiêu</div><div class="trend-stat-val" style="font-size:13px">${trend}</div></div>
  `;
}

// ── Ngân sách ─────────────────────────────────────────────
function budgetSpent(cat) {
  return monthTxs().filter(t => t.type === 'expense' && t.cat === cat).reduce((s, t) => s + t.amount, 0);
}
function addBudget() {
  const cat = document.getElementById('b-cat').value;
  const amount = parseMoneyInput('b-amount');
  if (!amount) { shake('b-amount'); return; }
  const idx = budgets.findIndex(b => b.cat === cat);
  if (idx >= 0) {
    budgets[idx] = {...budgets[idx], amount};
  } else {
    budgets.unshift({id: Date.now(), cat, amount});
  }
  save();
  document.getElementById('b-amount').value = '';
  document.getElementById('b-amount-hint').textContent = '';
  renderAll();
}
function renderBudgets() {
  const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + budgetSpent(b.cat), 0);
  const totalRemaining = totalBudgeted - totalSpent;
  const summaryEl = document.getElementById('budget-summary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div class="sum-card"><div class="sum-label"><i class="ti ti-wallet" style="color:#0071e3"></i> Tổng ngân sách</div><div class="sum-val" style="color:#1d1d1f">${fmt(totalBudgeted)}</div><div class="sum-sub">${budgets.length} danh mục</div></div>
      <div class="sum-card"><div class="sum-label"><i class="ti ti-arrow-up-circle" style="color:#d94040"></i> Đã chi</div><div class="sum-val" style="color:#1d1d1f">${fmt(totalSpent)}</div><div class="sum-sub">${totalBudgeted > 0 ? Math.round(totalSpent / totalBudgeted * 100) : 0}% ngân sách</div></div>
      <div class="sum-card"><div class="sum-label"><i class="ti ti-piggy-bank" style="color:#1d9954"></i> Còn lại</div><div class="sum-val" style="color:${totalRemaining < 0 ? '#d94040' : '#1d9954'}">${fmt(Math.abs(totalRemaining))}</div><div class="sum-sub">${totalRemaining < 0 ? 'vượt ngân sách' : 'chưa chi'}</div></div>
    `;
  }
  const listEl = document.getElementById('budget-list');
  if (!listEl) return;
  if (!budgets.length) {
    listEl.innerHTML = '<div class="budget-empty"><div class="empty-icon"><i class="ti ti-wallet-off"></i></div><div class="empty-text">Chưa có ngân sách nào. Thêm ngân sách để theo dõi chi tiêu!</div></div>';
    return;
  }
  listEl.innerHTML = budgets.map(b => {
    const spent = budgetSpent(b.cat);
    const remaining = b.amount - spent;
    const rawPct = b.amount > 0 ? Math.round(spent / b.amount * 100) : 0;
    const barPct = Math.min(rawPct, 100);
    const barColor = rawPct > 100 ? '#d94040' : rawPct > 75 ? '#ff9500' : '#1d9954';
    const icon = catIcon(b.cat);
    const iconColor = CAT_COLORS[b.cat] || '#8e8e93';
    const iconBg = CAT_BG[b.cat] || '#f5f5f7';
    return `<div class="budget-item">
      <div class="tx-icon-wrap" style="background:${iconBg}"><i class="ti ${icon}" style="color:${iconColor}"></i></div>
      <div class="budget-info">
        <div class="budget-name">${b.cat}</div>
        <div class="budget-amounts">${fmt(spent)} / ${fmt(b.amount)}</div>
        <div class="budget-bar-wrap"><div class="cat-bar" style="height:6px"><div class="cat-fill" style="width:${barPct}%;background:${barColor}"></div></div></div>
      </div>
      <div class="budget-right">
        <div class="budget-pct" style="color:${barColor}">${rawPct}%</div>
        <div class="budget-remain">${remaining < 0 ? '<span style="color:#d94040">-' + fmt(-remaining) + '</span>' : 'còn ' + fmt(remaining)}</div>
      </div>
      <button class="tx-del" onclick="confirmDelete('budget',${b.id},'${b.cat}')"><i class="ti ti-trash"></i></button>
    </div>`;
  }).join('');
}

function renderAll() {
  renderDashboard();
  renderTrendChart();
  renderTransactions();
  renderDebts();
  renderBudgets();
}

// ── Init ──────────────────────────────────────────────────
document.getElementById('f-date').value = new Date().toISOString().slice(0,10);
setType('income');
updateMonthLabel();
