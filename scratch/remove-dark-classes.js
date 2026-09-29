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

  content = content.replace(/className=(['"])(.*?)\1/g, (match, quote, classStr) => {
    let classes = classStr.split(' ');
    // Filter out ANY class that starts with 'dark:'
    let newClasses = classes.filter(c => !c.startsWith('dark:'));
    
    // Also remove the transition classes I added automatically if they are now alone, but it's safe to just leave them or remove them.
    // Let's just remove dark: classes.

    return `className=${quote}${newClasses.join(' ')}${quote}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Removed dark classes from', file);
  }
});
