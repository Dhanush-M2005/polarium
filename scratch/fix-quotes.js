const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  try {
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
  } catch(e) {}
  return results;
}

const files = walk('./app').concat(walk('./components'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Find all instances of className={`...`}
  content = content.replace(/className=\{\`([\s\S]*?)\`\}/g, (match, inner) => {
    // Check if the inner string has syntax errors like missing quotes before colons or before closing braces
    // Example:  shadow-sm : "text-slate-400 -> shadow-sm" : "text-slate-400
    // Example:  hover:bg-slate-50 } -> hover:bg-slate-50" }
    
    let fixed = inner;
    
    // Fix missing quote before colon
    // Matches word characters/hyphens/brackets/slashes followed by space : "
    fixed = fixed.replace(/([\w\-\[\]\/]+)(\s*:\s*")/g, (m, p1, p2) => {
      if (p1.endsWith('"')) return m; // already quoted
      return p1 + '"' + p2;
    });

    // Fix missing quote before closing brace
    fixed = fixed.replace(/([\w\-\[\]\/]+)(\s*\})/g, (m, p1, p2) => {
      if (p1.endsWith('"')) return m; // already quoted
      return p1 + '"' + p2;
    });

    return `className={\`${fixed}\`}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed quotes in:', file);
  }
});
