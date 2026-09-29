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

  // Replace arbitrary hex values with new theme classes
  content = content.replace(/\[#17243c\]/g, 'brand-main');
  content = content.replace(/\[#082b57\]/g, 'brand-navy');
  content = content.replace(/\[#1d5a98\]/g, 'brand-accent');
  content = content.replace(/\[#d2773a\]/g, 'brand-orange');

  // Also replace arbitrary bg values if they exist
  // We already replaced [#082b57] globally, so bg-[#082b57] becomes bg-brand-navy, which is perfect!
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Replaced hardcoded hex values with brand variables in', file);
  }
});
