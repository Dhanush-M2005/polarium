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

// Function to escape regex special characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
}

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Process each className attribute
  content = content.replace(/className=\{?(['"`])([\s\S]*?)\1\}?/g, (fullMatch, quote, classStr) => {
    
    // Split the string by spaces, filter out anything starting with "dark:", and rejoin
    let classes = classStr.split(/\s+/);
    classes = classes.filter(c => !c.startsWith('dark:'));
    
    return `className=${quote}${classes.join(' ')}${quote}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Removed dark classes from:', file);
  }
});

console.log('Done cleaning!');
