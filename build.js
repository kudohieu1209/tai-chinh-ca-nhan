const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');

// Keep the output directory in place when Windows has a file handle open
// (for example from a local preview server). The generated files below are
// overwritten deterministically, so a full recursive delete is unnecessary.
if (!fs.existsSync(wwwDir)) {
  fs.mkdirSync(wwwDir, { recursive: true });
}

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

// The vanilla HTML app does not have a bundler to import Capacitor core.
// Ship the bridge explicitly so native plugins can be called from JSX.
const capacitorBridge = path.join(__dirname, 'node_modules', '@capacitor', 'core', 'dist', 'capacitor.js');
if (fs.existsSync(capacitorBridge)) {
  fs.copyFileSync(capacitorBridge, path.join(__dirname, 'capacitor.js'));
  fs.copyFileSync(capacitorBridge, path.join(wwwDir, 'capacitor.js'));
}
// Copy app icon for favicon/brand mark (ưu tiên icon trong suốt đã cắt nền, fallback icon gốc)
const transparentSrc = path.join(__dirname, 'assets', 'icon_transparent.png');
const iconSrc = path.join(__dirname, 'assets', 'icon.png');
const faviconSrc = fs.existsSync(transparentSrc) ? transparentSrc : iconSrc;
if (fs.existsSync(faviconSrc)) {
  fs.copyFileSync(faviconSrc, path.join(wwwDir, 'icon.png'));
}
console.log('Copied to www/');
console.log('Build hoàn tất!');
