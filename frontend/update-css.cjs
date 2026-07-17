const fs = require('fs');

const path = 'c:/Users/raquel/Documents/GitHub/Projetos/todo-list/frontend/src/App.jsx';
let content = fs.readFileSync(path, 'utf8');

const cssStart = content.indexOf('const CSS = `');
const cssEnd = content.indexOf('`;\n', cssStart) + 3;

const oldCssBlock = content.substring(cssStart, cssEnd);

const newCssBlock = `const CSS = \`
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Outfit:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --font-head: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;
  --bg:        #0B0E14;
  --surface:   rgba(20, 24, 34, 0.65);
  --card:      rgba(30, 36, 48, 0.45);
  --border:    rgba(255, 255, 255, 0.08);
  --border-hl: rgba(255, 255, 255, 0.18);
  --hover:     rgba(255, 255, 255, 0.04);
  --text:      #F8FAFC;
  --muted:     #94A3B8;
  --muted2:    #64748B;
  --accent:    #8B5CF6;
  --accent2:   #A78BFA;
  --accent-bg: rgba(139, 92, 246, 0.15);
  --red:       #F43F5E;
  --red-bg:    rgba(244, 63, 94, 0.15);
  --green:     #10B981;
  --green-bg:  rgba(16, 185, 129, 0.15);
  --r:         18px;
  --sb:        250px;
}

html { height: 100%; }

body {
  min-height: 100%;
  background: var(--bg);
  background-image: 
    radial-gradient(circle at 15% 50%, rgba(139, 92, 246, 0.08), transparent 25%),
    radial-gradient(circle at 85% 30%, rgba(56, 189, 248, 0.08), transparent 25%);
  background-attachment: fixed;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 400;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  line-height: 1.5;
}

#root {
  position: fixed; inset: 0;
  display: flex; align-items: center; justify-content: center;
  padding: 32px;
}

.app {
  display: flex;
  width: 100%; max-width: 1100px;
  height: 100%; max-height: 800px;
  background: var(--surface);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--border);
  border-radius: 24px; overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05);
}

/* Auth */
.auth-wrap { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; padding: 24px; background: var(--bg); z-index: 1000; }
.auth-box  { width: 100%; max-width: 420px; background: var(--card); backdrop-filter: blur(24px); border: 1px solid var(--border); border-radius: 24px; padding: 48px 40px; box-shadow: 0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05); animation: fu 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
.logo { font-family: var(--font-head); font-size: 36px; font-weight: 700; background: linear-gradient(135deg, #A78BFA, #38BDF8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -1px; margin-bottom: 8px; }
.sub  { color: var(--muted); font-size: 14px; margin-bottom: 32px; font-weight: 300; }
.tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 32px; }
.tab  { flex: 1; padding: 12px; text-align: center; cursor: pointer; color: var(--muted); font-size: 13px; font-weight: 600; letter-spacing: 0.5px; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: all 0.2s ease; }
.tab.on { color: var(--text); border-bottom-color: var(--accent); }

/* Form */
.field { margin-bottom: 20px; }
.label { display: block; font-size: 11px; font-weight: 600; color: var(--muted); letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; }
input[data-f], select[data-f] {
  width: 100%; padding: 12px 16px;
  background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: var(--r);
  color: var(--text); font-family: var(--font-body); font-size: 14px;
  outline: none; transition: all 0.2s ease;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
}
input[data-f]:focus, select[data-f]:focus { border-color: var(--accent2); background: rgba(0,0,0,0.4); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15), inset 0 2px 4px rgba(0,0,0,0.1); }
select[data-f] { cursor: pointer; appearance: none; }
input[data-f]::placeholder { color: var(--muted2); }

/* Tiptap */
.ProseMirror { outline: none; font-family: var(--font-body); font-size: 14px; font-weight: 400; color: var(--text); line-height: 1.6; }
.ProseMirror p { margin: 0 0 8px; }
.ProseMirror p:last-child { margin-bottom: 0; }
.ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 8px 0; }
.ProseMirror li { margin-bottom: 4px; }
.ProseMirror strong { font-weight: 600; color: #fff; }
.ProseMirror em { font-style: italic; }

/* Buttons */
.btn     { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 20px; border-radius: var(--r); cursor: pointer; font-family: var(--font-body); font-size: 13px; font-weight: 600; letter-spacing: 0.3px; border: none; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); white-space: nowrap; }
.btn-p   { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3), inset 0 1px 0 rgba(255,255,255,0.2); }
.btn-p:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.2); filter: brightness(1.1); }
.btn-p:active { transform: translateY(1px); box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3); }
.btn-g   { background: rgba(255,255,255,0.05); color: var(--text); border: 1px solid var(--border); }
.btn-g:hover { background: rgba(255,255,255,0.1); border-color: var(--border-hl); }
.btn-w   { width: 100%; padding: 12px 20px; font-size: 14px; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; box-shadow: none !important; }

.ib      { background: none; border: none; cursor: pointer; color: var(--muted); padding: 6px; border-radius: 8px; display: flex; align-items: center; transition: all 0.2s ease; }
.ib:hover { color: var(--text); background: var(--hover); }
.ib.del:hover { color: var(--red); background: var(--red-bg); }

/* Sidebar */
.sb       { width: var(--sb); flex-shrink: 0; background: rgba(15, 18, 25, 0.6); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 28px 0; transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.sb-logo  { font-family: var(--font-head); font-size: 24px; font-weight: 700; background: linear-gradient(135deg, #A78BFA, #38BDF8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; padding: 0 24px 24px; border-bottom: 1px solid var(--border); letter-spacing: -0.5px; }
.sb-sec   { padding: 24px 16px 0; }
.sb-lbl   { font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; color: var(--muted2); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; padding: 0 8px; }
.sb-item  { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-radius: 12px; cursor: pointer; color: var(--muted); font-size: 13px; font-weight: 500; margin-bottom: 4px; transition: all 0.2s ease; border: 1px solid transparent; }
.sb-item:hover { background: var(--hover); color: var(--text); }
.sb-item.on    { background: var(--accent-bg); color: var(--text); border-color: rgba(139, 92, 246, 0.2); }
.sb-item.on .dot { background: var(--accent); opacity: 1; box-shadow: 0 0 8px rgba(139,92,246,0.6); }
.sb-l    { display: flex; align-items: center; gap: 10px; }
.dot     { width: 8px; height: 8px; border-radius: 50%; background: var(--muted2); opacity: 0.6; flex-shrink: 0; transition: all 0.2s ease; }
.sb-acts { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s ease; }
.sb-item:hover .sb-acts { opacity: 1; }
.sb-foot { margin-top: auto; padding: 20px 24px; border-top: 1px solid var(--border); }

/* Main */
.main    { flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0; }
.bar     { padding: 16px 32px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 16px; background: rgba(20, 24, 34, 0.4); }
.sw      { flex: 1; position: relative; min-width: 150px; max-width: 320px; }
.si      { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--muted); pointer-events: none; }
.sinput  { width: 100%; padding: 10px 14px 10px 38px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: var(--r); color: var(--text); font-family: var(--font-body); font-size: 13px; outline: none; transition: all 0.2s ease; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1); }
.sinput:focus { border-color: var(--accent); background: rgba(0,0,0,0.3); box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15), inset 0 1px 3px rgba(0,0,0,0.1); }
.sinput::placeholder { color: var(--muted2); }
.ftabs   { display: flex; gap: 6px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 12px; border: 1px solid var(--border); }
.ft      { padding: 6px 16px; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 500; color: var(--muted); transition: all 0.2s ease; }
.ft:hover { color: var(--text); }
.ft.on   { background: var(--surface); color: var(--text); box-shadow: 0 2px 8px rgba(0,0,0,0.2); }
.bar-r   { margin-left: auto; }
.ham     { display: none; }
.content { flex: 1; overflow-y: auto; padding: 32px; }
.content::-webkit-scrollbar { width: 6px; }
.content::-webkit-scrollbar-thumb { background: var(--border-hl); border-radius: 3px; }
.content::-webkit-scrollbar-track { background: transparent; }
.ptitle  { font-family: var(--font-head); font-size: 32px; font-weight: 700; color: var(--text); margin-bottom: 4px; letter-spacing: -0.5px; }
.pcount  { color: var(--muted); font-size: 13px; margin-bottom: 24px; font-weight: 500; }

/* Task card */
.tlist  { display: flex; flex-direction: column; gap: 12px; }
.tcard  { background: var(--card); border: 1px solid var(--border); border-radius: var(--r); padding: 18px 20px; display: flex; align-items: flex-start; gap: 16px; transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); animation: fu 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
@keyframes fu { from { opacity: 0; transform: translateY(8px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
.tcard:hover { border-color: var(--border-hl); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.05); background: rgba(35, 42, 56, 0.6); }
.tcard.done  { opacity: 0.5; filter: grayscale(50%); }
.tcard.done:hover { opacity: 0.7; transform: none; box-shadow: none; background: var(--card); }
.ck     { width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0; margin-top: 2px; border: 2px solid var(--muted2); cursor: pointer; background: rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); color: transparent; }
.ck:hover    { border-color: var(--accent2); background: var(--accent-bg); color: var(--accent2); transform: scale(1.1); }
.ck.done     { border-color: var(--green); background: var(--green); color: #fff; box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); }
.tbody  { flex: 1; min-width: 0; }
.ttitle { font-size: 16px; font-weight: 500; color: var(--text); margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ttitle.done { text-decoration: line-through; color: var(--muted); }
.tdesc  { font-size: 13px; color: var(--muted); margin-bottom: 12px; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.tdesc p { margin: 0; }
.tdesc ul, .tdesc ol { padding-left: 20px; margin: 0; }
.tmeta  { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.badge  { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border: 1px solid transparent; background: rgba(255,255,255,0.05); color: var(--muted); }
.due    { border-color: var(--border); }
.due.overdue { color: var(--red); border-color: var(--red-bg); background: rgba(244, 63, 94, 0.1); }
.tacts  { display: flex; gap: 4px; opacity: 0; transition: opacity 0.2s ease; flex-shrink: 0; }
.tcard:hover .tacts { opacity: 1; }

/* Empty */
.empty   { text-align: center; padding: 80px 20px; color: var(--muted); display: flex; flex-direction: column; align-items: center; justify-content: center; }
.empty svg { opacity: 0.3; margin: 0 auto 24px; color: var(--accent); filter: drop-shadow(0 0 16px rgba(139,92,246,0.4)); }
.empty h3  { font-family: var(--font-head); font-size: 24px; font-weight: 600; margin-bottom: 8px; color: var(--text); }
.empty p   { font-size: 14px; max-width: 300px; margin: 0 auto; line-height: 1.6; }

/* Modal */
.ov    { position: fixed; inset: 0; background: rgba(5, 7, 10, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 24px; animation: fi 0.2s ease; }
@keyframes fi { from { opacity: 0; backdrop-filter: blur(0px); } to { opacity: 1; backdrop-filter: blur(12px); } }
.modal { background: var(--card); border: 1px solid var(--border-hl); border-radius: 24px; width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; animation: su 0.3s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 32px 96px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1); }
@keyframes su { from { transform: translateY(20px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
.modal::-webkit-scrollbar { width: 6px; }
.modal::-webkit-scrollbar-thumb { background: var(--border-hl); border-radius: 3px; }
.mh { padding: 24px 32px 0; display: flex; align-items: center; justify-content: space-between; }
.mt { font-family: var(--font-head); font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
.mb { padding: 24px 32px; display: flex; flex-direction: column; gap: 20px; }
.mf { padding: 0 32px 24px; display: flex; gap: 12px; justify-content: flex-end; }

/* Priority grid */
.pgrid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
.popt  { padding: 10px 8px; border-radius: 10px; cursor: pointer; text-align: center; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; border: 1px solid var(--border); transition: all 0.2s ease; color: var(--muted); background: rgba(0,0,0,0.2); }
.popt:hover { border-color: var(--border-hl); color: var(--text); background: rgba(255,255,255,0.05); }

.err   { color: var(--red); font-size: 13px; text-align: center; background: var(--red-bg); border: 1px solid rgba(244,63,94,0.3); padding: 12px; border-radius: 12px; }
.sb-ov { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 200; backdrop-filter: blur(4px); }

/* Mobile */
@media (max-width: 768px) {
  #root { padding: 0; }
  .app  { border-radius: 0; max-height: 100%; border: none; }
  .sb   { position: fixed; top: 0; left: 0; height: 100%; z-index: 300; transform: translateX(-100%); box-shadow: 20px 0 40px rgba(0,0,0,0.5); }
  .sb.open    { transform: translateX(0); }
  .sb-ov.open { display: block; z-index: 250; }
  .ham  { display: flex; }
  .ftabs { display: none; }
  .sw   { max-width: 100%; }
  .pgrid { grid-template-columns: repeat(2,1fr); }
  .bar { padding: 16px 20px; }
  .content { padding: 20px; }
  .auth-box { padding: 32px 24px; border-radius: 0; border: none; height: 100%; max-width: 100%; display: flex; flex-direction: column; justify-content: center; }
  .modal { max-height: 100vh; border-radius: 0; border: none; }
}
@media (min-width: 769px) and (max-width: 900px) {
  :root { --sb: 220px; }
}
\`;\n`;

