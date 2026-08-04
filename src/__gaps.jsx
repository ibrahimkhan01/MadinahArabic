import { SESSIONS } from './__appt.jsx';
const vocabSet = new Set();
for (const s of SESSIONS) for (const w of s.vocab) vocabSet.add(w.ar);
// Collect every Arabic token that appears in exercises
const firstSeen = new Map();
for (const s of SESSIONS) {
  const toks = [];
  for (const t of (s.patternTiles || [])) {
    toks.push(...(t.tiles||[]), ...(t.answer||[]), ...(t.prebaked||[]).map(p=>p.ar));
    if (t.question) toks.push(...t.question.replace(/[؟?]/g,'').split(/\s+/));
  }
  for (const t of (s.alTransformExercises || [])) { toks.push(t.word, t.correct, ...(t.options||[])); }
  for (const t of (s.nearFarExercises || [])) toks.push(...(t.tiles||[]), ...(t.answer||[]));
  for (const t of (s.sunMoonWords || [])) toks.push(t.ar || t);
  for (const tk of toks) {
    if (!tk || typeof tk !== 'string' || !/[ء-ي]/.test(tk)) continue;
    if (vocabSet.has(tk)) continue;
    if (!firstSeen.has(tk)) firstSeen.set(tk, s.id);
  }
}
const rows = [...firstSeen.entries()].sort((a,b)=>a[1]-b[1] || a[0].localeCompare(b[0]));
console.log(`tokens used in exercises but absent from any vocab list: ${rows.length}\n`);
for (const [tk, id] of rows) console.log(`   session ${String(id).padStart(2)}   ${tk}`);
