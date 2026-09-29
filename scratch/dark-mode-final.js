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

// Comprehensive dark mode mapping
// Format: { match: regex, replacement: '$0 dark:equivalent' }
// These are applied only when the dark equivalent is NOT already present in the same className string

const MAPPINGS = [
  // ── Backgrounds ──
  { light: 'bg-white', dark: 'dark:bg-[#0a0a0a]' },
  { light: 'bg-white/95', dark: 'dark:bg-[#0a0a0a]/95' },
  { light: 'bg-white/90', dark: 'dark:bg-[#0a0a0a]/90' },
  { light: 'bg-slate-50', dark: 'dark:bg-[#000000]' },
  { light: 'bg-slate-100', dark: 'dark:bg-[#111111]' },
  { light: 'bg-slate-200', dark: 'dark:bg-[#1a1a1a]' },
  { light: 'bg-blue-50', dark: 'dark:bg-blue-950' },

  // ── Hover backgrounds ──
  { light: 'hover:bg-white', dark: 'dark:hover:bg-[#0a0a0a]' },
  { light: 'hover:bg-slate-50', dark: 'dark:hover:bg-[#111111]' },
  { light: 'hover:bg-slate-50/80', dark: 'dark:hover:bg-[#111111]/80' },
  { light: 'hover:bg-slate-100', dark: 'dark:hover:bg-[#1a1a1a]' },
  { light: 'hover:bg-slate-200', dark: 'dark:hover:bg-[#222222]' },
  { light: 'hover:bg-slate-200/60', dark: 'dark:hover:bg-[#1a1a1a]/60' },
  { light: 'hover:bg-blue-50/70', dark: 'dark:hover:bg-blue-950/70' },

  // ── Text colors ──
  { light: 'text-slate-900', dark: 'dark:text-slate-100' },
  { light: 'text-slate-800', dark: 'dark:text-slate-200' },
  { light: 'text-slate-700', dark: 'dark:text-slate-300' },
  { light: 'text-slate-600', dark: 'dark:text-slate-400' },
  { light: 'text-slate-500', dark: 'dark:text-slate-400' },
  { light: 'text-[#17243c]', dark: 'dark:text-white' },
  { light: 'text-[#082b57]', dark: 'dark:text-blue-400' },
  { light: 'text-[#1d5a98]', dark: 'dark:text-blue-400' },
  { light: 'text-[#164979]', dark: 'dark:text-blue-300' },
  { light: 'text-[#d2773a]', dark: 'dark:text-amber-400' },
  { light: 'text-[#243b5a]', dark: 'dark:text-slate-200' },
  { light: 'text-[#10264b]', dark: 'dark:text-white' },

  // ── Hover text ──
  { light: 'hover:text-slate-900', dark: 'dark:hover:text-white' },
  { light: 'hover:text-slate-700', dark: 'dark:hover:text-slate-200' },
  { light: 'hover:text-[#082b57]', dark: 'dark:hover:text-blue-400' },
  { light: 'hover:text-[#1d5a98]', dark: 'dark:hover:text-blue-400' },
  { light: 'hover:text-[#164979]', dark: 'dark:hover:text-blue-300' },
  { light: 'hover:text-[#d2773a]', dark: 'dark:hover:text-amber-400' },
  { light: 'hover:text-[#10264b]', dark: 'dark:hover:text-white' },

  // ── Group-hover text ──
  { light: 'group-hover:text-[#082b57]', dark: 'dark:group-hover:text-blue-400' },
  { light: 'group-hover:text-[#1d5a98]', dark: 'dark:group-hover:text-blue-400' },
  { light: 'group-hover:text-emerald-700', dark: 'dark:group-hover:text-emerald-400' },

  // ── Borders ──
  { light: 'border-slate-200', dark: 'dark:border-[#1a1a1a]' },
  { light: 'border-slate-200/80', dark: 'dark:border-[#1a1a1a]/80' },
  { light: 'border-slate-300', dark: 'dark:border-[#262626]' },
  { light: 'border-slate-100', dark: 'dark:border-[#111111]' },

  // ── Focus borders ──
  { light: 'focus-within:border-[#082b57]', dark: 'dark:focus-within:border-blue-500' },
  { light: 'focus-within:ring-[#082b57]', dark: 'dark:focus-within:ring-blue-500' },

  // ── Dividers ──
  { light: 'divide-slate-100', dark: 'dark:divide-[#1a1a1a]' },
  { light: 'divide-slate-200', dark: 'dark:divide-[#1a1a1a]' },

  // ── Placeholder text ──
  { light: 'placeholder:text-slate-400', dark: 'dark:placeholder:text-slate-500' },

  // ── Shadows ──
  { light: 'shadow-sm', dark: 'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4)]' },
  { light: 'shadow-md', dark: 'dark:shadow-[0_4px_6px_rgba(0,0,0,0.5)]' },
  { light: 'shadow-lg', dark: 'dark:shadow-[0_10px_15px_rgba(0,0,0,0.5)]' },
  { light: 'shadow-xl', dark: 'dark:shadow-[0_20px_25px_rgba(0,0,0,0.5)]' },

  // ── Active borders for navigation ──
  { light: 'border-[#082b57]', dark: 'dark:border-blue-500' },
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
}

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Process each className attribute
  content = content.replace(/className=\{?(['"`])([\s\S]*?)\1\}?/g, (fullMatch, quote, classStr) => {
    // Skip template literals with complex expressions
    if (quote === '`' && classStr.includes('${')) {
      // For template literals, we process the static parts only
      let modified = classStr;
      MAPPINGS.forEach(({ light, dark }) => {
        // Check if the dark equivalent already exists anywhere in the template
        if (modified.includes(dark)) return;
        
        // Build a regex that matches the light class as a whole word
        const lightEscaped = escapeRegex(light);
        const regex = new RegExp(`(?<=^|\\s|")${lightEscaped}(?=\\s|"|$|\`)`, 'g');
        
        if (regex.test(modified)) {
          // Add dark class right after the light class
          modified = modified.replace(new RegExp(`(?<=^|\\s|")${lightEscaped}(?=\\s|"|$|\`)`, 'g'), `${light} ${dark}`);
        }
      });
      return `className=${quote}${modified}${quote}`;
    }

    // For regular strings
    let modified = classStr;
    MAPPINGS.forEach(({ light, dark }) => {
      if (modified.includes(dark)) return;
      
      const lightEscaped = escapeRegex(light);
      const regex = new RegExp(`(^|\\s)${lightEscaped}(\\s|$)`, 'g');
      
      if (regex.test(modified)) {
        modified = modified.replace(new RegExp(`(^|\\s)${lightEscaped}(\\s|$)`, 'g'), `$1${light} ${dark}$2`);
      }
    });
    
    return `className=${quote}${modified}${quote}`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated:', file);
  }
});

console.log('Done!');
