const fs = require('fs');
const path = require('path');

const wwwDir = path.join(__dirname, 'www');

// Xóa thư mục www cũ nếu có
if (fs.existsSync(wwwDir)) {
  fs.rmSync(wwwDir, { recursive: true, force: true });
}

// Tạo lại thư mục www
fs.mkdirSync(wwwDir);

// Danh sách các file cần copy
const filesToCopy = ['index.html', 'style.css', 'data.js'];

filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  const destPath = path.join(wwwDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${file} to www/`);
  } else {
    console.warn(`File ${file} không tồn tại.`);
  }
});

console.log('Build hoàn tất. Dữ liệu web đã nằm trong thư mục www/');
