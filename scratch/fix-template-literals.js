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

  // Fix className=`...` -> className={`...`}
  // This regex finds className= followed by a backtick (template literal) NOT wrapped in {}
  // It needs to match className=`...` where `...` can span multiple lines and contain ${} expressions
  
  // Strategy: find className= followed immediately by ` (no { before it)
  // and replace with className={`...`}
  
  // We need to be careful not to match className={`...`} which is already correct
  
  let result = '';
  let i = 0;
  while (i < content.length) {
    // Look for 'className=' pattern
    if (content.substring(i, i + 10) === 'className=') {
      const afterEquals = i + 10;
      if (content[afterEquals] === '`') {
        // This is a broken className=`...` — need to wrap in {}
        // Find the closing backtick
        let j = afterEquals + 1;
        let depth = 0;
        while (j < content.length) {
          if (content[j] === '$' && content[j+1] === '{') {
            depth++;
            j += 2;
            continue;
          }
          if (content[j] === '}' && depth > 0) {
            depth--;
            j++;
            continue;
          }
          if (content[j] === '`' && depth === 0) {
            // Found the closing backtick
            break;
          }
          j++;
        }
        // content[afterEquals..j] is the template literal including backticks
        const templateLiteral = content.substring(afterEquals, j + 1);
        result += 'className={' + templateLiteral + '}';
        i = j + 1;
        continue;
      }
    }
    result += content[i];
    i++;
  }
  
  content = result;

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed template literals in', file);
  }
});

console.log('Done fixing template literals!');