content = content.replace(oldCssBlock, newCssBlock);

content = content.replace(
  'const PRIORITY_META = {\n  LOW:    { label: "Low",    color: "#7B6FA0", bg: "#EDE8F5" },\n  MEDIUM: { label: "Medium", color: "#4A7FC1", bg: "#E5EDFB" },\n  HIGH:   { label: "High",   color: "#C4782A", bg: "#FBF0E4" },\n  URGENT: { label: "Urgent", color: "#C0305A", bg: "#FCE8EF" },\n};',
  'const PRIORITY_META = {\n  LOW:    { label: "Low",    color: "#38BDF8", bg: "rgba(56, 189, 248, 0.15)" },\n  MEDIUM: { label: "Medium", color: "#A78BFA", bg: "rgba(167, 139, 250, 0.15)" },\n  HIGH:   { label: "High",   color: "#FBBF24", bg: "rgba(251, 191, 36, 0.15)" },\n  URGENT: { label: "Urgent", color: "#F43F5E", bg: "rgba(244, 63, 94, 0.15)" },\n};'
);

content = content.replace(/var\(--mono\)/g, 'var(--font-body)');
content = content.replace(/var\(--serif\)/g, 'var(--font-head)');

fs.writeFileSync(path, content, 'utf8');
console.log('Done replacement');
