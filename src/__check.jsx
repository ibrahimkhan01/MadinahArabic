import fs from 'fs';
import { SESSIONS, REVIEWS, ALL_SESSIONS, buildExercises, buildReviewExercises,
         getQuranCoverage, QURAN_CONNECTIONS, stripQ, getEmoji } from './__appt.jsx';

const URDU = /[ہےٹڈڑںھگچپ]/;
const NOPROMPT = new Set(['match', 'sun_moon']);
let bad = 0, total = 0;

console.log(`SESSIONS ${SESSIONS.length} | REVIEWS ${REVIEWS.length} | ALL_SESSIONS ${ALL_SESSIONS.length}`);
for (const s of SESSIONS) {
  const ex = buildExercises(s, 'en');
  total += ex.length;
  if (!ex.length) { console.log(`  !! session ${s.id} has no exercises`); bad++; }
  const drilled = new Set(ex.filter(e => e.type === 'en_ar').map(e => e.promptEn));
  for (const w of s.vocab)
    if (!drilled.has(w.en)) { console.log(`  !! session ${s.id}: "${w.en}" never drilled`); bad++; }
  for (const e of ex) {
    const label = e.promptEn ?? e.prompt ?? e.en ?? e.question ?? e.word;
    if (label === undefined && !NOPROMPT.has(e.type)) { console.log(`  !! session ${s.id} no prompt (${e.type})`); bad++; }
    for (const v of [label, e.hint, e.explanation])
      if (typeof v === 'string' && URDU.test(v)) { console.log(`  !! Urdu in session ${s.id}`); bad++; }
    if (e.answer && e.tiles) {
      const pre = new Set((e.prebaked || []).map(p => p.ar));
      for (const a of e.answer)
        if (!e.tiles.includes(a) && !pre.has(a)) { console.log(`  !! session ${s.id}: answer "${a}" not offered`); bad++; }
    }
  }
}
console.log(`total exercises ${total}`);
for (const r of REVIEWS) {
  const ex = buildReviewExercises(r);
  console.log(`  review ${r.coversLessons}: ${ex.length}`);
  if (!ex.length) bad++;
}
console.log(`quran coverage ${getQuranCoverage(SESSIONS.map(s => s.id))}%`);
console.log(bad === 0 ? 'CHECKS PASSED' : `CHECKS FAILED (${bad})`);

// ── Dump the course vocabulary for the reference list ──
const out = SESSIONS.map(s => ({
  id: s.id, lessonRef: s.lessonRef, part: s.part,
  title: s.title, titleEn: s.titleEn, grammar: s.grammar,
  vocab: s.vocab.map(w => ({
    ar: w.ar, en: w.en,
    emoji: getEmoji(w.en) || '',
    indef: w.indef || '',
    quran: !!QURAN_CONNECTIONS[stripQ(w.ar)],
  })),
}));
fs.writeFileSync('/tmp/vocab.json', JSON.stringify(out, null, 1));
const n = out.reduce((a, s) => a + s.vocab.length, 0);
console.log(`\ndumped ${n} vocab rows across ${out.length} sessions -> /tmp/vocab.json`);
