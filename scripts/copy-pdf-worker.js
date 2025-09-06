// Script to copy pdf.worker.js from node_modules to public folder
// Usage: node scripts/copy-pdf-worker.js

const fs = require('fs');
const path = require('path');

const possibleWorkers = [
  path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.js'),
  path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.min.js'),
  path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'build', 'pdf.worker.mjs'),
  path.join(__dirname, '..', 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.js'),
];
const dest = path.join(__dirname, '..', 'public', 'pdf.worker.js');

let found = false;
for (const src of possibleWorkers) {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} to public/pdf.worker.js`);
    found = true;
    break;
  }
}
if (!found) {
  console.error('pdf.worker.js not found in any known location.');
  process.exit(1);
}
