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

  // Revert custom brands to hex codes
  content = content.replace(/brand-main/g, '[#17243c]');
  content = content.replace(/brand-navy/g, '[#082b57]');
  content = content.replace(/brand-accent/g, '[#1d5a98]');
  content = content.replace(/brand-orange/g, '[#d2773a]');

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Reverted brand variables to hex in', file);
  }
});
