const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');

// Xóa thư mục www cũ nếu có
if (fs.existsSync(wwwDir)) {
  fs.rmSync(wwwDir, { recursive: true, force: true });
}

// Tạo lại thư mục www
fs.mkdirSync(wwwDir);

// Đọc các file src theo thứ tự
const srcFiles = [
  'zh.js',
  'icons.jsx',
  'charts.jsx',
  'components.jsx',
  'overview.jsx',
  'transactions.jsx',
  'debts.jsx',
  'budget.jsx',
  'notes.jsx',
  'settings.jsx',
  'app.jsx',
];

let jsx = '';
for (const file of srcFiles) {
  const filePath = path.join(__dirname, 'src', file);
  if (!fs.existsSync(filePath)) {
    console.warn('Missing: src/' + file);
    continue;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  jsx += (jsx ? '\n\n' : '') + content;
  console.log('  src/' + file);
}

// Đọc template
const template = fs.readFileSync(path.join(__dirname, 'index.template.html'), 'utf8');

// Replace placeholder
const html = template.replace('<!-- {{JSX}} -->', jsx);

// Ghi ra index.html
fs.writeFileSync(path.join(__dirname, 'index.html'), html, 'utf8');
console.log('Generated index.html');

// Copy ra www/
const filesToCopy = ['index.html', 'style.css', 'data.js'];
for (const file of filesToCopy) {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(wwwDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
  }
}
console.log('Copied to www/');
console.log('Build hoàn tất!');
