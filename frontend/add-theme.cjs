const fs = require('fs');
let code = fs.readFileSync('src/App.jsx', 'utf8');

// 1. Add sun and moon to I
if (!code.includes('sun: ')) {
  code = code.replace(
    /const I = {/,
    `const I = {\n  sun:    "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z",\n  moon:   "M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z",`
  );
}

// 2. Add theme state and effect to App
if (!code.includes('const [theme, setTheme]')) {
  code = code.replace(
    /const \[sbOpen,\s+setSbOpen\]\s+=\s+useState\(false\);/,
    `const [sbOpen,   setSbOpen]   = useState(false);\n  const [theme,    setTheme]    = useState(() => localStorage.getItem("theme") || "dark");\n\n  useEffect(() => {\n    document.body.className = theme;\n    localStorage.setItem("theme", theme);\n  }, [theme]);`
  );
}

// 3. Add toggle button to .bar-r
if (!code.includes('setTheme(t => t === "dark" ? "light" : "dark")')) {
  code = code.replace(
    /<div className="bar-r">/,
    `<div className="bar-r" style={{ display: "flex", gap: 8 }}>\n              <button className="ib" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>\n                {theme === "dark" ? <Icon d={I.sun} size={15} /> : <Icon d={I.moon} size={15} />}\n              </button>`
  );
}

// 4. Add .light CSS
if (!code.includes('body.light')) {
  const lightCSS = `

/* Light Theme Overrides */
body.light {
  --bg: #F8FAFC;
  --surface: rgba(255, 255, 255, 0.6);
  --card: rgba(255, 255, 255, 0.95);
  --border: rgba(0, 0, 0, 0.08);
  --border-hl: rgba(0, 0, 0, 0.15);
  --text: #0F172A;
  --muted: #64748B;
  --muted2: #94A3B8;
  --hover: rgba(0, 0, 0, 0.04);
}
body.light .app { box-shadow: 0 24px 80px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1); }
body.light .auth-box { box-shadow: 0 24px 64px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1); }
body.light .tcard:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04); background: rgba(255,255,255,1); }
body.light input[data-f], body.light select[data-f], body.light .sinput, body.light .ftabs, body.light .ck { background: rgba(255,255,255,0.7); box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }
body.light input[data-f]:focus, body.light select[data-f]:focus, body.light .sinput:focus { background: #fff; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15), inset 0 1px 2px rgba(0,0,0,0.05); }
body.light .btn-g { background: rgba(0,0,0,0.03); border: 1px solid var(--border); }
body.light .btn-g:hover { background: rgba(0,0,0,0.06); }
body.light .sb { background: rgba(248, 250, 252, 0.6); }
body.light .bar { background: rgba(255, 255, 255, 0.4); }
body.light .sb-sec::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); }
body.light .content::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }
body.light .popt { background: rgba(255,255,255,0.7); color: var(--muted); }
body.light .popt:hover { background: #fff; color: var(--text); }
body.light .ProseMirror strong { color: var(--text); }
`;
  
  // Insert before the end of the CSS string
  code = code.replace(
    /\n\s*`;\s*\n\s*\/\/\s*───\s*Rich Text Editor/,
    `${lightCSS}\n\`;\n\n// ─── Rich Text Editor`
  );
}

fs.writeFileSync('src/App.jsx', code);
console.log('Theme toggle injected');
