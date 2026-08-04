import { SESSIONS, stripQ } from './__appt.jsx';
const vocabKeys = new Set(), vocabAr = new Set();
for (const s of SESSIONS) for (const w of s.vocab) { vocabAr.add(w.ar); vocabKeys.add(stripQ(w.ar)); }
const SUF = ['هما','هم','هن','ها','كما','كم','كن','نا','ه','ك','ي'];
const isInflection = tk => {
  const k = stripQ(tk).replace(/[؟?]/g,'');
  if (vocabKeys.has(k)) return true;
  for (const s of SUF) if (k.endsWith(s) && vocabKeys.has(k.slice(0,-s.length))) return true;
  for (const p of ['و','ف','ب','ك','ل','م']) if (k.startsWith(p) && vocabKeys.has(k.slice(p.length))) return true;
  // component of a multi-word vocab phrase (e.g. رَبُّ from رَبُّ الْعَالَمِينَ)
  for (const vk of vocabKeys) if (vk.includes(' ') && vk.split(' ').includes(k)) return true;
  return false;
};
const seen = new Map();
for (const s of SESSIONS) {
  const toks = [];
  for (const t of (s.patternTiles || [])) {
    toks.push(...(t.tiles||[]), ...(t.answer||[]));
    if (t.question) toks.push(...t.question.replace(/[؟?]/g,'').split(/\s+/));
  }
  for (const t of (s.alTransformExercises || [])) toks.push(t.word, t.correct, ...(t.options||[]));
  for (const t of (s.nearFarExercises || [])) toks.push(...(t.tiles||[]), ...(t.answer||[]));
  for (const tk of toks) {
    if (!tk || typeof tk !== 'string' || !/[ء-ي]/.test(tk)) continue;
    const clean = tk.replace(/[؟?]/g,'');
    if (vocabAr.has(clean) || isInflection(clean)) continue;
    if (!seen.has(clean)) seen.set(clean, s.id);
  }
}
// prebaked tiles are Quranic verse fragments, not taught vocabulary — report separately
const rows = [...seen.entries()].sort((a,b)=>a[1]-b[1]);
console.log(`candidate untaught words (excluding inflections & phrase parts): ${rows.length}\n`);
for (const [tk,id] of rows) console.log(`   session ${String(id).padStart(2)}   ${tk}`);
