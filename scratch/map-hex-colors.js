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

const replacements = {
  '\\[#082b57\\]': 'brand-navy',
  '\\[#1d5a98\\]': 'brand-navylight',
  '\\[#17243c\\]': 'brand-dark',
  '\\[#d2773a\\]': 'brand-orange',
  '\\[#10264b\\]': 'brand-dark',
  '\\[#05162d\\]': 'brand-dark',
  '\\[#0c3e75\\]': 'brand-navy',
  '\\[#051937\\]': 'brand-dark',
  '\\[#164979\\]': 'brand-navylight',
  '\\[#0a0a0a\\]': 'slate-900',
  '\\[#000000\\]': 'slate-950',
  '\\[#111111\\]': 'slate-900',
  '\\[#1a1a1a\\]': 'slate-800'
};

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  Object.entries(replacements).forEach(([hex, name]) => {
    // Replace text-[hex], bg-[hex], border-[hex], ring-[hex], etc.
    const regex = new RegExp(`(text|bg|border|ring|fill|stroke|divide|from|via|to)-${hex}`, 'g');
    content = content.replace(regex, `$1-${name}`);
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Replaced hex codes with brand names in:', file);
  }
});

console.log('Done mapping hex codes!');
