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

const files = walk('./app').concat(walk('./components'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Refine the dark text classes to be more "World Class" (Vercel/Linear style)
  // Replacing cyan with softer blue, and pure white with slate-100
  content = content.replace(/dark:text-cyan-400/g, 'dark:text-blue-400');
  content = content.replace(/dark:text-cyan-300/g, 'dark:text-blue-300');
  content = content.replace(/dark:hover:text-cyan-400/g, 'dark:hover:text-blue-400');
  content = content.replace(/dark:hover:text-cyan-300/g, 'dark:hover:text-blue-300');
  content = content.replace(/dark:text-white/g, 'dark:text-slate-100');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Refined dark text classes in', file);
  }
});
