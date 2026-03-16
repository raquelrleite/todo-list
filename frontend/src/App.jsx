import { useState, useEffect, useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import DOMPurify from "dompurify";

const API_URL = "http://localhost:8080";
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const PRIORITY_META = {
  LOW:    { label: "Low",    color: "#7B6FA0", bg: "#EDE8F5" },
  MEDIUM: { label: "Medium", color: "#4A7FC1", bg: "#E5EDFB" },
  HIGH:   { label: "High",   color: "#C4782A", bg: "#FBF0E4" },
  URGENT: { label: "Urgent", color: "#C0305A", bg: "#FCE8EF" },
};
const MONTH_NAMES  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTH_SHORT  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAY_NAMES    = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ─── API hook ─────────────────────────────────────────────────────────────────
let refreshPromise = null; // lock global para evitar refresh simultâneo

function useApi() {
  const request = useCallback(async (method, path, body = null, retry = true) => {
    const headers = { "Content-Type": "application/json" };
    const token = localStorage.getItem("accessToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${path}`, {
      method, headers, body: body ? JSON.stringify(body) : null,
    });

    if (res.status === 401 && retry && !path.includes("/v1/users/login") && !path.includes("/v1/users/refresh")) {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        // Sem refresh token = não está logado, retorna o erro original da requisição
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        throw new Error(data.message || "Error");
      }

      try {
        // Se já tem um refresh em andamento, aguarda ele terminar
        if (!refreshPromise) {
          refreshPromise = fetch(`${API_URL}/v1/users/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          }).then(async (ref) => {
            if (!ref.ok) throw new Error("Refresh failed");
            const data = await ref.json();
            localStorage.setItem("accessToken", data.accessToken);
            localStorage.setItem("refreshToken", data.refreshToken);
          }).finally(() => {
            refreshPromise = null;
          });
        }

        await refreshPromise;
        return request(method, path, body, false);
      } catch {
        localStorage.clear();
        window.location.reload();
        return;
      }
    }

    if (res.status === 204) return null;
    const text = await res.text();
    if (!text) return null;
    const data = JSON.parse(text);
    if (!res.ok) throw new Error(data.message || "Error");
    return data;
  }, []);

  return { request };
}

// ─── Icon ─────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, stroke = "currentColor", fill = "none", sw = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ display:"block", flexShrink:0 }}>
    <path d={d} />
  </svg>
);
const I = {
  check:    "M20 6L9 17l-5-5",
  plus:     "M12 5v14M5 12h14",
  trash:    "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  edit:     "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  logout:   "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9",
  cal:      "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  clock:    "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  search:   "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  x:        "M18 6L6 18M6 6l12 12",
  ring:     "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
  checkC:   "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  menu:     "M3 12h18M3 6h18M3 18h18",
  chevL:    "M15 18l-6-6 6-6",
  chevR:    "M9 18l6-6-6-6",
  chevU:    "M18 15l-6-6-6 6",
  chevD:    "M6 9l6 6 6-6",
  bold:     "M6 4h8a4 4 0 010 8H6zM6 12h9a4 4 0 010 8H6z",
  italic:   "M19 4h-9M14 20H5M15 4L9 20",
  listUl:   "M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01",
  listOl:   "M10 6h11M10 12h11M10 18h11M4 6h.01M4 12h.01M4 18h.01",
  undo:     "M3 7v6h6M3 13C5 8 9 5 14 5a9 9 0 010 18c-4 0-7.4-2-9-5",
  redo:     "M21 7v6h-6M21 13c-2-5-6-8-11-8a9 9 0 000 18c4 0 7.4-2 9-5",
};

// ─── Rich Text Editor ─────────────────────────────────────────────────────────
function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && !editor.isFocused && value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  const ToolBtn = ({ action, active, title, children }) => (
    <button type="button" onClick={action} title={title}
      style={{
        background: active ? "rgba(139,110,232,0.15)" : "none",
        border: "none", borderRadius: 5, padding: "4px 7px",
        cursor: "pointer", color: active ? "var(--accent)" : "var(--muted)",
        display: "flex", alignItems: "center", transition: "all 0.12s",
      }}>
      {children}
    </button>
  );

  const Sep = () => <div style={{ width:1, height:16, background:"var(--border)", margin:"0 4px" }}/>;

  return (
    <div style={{ border:"1px solid var(--border)", borderRadius:"var(--r)", overflow:"hidden", background:"var(--surface)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:1, padding:"5px 8px", borderBottom:"1px solid var(--border)", background:"var(--card)" }}>
        <ToolBtn action={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
          <Icon d={I.bold} size={13}/>
        </ToolBtn>
        <ToolBtn action={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
          <Icon d={I.italic} size={13}/>
        </ToolBtn>
        <Sep/>
        <ToolBtn action={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">
          <Icon d={I.listUl} size={13}/>
        </ToolBtn>
        <ToolBtn action={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list">
          <Icon d={I.listOl} size={13}/>
        </ToolBtn>
        <Sep/>
        <ToolBtn action={() => editor.chain().focus().undo().run()} title="Undo">
          <Icon d={I.undo} size={13}/>
        </ToolBtn>
        <ToolBtn action={() => editor.chain().focus().redo().run()} title="Redo">
          <Icon d={I.redo} size={13}/>
        </ToolBtn>
      </div>
      <EditorContent editor={editor}
        style={{ padding:"10px 14px", minHeight:80, color:"var(--text)", fontSize:13, lineHeight:1.6 }}/>
    </div>
  );
}

// ─── Calendar + Time Picker (compact popover) ─────────────────────────────────
function DateTimePicker({ value, onChange }) {
  const today = new Date();
  const toObj = (d) => d ? { y: d.getFullYear(), m: d.getMonth(), day: d.getDate(), h: d.getHours(), min: d.getMinutes() } : null;
  const fromStr = (s) => s ? toObj(new Date(s)) : null;

  const init = fromStr(value);
  const [open, setOpen]       = useState(false);
  const [step, setStep]       = useState("cal");
  const [cursor, setCursor]   = useState({ y: init?.y ?? today.getFullYear(), m: init?.m ?? today.getMonth() });
  const [sel, setSel]         = useState(init ? { y: init.y, m: init.m, day: init.day } : null);
  const [hour, setHour]       = useState(init?.h  ?? 9);
  const [minute, setMinute]   = useState(init?.min ?? 0);
  const wrapRef = useRef(null);

  // Sync state when value prop changes externally
  useEffect(() => {
    const parsed = fromStr(value);
    if (!value) {
      setSel(null);
      setStep("cal");
    } else if (parsed) {
      setSel({ y: parsed.y, m: parsed.m, day: parsed.day });
      setHour(parsed.h);
      setMinute(parsed.min);
      setCursor({ y: parsed.y, m: parsed.m });
    }
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const pad = n => String(n).padStart(2,"0");

  const emit = (s, h, min) => {
    if (!s) { onChange(""); return; }
    onChange(`${s.y}-${pad(s.m+1)}-${pad(s.day)}T${pad(h)}:${pad(min)}`);
  };

  const daysInMonth = (y,m) => new Date(y, m+1, 0).getDate();
  const firstWeekDay = (y,m) => new Date(y, m, 1).getDay();
  const prevMonth = () => setCursor(c => c.m === 0 ? {y:c.y-1, m:11} : {...c, m:c.m-1});
  const nextMonth = () => setCursor(c => c.m === 11 ? {y:c.y+1, m:0}  : {...c, m:c.m+1});

  const pickDay = (day) => {
    const s = { y: cursor.y, m: cursor.m, day };
    setSel(s); emit(s, hour, minute); setStep("time");
  };
  const changeH = (delta) => { const h = (hour + delta + 24) % 24; setHour(h); if (sel) emit(sel, h, minute); };
  const changeM = (delta) => { const min = (minute + delta + 60) % 60; setMinute(min); if (sel) emit(sel, hour, min); };
  const clear = (e) => { e.stopPropagation(); setSel(null); setStep("cal"); onChange(""); setOpen(false); };

  const totalDays = daysInMonth(cursor.y, cursor.m);
  const startCol  = firstWeekDay(cursor.y, cursor.m);
  const cells     = Array.from({ length: Math.ceil((startCol + totalDays) / 7) * 7 }, (_, i) => {
    const d = i - startCol + 1;
    return d >= 1 && d <= totalDays ? d : null;
  });

  const isSelected = d => sel && sel.y === cursor.y && sel.m === cursor.m && sel.day === d;
  const isToday    = d => d === today.getDate() && cursor.m === today.getMonth() && cursor.y === today.getFullYear();
  const displayLabel = sel ? `${pad(sel.day)} ${MONTH_SHORT[sel.m]} ${sel.y}  ·  ${pad(hour)}:${pad(minute)}` : "";

  return (
    <div ref={wrapRef} style={{ position:"relative" }}>
      {/* Trigger input */}
      <div onClick={() => setOpen(o => !o)}
        style={{
          display:"flex", alignItems:"center", gap:8,
          padding:"8px 12px", border:"1px solid var(--border)", borderRadius:"var(--r)",
          background:"var(--surface)", cursor:"pointer",
          transition:"border-color 0.18s",
          borderColor: open ? "var(--accent)" : "var(--border)",
        }}>
        <Icon d={I.cal} size={13} stroke="var(--muted)"/>
        {sel ? (
          <span style={{ flex:1, fontFamily:"var(--mono)", fontSize:12, color:"var(--text)" }}>{displayLabel}</span>
        ) : (
          <span style={{ flex:1, fontFamily:"var(--mono)", fontSize:12, color:"var(--muted2)" }}>Pick a date & time…</span>
        )}
        {sel && (
          <button onClick={clear}
            style={{ background:"none", border:"none", cursor:"pointer", color:"var(--muted2)", display:"flex", padding:1, borderRadius:4 }}>
            <Icon d={I.x} size={11}/>
          </button>
        )}
      </div>

      {/* Popover */}
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:400,
          background:"var(--card)", border:"1px solid var(--border)", borderRadius:12,
          boxShadow:"0 8px 32px rgba(80,40,160,0.14)", overflow:"hidden",
          width:260, animation:"su 0.14s ease",
        }}>
          {/* Tab bar */}
          <div style={{ display:"flex", borderBottom:"1px solid var(--border)", background:"var(--surface)" }}>
            {[["cal", I.cal, "Date"], ["time", I.clock, "Time"]].map(([s, icon, label]) => (
              <button key={s} onClick={() => s === "time" && !sel ? null : setStep(s)}
                style={{
                  flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:5,
                  padding:"8px 0", border:"none", background:"none", cursor: s==="time"&&!sel ? "default" : "pointer",
                  borderBottom:`2px solid ${step===s?"var(--accent)":"transparent"}`,
                  color: step===s ? "var(--accent)" : s==="time"&&!sel ? "var(--muted2)" : "var(--muted)",
                  fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.05em", textTransform:"uppercase",
                  opacity: s==="time"&&!sel ? 0.45 : 1, transition:"all 0.15s",
                }}>
                <Icon d={icon} size={11}/> {label}
              </button>
            ))}
          </div>

          {step==="cal" && (
            <div style={{ padding:"12px 14px 14px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <button onClick={prevMonth} style={arrowBtn}><Icon d={I.chevL} size={12}/></button>
                <span style={{ fontFamily:"var(--serif)", fontSize:15, fontWeight:600, color:"var(--text)" }}>
                  {MONTH_SHORT[cursor.m]} {cursor.y}
                </span>
                <button onClick={nextMonth} style={arrowBtn}><Icon d={I.chevR} size={12}/></button>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", marginBottom:3 }}>
                {DAY_NAMES.map(d => <div key={d} style={{ textAlign:"center", fontSize:9, color:"var(--muted2)", padding:"2px 0", letterSpacing:"0.05em" }}>{d}</div>)}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:1 }}>
                {cells.map((d, i) => {
                  const active = isSelected(d);
                  const todayCell = isToday(d);
                  return (
                    <button key={i} onClick={() => d && pickDay(d)} disabled={!d}
                      style={{
                        padding:"5px 0", border:"none", borderRadius:6, cursor:d?"pointer":"default",
                        background: active ? "var(--accent)" : "transparent",
                        color: active ? "#fff" : todayCell ? "var(--accent)" : d ? "var(--text)" : "transparent",
                        fontFamily:"var(--mono)", fontSize:11, fontWeight: active ? 500 : 300,
                        outline: todayCell&&!active ? "1.5px solid var(--accent)" : "none",
                        outlineOffset:"-1px", transition:"background 0.1s",
                      }}
                      onMouseEnter={e => { if(d&&!active) e.currentTarget.style.background="var(--hover)"; }}
                      onMouseLeave={e => { if(d&&!active) e.currentTarget.style.background="transparent"; }}>
                      {d || ""}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step==="time" && (
            <div style={{ padding:"14px", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Spinner label="Hr" value={pad(hour)} onUp={() => changeH(1)} onDown={() => changeH(-1)} />
                <span style={{ fontSize:22, color:"var(--muted2)", fontFamily:"var(--mono)", marginBottom:14 }}>:</span>
                <Spinner label="Min" value={pad(minute)} onUp={() => changeM(5)} onDown={() => changeM(-5)} />
              </div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap", justifyContent:"center" }}>
                {[0,6,8,9,12,14,18,20,22].map(h => (
                  <button key={h} onClick={() => { setHour(h); setMinute(0); if(sel) emit(sel,h,0); }}
                    style={{ padding:"2px 7px", border:"1px solid var(--border)", borderRadius:5,
                      background: hour===h&&minute===0 ? "var(--accent)" : "transparent",
                      color: hour===h&&minute===0 ? "#fff" : "var(--muted)",
                      fontFamily:"var(--mono)", fontSize:9, cursor:"pointer", transition:"all 0.12s" }}>
                    {pad(h)}h
                  </button>
                ))}
              </div>
              <button onClick={() => setOpen(false)}
                style={{ width:"100%", padding:"7px 0", border:"none", borderRadius:7, background:"var(--accent)", color:"#fff",
                  fontFamily:"var(--mono)", fontSize:10, letterSpacing:"0.07em", textTransform:"uppercase", cursor:"pointer" }}>
                Done
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Spinner({ label, value, onUp, onDown }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <button onClick={onUp} style={spinBtn}><Icon d={I.chevU} size={13}/></button>
      <div style={{ width:52, textAlign:"center", fontFamily:"var(--mono)", fontSize:26, fontWeight:400,
        color:"var(--text)", background:"var(--surface)", border:"1px solid var(--border)",
        borderRadius:8, padding:"4px 0", lineHeight:1 }}>{value}</div>
      <button onClick={onDown} style={spinBtn}><Icon d={I.chevD} size={13}/></button>
      <span style={{ fontSize:8, color:"var(--muted2)", textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
    </div>
  );
}

const arrowBtn   = { background:"none", border:"1px solid var(--border)", borderRadius:6, padding:"3px 7px", cursor:"pointer", color:"var(--muted)", display:"flex", transition:"border-color 0.15s" };
const spinBtn    = { background:"none", border:"1px solid var(--border)", borderRadius:6, padding:"4px 11px", cursor:"pointer", color:"var(--muted)", display:"flex", transition:"background 0.12s" };

// ─── Global styles ────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Mono:wght@300;400;500&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --serif:  'Cormorant Garamond', Georgia, serif;
  --mono:   'DM Mono', 'Courier New', monospace;
  --bg:     #EDE8F8;
  --surface:#F7F4FF;
  --card:   #FFFFFF;
  --border: #DDD6F0;
  --hover:  #F0ECFB;
  --text:   #1E1830;
  --muted:  #7B6FA0;
  --muted2: #B0A5CC;
  --accent: #8B6EE8;
  --accent2:#6A4DC7;
  --red:    #E05599;
  --green:  #2DBF8A;
  --r:      12px;
  --sb:     230px;
}

html { height: 100%; }

body {
  min-height: 100%;
  background: linear-gradient(135deg, #EAE3FC 0%, #DDD4FA 45%, #F2E6F5 100%);
  background-attachment: fixed;
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 300;
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

#root {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.app {
  display: flex;
  width: 100%;
  max-width: 1060px;
  height: 100%;
  max-height: 760px;
  background: var(--surface);
  border: 1px solid rgba(200,185,240,0.7);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 16px 56px rgba(80,40,160,0.14), 0 2px 8px rgba(80,40,160,0.06);
}

/* ── Auth ── */
.auth-wrap { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; padding:24px; }
.auth-box { width:100%; max-width:390px; background:var(--card); border:1px solid var(--border); border-radius:20px; padding:38px 34px; box-shadow:0 10px 44px rgba(100,60,180,0.11); }
.logo { font-family:var(--serif); font-size:32px; font-weight:600; color:var(--accent); letter-spacing:-0.4px; margin-bottom:4px; }
.sub  { color:var(--muted); font-size:12px; margin-bottom:30px; }
.tabs { display:flex; border-bottom:1px solid var(--border); margin-bottom:26px; }
.tab  { flex:1; padding:9px; text-align:center; cursor:pointer; color:var(--muted); font-size:11px; letter-spacing:0.09em; text-transform:uppercase; border-bottom:2px solid transparent; margin-bottom:-1px; transition:all 0.18s; }
.tab.on { color:var(--accent); border-bottom-color:var(--accent); }

/* ── Form ── */
.field { margin-bottom: 14px; }
.label { display:block; font-size:10px; color:var(--muted); letter-spacing:0.09em; text-transform:uppercase; margin-bottom:5px; }
input[data-f], select[data-f] {
  width:100%; padding:9px 13px;
  background:var(--surface); border:1px solid var(--border); border-radius:var(--r);
  color:var(--text); font-family:var(--mono); font-size:13px;
  outline:none; transition:border-color 0.18s;
}
input[data-f]:focus, select[data-f]:focus { border-color:var(--accent); }
select[data-f] { cursor:pointer; appearance:none; }

/* ── Tiptap editor styles ── */
.ProseMirror {
  outline: none;
  font-family: var(--mono);
  font-size: 13px;
  font-weight: 300;
  color: var(--text);
  line-height: 1.6;
}
.ProseMirror p { margin: 0 0 6px; }
.ProseMirror p:last-child { margin-bottom: 0; }
.ProseMirror ul, .ProseMirror ol { padding-left: 20px; margin: 4px 0; }
.ProseMirror li { margin-bottom: 2px; }
.ProseMirror strong { font-weight: 500; color: var(--text); }
.ProseMirror em { font-style: italic; }
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--muted2);
  pointer-events: none;
  float: left;
  height: 0;
}

/* ── Buttons ── */
.btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; padding:9px 16px; border-radius:var(--r); cursor:pointer; font-family:var(--mono); font-size:11px; font-weight:400; letter-spacing:0.07em; text-transform:uppercase; border:none; transition:all 0.18s; white-space:nowrap; }
.btn-p { background:var(--accent); color:#fff; }
.btn-p:hover { background:var(--accent2); }
.btn-g { background:transparent; color:var(--muted); border:1px solid var(--border); }
.btn-g:hover { border-color:var(--muted); color:var(--text); }
.btn-w { width:100%; }
.btn:disabled { opacity:0.4; cursor:not-allowed; }
.ib { background:none; border:none; cursor:pointer; color:var(--muted); padding:3px; border-radius:5px; display:flex; align-items:center; transition:color 0.15s; }
.ib:hover { color:var(--text); }
.ib.del:hover { color:var(--red); }

/* ── Sidebar ── */
.sb { width:var(--sb); flex-shrink:0; background:var(--card); border-right:1px solid var(--border); display:flex; flex-direction:column; padding:22px 0; transition:transform 0.24s ease; }
.sb-logo { font-family:var(--serif); font-size:22px; font-weight:600; color:var(--accent); padding:0 18px 18px; border-bottom:1px solid var(--border); }
.sb-sec { padding:16px 14px 0; }
.sb-lbl { font-size:9px; letter-spacing:0.13em; text-transform:uppercase; color:var(--muted2); margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; }
.sb-item { display:flex; align-items:center; justify-content:space-between; padding:7px 9px; border-radius:8px; cursor:pointer; color:var(--muted); font-size:12px; margin-bottom:2px; transition:all 0.14s; }
.sb-item:hover { background:var(--hover); color:var(--text); }
.sb-item.on { background:rgba(139,110,232,0.11); color:var(--accent); }
.sb-l { display:flex; align-items:center; gap:7px; }
.dot  { width:6px; height:6px; border-radius:50%; background:var(--accent); opacity:0.55; flex-shrink:0; }
.sb-acts { display:flex; gap:2px; opacity:0; transition:opacity 0.14s; }
.sb-item:hover .sb-acts { opacity:1; }
.sb-foot { margin-top:auto; padding:14px; border-top:1px solid var(--border); }

/* ── Main ── */
.main { flex:1; display:flex; flex-direction:column; overflow:hidden; min-width:0; }
.bar { padding:13px 20px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:9px; background:var(--surface); }
.sw { flex:1; position:relative; min-width:120px; max-width:260px; }
.si { position:absolute; left:9px; top:50%; transform:translateY(-50%); color:var(--muted); pointer-events:none; }
.sinput { width:100%; padding:7px 9px 7px 29px; background:var(--card); border:1px solid var(--border); border-radius:var(--r); color:var(--text); font-family:var(--mono); font-size:12px; outline:none; transition:border-color 0.18s; }
.sinput:focus { border-color:var(--accent); }
.ftabs { display:flex; gap:3px; }
.ft { padding:5px 11px; border-radius:7px; cursor:pointer; font-size:10px; letter-spacing:0.07em; text-transform:uppercase; color:var(--muted); transition:all 0.14s; border:1px solid transparent; }
.ft:hover { color:var(--text); }
.ft.on { background:rgba(139,110,232,0.1); color:var(--accent); border-color:rgba(139,110,232,0.2); }
.bar-r { margin-left:auto; }
.ham { display:none; }

.content { flex:1; overflow-y:auto; padding:20px; }
.content::-webkit-scrollbar { width:4px; }
.content::-webkit-scrollbar-thumb { background:var(--border); border-radius:2px; }
.ptitle { font-family:var(--serif); font-size:25px; font-weight:600; color:var(--text); margin-bottom:3px; letter-spacing:-0.2px; }
.pcount { color:var(--muted); font-size:11px; margin-bottom:16px; }

/* ── Task card ── */
.tlist { display:flex; flex-direction:column; gap:7px; }
.tcard { background:var(--card); border:1px solid var(--border); border-radius:var(--r); padding:12px 14px; display:flex; align-items:flex-start; gap:11px; transition:border-color 0.18s; animation:fu 0.2s ease; }
@keyframes fu { from { opacity:0; transform:translateY(4px) } to { opacity:1; transform:translateY(0) } }
.tcard:hover { border-color:#c4b8e8; }
.tcard.done { opacity:0.48; }
.ck { width:17px; height:17px; border-radius:50%; flex-shrink:0; margin-top:2px; border:1.5px solid var(--muted2); cursor:pointer; background:none; display:flex; align-items:center; justify-content:center; transition:all 0.18s; color:transparent; }
.ck:hover { border-color:var(--accent); color:var(--accent); }
.ck.done { border-color:var(--green); background:rgba(45,191,138,0.12); color:var(--green); }
.tbody { flex:1; min-width:0; }
.ttitle { font-size:13px; color:var(--text); margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ttitle.done { text-decoration:line-through; color:var(--muted); }

/* rich text preview in card */
.tdesc { font-size:11.5px; color:var(--muted); margin-bottom:7px; line-height:1.5;
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
.tdesc p { margin:0; }
.tdesc ul, .tdesc ol { padding-left:16px; margin:0; }

.tmeta { display:flex; align-items:center; gap:5px; flex-wrap:wrap; }
.badge { display:inline-flex; align-items:center; gap:3px; padding:2px 7px; border-radius:4px; font-size:9px; letter-spacing:0.05em; text-transform:uppercase; border:1px solid transparent; }
.due { color:var(--muted); background:var(--surface); border-color:var(--border); }
.due.overdue { color:var(--red); border-color:rgba(224,85,153,0.28); background:rgba(224,85,153,0.06); }
.tacts { display:flex; gap:3px; opacity:0; transition:opacity 0.14s; flex-shrink:0; }
.tcard:hover .tacts { opacity:1; }

/* ── Empty ── */
.empty { text-align:center; padding:48px 20px; color:var(--muted); }
.empty svg { opacity:0.15; margin-bottom:14px; }
.empty h3 { font-family:var(--serif); font-size:20px; font-weight:400; margin-bottom:5px; color:var(--text); }
.empty p { font-size:12px; }

/* ── Modal ── */
.ov { position:fixed; inset:0; background:rgba(24,16,44,0.48); backdrop-filter:blur(7px); display:flex; align-items:center; justify-content:center; z-index:300; padding:20px; animation:fi 0.14s ease; }
@keyframes fi { from { opacity:0 } to { opacity:1 } }
.modal { background:var(--card); border:1px solid var(--border); border-radius:16px; width:100%; max-width:490px; max-height:92vh; overflow-y:auto; animation:su 0.18s ease; box-shadow:0 20px 64px rgba(80,40,160,0.16); }
@keyframes su { from { transform:translateY(14px); opacity:0 } to { transform:translateY(0); opacity:1 } }
.mh { padding:18px 22px 0; display:flex; align-items:center; justify-content:space-between; }
.mt { font-family:var(--serif); font-size:21px; font-weight:600; letter-spacing:-0.2px; }
.mb { padding:16px 22px; display:flex; flex-direction:column; gap:13px; }
.mf { padding:0 22px 18px; display:flex; gap:7px; justify-content:flex-end; }

/* ── Priority grid ── */
.pgrid { display:grid; grid-template-columns:repeat(4,1fr); gap:5px; }
.popt { padding:7px 4px; border-radius:8px; cursor:pointer; text-align:center; font-size:9px; letter-spacing:0.05em; text-transform:uppercase; border:1px solid var(--border); transition:all 0.14s; color:var(--muted); }
.popt:hover { border-color:var(--muted); color:var(--text); }

.err { color:var(--red); font-size:11px; text-align:center; }
.sb-ov { display:none; position:fixed; inset:0; background:rgba(24,16,44,0.38); z-index:200; backdrop-filter:blur(2px); }

/* ── Mobile ── */
@media (max-width: 660px) {
  #root { padding:0; }
  .app { border-radius:0; max-height:100%; border:none; }
  .sb { position:fixed; top:0; left:0; height:100%; z-index:220; transform:translateX(-100%); box-shadow:5px 0 28px rgba(80,40,160,0.12); }
  .sb.open { transform:translateX(0); }
  .sb-ov.open { display:block; }
  .ham { display:flex; }
  .ftabs { display:none; }
  .sw { max-width:100%; }
  .pgrid { grid-template-columns:repeat(2,1fr); }
}
@media (min-width: 661px) and (max-width: 840px) {
  :root { --sb: 190px; }
}
`;

// ─── Auth ─────────────────────────────────────────────────────────────────────
function Auth({ onLogin, onForgot }) {
  const [tab, setTab] = useState("in");
  const [f, setF] = useState({ name:"", email:"", pass:"", passConfirm:"" });
  const [err, setErr] = useState("");
  const [registered, setRegistered] = useState(false);
  const [notVerified, setNotVerified] = useState(false);
  const [resendDone, setResendDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const { request } = useApi();
  const upd = k => e => setF(p=>({...p,[k]:e.target.value}));

  const go = async () => {
    setErr(""); setNotVerified(false); setResendDone(false);
    if (tab==="up" && f.pass !== f.passConfirm) {
      return setErr("Passwords do not match");
    }
    setBusy(true);
    try {
      if (tab==="up") {
        await request("POST","/v1/users/register",{
          name: f.name, email: f.email,
          password: f.pass, passwordConfirmation: f.passConfirm,
        });
        setRegistered(true);
        setTab("in");
        return;
      }
      const d = await request("POST","/v1/users/login",{email:f.email,password:f.pass});
      localStorage.setItem("accessToken", d.accessToken);
      localStorage.setItem("refreshToken", d.refreshToken);
      localStorage.setItem("nome", d.nome);
      onLogin();
    } catch(e) {
      if (e.message?.toLowerCase().includes("verify")) {
        setNotVerified(true);
      } else {
        setErr(e.message);
      }
    }
    finally { setBusy(false); }
  };

  const resend = async () => {
    setBusy(true);
    try {
      await request("POST", "/v1/users/resend-confirmation", { email: f.email });
      setResendDone(true);
      setNotVerified(false);
    } catch(e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="logo">taskflow.</div>
        <div className="sub">your minimal productivity companion</div>
        <div className="tabs">
          <div className={`tab ${tab==="in"?"on":""}`} onClick={()=>setTab("in")}>Sign In</div>
          <div className={`tab ${tab==="up"?"on":""}`} onClick={()=>setTab("up")}>Register</div>
        </div>
        {tab==="up" && <div className="field"><label className="label">Name</label><input data-f value={f.name} onChange={upd("name")} placeholder="your name"/></div>}
        <div className="field"><label className="label">Email</label><input data-f type="email" value={f.email} onChange={upd("email")} placeholder="you@example.com"/></div>
        <div className="field"><label className="label">Password</label><input data-f type="password" value={f.pass} onChange={upd("pass")} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/></div>
        {tab==="up" && (
          <div className="field">
            <label className="label">Confirm Password</label>
            <input data-f type="password" value={f.passConfirm} onChange={upd("passConfirm")} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/>
          </div>
        )}
        {registered && (
          <div style={{background:"rgba(45,191,138,0.08)", border:"1px solid rgba(45,191,138,0.3)", borderRadius:10, padding:"12px 14px", marginBottom:12}}>
            <p style={{color:"var(--green)", fontSize:12}}>✓ Account created! Check your email to confirm your account before signing in.</p>
          </div>
        )}
        {err && <div className="err" style={{marginBottom:12}}>{err}</div>}

        {notVerified && (
          <div style={{background:"rgba(139,110,232,0.08)", border:"1px solid rgba(139,110,232,0.25)", borderRadius:10, padding:"12px 14px", marginBottom:12}}>
            <p style={{color:"var(--text)", fontSize:12, marginBottom:8}}>
              Please verify your email before signing in.
            </p>
            <button className="btn btn-g btn-w" onClick={resend} disabled={busy} style={{fontSize:11}}>
              {busy ? "…" : "Resend confirmation email"}
            </button>
          </div>
        )}

        {resendDone && (
          <div style={{background:"rgba(45,191,138,0.08)", border:"1px solid rgba(45,191,138,0.3)", borderRadius:10, padding:"12px 14px", marginBottom:12}}>
            <p style={{color:"var(--green)", fontSize:12}}>✓ Confirmation email sent. Check your inbox.</p>
          </div>
        )}

        <button className="btn btn-p btn-w" onClick={go} disabled={busy}>{busy?"…":tab==="in"?"Sign In":"Create Account"}</button>
        {tab==="in" && (
          <div style={{textAlign:"center", marginTop:14}}>
            <button onClick={onForgot}
              style={{background:"none", border:"none", cursor:"pointer", color:"var(--muted)", fontSize:11, fontFamily:"var(--mono)", letterSpacing:"0.05em"}}>
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Account Confirmation ─────────────────────────────────────────────────────
function AccountConfirmation({ token, onBack }) {
  const [status, setStatus] = useState("loading"); 
  const { request } = useApi();

  useEffect(() => {
    const confirm = async () => {
      try {
        await request("GET", `/v1/users/account-confirmation?token=${token}`);
        setStatus("success");
      } catch {
        setStatus("error");
      }
    };
    confirm();
  }, [token, request]);

  return (
    <div className="auth-wrap">
      <div className="auth-box" style={{textAlign:"center"}}>
        <div className="logo">taskflow.</div>
        {status === "loading" && (
          <p style={{color:"var(--muted)", fontSize:13, marginTop:20}}>Confirming your account…</p>
        )}
        {status === "success" && (
          <>
            <div style={{fontSize:36, margin:"20px 0 12px"}}>✅</div>
            <p style={{color:"var(--text)", fontSize:13, marginBottom:8}}>Email confirmed!</p>
            <p style={{color:"var(--muted)", fontSize:12, marginBottom:24}}>Your account is ready. You can now sign in.</p>
            <button className="btn btn-p btn-w" onClick={onBack}>Sign In</button>
          </>
        )}
        {status === "error" && (
          <>
            <div style={{fontSize:36, margin:"20px 0 12px"}}>❌</div>
            <p style={{color:"var(--text)", fontSize:13, marginBottom:8}}>Link invalid or expired</p>
            <p style={{color:"var(--muted)", fontSize:12, marginBottom:24}}>Request a new confirmation email from the sign in page.</p>
            <button className="btn btn-g btn-w" onClick={onBack}>Back to Sign In</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Forgot Password ─────────────────────────────────────────────────────────
function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const { request } = useApi();

  const go = async () => {
    if (!email.trim()) return setErr("Email is required");
    setErr(""); setBusy(true);
    try {
      await request("POST", "/v1/users/forgot-password", { email });
      setDone(true);
    } catch(e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="logo">taskflow.</div>
        <div className="sub" style={{marginBottom:24}}>Reset your password</div>

        {done ? (
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:32, marginBottom:12}}>📬</div>
            <p style={{color:"var(--text)", fontSize:13, marginBottom:8}}>Check your inbox</p>
            <p style={{color:"var(--muted)", fontSize:12, marginBottom:24}}>
              If an account with that email exists, a reset link has been sent.
            </p>
            <button className="btn btn-g btn-w" onClick={onBack}>Back to Sign In</button>
          </div>
        ) : (
          <>
            <p style={{color:"var(--muted)", fontSize:12, marginBottom:20}}>
              Enter your email and we'll send you a link to reset your password.
            </p>
            <div className="field">
              <label className="label">Email</label>
              <input data-f type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="you@example.com" autoFocus onKeyDown={e=>e.key==="Enter"&&go()}/>
            </div>
            {err && <div className="err" style={{marginBottom:12}}>{err}</div>}
            <button className="btn btn-p btn-w" onClick={go} disabled={busy}>{busy?"…":"Send Reset Link"}</button>
            <div style={{textAlign:"center", marginTop:14}}>
              <button onClick={onBack}
                style={{background:"none", border:"none", cursor:"pointer", color:"var(--muted)", fontSize:11, fontFamily:"var(--mono)", letterSpacing:"0.05em"}}>
                Back to Sign In
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Reset Password ───────────────────────────────────────────────────────────
function ResetPassword({ token, onBack }) {
  const [f, setF] = useState({ pass:"", passConfirm:"" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const { request } = useApi();
  const upd = k => e => setF(p=>({...p,[k]:e.target.value}));

  const go = async () => {
    if (!f.pass) return setErr("Password is required");
    if (f.pass !== f.passConfirm) return setErr("Passwords do not match");
    setErr(""); setBusy(true);
    try {
      await request("POST", "/v1/users/reset-password", {
        token, password: f.pass, passwordConfirmation: f.passConfirm,
      });
      setDone(true);
    } catch(e) { setErr(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="logo">taskflow.</div>
        <div className="sub" style={{marginBottom:24}}>Choose a new password</div>

        {done ? (
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:32, marginBottom:12}}>✅</div>
            <p style={{color:"var(--text)", fontSize:13, marginBottom:8}}>Password updated!</p>
            <p style={{color:"var(--muted)", fontSize:12, marginBottom:24}}>
              Your password has been changed successfully.
            </p>
            <button className="btn btn-p btn-w" onClick={onBack}>Sign In</button>
          </div>
        ) : (
          <>
            <div className="field">
              <label className="label">New Password</label>
              <input data-f type="password" value={f.pass} onChange={upd("pass")}
                placeholder="••••••••" autoFocus/>
            </div>
            <div className="field">
              <label className="label">Confirm New Password</label>
              <input data-f type="password" value={f.passConfirm} onChange={upd("passConfirm")}
                placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&go()}/>
            </div>
            {err && <div className="err" style={{marginBottom:12}}>{err}</div>}
            <button className="btn btn-p btn-w" onClick={go} disabled={busy}>{busy?"…":"Reset Password"}</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Category Modal ───────────────────────────────────────────────────────────
function CatModal({ cat, onClose, onSave }) {
  const [title, setTitle] = useState(cat?.title||"");
  const [err, setErr] = useState("");
  const { request } = useApi();
  const save = async () => {
    if (!title.trim()) return setErr("Title is required");
    try {
      cat ? await request("PATCH",`/v1/categories/${cat.id}`,{title})
           : await request("POST","/v1/categories",{title});
      onSave();
    } catch(e) { setErr(e.message); }
  };
  return (
    <div className="ov" onClick={onClose}>
      <div className="modal" style={{maxWidth:330}} onClick={e=>e.stopPropagation()}>
        <div className="mh">
          <div className="mt">{cat?"Edit Category":"New Category"}</div>
          <button className="ib" onClick={onClose}><Icon d={I.x}/></button>
        </div>
        <div className="mb">
          <div className="field" style={{marginBottom:0}}>
            <label className="label">Title</label>
            <input data-f value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Work, Personal…" autoFocus onKeyDown={e=>e.key==="Enter"&&save()}/>
          </div>
          {err && <div className="err">{err}</div>}
        </div>
        <div className="mf">
          <button className="btn btn-g" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Modal ───────────────────────────────────────────────────────────────
function TaskModal({ task, cats, onClose, onSave }) {
  const ed = !!task;
  const [f, setF] = useState({
    title: task?.title||"",
    desc: task?.description||"",
    due: task?.dueDate ? task.dueDate.slice(0,16) : "",
    prio: task?.priority||"",
    catId: task?.categoryId||"",
  });
  const [err, setErr] = useState("");
  const { request } = useApi();
  const upd = k => e => setF(p=>({...p,[k]:e.target.value}));
  const toggleP = p => setF(prev=>({...prev, prio: prev.prio===p?"":p}));

  const isEmptyHtml = (html) => !html || html.trim() === "" || html.trim() === "<p></p>";

  const save = async () => {
    if (!f.title.trim()) return setErr("Title is required");
    try {
      const body = {
        title: f.title.trim(),
        description: isEmptyHtml(f.desc) ? null : f.desc,
        dueDate: f.due ? f.due+":00" : null,
        priority: f.prio||null,
        categoryId: f.catId?Number(f.catId):null,
      };
      ed ? await request("PATCH",`/v1/tasks/${task.id}`,body)
         : await request("POST","/v1/tasks",body);
      onSave();
    } catch(e) { setErr(e.message || "Failed to save task"); }
  };

  return (
    <div className="ov" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mh">
          <div className="mt">{ed?"Edit Task":"New Task"}</div>
          <button className="ib" onClick={onClose}><Icon d={I.x}/></button>
        </div>
        <div className="mb">
          <div className="field" style={{marginBottom:0}}>
            <label className="label">Title <span style={{color:"var(--red)"}}>*</span></label>
            <input data-f value={f.title} onChange={upd("title")} placeholder="What needs to be done…" autoFocus/>
          </div>

          <div>
            <label className="label" style={{display:"block", marginBottom:6}}>
              Description <span style={{color:"var(--muted2)",fontSize:9}}>(optional)</span>
            </label>
            <RichTextEditor value={f.desc} onChange={v=>setF(p=>({...p,desc:v}))}/>
          </div>

          <div>
            <label className="label">Priority</label>
            <div className="pgrid">
              {PRIORITIES.map(p=>{
                const m = PRIORITY_META[p];
                return (
                  <div key={p} className="popt"
                    style={f.prio===p?{background:m.bg,color:m.color,borderColor:m.color}:{}}
                    onClick={()=>toggleP(p)}>{m.label}</div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="label" style={{marginBottom:8}}>
              Due Date <span style={{color:"var(--muted2)",fontSize:9}}>(optional)</span>
            </label>
            <DateTimePicker value={f.due} onChange={v=>setF(p=>({...p,due:v}))}/>
          </div>

          <div className="field" style={{marginBottom:0}}>
            <label className="label">Category</label>
            <select data-f value={f.catId} onChange={upd("catId")}>
              <option value="">None</option>
              {cats.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          {err && <div className="err">{err}</div>}
        </div>
        <div className="mf">
          <button className="btn btn-g" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={save}>{ed?"Save Changes":"Create Task"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TCard({ task, onDone, onDel, onEdit }) {
  const pm = task.priority ? PRIORITY_META[task.priority] : null;
  const over = task.dueDate && !task.done && new Date(task.dueDate) < new Date();
  const fmtDate = d => {
    const dt = new Date(d);
    const pad = n => String(n).padStart(2,"0");
    return `${pad(dt.getDate())} ${MONTH_SHORT[dt.getMonth()]} ${dt.getFullYear()}  ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  const safeDesc = task.description ? DOMPurify.sanitize(task.description) : null;

  return (
    <div className={`tcard ${task.done?"done":""}`}>
      <button className={`ck ${task.done?"done":""}`} onClick={()=>!task.done&&onDone(task.id)}>
        {task.done && <Icon d={I.check} size={9}/>}
      </button>
      <div className="tbody">
        <div className={`ttitle ${task.done?"done":""}`}>{task.title}</div>
        {safeDesc && safeDesc.trim() !== "" && safeDesc.trim() !== "<p></p>" && (
          <div className="tdesc" dangerouslySetInnerHTML={{ __html: safeDesc }}/>
        )}
        <div className="tmeta">
          {pm && <span className="badge" style={{background:pm.bg,color:pm.color,borderColor:pm.bg}}>{pm.label}</span>}
          {task.dueDate && (
            <span className={`badge due ${over?"overdue":""}`}>
              <Icon d={I.cal} size={8}/> {fmtDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>
      <div className="tacts">
        <button className="ib" onClick={()=>onEdit(task)}><Icon d={I.edit} size={13}/></button>
        <button className="ib del" onClick={()=>onDel(task.id)}><Icon d={I.trash} size={13}/></button>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [authed, setAuthed]   = useState(!!localStorage.getItem("accessToken"));
  const [screen, setScreen]   = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const path = window.location.pathname;
    if (path.includes("reset-password") && token) return { name: "reset", token };
    if (path.includes("account-confirmation") && token) return { name: "confirm", token };
    return { name: "auth" };
  });
  const [tasks, setTasks]     = useState([]);
  const [cats, setCats]       = useState([]);
  const [filter, setFilter]   = useState("pending");
  const [search, setSearch]   = useState("");
  const [actCat, setActCat]   = useState(null);
  const [modal, setModal]     = useState(null);
  const [editTask, setEditTask]= useState(null);
  const [editCat, setEditCat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sbOpen, setSbOpen]   = useState(false);
  const { request } = useApi();

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const url = actCat
        ? `/v1/tasks/category/${actCat}`
        : `/v1/tasks?done=${filter==="done"}`;
      setTasks(await request("GET", url) || []);
    }
    catch(e) { if(e.message?.toLowerCase().includes("token")) logout(); }
    finally { setLoading(false); }
  }, [filter, actCat, request]);

  const loadCats = useCallback(async () => {
    try { setCats(await request("GET","/v1/categories")||[]); } catch{}
  }, [request]);

  useEffect(()=>{ if(authed){ loadTasks(); loadCats(); }}, [authed, loadTasks, loadCats]);

  const logout = () => { localStorage.clear(); setAuthed(false); setScreen({ name: "auth" }); };
  const done   = async id => { await request("PATCH",`/v1/tasks/complete/${id}`); loadTasks(); };
  const delT   = async id => { await request("DELETE",`/v1/tasks/${id}`); loadTasks(); };
  const delC   = async id => { await request("DELETE",`/v1/categories/${id}`); loadCats(); if(actCat===id) setActCat(null); };

  const shown = tasks.filter(t =>
    !search || (t.title||"").toLowerCase().includes(search.toLowerCase()) || (t.description||"").toLowerCase().includes(search.toLowerCase())
  );

  const catName = actCat ? (cats.find(c=>c.id===actCat)?.title||"Category") : null;
  const goBack  = () => { window.history.replaceState({},"","/"); setScreen({ name: "auth" }); };

  if (screen.name === "confirm") {
    return <><style>{CSS}</style><AccountConfirmation token={screen.token} onBack={goBack}/></>;
  }

  if (!authed) {
    if (screen.name === "forgot") return <><style>{CSS}</style><ForgotPassword onBack={()=>setScreen({name:"auth"})}/></>;
    if (screen.name === "reset")  return <><style>{CSS}</style><ResetPassword token={screen.token} onBack={goBack}/></>;
    return <><style>{CSS}</style><Auth onLogin={()=>setAuthed(true)} onForgot={()=>setScreen({name:"forgot"})}/></>;
  }

  return (
    <>
      <style>{CSS}</style>
      <div className={`sb-ov ${sbOpen?"open":""}`} onClick={()=>setSbOpen(false)}/>
      <div className="app">
        <aside className={`sb ${sbOpen?"open":""}`}>
          <div className="sb-logo">taskflow.</div>
          <div className="sb-sec">
            <div className="sb-lbl">View</div>
            {[["pending",I.ring,"Pending"],["done",I.checkC,"Completed"]].map(([f,icon,label])=>(
              <div key={f} className={`sb-item ${filter===f&&!actCat?"on":""}`}
                onClick={()=>{setFilter(f);setActCat(null);setSbOpen(false);}}>
                <div className="sb-l"><Icon d={icon} size={13}/>{label}</div>
              </div>
            ))}
          </div>
          <div className="sb-sec" style={{marginTop:14}}>
            <div className="sb-lbl">
              Categories
              <button className="ib" onClick={()=>{setEditCat(null);setModal("cat");}}><Icon d={I.plus} size={12}/></button>
            </div>
            {cats.map(c=>(
              <div key={c.id} className={`sb-item ${actCat===c.id?"on":""}`}
                onClick={()=>{setActCat(c.id);setSbOpen(false);}}>
                <div className="sb-l"><span className="dot"/>{c.title}</div>
                <div className="sb-acts">
                  <button className="ib" onClick={e=>{e.stopPropagation();setEditCat(c);setModal("cat");}}><Icon d={I.edit} size={11}/></button>
                  <button className="ib del" onClick={e=>{e.stopPropagation();delC(c.id);}}><Icon d={I.trash} size={11}/></button>
                </div>
              </div>
            ))}
            {!cats.length && <div style={{color:"var(--muted2)",fontSize:11,padding:"3px 9px"}}>No categories yet</div>}
          </div>
          <div className="sb-foot">
            <div style={{ marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:"50%", background:"rgba(139,110,232,0.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontFamily:"var(--serif)", fontSize:14, color:"var(--accent)", fontWeight:600 }}>
                  {(localStorage.getItem("nome")||"?")[0].toUpperCase()}
                </span>
              </div>
              <span style={{ fontFamily:"var(--mono)", fontSize:11, color:"var(--text)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {localStorage.getItem("nome")||""}
              </span>
            </div>
            <button className="btn btn-g btn-w" onClick={logout}><Icon d={I.logout} size={13}/>Sign Out</button>
          </div>
        </aside>

        <main className="main">
          <div className="bar">
            <button className="ib ham" onClick={()=>setSbOpen(true)}><Icon d={I.menu} size={18}/></button>
            <div className="sw">
              <span className="si"><Icon d={I.search} size={12}/></span>
              <input className="sinput" placeholder="Search tasks…" value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className="ftabs">
              <div className={`ft ${filter==="pending"?"on":""}`} onClick={()=>setFilter("pending")}>Pending</div>
              <div className={`ft ${filter==="done"?"on":""}`} onClick={()=>setFilter("done")}>Done</div>
            </div>
            <div className="bar-r">
              <button className="btn btn-p" onClick={()=>{setEditTask(null);setModal("task");}}>
                <Icon d={I.plus} size={13}/>New Task
              </button>
            </div>
          </div>
          <div className="content">
            <div className="ptitle">{catName||(filter==="done"?"Completed":"My Tasks")}</div>
            <div className="pcount">{shown.length} {shown.length===1?"task":"tasks"}</div>
            {loading ? (
              <div style={{color:"var(--muted)",textAlign:"center",padding:40,fontSize:12}}>Loading…</div>
            ) : shown.length===0 ? (
              <div className="empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <h3>{filter==="done"?"Nothing completed yet":"All clear"}</h3>
                <p>{filter==="done"?"Complete a task to see it here.":"Add a new task to get started."}</p>
              </div>
            ) : (
              <div className="tlist">
                {shown.map(t=>(
                  <TCard key={t.id} task={t} onDone={done} onDel={delT}
                    onEdit={t=>{setEditTask(t);setModal("task");}}/>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {modal==="task" && (
        <TaskModal task={editTask} cats={cats}
          onClose={()=>{setModal(null);setEditTask(null);}}
          onSave={()=>{setModal(null);setEditTask(null);loadTasks();}}/>
      )}
      {modal==="cat" && (
        <CatModal cat={editCat}
          onClose={()=>{setModal(null);setEditCat(null);}}
          onSave={()=>{setModal(null);setEditCat(null);loadCats();}}/>
      )}
    </>
  );
}