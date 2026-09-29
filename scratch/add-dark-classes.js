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
    let newClasses = new Set(classes);
    
    classes.forEach(c => {
      // Extract optional prefix (hover:, focus:, group-hover:, active:, sm:hover:, etc)
      const parts = c.split(':');
      const base = parts.pop();
      const prefix = parts.length > 0 ? parts.join(':') + ':' : '';
      
      const pDark = prefix ? `dark:${prefix}` : 'dark:';
      const hasDark = (clsType) => classes.some(existingClass => existingClass === `${pDark}${clsType}`);

      if (base === 'bg-white' && !hasDark('bg-slate-900') && !hasDark('bg-slate-950')) newClasses.add(`${pDark}bg-slate-900`);
      if (base === 'bg-slate-50' && !hasDark('bg-slate-950') && !hasDark('bg-slate-900')) newClasses.add(`${pDark}bg-slate-950`);
      if (base === 'bg-slate-100' && !hasDark('bg-slate-800')) newClasses.add(`${pDark}bg-slate-800`);
      if (base === 'text-slate-900' && !hasDark('text-slate-100')) newClasses.add(`${pDark}text-slate-100`);
      if (base === 'text-slate-800' && !hasDark('text-slate-200')) newClasses.add(`${pDark}text-slate-200`);
      if (base === 'text-slate-700' && !hasDark('text-slate-300')) newClasses.add(`${pDark}text-slate-300`);
      if (base === 'text-[#17243c]' && !hasDark('text-white')) newClasses.add(`${pDark}text-white`);
      if (base === 'text-[#082b57]' && !hasDark('text-cyan-400')) newClasses.add(`${pDark}text-cyan-400`);
      if (base === 'border-slate-200' && !hasDark('border-slate-700')) newClasses.add(`${pDark}border-slate-700`);
      if (base === 'border-slate-300' && !hasDark('border-slate-600')) newClasses.add(`${pDark}border-slate-600`);
      if (base === 'divide-slate-100' && !hasDark('divide-slate-800')) newClasses.add(`${pDark}divide-slate-800`);
      if (base === 'divide-slate-200' && !hasDark('divide-slate-700')) newClasses.add(`${pDark}divide-slate-700`);
      if (base === 'bg-slate-200' && !hasDark('bg-slate-700')) newClasses.add(`${pDark}bg-slate-700`);
      
      // Specifically target #1d5a98 links and hover states
      if (base === 'text-[#1d5a98]' && !hasDark('text-cyan-400')) newClasses.add(`${pDark}text-cyan-400`);
      if (base === 'text-[#164979]' && !hasDark('text-cyan-300')) newClasses.add(`${pDark}text-cyan-300`);
      if (base === 'text-[#d2773a]' && !hasDark('text-amber-400')) newClasses.add(`${pDark}text-amber-400`);
    });

    if (newClasses.size > classes.length && !newClasses.has('transition-colors')) {
      newClasses.add('transition-colors');
      newClasses.add('duration-300');
    }

    return `className=${quote}${Array.from(newClasses).join(' ')}${quote}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Added dark classes to', file);
  }
});
