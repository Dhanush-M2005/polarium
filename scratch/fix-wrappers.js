const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (file.endsWith('.tsx')) {
      results.push(filePath);
    }
  });
  return results;
}

const files = walk('./app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Fix outer wrappers
  content = content.replace(/min-h-screen bg-slate-50 text-slate-900 font-sans pb-24/g, 'min-h-screen bg-transparent transition-colors duration-300 pb-24');
  content = content.replace(/min-h-screen bg-slate-50 text-slate-900 font-sans pb-20/g, 'min-h-screen bg-transparent transition-colors duration-300 pb-20');
  content = content.replace(/min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans/g, 'min-h-screen bg-transparent flex flex-col transition-colors duration-300');
  content = content.replace(/min-h-screen flex items-center justify-center bg-slate-50 text-slate-900/g, 'min-h-screen flex items-center justify-center bg-transparent transition-colors duration-300');
  content = content.replace(/min-h-screen bg-slate-100 font-sans text-slate-900/g, 'min-h-screen bg-transparent font-sans transition-colors duration-300');
  content = content.replace(/flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans/g, 'flex flex-col min-h-screen bg-transparent font-sans transition-colors duration-300');
  content = content.replace(/min-h-screen bg-slate-50 flex items-center justify-center p-8 text-xs text-slate-500 font-semibold/g, 'min-h-screen bg-transparent flex items-center justify-center p-8 text-xs text-slate-500 font-semibold transition-colors duration-300');
  content = content.replace(/min-h-screen bg-slate-50 flex items-center justify-center p-8 text-slate-600 font-mono text-xs/g, 'min-h-screen bg-transparent flex items-center justify-center p-8 text-slate-600 font-mono text-xs transition-colors duration-300');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated wrapper in', file);
  }
});
