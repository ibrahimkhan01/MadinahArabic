import { useState, useRef, useEffect } from "react";

// Responsive hook — triggers re-render on resize
function useWindowSize() {
  const [size, setSize] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 1024, h: typeof window !== "undefined" ? window.innerHeight : 768 });
  useEffect(() => {
    const handler = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return size;
}

// ──────────────────────────────────────────────
// MADINAH ARABIC LEARNER — Full 92-session build
// Books 1–4 · 42 lessons · 2 sessions/lesson + 8 review sessions
// ──────────────────────────────────────────────

const GREEN = "#059669";
const DARK = "#0f172a";
const isAr = (s) => /[\u0600-\u06FF]/.test(s);
const arFont = "'Noto Naskh Arabic', 'Scheherazade New', 'Amiri', serif";

// ── Emoji lookup by English meaning ─────────────
const EMOJI = {
  // Objects
  "book":"📖","pen":"🖊️","key":"🔑","door":"🚪","pencil":"✏️",
  "house":"🏠","home":"🏠","mosque":"🕌","star":"⭐","stone":"🪨","rock":"🪨",
  "bed":"🛏️","chair":"🪑","desk":"🖥️","desk/office":"🗂️","office":"🏢","wall":"🧱",
  "table":"🪑","lamp":"💡","light":"💡","window":"🪟","room":"🛋️",
  "shirt":"👕","clothes":"👔","garment":"👔","ring":"💍","sword":"⚔️",
  "car":"🚗","boat":"⛵","ship":"🚢","road":"🛣️","path":"🛤️",
  "food":"🍽️","bread":"🍞","water":"💧","milk":"🥛","fruit":"🍎",
  "tree":"🌳","garden":"🌿","river":"🌊","mountain":"⛰️","sea":"🌊","ocean":"🌊",
  "fire":"🔥","earth":"🌍","sky":"☁️","sun":"☀️","moon":"🌙","wind":"💨",
  "night":"🌙","day":"☀️","morning":"🌅","evening":"🌆",
  "book (lesson)":"📖","lesson":"📝","school":"🏫","university":"🎓","class":"🏫",
  "letter":"✉️","word":"💬","speech":"💬","news":"📰","story":"📖",
  "knowledge":"📚","wisdom":"💡","truth":"✅","guidance":"🧭",
  // People
  "man":"👨","woman":"👩","boy":"👦","girl":"👧",
  "father":"👨","mother":"👩","son":"👦","daughter":"👧",
  "brother":"👦","sister":"👧","family":"👨‍👩‍👧‍👦",
  "teacher":"👨‍🏫","student":"👨‍🎓","friend":"🤝","servant":"🙇",
  "king":"👑","prophet":"🕌","messenger":"📨","slave":"🙇",
  "doctor":"👨‍⚕️","engineer":"👷","worker":"👷",
  // Animals
  "dog":"🐕","cat":"🐈","horse":"🐴","lion":"🦁","bird":"🐦",
  "cow":"🐄","camel":"🐪","sheep":"🐑","elephant":"🐘","fish":"🐟",
  // Religion / abstract
  "prayer":"🤲","fasting":"🌙","pilgrimage":"🕌","zakat":"💰",
  "paradise":"🌹","hellfire":"🔥","angel":"👼","devil":"😈",
  "good":"✅","bad":"❌","mercy":"💚","patience":"⏳","gratitude":"🙏",
  "world":"🌍","hereafter":"⭐","death":"💀","life":"🌱",
  "heart":"❤️","hand":"✋","eye":"👁️","face":"😊","head":"🧠",
  "city":"🏙️","village":"🏘️","country":"🗺️","market":"🛒",
  "money":"💰","gold":"🥇","silver":"🥈",
  "war":"⚔️","peace":"☮️","victory":"🏆",
  "right":"➡️","left":"⬅️","near":"📍","far":"🔭",
  "big":"🔼","small":"🔽","new":"✨","old":"📜",
  "east":"🌅","west":"🌇","north":"⬆️","south":"⬇️",
};
const getEmoji = (en) => EMOJI[en.toLowerCase()] || EMOJI[en] || null;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Audio (Web Speech API) ──────────────────────
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "ar";
  utt.rate = 0.82;

  const doSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find(v => v.lang.startsWith("ar"));
    if (arVoice) utt.voice = arVoice;
    window.speechSynthesis.speak(utt);
  };

  // Chrome loads voices asynchronously — wait if not ready yet
  if (window.speechSynthesis.getVoices().length > 0) {
    doSpeak();
  } else {
    window.speechSynthesis.addEventListener("voiceschanged", doSpeak, { once: true });
  }
}

function SpeakBtn({ text, size = 18 }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); speak(text); }}
      title="Hear pronunciation"
      style={{ background:"none", border:"none", cursor:"pointer",
               fontSize:size, lineHeight:1, padding:"2px 8px",
               opacity:0.55, verticalAlign:"middle" }}>
      🔊
    </button>
  );
}

// ──────────────────────────────────────────────
// SESSIONS (84 regular sessions, Books 1–4)
// ──────────────────────────────────────────────
const SESSIONS = [

// ═══ BOOK 1 · Lessons 1–10 · Sessions 1–20 ═══

  { id:1, book:1, lessonRef:"1.1", part:"A", title:"مَا هَذَا؟", titleEn:"What Is This? (Part 1)",
    grammar:'هَذَا means "this" for masculine objects. مَا هَذَا؟ = What is this? Answer: هَذَا كِتَابٌ. Nouns take ـٌ (tanwīn ḍamm) in the indefinite.',
    vocab:[{ar:"كِتَابٌ",en:"book"},{ar:"قَلَمٌ",en:"pen"},{ar:"مِفْتَاحٌ",en:"key"},{ar:"بَابٌ",en:"door"}],
    patternTiles:[
      {emoji:"📖", question:"مَا هَذَا؟", tiles:["هَذَا","كِتَابٌ"], answer:["هَذَا","كِتَابٌ"]},
      {emoji:"🔑", question:"مَا هَذَا؟", tiles:["هَذَا","مِفْتَاحٌ"], answer:["هَذَا","مِفْتَاحٌ"]},
    ]},
  { id:2, book:1, lessonRef:"1.1", part:"B", title:"مَا هَذَا؟", titleEn:"What Is This? (Part 2)",
    grammar:'More هَذَا sentences. Nouns ending in ـٌ are indefinite ("a book"). Every Arabic noun has a gender — masculine or feminine.',
    vocab:[{ar:"بَيْتٌ",en:"house"},{ar:"مَسْجِدٌ",en:"mosque"},{ar:"نَجْمٌ",en:"star"},{ar:"حَجَرٌ",en:"stone"}],
    patternTiles:[
      {emoji:"🏠", question:"مَا هَذَا؟", tiles:["هَذَا","بَيْتٌ"], answer:["هَذَا","بَيْتٌ"]},
      {emoji:"🕌", question:"مَا هَذَا؟", tiles:["هَذَا","مَسْجِدٌ"], answer:["هَذَا","مَسْجِدٌ"]},
    ]},

  { id:3, book:1, lessonRef:"1.2", part:"A", title:"ذَلِكَ — That Is...", titleEn:"Far Demonstratives (Part 1)",
    grammar:'ذَلِكَ = "that" for masculine objects far away. Compare: هَذَا كِتَابٌ (This is a book) vs. ذَلِكَ كِتَابٌ (That is a book).',
    vocab:[{ar:"سَرِيرٌ",en:"bed"},{ar:"كُرْسِيٌّ",en:"chair"},{ar:"مَكْتَبٌ",en:"desk/office"},{ar:"جِدَارٌ",en:"wall"}],
    patternTiles:[
      {emoji:"🛏️", question:"مَا ذَلِكَ؟", tiles:["ذَلِكَ","سَرِيرٌ"], answer:["ذَلِكَ","سَرِيرٌ"]},
      {emoji:"🪑", question:"مَا ذَلِكَ؟", tiles:["ذَلِكَ","كُرْسِيٌّ"], answer:["ذَلِكَ","كُرْسِيٌّ"]},
    ]},
  { id:4, book:1, lessonRef:"1.2", part:"B", title:"ذَلِكَ — That Is...", titleEn:"Far Demonstratives (Part 2)",
    grammar:'Practice هَذَا and ذَلِكَ with more nouns. مَنْ هَذَا؟ = Who is this? (used for people).',
    vocab:[{ar:"وَلَدٌ",en:"boy"},{ar:"رَجُلٌ",en:"man"},{ar:"طَالِبٌ",en:"student (m.)"},{ar:"مُدَرِّسٌ",en:"teacher (m.)"}],
    patternTiles:[
      {emoji:"👦", question:"مَنْ هَذَا؟", tiles:["هَذَا","وَلَدٌ"], answer:["هَذَا","وَلَدٌ"]},
      {emoji:"👨‍🏫", question:"مَنْ هَذَا؟", tiles:["هَذَا","مُدَرِّسٌ"], answer:["هَذَا","مُدَرِّسٌ"]},
    ]},

  { id:5, book:1, lessonRef:"1.3", part:"A", title:"الـ — The Definite Article (Part 1)", titleEn:"Making Nouns Definite",
    grammar:'الـ makes a noun definite: كِتَابٌ → الْكِتَابُ. The ـٌ disappears, replaced by ـُ. With "moon letters" الـ is fully pronounced: الْبَيْتُ.',
    vocab:[{ar:"الْكِتَابُ",en:"the book"},{ar:"الْقَلَمُ",en:"the pen"},{ar:"الْبَيْتُ",en:"the house"},{ar:"الْبَابُ",en:"the door"}],
    patternTiles:[
      {emoji:"📖", question:"مَا هَذَا؟", tiles:["هَذَا","الْكِتَابُ"], answer:["هَذَا","الْكِتَابُ"]},
      {emoji:"🚪", question:"مَا هَذَا؟", tiles:["هَذَا","الْبَابُ"], answer:["هَذَا","الْبَابُ"]},
    ]},
  { id:6, book:1, lessonRef:"1.3", part:"B", title:"الـ — Sun & Moon Letters", titleEn:"Sun Letters (Part 2)",
    grammar:'With "sun letters" (ت،ث،د،ذ،ر،ز،س،ش،ص،ض،ط،ظ،ل،ن) the ل of الـ assimilates: الشَّمْسُ (ash-shams), الرَّجُلُ (ar-rajul). Written but not pronounced separately.',
    vocab:[{ar:"الشَّمْسُ",en:"the sun"},{ar:"الرَّجُلُ",en:"the man"},{ar:"النَّجْمُ",en:"the star"},{ar:"الطَّالِبُ",en:"the student"}],
    patternTiles:[
      {emoji:"⭐", question:"مَا هَذَا؟", tiles:["هَذَا","النَّجْمُ"], answer:["هَذَا","النَّجْمُ"]},
      {emoji:"👨", question:"مَنْ هَذَا؟", tiles:["هَذَا","الرَّجُلُ"], answer:["هَذَا","الرَّجُلُ"]},
    ]},

  { id:7, book:1, lessonRef:"1.4", part:"A", title:"الصِّفَاتُ — Adjectives (Part 1)", titleEn:"Describing with Adjectives",
    grammar:'Adjectives come AFTER the noun. Definite noun + definite adjective: الْبَيْتُ الْكَبِيرُ. Indefinite noun + indefinite adjective: بَيْتٌ كَبِيرٌ.',
    vocab:[{ar:"كَبِيرٌ",en:"big"},{ar:"صَغِيرٌ",en:"small"},{ar:"جَدِيدٌ",en:"new"},{ar:"قَدِيمٌ",en:"old"}],
    patternTiles:[
      {en:"This is a big house.", tiles:["هَذَا","بَيْتٌ","كَبِيرٌ"], answer:["هَذَا","بَيْتٌ","كَبِيرٌ"]},
      {en:"That is a new book.", tiles:["ذَلِكَ","كِتَابٌ","جَدِيدٌ"], answer:["ذَلِكَ","كِتَابٌ","جَدِيدٌ"]},
    ]},
  { id:8, book:1, lessonRef:"1.4", part:"B", title:"الصِّفَاتُ — More Adjectives (Part 2)", titleEn:"More Adjectives",
    grammar:'More masculine adjectives. هَذَا طَالِبٌ جَدِيدٌ = This is a new student (noun + adjective forms descriptive phrase).',
    vocab:[{ar:"جَمِيلٌ",en:"beautiful"},{ar:"طَوِيلٌ",en:"tall/long"},{ar:"قَصِيرٌ",en:"short"},{ar:"رَخِيصٌ",en:"cheap"}],
    patternTiles:[
      {en:"This is a tall man.", tiles:["هَذَا","رَجُلٌ","طَوِيلٌ"], answer:["هَذَا","رَجُلٌ","طَوِيلٌ"]},
      {en:"That is a short pen.", tiles:["ذَلِكَ","قَلَمٌ","قَصِيرٌ"], answer:["ذَلِكَ","قَلَمٌ","قَصِيرٌ"]},
    ]},

  { id:9, book:1, lessonRef:"1.5", part:"A", title:"حُرُوفُ الْجَرِّ (Part 1)", titleEn:"Prepositions: في، عَلَى، مِنْ، إِلَى",
    grammar:'Prepositions put the following noun into genitive (ـِ or ـٍ): فِي الْبَيْتِ (in the house), عَلَى الْمَكْتَبِ (on the desk), مِنَ الْمَسْجِدِ (from the mosque), إِلَى الْمَدْرَسَةِ (to the school).',
    vocab:[{ar:"فِي",en:"in"},{ar:"عَلَى",en:"on"},{ar:"مِنْ",en:"from"},{ar:"إِلَى",en:"to"}],
    patternTiles:[
      {en:"The book is on the desk.", tiles:["الْكِتَابُ","عَلَى","الْمَكْتَبِ"], answer:["الْكِتَابُ","عَلَى","الْمَكْتَبِ"]},
      {en:"The key is in the house.", tiles:["الْمِفْتَاحُ","فِي","الْبَيْتِ"], answer:["الْمِفْتَاحُ","فِي","الْبَيْتِ"]},
    ]},
  { id:10, book:1, lessonRef:"1.5", part:"B", title:"حُرُوفُ الْجَرِّ (Part 2)", titleEn:"Prepositions: تَحْتَ، فَوْقَ، أَمَامَ",
    grammar:'More location prepositions. أَيْنَ؟ = where? The answer: الْكِتَابُ عَلَى الْمَكْتَبِ. After a preposition, the noun loses ـٌ and takes ـٍ.',
    vocab:[{ar:"تَحْتَ",en:"under"},{ar:"فَوْقَ",en:"above"},{ar:"أَمَامَ",en:"in front of"},{ar:"خَلْفَ",en:"behind"}],
    patternTiles:[
      {en:"The pen is under the book.", tiles:["الْقَلَمُ","تَحْتَ","الْكِتَابِ"], answer:["الْقَلَمُ","تَحْتَ","الْكِتَابِ"]},
      {en:"The door is in front of the house.", tiles:["الْبَابُ","أَمَامَ","الْبَيْتِ"], answer:["الْبَابُ","أَمَامَ","الْبَيْتِ"]},
    ]},

  { id:11, book:1, lessonRef:"1.6", part:"A", title:"الضَّمَائِرُ (Part 1)", titleEn:"Personal Pronouns",
    grammar:'هُوَ (he), هِيَ (she), أَنَا (I), أَنْتَ (you m.). In equational sentences: هُوَ طَبِيبٌ = He is a doctor. Arabic has no verb "to be" in present tense.',
    vocab:[{ar:"هُوَ",en:"he"},{ar:"هِيَ",en:"she"},{ar:"أَنَا",en:"I"},{ar:"أَنْتَ",en:"you (m.)"}],
    patternTiles:[
      {en:"He is a student.", tiles:["هُوَ","طَالِبٌ"], answer:["هُوَ","طَالِبٌ"]},
      {en:"I am a teacher.", tiles:["أَنَا","مُدَرِّسٌ"], answer:["أَنَا","مُدَرِّسٌ"]},
    ]},
  { id:12, book:1, lessonRef:"1.6", part:"B", title:"الضَّمَائِرُ (Part 2)", titleEn:"Pronouns with Professions",
    grammar:'مَنْ أَنْتَ؟ = Who are you? أَنَا طَالِبٌ = I am a student. هُوَ مُدَرِّسٌ = He is a teacher.',
    vocab:[{ar:"طَبِيبٌ",en:"doctor (m.)"},{ar:"مُهَنْدِسٌ",en:"engineer"},{ar:"تَاجِرٌ",en:"merchant"},{ar:"فَلَّاحٌ",en:"farmer"}],
    patternTiles:[
      {emoji:"👨‍⚕️", en:"He is a doctor.", tiles:["هُوَ","طَبِيبٌ"], answer:["هُوَ","طَبِيبٌ"]},
      {en:"I am a merchant.", tiles:["أَنَا","تَاجِرٌ"], answer:["أَنَا","تَاجِرٌ"]},
    ]},

  { id:13, book:1, lessonRef:"1.7", part:"A", title:"الْمُؤَنَّثُ (Part 1)", titleEn:"Feminine Nouns & هَذِهِ",
    grammar:'Feminine nouns end in ةٌ. Use هَذِهِ (this, f.) and تِلْكَ (that, f.): هَذِهِ سَيَّارَةٌ. Adjectives must match: هَذِهِ سَيَّارَةٌ جَمِيلَةٌ.',
    vocab:[{ar:"سَيَّارَةٌ",en:"car"},{ar:"مَدْرَسَةٌ",en:"school"},{ar:"غُرْفَةٌ",en:"room"},{ar:"حَدِيقَةٌ",en:"garden"}],
    patternTiles:[
      {emoji:"🚗", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","سَيَّارَةٌ"], answer:["هَذِهِ","سَيَّارَةٌ"]},
      {emoji:"🏫", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","مَدْرَسَةٌ"], answer:["هَذِهِ","مَدْرَسَةٌ"]},
    ]},
  { id:14, book:1, lessonRef:"1.7", part:"B", title:"الْمُؤَنَّثُ (Part 2)", titleEn:"Feminine Adjectives & Professions",
    grammar:'Feminine adjectives add ةٌ: كَبِيرٌ → كَبِيرَةٌ. Professions too: مُدَرِّسٌ → مُدَرِّسَةٌ. هِيَ مُدَرِّسَةٌ = She is a teacher.',
    vocab:[{ar:"مُدَرِّسَةٌ",en:"teacher (f.)"},{ar:"طَالِبَةٌ",en:"student (f.)"},{ar:"طَبِيبَةٌ",en:"doctor (f.)"},{ar:"جَمِيلَةٌ",en:"beautiful (f.)"}],
    patternTiles:[
      {emoji:"👩‍🏫", en:"She is a teacher.", tiles:["هِيَ","مُدَرِّسَةٌ"], answer:["هِيَ","مُدَرِّسَةٌ"]},
      {emoji:"👩‍🎓", en:"She is a student.", tiles:["هِيَ","طَالِبَةٌ"], answer:["هِيَ","طَالِبَةٌ"]},
    ]},

  { id:15, book:1, lessonRef:"1.8", part:"A", title:"الْإِضَافَةُ (Part 1)", titleEn:"Possessive Constructions",
    grammar:'Possession by juxtaposition: كِتَابُ الطَّالِبِ (the student\'s book). First noun loses tanwīn. Second noun takes genitive ـِ.',
    vocab:[{ar:"بَابُ الْبَيْتِ",en:"the door of the house"},{ar:"كِتَابُ الطَّالِبِ",en:"the student's book"},{ar:"مَكْتَبُ الْمُدِيرِ",en:"the director's office"},{ar:"غُرْفَةُ الْوَلَدِ",en:"the boy's room"}],
    patternTiles:[
      {en:"The student's book is on the desk.", tiles:["كِتَابُ","الطَّالِبِ","عَلَى","الْمَكْتَبِ"], answer:["كِتَابُ","الطَّالِبِ","عَلَى","الْمَكْتَبِ"]},
      {en:"The door of the house is big.", tiles:["بَابُ","الْبَيْتِ","كَبِيرٌ"], answer:["بَابُ","الْبَيْتِ","كَبِيرٌ"]},
    ]},
  { id:16, book:1, lessonRef:"1.8", part:"B", title:"الْإِضَافَةُ (Part 2)", titleEn:"Possessive Pronouns",
    grammar:'Attached pronouns: بَيْتِي (my house), بَيْتُكَ (your house), بَيْتُهُ (his house), بَيْتُهَا (her house). Pronoun attaches directly to noun.',
    vocab:[{ar:"بَيْتِي",en:"my house"},{ar:"كِتَابُكَ",en:"your book"},{ar:"قَلَمُهُ",en:"his pen"},{ar:"غُرْفَتُهَا",en:"her room"}],
    patternTiles:[
      {en:"My house is big.", tiles:["بَيْتِي","كَبِيرٌ"], answer:["بَيْتِي","كَبِيرٌ"]},
      {en:"His pen is on the desk.", tiles:["قَلَمُهُ","عَلَى","الْمَكْتَبِ"], answer:["قَلَمُهُ","عَلَى","الْمَكْتَبِ"]},
    ]},

  { id:17, book:1, lessonRef:"1.9", part:"A", title:"الْعَائِلَةُ (Part 1)", titleEn:"Family Vocabulary",
    grammar:'أَبٌ (father) and أَخٌ (brother) are irregular: أَبِي (my father), أَخِي (my brother). These are الْأَسْمَاءُ الْخَمْسَةُ — special nouns.',
    vocab:[{ar:"أَبٌ",en:"father"},{ar:"أُمٌّ",en:"mother"},{ar:"أَخٌ",en:"brother"},{ar:"أُخْتٌ",en:"sister"}],
    patternTiles:[
      {emoji:"👨", en:"My father is generous.", tiles:["أَبِي","كَرِيمٌ"], answer:["أَبِي","كَرِيمٌ"]},
      {en:"I have a brother and a sister.", tiles:["عِنْدِي","أَخٌ","وَأُخْتٌ"], answer:["عِنْدِي","أَخٌ","وَأُخْتٌ"]},
    ]},
  { id:18, book:1, lessonRef:"1.9", part:"B", title:"الْعَائِلَةُ (Part 2)", titleEn:"Extended Family",
    grammar:'عِنْدِي أَخٌ وَأُخْتٌ = I have a brother and a sister. لِي أَبٌ كَرِيمٌ = I have a generous father.',
    vocab:[{ar:"زَوْجٌ",en:"husband"},{ar:"زَوْجَةٌ",en:"wife"},{ar:"اِبْنٌ",en:"son"},{ar:"بِنْتٌ",en:"daughter"}],
    patternTiles:[
      {en:"My son is a student.", tiles:["اِبْنِي","طَالِبٌ"], answer:["اِبْنِي","طَالِبٌ"]},
      {en:"His wife is a teacher.", tiles:["زَوْجَتُهُ","مُدَرِّسَةٌ"], answer:["زَوْجَتُهُ","مُدَرِّسَةٌ"]},
    ]},

  { id:19, book:1, lessonRef:"1.10", part:"A", title:"الَّذِي — The One Who / Which", titleEn:"Relative Pronoun (Part 1)",
    grammar:'الَّذِي (who/which) for masculine singular. الَّتِي for feminine. الطَّالِبُ الَّذِي فِي الْفَصْلِ = The student who is in the class.',
    vocab:[{ar:"الَّذِي",en:"who/which (m.)"},{ar:"الَّتِي",en:"who/which (f.)"},{ar:"الَّذِينَ",en:"who/which (m.pl.)"},{ar:"الْفَصْلُ",en:"classroom"}],
    patternTiles:[
      {en:"The student who is in the classroom.", tiles:["الطَّالِبُ","الَّذِي","فِي","الْفَصْلِ"], answer:["الطَّالِبُ","الَّذِي","فِي","الْفَصْلِ"]},
      {en:"The book which is on the desk.", tiles:["الْكِتَابُ","الَّذِي","عَلَى","الْمَكْتَبِ"], answer:["الْكِتَابُ","الَّذِي","عَلَى","الْمَكْتَبِ"]},
    ]},
  { id:20, book:1, lessonRef:"1.10", part:"B", title:"مُرَاجَعَةٌ — Book 1 Review", titleEn:"Book 1 Revision",
    grammar:'Review all Book 1 patterns: هَذَا/ذَلِكَ/هَذِهِ/تِلْكَ, الـ, adjective agreement, prepositions, pronouns, iḍāfa, الَّذِي.',
    vocab:[{ar:"أَيْنَ",en:"where?"},{ar:"مَنْ",en:"who?"},{ar:"مَا",en:"what?"},{ar:"أَيْضًا",en:"also"}],
    patternTiles:[
      {emoji:"🪑", question:"مَا ذَلِكَ؟", tiles:["ذَلِكَ","كُرْسِيٌّ"], answer:["ذَلِكَ","كُرْسِيٌّ"]},
      {en:"Where is the key?", tiles:["أَيْنَ","الْمِفْتَاحُ؟"], answer:["أَيْنَ","الْمِفْتَاحُ؟"]},
    ]},

// ═══ BOOK 2 · Lessons 1–12 · Sessions 21–44 ═══

  { id:21, book:2, lessonRef:"2.1", part:"A", title:"الْمُضَارِعُ — هُوَ (Part 1)", titleEn:"Present Tense: He",
    grammar:'Present tense (الْمُضَارِعُ) for "he": prefix يَـ + root. يَكْتُبُ (he writes), يَقْرَأُ (he reads), يَذْهَبُ (he goes). Ending ـُ signals present tense.',
    vocab:[{ar:"يَكْتُبُ",en:"he writes"},{ar:"يَقْرَأُ",en:"he reads"},{ar:"يَذْهَبُ",en:"he goes"},{ar:"يَجْلِسُ",en:"he sits"}]},
  { id:22, book:2, lessonRef:"2.1", part:"B", title:"الْمُضَارِعُ — هُوَ (Part 2)", titleEn:"Present Tense: More Verbs",
    grammar:'More present tense verbs. Subject can come after verb: يَدْخُلُ الطَّالِبُ = The student enters.',
    vocab:[{ar:"يَفْتَحُ",en:"he opens"},{ar:"يَخْرُجُ",en:"he goes out"},{ar:"يَدْخُلُ",en:"he enters"},{ar:"يَأْكُلُ",en:"he eats"}]},

  { id:23, book:2, lessonRef:"2.2", part:"A", title:"الْمُضَارِعُ — أَنَا وَأَنْتَ (Part 1)", titleEn:"Present Tense: I & You",
    grammar:'أَنَا: prefix أَـ → أَكْتُبُ (I write). أَنْتَ: prefix تَـ → تَكْتُبُ (you write). أَنْتِ (f.): تَكْتُبِينَ.',
    vocab:[{ar:"أَكْتُبُ",en:"I write"},{ar:"تَكْتُبُ",en:"you write (m.)"},{ar:"أَذْهَبُ",en:"I go"},{ar:"تَذْهَبُ",en:"you go (m.)"}]},
  { id:24, book:2, lessonRef:"2.2", part:"B", title:"الْمُضَارِعُ — نَحْنُ وَهُمْ (Part 2)", titleEn:"Present Tense: We & They",
    grammar:'نَحْنُ: prefix نَـ → نَكْتُبُ. هُمْ: يَكْتُبُونَ. هُنَّ: يَكْتُبْنَ. هُمَا: يَكْتُبَانِ.',
    vocab:[{ar:"نَكْتُبُ",en:"we write"},{ar:"يَكْتُبُونَ",en:"they write (m.)"},{ar:"نَذْهَبُ",en:"we go"},{ar:"يَذْهَبُونَ",en:"they go (m.)"}]},

  { id:25, book:2, lessonRef:"2.3", part:"A", title:"الْأَمْرُ (Part 1)", titleEn:"Commands",
    grammar:'Imperative (الْأَمْرُ) from present tense: يَكْتُبُ → اُكْتُبْ (Write!). For feminine: اُكْتُبِي. For plural: اُكْتُبُوا. Note the hamzat al-waṣl (اُ) at the start.',
    vocab:[{ar:"اُكْتُبْ",en:"Write! (m.)"},{ar:"اقْرَأْ",en:"Read! (m.)"},{ar:"اِجْلِسْ",en:"Sit! (m.)"},{ar:"اُخْرُجْ",en:"Go out! (m.)"}]},
  { id:26, book:2, lessonRef:"2.3", part:"B", title:"الْأَمْرُ (Part 2)", titleEn:"Commands: Feminine & Plural",
    grammar:'Feminine imperative adds ـِي: اُكْتُبِي. Plural masculine adds وا: اُكْتُبُوا. Used in classroom instructions daily.',
    vocab:[{ar:"اُكْتُبِي",en:"Write! (f.)"},{ar:"اُكْتُبُوا",en:"Write! (pl.)"},{ar:"اِفْتَحُوا",en:"Open! (pl.)"},{ar:"اِسْمَعُوا",en:"Listen! (pl.)"}]},

  { id:27, book:2, lessonRef:"2.4", part:"A", title:"أَيَّامُ الْأُسْبُوعِ (Part 1)", titleEn:"Days of the Week (Part 1)",
    grammar:'Days begin with يَوْمُ (the day of...). Sunday=الْأَحَد, Monday=الِاثْنَيْن, Tuesday=الثُّلَاثَاء, Wednesday=الْأَرْبِعَاء.',
    vocab:[{ar:"يَوْمُ الْأَحَدِ",en:"Sunday"},{ar:"يَوْمُ الِاثْنَيْنِ",en:"Monday"},{ar:"يَوْمُ الثُّلَاثَاءِ",en:"Tuesday"},{ar:"يَوْمُ الْأَرْبِعَاءِ",en:"Wednesday"}]},
  { id:28, book:2, lessonRef:"2.4", part:"B", title:"أَيَّامُ الْأُسْبُوعِ (Part 2)", titleEn:"Days of the Week (Part 2)",
    grammar:'Remaining days: الْخَمِيس (Thursday), الْجُمُعَة (Friday — holy day), السَّبْت (Saturday). مَتَى؟ = When?',
    vocab:[{ar:"يَوْمُ الْخَمِيسِ",en:"Thursday"},{ar:"يَوْمُ الْجُمُعَةِ",en:"Friday"},{ar:"يَوْمُ السَّبْتِ",en:"Saturday"},{ar:"مَتَى؟",en:"When?"}]},

  { id:29, book:2, lessonRef:"2.5", part:"A", title:"ضَمَائِرُ الْجَمْعِ (Part 1)", titleEn:"Plural Pronouns",
    grammar:'أَنْتُمْ (you m.pl.), أَنْتُنَّ (you f.pl.), هُمْ (they m.), هُنَّ (they f.), نَحْنُ (we). هَؤُلَاءِ (these people), أُولَئِكَ (those people).',
    vocab:[{ar:"أَنْتُمْ",en:"you (m. plural)"},{ar:"أَنْتُنَّ",en:"you (f. plural)"},{ar:"هُمْ",en:"they (m.)"},{ar:"هَؤُلَاءِ",en:"these (people)"}]},
  { id:30, book:2, lessonRef:"2.5", part:"B", title:"الْمُثَنَّى (Part 2)", titleEn:"Dual Form",
    grammar:'Dual: add ـَانِ (nom.) or ـَيْنِ (acc./gen.): كِتَابٌ → كِتَابَانِ. Dual pronoun: هُمَا. Demonstratives: هَذَانِ (these two m.), هَاتَانِ (these two f.).',
    vocab:[{ar:"كِتَابَانِ",en:"two books"},{ar:"طَالِبَانِ",en:"two students (m.)"},{ar:"هُمَا",en:"the two of them"},{ar:"هَذَانِ",en:"these two (m.)"}]},

  { id:31, book:2, lessonRef:"2.6", part:"A", title:"الْأَعْدَادُ ١–٥", titleEn:"Numbers 1–5",
    grammar:'Numbers 3–10 come before noun, use opposite gender: ثَلَاثَةُ كُتُبٍ (3 books — masc. noun, so number has ةٌ). Noun is plural genitive.',
    vocab:[{ar:"وَاحِدٌ",en:"one"},{ar:"اثْنَانِ",en:"two"},{ar:"ثَلَاثَةٌ",en:"three"},{ar:"أَرْبَعَةٌ",en:"four"},{ar:"خَمْسَةٌ",en:"five"}]},
  { id:32, book:2, lessonRef:"2.6", part:"B", title:"الْأَعْدَادُ ٦–١٠", titleEn:"Numbers 6–10",
    grammar:'كَمْ (how many?) takes singular accusative: كَمْ كِتَابًا؟ Numbers 6–10 follow opposite-gender rule. عَشَرَةٌ = ten.',
    vocab:[{ar:"سِتَّةٌ",en:"six"},{ar:"سَبْعَةٌ",en:"seven"},{ar:"ثَمَانِيَةٌ",en:"eight"},{ar:"تِسْعَةٌ",en:"nine"},{ar:"عَشَرَةٌ",en:"ten"}]},

  { id:33, book:2, lessonRef:"2.7", part:"A", title:"الْمَاضِي — هُوَ وَهِيَ (Part 1)", titleEn:"Past Tense: He & She",
    grammar:'Past tense base = 3rd person masculine singular: ذَهَبَ (he went), كَتَبَ (he wrote). Feminine adds تْ: ذَهَبَتْ, كَتَبَتْ.',
    vocab:[{ar:"ذَهَبَ",en:"he went"},{ar:"ذَهَبَتْ",en:"she went"},{ar:"كَتَبَ",en:"he wrote"},{ar:"كَتَبَتْ",en:"she wrote"}]},
  { id:34, book:2, lessonRef:"2.7", part:"B", title:"الْمَاضِي — كُلُّ الضَّمَائِرِ (Part 2)", titleEn:"Past Tense: All Pronouns",
    grammar:'Full past tense: أَنَا ذَهَبْتُ، أَنْتَ ذَهَبْتَ، هُوَ ذَهَبَ، هِيَ ذَهَبَتْ، نَحْنُ ذَهَبْنَا، هُمْ ذَهَبُوا.',
    vocab:[{ar:"ذَهَبْتُ",en:"I went"},{ar:"ذَهَبْتَ",en:"you went (m.)"},{ar:"ذَهَبْنَا",en:"we went"},{ar:"ذَهَبُوا",en:"they went (m.)"}]},

  { id:35, book:2, lessonRef:"2.8", part:"A", title:"النَّفْيُ (Part 1)", titleEn:"Negation: لَا، مَا، لَيْسَ",
    grammar:'لَا negates present habits: لَا يَذْهَبُ. مَا negates past: مَا ذَهَبَ. لَيْسَ negates nominal sentences: لَيْسَ طَالِبًا (accusative after لَيْسَ). لَمْ + jussive: لَمْ يَذْهَبْ.',
    vocab:[{ar:"لَا يَذْهَبُ",en:"he does not go"},{ar:"مَا ذَهَبَ",en:"he did not go"},{ar:"لَيْسَ",en:"is not"},{ar:"لَمْ يَذْهَبْ",en:"he did not go (لَمْ)"}]},
  { id:36, book:2, lessonRef:"2.8", part:"B", title:"نَعَمْ وَبَلَى (Part 2)", titleEn:"Yes, No, and Prohibition",
    grammar:'نَعَمْ = yes. لَا = no. بَلَى = yes! (contradicts a negative question). Prohibition: لَا + jussive: لَا تَكْتُبْ هُنَا (Don\'t write here).',
    vocab:[{ar:"نَعَمْ",en:"yes"},{ar:"لَا",en:"no"},{ar:"بَلَى",en:"yes! (contradicting negative)"},{ar:"لَا تَكْتُبْ",en:"do not write (prohibition)"}]},

  { id:37, book:2, lessonRef:"2.9", part:"A", title:"أَسْمَاءُ الِاسْتِفْهَامِ (Part 1)", titleEn:"Question Words",
    grammar:'Complete question words: مَاذَا (what thing?), كَيْفَ (how?), لِمَاذَا (why?), مَنْ (who?), أَيْنَ (where?), مَتَى (when?), كَمْ (how many?). كَيْفَ حَالُكَ؟ = How are you?',
    vocab:[{ar:"مَاذَا",en:"what? (what thing?)"},{ar:"كَيْفَ",en:"how?"},{ar:"لِمَاذَا",en:"why?"},{ar:"كَيْفَ حَالُكَ؟",en:"How are you?"}]},
  { id:38, book:2, lessonRef:"2.9", part:"B", title:"أَسْمَاءُ الِاسْتِفْهَامِ (Part 2)", titleEn:"Question Words Practice",
    grammar:'Practice building questions: لِمَاذَا تَذْهَبُ؟ = Why are you going? مَاذَا تَكْتُبُ؟ = What are you writing? أَيُّ (which?) used with nouns: أَيُّ كِتَابٍ؟',
    vocab:[{ar:"أَيُّ",en:"which?"},{ar:"مَاذَا تَكْتُبُ؟",en:"What are you writing?"},{ar:"لِمَاذَا تَذْهَبُ؟",en:"Why are you going?"},{ar:"كَمْ طَالِبًا",en:"how many students?"}]},

  { id:39, book:2, lessonRef:"2.10", part:"A", title:"الْأَفْعَالُ الْمُتَعَدِّيَةُ (Part 1)", titleEn:"Transitive Verbs & Objects",
    grammar:'Transitive verbs take a direct object in the accusative (ـَ): كَتَبَ الطَّالِبُ الدَّرْسَ (The student wrote the lesson). The verb أَعْطَى (gave) can take two objects: أَعْطَيْتُكَ الْكِتَابَ (I gave you the book).',
    vocab:[{ar:"أَعْطَى",en:"he gave"},{ar:"أَخَذَ",en:"he took"},{ar:"فَهِمَ",en:"he understood"},{ar:"سَأَلَ",en:"he asked"}]},
  { id:40, book:2, lessonRef:"2.10", part:"B", title:"الْأَفْعَالُ الْمُتَعَدِّيَةُ (Part 2)", titleEn:"Verb + Object Practice",
    grammar:'More transitive verbs. Object pronouns attach to verbs: أَعْطَيْتُهُ (I gave him), سَأَلَنِي (he asked me — nūn protects ي). Same suffixes attach to prepositions: فِيهِ, عَلَيْهِ.',
    vocab:[{ar:"أَعْطَيْتُهُ",en:"I gave him/it"},{ar:"سَأَلَنِي",en:"he asked me"},{ar:"فَهِمُوهُ",en:"they understood it"},{ar:"أَخَذْتُهَا",en:"I took it (f.)"}]},

  { id:41, book:2, lessonRef:"2.11", part:"A", title:"اللَّامُ وَالْإِعْطَاءُ (Part 1)", titleEn:"Indirect Objects with لِـ",
    grammar:'Indirect objects use لِـ (for/to): أَعْطَيْتُ الْكِتَابَ لِلطَّالِبِ (I gave the book to the student). لِـ + pronoun suffix: لَهُ (for him), لَهَا (for her), لِي (for me), لَكَ (for you).',
    vocab:[{ar:"لَهُ",en:"for him / his"},{ar:"لَهَا",en:"for her / hers"},{ar:"لَنَا",en:"for us / ours"},{ar:"لَكُمْ",en:"for you all"}]},
  { id:42, book:2, lessonRef:"2.11", part:"B", title:"عِنْدَ وَلَدَى (Part 2)", titleEn:"Having: عِنْدَ & لَدَى",
    grammar:'عِنْدَ + pronoun = to have: عِنْدِي كِتَابٌ (I have a book), عِنْدَهُ سَيَّارَةٌ (He has a car). لَدَى is similar but more formal. كَانَ عِنْدَهُ = He had (past tense of having).',
    vocab:[{ar:"عِنْدِي",en:"I have / at me"},{ar:"عِنْدَهُ",en:"he has / at him"},{ar:"لَدَيْهِ",en:"he has (formal)"},{ar:"كَانَ عِنْدَهُ",en:"he had"}]},

  { id:43, book:2, lessonRef:"2.12", part:"A", title:"مُرَاجَعَةُ كِتَابٍ ٢ (Part 1)", titleEn:"Book 2 Review (Part 1)",
    grammar:'Review all verb tenses: present (يَكْتُبُ), imperative (اُكْتُبْ), past (كَتَبَ). Review negation: لَا، مَا، لَمْ، لَيْسَ. Review question words.',
    vocab:[{ar:"يَدْرُسُ",en:"he studies"},{ar:"دَرَسَ",en:"he studied"},{ar:"اُدْرُسْ",en:"Study! (m.)"},{ar:"لَمْ يَدْرُسْ",en:"he did not study"}]},
  { id:44, book:2, lessonRef:"2.12", part:"B", title:"مُرَاجَعَةُ كِتَابٍ ٢ (Part 2)", titleEn:"Book 2 Review (Part 2)",
    grammar:'Review: days of week, numbers 1-10, dual form, plural pronouns, possessive لِـ, عِنْدَ. Comprehensive sentence building.',
    vocab:[{ar:"يَوْمِيًّا",en:"daily"},{ar:"أَحْيَانًا",en:"sometimes"},{ar:"دَائِمًا",en:"always"},{ar:"أَبَدًا",en:"never"}]},

// ═══ BOOK 3 · Lessons 1–10 · Sessions 45–64 ═══

  { id:45, book:3, lessonRef:"3.1", part:"A", title:"إِنَّ وَأَخَوَاتُهَا (Part 1)", titleEn:"inna & Sisters",
    grammar:'إِنَّ (indeed), أَنَّ (that), لَكِنَّ (but), لَعَلَّ (perhaps). These cause their subject (اسم إِنَّ) to become accusative: إِنَّ الطَّالِبَ مُجْتَهِدٌ.',
    vocab:[{ar:"إِنَّ",en:"indeed/verily"},{ar:"أَنَّ",en:"that (conjunction)"},{ar:"لَكِنَّ",en:"but/however"},{ar:"لَعَلَّ",en:"perhaps/I hope"}]},
  { id:46, book:3, lessonRef:"3.1", part:"B", title:"إِنَّ — Practice (Part 2)", titleEn:"Using inna in Sentences",
    grammar:'إِنَّ: noun after it takes accusative (ـَ), but predicate keeps nominative (ـُ): إِنَّ الْبَيْتَ كَبِيرٌ. Very common in Qur\'anic Arabic.',
    vocab:[{ar:"مُجْتَهِدٌ",en:"hardworking"},{ar:"كَرِيمٌ",en:"generous"},{ar:"صَادِقٌ",en:"truthful"},{ar:"صَعْبٌ",en:"difficult"}]},

  { id:47, book:3, lessonRef:"3.2", part:"A", title:"أَفْعَلُ التَّفْضِيلِ (Part 1)", titleEn:"Comparative & Superlative",
    grammar:'Comparative on أَفْعَلُ pattern: كَبِيرٌ → أَكْبَرُ (bigger), صَغِيرٌ → أَصْغَرُ. With مِنْ = comparative: أَكْبَرُ مِنَ الْقَلَمِ. With الـ = superlative: الْأَكْبَرُ.',
    vocab:[{ar:"أَكْبَرُ",en:"bigger/biggest"},{ar:"أَصْغَرُ",en:"smaller/smallest"},{ar:"أَطْوَلُ",en:"taller/tallest"},{ar:"أَقْصَرُ",en:"shorter/shortest"}]},
  { id:48, book:3, lessonRef:"3.2", part:"B", title:"أَفْعَلُ التَّفْضِيلِ (Part 2)", titleEn:"More Comparatives",
    grammar:'أَفْعَلُ does NOT change for gender: هُوَ أَكْبَرُ, هِيَ أَكْبَرُ. The form is the same for masculine and feminine.',
    vocab:[{ar:"أَجْمَلُ",en:"more/most beautiful"},{ar:"أَحْسَنُ",en:"better/best"},{ar:"أَسْرَعُ",en:"faster/fastest"},{ar:"أَبْعَدُ",en:"farther/farthest"}]},

  { id:49, book:3, lessonRef:"3.3", part:"A", title:"الْأَلْوَانُ (Part 1)", titleEn:"Colors",
    grammar:'Colors follow أَفْعَلُ/فَعْلَاءُ pattern: أَحْمَرُ (red m.), حَمْرَاءُ (red f.). These are diptotes (مَمْنُوعٌ مِنَ الصَّرْفِ): no tanwīn in indefinite.',
    vocab:[{ar:"أَحْمَرُ / حَمْرَاءُ",en:"red (m./f.)"},{ar:"أَزْرَقُ / زَرْقَاءُ",en:"blue (m./f.)"},{ar:"أَخْضَرُ / خَضْرَاءُ",en:"green (m./f.)"},{ar:"أَصْفَرُ / صَفْرَاءُ",en:"yellow (m./f.)"}]},
  { id:50, book:3, lessonRef:"3.3", part:"B", title:"الْأَلْوَانُ (Part 2)", titleEn:"More Colors",
    grammar:'أَبْيَضُ (white), أَسْوَدُ (black). Plural of colors: فُعْلٌ: حُمْرٌ (reds), بِيضٌ (whites), سُودٌ (blacks), خُضْرٌ (greens).',
    vocab:[{ar:"أَبْيَضُ / بَيْضَاءُ",en:"white (m./f.)"},{ar:"أَسْوَدُ / سَوْدَاءُ",en:"black (m./f.)"},{ar:"بُنِّيٌّ",en:"brown"},{ar:"رَمَادِيٌّ",en:"grey"}]},

  { id:51, book:3, lessonRef:"3.4", part:"A", title:"الْأَعْدَادُ ١١–١٥", titleEn:"Numbers 11–15",
    grammar:'Numbers 11–19 are compound. Both parts fixed for 13–19: أَحَدَ عَشَرَ (11), اثْنَا عَشَرَ (12), ثَلَاثَةَ عَشَرَ (13). Counted noun is SINGULAR accusative.',
    vocab:[{ar:"أَحَدَ عَشَرَ",en:"eleven"},{ar:"اثْنَا عَشَرَ",en:"twelve"},{ar:"ثَلَاثَةَ عَشَرَ",en:"thirteen"},{ar:"أَرْبَعَةَ عَشَرَ",en:"fourteen"},{ar:"خَمْسَةَ عَشَرَ",en:"fifteen"}]},
  { id:52, book:3, lessonRef:"3.4", part:"B", title:"الْأَعْدَادُ ١٦–٢٠", titleEn:"Numbers 16–20",
    grammar:'عِشْرُونَ (20) is sound masculine plural form. 21+ = number + وَ + عِشْرُونَ: وَاحِدٌ وَعِشْرُونَ. Counted noun stays singular accusative.',
    vocab:[{ar:"سِتَّةَ عَشَرَ",en:"sixteen"},{ar:"سَبْعَةَ عَشَرَ",en:"seventeen"},{ar:"ثَمَانِيَةَ عَشَرَ",en:"eighteen"},{ar:"تِسْعَةَ عَشَرَ",en:"nineteen"},{ar:"عِشْرُونَ",en:"twenty"}]},

  { id:53, book:3, lessonRef:"3.5", part:"A", title:"كَانَ (Part 1)", titleEn:"The Verb كَانَ",
    grammar:'كَانَ (he was) makes the predicate accusative: كَانَ الطَّالِبُ مُجْتَهِدًا. Conjugation: كَانَ، كَانَتْ، كُنْتُ، كُنْتَ، كُنَّا، كَانُوا.',
    vocab:[{ar:"كَانَ",en:"he was"},{ar:"كَانَتْ",en:"she was"},{ar:"كُنْتُ",en:"I was"},{ar:"كُنَّا",en:"we were"}]},
  { id:54, book:3, lessonRef:"3.5", part:"B", title:"الْوَقْتُ — Telling Time", titleEn:"Telling the Time",
    grammar:'السَّاعَةُ الثَّالِثَةُ (3 o\'clock), السَّاعَةُ الثَّالِثَةُ وَالنِّصْفُ (3:30), إِلَّا رُبْعًا (quarter to). فِي أَيِّ سَاعَةٍ؟ = At what time?',
    vocab:[{ar:"السَّاعَةُ",en:"the hour/o'clock"},{ar:"النِّصْفُ",en:"the half"},{ar:"الرُّبْعُ",en:"the quarter"},{ar:"دَقِيقَةٌ",en:"minute"}]},

  { id:55, book:3, lessonRef:"3.6", part:"A", title:"الْمَجْزُومُ — لَمْ (Part 1)", titleEn:"Jussive Mood with لَمْ",
    grammar:'لَمْ + jussive (الْمَجْزُومُ) negates past: لَمْ يَذْهَبْ (he did not go). Jussive: final ـُ becomes sukūn (ـْ). يَكْتُبُونَ → لَمْ يَكْتُبُوا (ن drops). Very common in Qur\'an and speech.',
    vocab:[{ar:"لَمْ يَذْهَبْ",en:"he did not go"},{ar:"لَمْ يَكْتُبْ",en:"he did not write"},{ar:"لَمْ نَذْهَبْ",en:"we did not go"},{ar:"لَمْ يَكْتُبُوا",en:"they did not write"}]},
  { id:56, book:3, lessonRef:"3.6", part:"B", title:"الْمَجْزُومُ — لَا النَّاهِيَةُ (Part 2)", titleEn:"Prohibition with لَا",
    grammar:'لَا النَّاهِيَةُ (prohibitive لَا) + jussive = don\'t!: لَا تَذْهَبْ (Don\'t go!). لَا تَكْذِبْ (Don\'t lie!). Compare: لَا تَكْتُبُ (habitual negation) vs لَا تَكْتُبْ (command: don\'t write!).',
    vocab:[{ar:"لَا تَذْهَبْ",en:"Don't go! (m.)"},{ar:"لَا تَكْذِبْ",en:"Don't lie!"},{ar:"لَا تَنْسَ",en:"Don't forget!"},{ar:"لَا تَيْأَسْ",en:"Don't despair!"}]},

  { id:57, book:3, lessonRef:"3.7", part:"A", title:"الشَّرْطُ — إِذَا (Part 1)", titleEn:"Conditional Sentences with إِذَا",
    grammar:'إِذَا (if/when) introduces a condition: إِذَا ذَهَبْتَ جِئْتُ (If you go, I will come). Both verbs can be past tense for future meaning. The response clause often begins with فَـ: إِذَا جَاءَ فَأَخْبِرْنِي.',
    vocab:[{ar:"إِذَا",en:"if / when"},{ar:"فَإِنَّ",en:"then indeed"},{ar:"إِذَا جَاءَ",en:"if/when he comes"},{ar:"إِذَا شِئْتَ",en:"if you wish"}]},
  { id:58, book:3, lessonRef:"3.7", part:"B", title:"الشَّرْطُ — إِنْ (Part 2)", titleEn:"Conditional with إِنْ",
    grammar:'إِنْ (if) is used with jussive verbs: إِنْ تَذْهَبْ أَذْهَبْ (If you go, I go). Both verbs take jussive. إِذَا is more common in everyday speech; إِنْ in formal/Qur\'anic Arabic.',
    vocab:[{ar:"إِنْ شَاءَ اللهُ",en:"If Allah wills (God willing)"},{ar:"إِنْ تَفْعَلْ",en:"if you do"},{ar:"إِنْ كَانَ",en:"if it was/is"},{ar:"حِينَئِذٍ",en:"at that time / then"}]},

  { id:59, book:3, lessonRef:"3.8", part:"A", title:"الْمَجْهُولُ (Part 1)", titleEn:"Passive Voice",
    grammar:'Passive voice (الْمَجْهُولُ): pattern changes for present—يُفْعَلُ: يُكْتَبُ (it is written). For past—فُعِلَ: كُتِبَ (it was written). The subject becomes unknown (مَجْهُول). Object becomes subject in nominative.',
    vocab:[{ar:"كُتِبَ",en:"it was written"},{ar:"يُكْتَبُ",en:"it is written"},{ar:"قُرِئَ",en:"it was read"},{ar:"يُعْطَى",en:"it is given"}]},
  { id:60, book:3, lessonRef:"3.8", part:"B", title:"الْمَجْهُولُ (Part 2)", titleEn:"Passive Voice Practice",
    grammar:'More passive forms. The passive subject (النَّائِبُ عَنِ الْفَاعِلِ) takes nominative: الْكِتَابُ كُتِبَ (The book was written). Preposition phrases can also be promoted: ضُرِبَ بِهِ (He was hit with it).',
    vocab:[{ar:"فُتِحَ",en:"it was opened"},{ar:"يُفْتَحُ",en:"it is opened"},{ar:"بُنِيَ",en:"it was built"},{ar:"يُبْنَى",en:"it is built"}]},

  { id:61, book:3, lessonRef:"3.9", part:"A", title:"الْمَصْدَرُ (Part 1)", titleEn:"Verbal Nouns",
    grammar:'The verbal noun (الْمَصْدَرُ) is derived from a verb root. Form I pattern varies: كَتَبَ → كِتَابَةٌ (writing), ذَهَبَ → ذَهَابٌ (going), قَرَأَ → قِرَاءَةٌ (reading). Masdar used like a noun or verb.',
    vocab:[{ar:"كِتَابَةٌ",en:"writing (n.)"},{ar:"قِرَاءَةٌ",en:"reading (n.)"},{ar:"ذَهَابٌ",en:"going (n.)"},{ar:"دِرَاسَةٌ",en:"studying (n.)"}]},
  { id:62, book:3, lessonRef:"3.9", part:"B", title:"الْمَصْدَرُ (Part 2)", titleEn:"Using Verbal Nouns",
    grammar:'Maṣdar used with prepositions: بَعْدَ الْكِتَابَةِ (after writing), قَبْلَ الذَّهَابِ (before going). With بِدُونِ (without): بِدُونِ دِرَاسَةٍ (without studying). Forms a key structure in Arabic.',
    vocab:[{ar:"بَعْدَ",en:"after"},{ar:"قَبْلَ",en:"before"},{ar:"بِدُونِ",en:"without"},{ar:"عِنْدَ الْوُصُولِ",en:"upon arrival"}]},

  { id:63, book:3, lessonRef:"3.10", part:"A", title:"مُرَاجَعَةُ كِتَابٍ ٣ (Part 1)", titleEn:"Book 3 Review (Part 1)",
    grammar:'Review: إِنَّ sisters, أَفْعَلُ comparative, colors (diptotes), numbers 11-20, كَانَ, jussive (لَمْ + لَا النَّاهِيَةُ), conditional (إِذَا / إِنْ).',
    vocab:[{ar:"إِنَّ الدَّرْسَ سَهْلٌ",en:"Indeed the lesson is easy"},{ar:"لَمْ يَفْهَمْ",en:"he did not understand"},{ar:"إِذَا دَرَسْتَ",en:"if you studied"},{ar:"أَحْسَنُ مِنْ",en:"better than"}]},
  { id:64, book:3, lessonRef:"3.10", part:"B", title:"مُرَاجَعَةُ كِتَابٍ ٣ (Part 2)", titleEn:"Book 3 Review (Part 2)",
    grammar:'Review: passive voice, verbal nouns (maṣdar), telling time. Full sentence building combining Book 3 structures with earlier vocabulary.',
    vocab:[{ar:"يُقْرَأُ",en:"it is read"},{ar:"دِرَاسَةٌ",en:"studying"},{ar:"السَّاعَةُ الْعَاشِرَةُ",en:"ten o'clock"},{ar:"بَعْدَ الدِّرَاسَةِ",en:"after studying"}]},

// ═══ BOOK 4 · Lessons 1–10 · Sessions 65–84 ═══

  { id:65, book:4, lessonRef:"4.1", part:"A", title:"جَمْعُ الْمُذَكَّرِ السَّالِمِ", titleEn:"Sound Masculine Plural (ـُونَ / ـِينَ)",
    grammar:'Sound masculine plural: add ـُونَ (nom.) or ـِينَ (acc./gen.): مُدَرِّسٌ → مُدَرِّسُونَ. Only for rational masculine beings. The tanwīn and ـٌ of singular are removed.',
    vocab:[{ar:"مُدَرِّسُونَ",en:"teachers (m.)"},{ar:"طَالِبُونَ",en:"students (m.)"},{ar:"مُهَنْدِسُونَ",en:"engineers"},{ar:"مُسْلِمُونَ",en:"Muslims (m.)"}]},
  { id:66, book:4, lessonRef:"4.1", part:"B", title:"جَمْعُ الْمُؤَنَّثِ السَّالِمِ", titleEn:"Sound Feminine Plural (ـَاتٌ)",
    grammar:'Sound feminine plural: replace ةٌ with ـَاتٌ: مُدَرِّسَةٌ → مُدَرِّسَاتٌ. In acc./gen.: ـَاتٍ (kasra, NOT fatḥa — special rule!): رَأَيْتُ الطَّالِبَاتِ.',
    vocab:[{ar:"مُدَرِّسَاتٌ",en:"teachers (f.)"},{ar:"طَالِبَاتٌ",en:"students (f.)"},{ar:"سَيَّارَاتٌ",en:"cars"},{ar:"مَدَارِسُ",en:"schools (broken pl.)"}]},

  { id:67, book:4, lessonRef:"4.2", part:"A", title:"جَمْعُ التَّكْسِيرِ (Part 1)", titleEn:"Broken Plurals (Part 1)",
    grammar:'Broken plurals change internal structure. فُعُولٌ: كِتَابٌ → كُتُبٌ, دَرْسٌ → دُرُوسٌ. أَفْعَالٌ: قَلَمٌ → أَقْلَامٌ, بَابٌ → أَبْوَابٌ. Must be memorised.',
    vocab:[{ar:"كُتُبٌ",en:"books"},{ar:"دُرُوسٌ",en:"lessons"},{ar:"أَقْلَامٌ",en:"pens"},{ar:"أَبْوَابٌ",en:"doors"}]},
  { id:68, book:4, lessonRef:"4.2", part:"B", title:"جَمْعُ التَّكْسِيرِ (Part 2)", titleEn:"Broken Plurals (Part 2)",
    grammar:'More patterns: فِعَالٌ: رَجُلٌ → رِجَالٌ. فُعَلَاءُ: طَبِيبٌ → أَطِبَّاءُ. مَفَاعِلُ: مَسْجِدٌ → مَسَاجِدُ (diptote). Non-human plurals take feminine singular agreement!',
    vocab:[{ar:"رِجَالٌ",en:"men"},{ar:"أَطِبَّاءُ",en:"doctors"},{ar:"مَسَاجِدُ",en:"mosques"},{ar:"أَنْبِيَاءُ",en:"prophets"}]},

  { id:69, book:4, lessonRef:"4.3", part:"A", title:"الْجُمْلَةُ الْفِعْلِيَّةُ (Part 1)", titleEn:"Verbal Sentences & Accusative",
    grammar:'Verbal sentences start with verb: ذَهَبَ الطَّالِبُ. Subject (الْفَاعِلُ) is nominative (ـُ). Object (الْمَفْعُولُ بِهِ) is accusative (ـَ): كَتَبَ الطَّالِبُ الدَّرْسَ.',
    vocab:[{ar:"الْفَاعِلُ",en:"subject (doer)"},{ar:"الْمَفْعُولُ بِهِ",en:"direct object"},{ar:"كَتَبَ الدَّرْسَ",en:"wrote the lesson (acc.)"},{ar:"فَتَحَ الْبَابَ",en:"opened the door (acc.)"}]},
  { id:70, book:4, lessonRef:"4.3", part:"B", title:"الْجُمْلَةُ الْفِعْلِيَّةُ (Part 2)", titleEn:"Object Pronoun Suffixes",
    grammar:'Object pronouns attach to verbs: ضَرَبَهُ (he hit him), كَتَبَهَا (he wrote it f.), سَأَلَنِي (he asked me). Same suffixes on prepositions: فِيهِ, عَلَيْهِ.',
    vocab:[{ar:"ضَرَبَهُ",en:"he hit him/it"},{ar:"كَتَبَهَا",en:"he wrote it (f.)"},{ar:"سَأَلَنِي",en:"he asked me"},{ar:"فَهِمُوهُ",en:"they understood it"}]},

  { id:71, book:4, lessonRef:"4.4", part:"A", title:"أُرِيدُ أَنْ... (Part 1)", titleEn:"I Want To... (Subjunctive)",
    grammar:'After أَنْ (to), present tense takes subjunctive (الْمَنْصُوبُ): final ـُ → ـَ, يَفْعَلُونَ loses ن: أُرِيدُ أَنْ أَكْتُبَ (I want to write).',
    vocab:[{ar:"أُرِيدُ أَنْ أَكْتُبَ",en:"I want to write"},{ar:"أُرِيدُ أَنْ أَذْهَبَ",en:"I want to go"},{ar:"يُمْكِنُ أَنْ",en:"it is possible to"},{ar:"لَنْ يَذْهَبَ",en:"he will not go"}]},
  { id:72, book:4, lessonRef:"4.4", part:"B", title:"لِأَنَّ وَلِـ (Part 2)", titleEn:"Because & Purpose",
    grammar:'لِأَنَّ (because): ذَهَبْتُ لِأَنَّ الْجَوَّ جَمِيلٌ. لِـ of purpose + subjunctive: جِئْتُ لِأَكْتُبَ (I came to write). This lām causes subjunctive in following verb.',
    vocab:[{ar:"لِأَنَّ",en:"because"},{ar:"جِئْتُ لِأَكْتُبَ",en:"I came to write"},{ar:"مُنْذُ",en:"since/for (time)"},{ar:"مُنْذُ أُسْبُوعٍ",en:"for a week"}]},

  { id:73, book:4, lessonRef:"4.5", part:"A", title:"الْفُصُولُ وَالطَّقْسُ (Part 1)", titleEn:"Seasons & Weather",
    grammar:'Four seasons: الرَّبِيعُ (spring), الصَّيْفُ (summer), الْخَرِيفُ (autumn), الشِّتَاءُ (winter). Weather adjectives: حَارٌّ (hot), بَارِدٌ (cold), مُشْمِسٌ (sunny), مَاطِرٌ (rainy).',
    vocab:[{ar:"الرَّبِيعُ",en:"spring"},{ar:"الصَّيْفُ",en:"summer"},{ar:"الْخَرِيفُ",en:"autumn"},{ar:"الشِّتَاءُ",en:"winter"}]},
  { id:74, book:4, lessonRef:"4.5", part:"B", title:"الطَّقْسُ (Part 2)", titleEn:"Weather Expressions",
    grammar:'Weather sentences: الْجَوُّ حَارٌّ (the weather is hot). تَمْطُرُ السَّمَاءُ (it is raining). Review كَانَ with weather: كَانَ الطَّقْسُ بَارِدًا (The weather was cold).',
    vocab:[{ar:"الْجَوُّ حَارٌّ",en:"the weather is hot"},{ar:"الْجَوُّ بَارِدٌ",en:"the weather is cold"},{ar:"تَمْطُرُ",en:"it rains"},{ar:"ثَلْجٌ",en:"snow"}]},

  { id:75, book:4, lessonRef:"4.6", part:"A", title:"الْفِعْلُ الثُّلَاثِيُّ الْمَزِيدُ — بَابُ فَعَّلَ", titleEn:"Verb Form II (فَعَّلَ)",
    grammar:'Form II doubles the middle radical: كَتَبَ → كَتَّبَ (to make write/dictate). Meanings: intensive, causative, or denominative. Present tense: يُفَعِّلُ. Masdar: تَفْعِيلٌ.',
    vocab:[{ar:"دَرَّسَ",en:"he taught (caused to study)"},{ar:"عَلَّمَ",en:"he taught/trained"},{ar:"كَبَّرَ",en:"he enlarged/said Allahu Akbar"},{ar:"قَدَّمَ",en:"he presented/offered"}]},
  { id:76, book:4, lessonRef:"4.6", part:"B", title:"بَابُ فَعَّلَ — Practice (Part 2)", titleEn:"Form II in Sentences",
    grammar:'Form II passive: فُعِّلَ, present يُفَعَّلُ. Common Form II verbs: سَمَّى (named), رَتَّبَ (arranged), حَسَّنَ (improved). Maṣdar تَفْعِيلٌ: تَدْرِيسٌ (teaching), تَعْلِيمٌ (education).',
    vocab:[{ar:"تَدْرِيسٌ",en:"teaching (n.)"},{ar:"تَعْلِيمٌ",en:"education"},{ar:"تَرْتِيبٌ",en:"arrangement"},{ar:"تَقْدِيمٌ",en:"presentation"}]},

  { id:77, book:4, lessonRef:"4.7", part:"A", title:"بَابُ أَفْعَلَ — Form IV (Part 1)", titleEn:"Verb Form IV (أَفْعَلَ)",
    grammar:'Form IV adds أَ- prefix: ذَهَبَ → أَذْهَبَ (to cause to go). Often causative. Present: يُفْعِلُ. Masdar: إِفْعَالٌ. Very common: أَسْلَمَ (he submitted/became Muslim), أَعْطَى (he gave).',
    vocab:[{ar:"أَسْلَمَ",en:"he submitted (became Muslim)"},{ar:"أَرْسَلَ",en:"he sent"},{ar:"أَخْرَجَ",en:"he brought out"},{ar:"أَنْزَلَ",en:"he sent down/revealed"}]},
  { id:78, book:4, lessonRef:"4.7", part:"B", title:"بَابُ أَفْعَلَ — Practice (Part 2)", titleEn:"Form IV in Sentences",
    grammar:'Form IV masdar: إِفْعَالٌ: إِسْلَامٌ (submission/Islam), إِرْسَالٌ (sending), إِخْرَاجٌ (bringing out). Present passive: يُفْعَلُ. These forms appear heavily in Qur\'anic vocabulary.',
    vocab:[{ar:"إِسْلَامٌ",en:"submission/Islam"},{ar:"إِيمَانٌ",en:"faith/belief"},{ar:"إِنْزَالٌ",en:"sending down"},{ar:"إِعْطَاءٌ",en:"giving"}]},

  { id:79, book:4, lessonRef:"4.8", part:"A", title:"اسْمُ الْفَاعِلِ (Part 1)", titleEn:"Active Participle",
    grammar:'Active participle (اسْمُ الْفَاعِلِ): Form I → فَاعِلٌ: كَتَبَ → كَاتِبٌ (writer). Used as noun or adjective. Feminine: كَاتِبَةٌ. Plural: كُتَّابٌ (broken) or كَاتِبُونَ (sound).',
    vocab:[{ar:"كَاتِبٌ",en:"writer/writing (m.)"},{ar:"طَالِبٌ",en:"seeker/student"},{ar:"مُؤْمِنٌ",en:"believer (Form IV)"},{ar:"مُسْلِمٌ",en:"Muslim/submitting"}]},
  { id:80, book:4, lessonRef:"4.8", part:"B", title:"اسْمُ الْمَفْعُولِ (Part 2)", titleEn:"Passive Participle",
    grammar:'Passive participle (اسْمُ الْمَفْعُولِ): Form I → مَفْعُولٌ: كَتَبَ → مَكْتُوبٌ (written). Form II/IV: prefix مُـ + verb with fatḥa on penultimate: مُدَرِّسٌ → مُدَرَّسٌ (taught).',
    vocab:[{ar:"مَكْتُوبٌ",en:"written"},{ar:"مَفْهُومٌ",en:"understood"},{ar:"مَعْرُوفٌ",en:"known/recognised"},{ar:"مَحْبُوبٌ",en:"beloved/liked"}]},

  { id:81, book:4, lessonRef:"4.9", part:"A", title:"لَوْ وَلَوْلَا (Part 1)", titleEn:"Hypothetical Conditionals",
    grammar:'لَوْ (if — contrary to fact): لَوْ دَرَسْتَ لَنَجَحْتَ (If you had studied, you would have passed). Both verbs in past tense. Response has لَـ prefix. لَوْلَا (if not for): لَوْلَا اللهُ مَا هُدِينَا.',
    vocab:[{ar:"لَوْ",en:"if (hypothetical)"},{ar:"لَوْلَا",en:"if not for / but for"},{ar:"لَنَجَحْتَ",en:"you would have passed"},{ar:"لَمَا",en:"then...not (response)"}]},
  { id:82, book:4, lessonRef:"4.9", part:"B", title:"لَوْ — Practice (Part 2)", titleEn:"Hypothetical Conditionals Practice",
    grammar:'More لَوْ sentences. لَوْ كَانَ عِنْدِي مَالٌ لَاشْتَرَيْتُ (If I had money I would have bought). Contrast with إِذَا (real condition) vs لَوْ (imagined/impossible condition).',
    vocab:[{ar:"لَوْ كَانَ",en:"if it were/had been"},{ar:"لَاشْتَرَيْتُ",en:"I would have bought"},{ar:"لَوْ شِئْتُ",en:"if I had wanted"},{ar:"لَوْ أَرَدْتَ",en:"if you had wanted"}]},

  { id:83, book:4, lessonRef:"4.10", part:"A", title:"مُرَاجَعَةٌ نِهَائِيَّةٌ (Part 1)", titleEn:"Final Review (Part 1)",
    grammar:'Review: sound plurals (ـُونَ / ـَاتٌ), broken plurals, verbal sentence cases, object pronouns, subjunctive (أَنْ), Form II (فَعَّلَ), Form IV (أَفْعَلَ), active/passive participles.',
    vocab:[{ar:"مُعَلِّمٌ",en:"teacher (Form II active participle)"},{ar:"مُتَعَلِّمٌ",en:"learner (Form V)"},{ar:"مُرْسَلٌ",en:"sent/messenger (Form IV passive)"},{ar:"مَحْبُوبٌ",en:"beloved"}]},
  { id:84, book:4, lessonRef:"4.10", part:"B", title:"مُرَاجَعَةٌ نِهَائِيَّةٌ (Part 2)", titleEn:"Final Review (Part 2)",
    grammar:'Comprehensive review of all 4 books. From basic هَذَا sentences to complex verbal sentences with moods, plurals, and derived verb forms. You have covered the complete Madinah Arabic Reader curriculum!',
    vocab:[{ar:"الْحَمْدُ لِلَّهِ",en:"All praise is for Allah"},{ar:"بَارَكَ اللهُ فِيكَ",en:"May Allah bless you"},{ar:"جَزَاكَ اللهُ خَيْرًا",en:"May Allah reward you with good"},{ar:"إِنْ شَاءَ اللهُ",en:"God willing"}]},
];

// ──────────────────────────────────────────────
// REVIEW SESSIONS (8 reviews, one after every 5 lessons)
// Each has grammarExercises (5) + sentenceTiles (5)
// Pre-baked tiles: already placed, tappable to toggle Arabic↔English
// ──────────────────────────────────────────────
const REVIEWS = [
  // R1: After B1 L1-5 (sessions 1-10) · focuses on هَذَا/ذَلِكَ, الـ, adjectives, prepositions
  { id:"r1", type:"review", coversLessons:"B1 L1–5",
    titleEn:"Review: Demonstratives, الـ, Adjectives & Prepositions",
    grammarExercises:[
      { type:"grammar_mcq", promptEn:'Which word means "this" for a masculine noun?', correct:"هَذَا", options:["هَذَا","هَذِهِ","ذَلِكَ","تِلْكَ"] },
      { type:"grammar_mcq", promptEn:'Choose the correct definite form of قَلَمٌ (pen):', correct:"الْقَلَمُ", options:["الْقَلَمُ","الْقَلَمٌ","اَلْقَلَمِ","قَلَمُ"] },
      { type:"grammar_mcq", promptEn:'Complete: الْبَيْتُ ___ (the big house — definite adjective):', correct:"الْكَبِيرُ", options:["الْكَبِيرُ","كَبِيرٌ","كَبِيرُ","الْكَبِيرٌ"] },
      { type:"grammar_mcq", promptEn:'Which preposition means "on"?', correct:"عَلَى", options:["عَلَى","فِي","مِنْ","تَحْتَ"] },
      { type:"grammar_err", promptEn:'Find the error: "هَذِهِ بَيْتٌ كَبِيرٌ" (بَيْتٌ is masculine)', correct:"هَذَا", options:["هَذَا","هَذِهِ","بَيْتٌ","كَبِيرٌ"] },
    ],
    sentenceTiles:[
      { en:"This is a new book.", answer:["هَذَا","كِتَابٌ","جَدِيدٌ"], tiles:["هَذَا","كِتَابٌ","جَدِيدٌ","قَلَمٌ","ذَلِكَ"], prebaked:[] },
      { en:"The pen is on the desk.", answer:["الْقَلَمُ","عَلَى","الْمَكْتَبِ"], tiles:["الْقَلَمُ","عَلَى","الْمَكْتَبِ","تَحْتَ","الْكِتَابُ"], prebaked:[] },
      { en:"That is a small chair.", answer:["ذَلِكَ","كُرْسِيٌّ","صَغِيرٌ"], tiles:["ذَلِكَ","كُرْسِيٌّ","صَغِيرٌ","هَذَا","كَبِيرٌ"], prebaked:[] },
      { en:"This is a beautiful garden.", answer:["هَذِهِ","حَدِيقَةٌ","جَمِيلَةٌ"], tiles:["هَذِهِ","جَمِيلَةٌ"], prebaked:[{ar:"حَدِيقَةٌ",en:"garden"}] },
      { en:"The star is above the house.", answer:["النَّجْمُ","فَوْقَ","الْبَيْتِ"], tiles:["النَّجْمُ","فَوْقَ","الْبَيْتِ","تَحْتَ","الشَّمْسُ"], prebaked:[] },
    ]},

  // R2: After B1 L6-10 (sessions 11-20) · pronouns, feminine, iḍāfa, family, الذي
  { id:"r2", type:"review", coversLessons:"B1 L6–10",
    titleEn:"Review: Pronouns, Feminine, Iḍāfa & Relative Pronoun",
    grammarExercises:[
      { type:"grammar_mcq", promptEn:'Which pronoun means "she"?', correct:"هِيَ", options:["هِيَ","هُوَ","أَنَا","أَنْتَ"] },
      { type:"grammar_mcq", promptEn:'Feminine form of مُدَرِّسٌ (teacher):', correct:"مُدَرِّسَةٌ", options:["مُدَرِّسَةٌ","مُدَرِّسٌ","مُدَرِّسِي","مُدَرِّسَات"] },
      { type:"grammar_mcq", promptEn:'In the iḍāfa كِتَابُ الطَّالِبِ, the second noun takes:', correct:"genitive (ـِ)", options:["genitive (ـِ)","nominative (ـُ)","accusative (ـَ)","no case ending"] },
      { type:"grammar_mcq", promptEn:'الَّذِي is used for which type of noun?', correct:"masculine singular", options:["masculine singular","feminine singular","masculine plural","any noun"] },
      { type:"grammar_err", promptEn:'Find the error: "هُوَ مُدَرِّسَةٌ" (هُوَ = he)', correct:"مُدَرِّسٌ", options:["مُدَرِّسٌ","مُدَرِّسَةٌ","هُوَ","هِيَ"] },
    ],
    sentenceTiles:[
      { en:"She is a doctor.", answer:["هِيَ","طَبِيبَةٌ"], tiles:["هِيَ","طَبِيبَةٌ","هُوَ","طَبِيبٌ"], prebaked:[] },
      { en:"The boy's room is big.", answer:["غُرْفَةُ","الْوَلَدِ","كَبِيرَةٌ"], tiles:["غُرْفَةُ","الْوَلَدِ","كَبِيرَةٌ","صَغِيرَةٌ","الْبَيْتُ"], prebaked:[] },
      { en:"My father is in the house.", answer:["أَبِي","فِي","الْبَيْتِ"], tiles:["أَبِي","فِي","الْبَيْتِ","عَلَى","أُمِّي"], prebaked:[] },
      { en:"The student who is in the classroom is new.", answer:["الطَّالِبُ","الَّذِي","فِي","الْفَصْلِ","جَدِيدٌ"], tiles:["الطَّالِبُ","الَّذِي","فِي","الْفَصْلِ","جَدِيدٌ","قَدِيمٌ"], prebaked:[] },
      { en:"He is a generous merchant.", answer:["هُوَ","تَاجِرٌ","كَرِيمٌ"], tiles:["هُوَ","تَاجِرٌ","كَرِيمٌ","بَخِيلٌ"], prebaked:[{ar:"كَرِيمٌ",en:"generous"}] },
    ]},

  // R3: After B2 L1-5 (sessions 21-30) · present tense, imperative, days of week, plural pronouns
  { id:"r3", type:"review", coversLessons:"B2 L1–5",
    titleEn:"Review: Present Tense, Imperatives & Days of Week",
    grammarExercises:[
      { type:"grammar_mcq", promptEn:'Present tense of "he goes" (root ذ-هـ-ب):', correct:"يَذْهَبُ", options:["يَذْهَبُ","أَذْهَبُ","تَذْهَبُ","نَذْهَبُ"] },
      { type:"grammar_mcq", promptEn:'Imperative "Write!" (masculine singular):', correct:"اُكْتُبْ", options:["اُكْتُبْ","اُكْتُبِي","اُكْتُبُوا","تَكْتُبُ"] },
      { type:"grammar_mcq", promptEn:'Which day comes after يَوْمُ الْأَرْبِعَاءِ (Wednesday)?', correct:"يَوْمُ الْخَمِيسِ", options:["يَوْمُ الْخَمِيسِ","يَوْمُ الثُّلَاثَاءِ","يَوْمُ الْجُمُعَةِ","يَوْمُ السَّبْتِ"] },
      { type:"grammar_mcq", promptEn:'"They write" (masculine plural — هُمْ):', correct:"يَكْتُبُونَ", options:["يَكْتُبُونَ","نَكْتُبُ","تَكْتُبُونَ","يَكْتُبَانِ"] },
      { type:"grammar_err", promptEn:'Find the error: "أَنَا تَكْتُبُ" (أَنَا = I)', correct:"أَكْتُبُ", options:["أَكْتُبُ","تَكْتُبُ","يَكْتُبُ","نَكْتُبُ"] },
    ],
    sentenceTiles:[
      { en:"The student reads the book.", answer:["الطَّالِبُ","يَقْرَأُ","الْكِتَابَ"], tiles:["الطَّالِبُ","يَقْرَأُ","الْكِتَابَ","يَكْتُبُ","الْقَلَمُ"], prebaked:[] },
      { en:"Open the door! (plural)", answer:["اِفْتَحُوا","الْبَابَ"], tiles:["اِفْتَحُوا","الْبَابَ","اُكْتُبُوا","الْكِتَابَ"], prebaked:[] },
      { en:"I go to school on Friday.", answer:["أَذْهَبُ","إِلَى","الْمَدْرَسَةِ","يَوْمَ","الْجُمُعَةِ"], tiles:["أَذْهَبُ","إِلَى","الْمَدْرَسَةِ","يَوْمَ","الْجُمُعَةِ","السَّبْتِ"], prebaked:[] },
      { en:"These two students go to the mosque.", answer:["هَذَانِ","الطَّالِبَانِ","يَذْهَبَانِ","إِلَى","الْمَسْجِدِ"], tiles:["هَذَانِ","الطَّالِبَانِ","يَذْهَبَانِ","إِلَى","الْمَسْجِدِ"], prebaked:[{ar:"يَذْهَبَانِ",en:"the two go"}] },
      { en:"Listen! (to a group)", answer:["اِسْمَعُوا"], tiles:["اِسْمَعُوا","اِسْمَعْ","اِسْمَعِي"], prebaked:[] },
    ]},

  // R4: After B2 L6-10 (sessions 31-40) · numbers, past tense, negation, question words
  { id:"r4", type:"review", coversLessons:"B2 L6–10",
    titleEn:"Review: Numbers, Past Tense, Negation & Questions",
    grammarExercises:[
      { type:"grammar_mcq", promptEn:'How do you say "he did not go" using لَمْ?', correct:"لَمْ يَذْهَبْ", options:["لَمْ يَذْهَبْ","لَمْ يَذْهَبُ","مَا يَذْهَبُ","لَا ذَهَبَ"] },
      { type:"grammar_mcq", promptEn:'"Three books" — correct Arabic (3 = masculine noun, books = masculine):', correct:"ثَلَاثَةُ كُتُبٍ", options:["ثَلَاثَةُ كُتُبٍ","ثَلَاثُ كُتُبٍ","ثَلَاثَةٌ كُتُبٌ","كُتُبٌ ثَلَاثَةٌ"] },
      { type:"grammar_mcq", promptEn:'Past tense "she went" (root ذ-هـ-ب):', correct:"ذَهَبَتْ", options:["ذَهَبَتْ","ذَهَبَ","ذَهَبْتُ","تَذْهَبُ"] },
      { type:"grammar_mcq", promptEn:'Which question word means "why"?', correct:"لِمَاذَا", options:["لِمَاذَا","مَاذَا","كَيْفَ","مَتَى"] },
      { type:"grammar_err", promptEn:'Find the error: "لَيْسَ هُوَ طَالِبٌ" (after لَيْسَ = accusative)', correct:"طَالِبًا", options:["طَالِبًا","طَالِبٌ","هُوَ","لَيْسَ"] },
    ],
    sentenceTiles:[
      { en:"He did not write the lesson.", answer:["لَمْ","يَكْتُبْ","الدَّرْسَ"], tiles:["لَمْ","يَكْتُبْ","الدَّرْسَ","مَا","الطَّالِبُ"], prebaked:[] },
      { en:"Why are you going to school?", answer:["لِمَاذَا","تَذْهَبُ","إِلَى","الْمَدْرَسَةِ؟"], tiles:["لِمَاذَا","تَذْهَبُ","إِلَى","الْمَدْرَسَةِ؟","أَيْنَ","مَاذَا"], prebaked:[] },
      { en:"I have five books.", answer:["عِنْدِي","خَمْسَةُ","كُتُبٍ"], tiles:["عِنْدِي","خَمْسَةُ","كُتُبٍ","سَبْعَةُ","أَقْلَامٍ"], prebaked:[] },
      { en:"They went to the mosque on Friday.", answer:["ذَهَبُوا","إِلَى","الْمَسْجِدِ","يَوْمَ","الْجُمُعَةِ"], tiles:["ذَهَبُوا","إِلَى","الْمَسْجِدِ","يَوْمَ","الْجُمُعَةِ","السَّبْتِ"], prebaked:[] },
      { en:"He is not a student.", answer:["لَيْسَ","طَالِبًا"], tiles:["لَيْسَ","طَالِبًا","طَالِبٌ","هُوَ"], prebaked:[{ar:"لَيْسَ",en:"is not"}] },
    ]},

  // R5: After B2 L11-12 + B3 L1-3 (sessions 41-50) · indirect objects, comparative, colors, إِنَّ
  { id:"r5", type:"review", coversLessons:"B2 L11–12 + B3 L1–3",
    titleEn:"Review: Indirect Objects, Comparative, Colors & إِنَّ",
    grammarExercises:[
      { type:"grammar_mcq", promptEn:'After إِنَّ, the noun takes:', correct:"accusative (ـَ)", options:["accusative (ـَ)","nominative (ـُ)","genitive (ـِ)","no change"] },
      { type:"grammar_mcq", promptEn:'Comparative of جَمِيلٌ (beautiful):', correct:"أَجْمَلُ", options:["أَجْمَلُ","جَمِيلَةٌ","أَجْمَلٌ","جَمِيلٌ"] },
      { type:"grammar_mcq", promptEn:'Feminine form of أَحْمَرُ (red):', correct:"حَمْرَاءُ", options:["حَمْرَاءُ","أَحْمَرَةٌ","أَحْمَرُ","حَمْرَاءٌ"] },
      { type:"grammar_mcq", promptEn:'"I have a book" in Arabic:', correct:"عِنْدِي كِتَابٌ", options:["عِنْدِي كِتَابٌ","لِي كِتَابُ","أَنَا كِتَابٌ","كِتَابٌ عِنْدَ"] },
      { type:"grammar_err", promptEn:'Find the error: "إِنَّ الْبَيْتُ كَبِيرٌ" (after إِنَّ = accusative)', correct:"الْبَيْتَ", options:["الْبَيْتَ","الْبَيْتُ","كَبِيرٌ","إِنَّ"] },
    ],
    sentenceTiles:[
      { en:"Indeed the student is hardworking.", answer:["إِنَّ","الطَّالِبَ","مُجْتَهِدٌ"], tiles:["إِنَّ","الطَّالِبَ","الطَّالِبُ","مُجْتَهِدٌ","كَسُولٌ"], prebaked:[] },
      { en:"The book is bigger than the pen.", answer:["الْكِتَابُ","أَكْبَرُ","مِنَ","الْقَلَمِ"], tiles:["الْكِتَابُ","أَكْبَرُ","مِنَ","الْقَلَمِ","أَصْغَرُ"], prebaked:[] },
      { en:"I gave him the book.", answer:["أَعْطَيْتُهُ","الْكِتَابَ"], tiles:["أَعْطَيْتُهُ","الْكِتَابَ","الْقَلَمَ","أَخَذْتُهُ"], prebaked:[] },
      { en:"She has a red car.", answer:["عِنْدَهَا","سَيَّارَةٌ","حَمْرَاءُ"], tiles:["عِنْدَهَا","سَيَّارَةٌ","حَمْرَاءُ","زَرْقَاءُ"], prebaked:[] },
      { en:"This is the best book.", answer:["هَذَا","الْكِتَابُ","الْأَحْسَنُ"], tiles:["هَذَا","الْكِتَابُ","الْأَحْسَنُ","الْأَكْبَرُ"], prebaked:[{ar:"الْأَحْسَنُ",en:"the best"}] },
    ]},

  // R6: After B3 L4-8 (sessions 51-60) · numbers 11-20, كَانَ, jussive, conditional, passive
  { id:"r6", type:"review", coversLessons:"B3 L4–8",
    titleEn:"Review: Numbers 11–20, كَانَ, Jussive & Passive",
    grammarExercises:[
      { type:"grammar_mcq", promptEn:'How many students does خَمْسَةَ عَشَرَ طَالِبًا mean?', correct:"15 students", options:["15 students","13 students","50 students","5 students"] },
      { type:"grammar_mcq", promptEn:'كَانَ الطَّالِبُ ___ (hardworking — after كَانَ = accusative):', correct:"مُجْتَهِدًا", options:["مُجْتَهِدًا","مُجْتَهِدٌ","مُجْتَهِدِ","مُجْتَهِدَةً"] },
      { type:"grammar_mcq", promptEn:'Passive past tense of كَتَبَ (he wrote):', correct:"كُتِبَ", options:["كُتِبَ","يُكْتَبُ","كَتَّبَ","كَاتِبٌ"] },
      { type:"grammar_mcq", promptEn:'لَا تَذْهَبْ means:', correct:"Don't go! (prohibition)", options:["Don't go! (prohibition)","He does not go","He did not go","You go"] },
      { type:"grammar_err", promptEn:'Find error: "إِذَا ذَهَبَ فَأَنَا يَذْهَبُ" (I = أَنَا, so verb should be 1st person)', correct:"أَذْهَبُ", options:["أَذْهَبُ","يَذْهَبُ","تَذْهَبُ","نَذْهَبُ"] },
    ],
    sentenceTiles:[
      { en:"The teacher was in the school.", answer:["كَانَ","الْمُدَرِّسُ","فِي","الْمَدْرَسَةِ"], tiles:["كَانَ","الْمُدَرِّسُ","فِي","الْمَدْرَسَةِ","الْمَسْجِدِ"], prebaked:[] },
      { en:"The lesson was written.", answer:["كُتِبَ","الدَّرْسُ"], tiles:["كُتِبَ","الدَّرْسُ","كَتَبَ","الطَّالِبُ"], prebaked:[] },
      { en:"If you study, you will succeed.", answer:["إِذَا","دَرَسْتَ","نَجَحْتَ"], tiles:["إِذَا","دَرَسْتَ","نَجَحْتَ","رَسَبْتَ"], prebaked:[{ar:"نَجَحْتَ",en:"you succeeded"}] },
      { en:"Don't forget the lesson!", answer:["لَا","تَنْسَ","الدَّرْسَ"], tiles:["لَا","تَنْسَ","الدَّرْسَ","تَقْرَأْ","الْكِتَابَ"], prebaked:[] },
      { en:"There are thirteen students in the class.", answer:["فِي","الْفَصْلِ","ثَلَاثَةَ","عَشَرَ","طَالِبًا"], tiles:["فِي","الْفَصْلِ","ثَلَاثَةَ","عَشَرَ","طَالِبًا","خَمْسَةَ"], prebaked:[] },
    ]},

  // R7: After B3 L9-10 + B4 L1-3 (sessions 61-70) · verbal nouns, sound/broken plurals, verbal sentence
  { id:"r7", type:"review", coversLessons:"B3 L9–10 + B4 L1–3",
    titleEn:"Review: Verbal Nouns, Plurals & Verbal Sentences",
    grammarExercises:[
      { type:"grammar_mcq", promptEn:'Verbal noun (masdar) of ذَهَبَ (to go):', correct:"ذَهَابٌ", options:["ذَهَابٌ","ذَهَبَ","يَذْهَبُ","ذَاهِبٌ"] },
      { type:"grammar_mcq", promptEn:'Sound masculine plural of مُسْلِمٌ:', correct:"مُسْلِمُونَ", options:["مُسْلِمُونَ","مُسْلِمَاتٌ","مُسْلِمَانِ","مَسَالِمُ"] },
      { type:"grammar_mcq", promptEn:'Broken plural of كِتَابٌ (book):', correct:"كُتُبٌ", options:["كُتُبٌ","كِتَابَانِ","كِتَابُونَ","أَكْتَابٌ"] },
      { type:"grammar_mcq", promptEn:'In a verbal sentence, the direct object takes:', correct:"accusative (ـَ)", options:["accusative (ـَ)","nominative (ـُ)","genitive (ـِ)","jussive (ـْ)"] },
      { type:"grammar_err", promptEn:'Find error: "كَتَبَ الطَّالِبُ الدَّرْسُ" (object = accusative)', correct:"الدَّرْسَ", options:["الدَّرْسَ","الدَّرْسُ","الطَّالِبُ","كَتَبَ"] },
    ],
    sentenceTiles:[
      { en:"The teachers went to the school.", answer:["ذَهَبَ","الْمُدَرِّسُونَ","إِلَى","الْمَدْرَسَةِ"], tiles:["ذَهَبَ","الْمُدَرِّسُونَ","إِلَى","الْمَدْرَسَةِ","الطَّالِبَاتُ","الْمَسْجِدِ"], prebaked:[] },
      { en:"After studying, he opened the door.", answer:["بَعْدَ","الدِّرَاسَةِ","فَتَحَ","الْبَابَ"], tiles:["بَعْدَ","الدِّرَاسَةِ","فَتَحَ","الْبَابَ","قَبْلَ","الْكِتَابَ"], prebaked:[] },
      { en:"She asked him.", answer:["سَأَلَتْهُ"], tiles:["سَأَلَتْهُ","سَأَلَهَا","سَأَلَ"], prebaked:[] },
      { en:"The prophets are mentioned in the book.", answer:["الْأَنْبِيَاءُ","مَذْكُورُونَ","فِي","الْكِتَابِ"], tiles:["الْأَنْبِيَاءُ","مَذْكُورُونَ","فِي","الْكِتَابِ","الرِّجَالُ"], prebaked:[{ar:"مَذْكُورُونَ",en:"are mentioned"}] },
      { en:"The mosques were built.", answer:["بُنِيَتِ","الْمَسَاجِدُ"], tiles:["بُنِيَتِ","الْمَسَاجِدُ","بَنَى","الرِّجَالُ"], prebaked:[] },
    ]},

  // R8: After B4 L4-8 (sessions 71-80) · subjunctive, weather, Form II, Form IV, participles
  { id:"r8", type:"review", coversLessons:"B4 L4–8",
    titleEn:"Review: Subjunctive, Verb Forms II & IV, Participles",
    grammarExercises:[
      { type:"grammar_mcq", promptEn:'After أَنْ (to), the verb takes:', correct:"subjunctive (ـَ ending)", options:["subjunctive (ـَ ending)","indicative (ـُ ending)","jussive (ـْ ending)","past tense form"] },
      { type:"grammar_mcq", promptEn:'Form II masdar of دَرَّسَ (he taught):', correct:"تَدْرِيسٌ", options:["تَدْرِيسٌ","دِرَاسَةٌ","دَرْسٌ","تَدْرِيسَةٌ"] },
      { type:"grammar_mcq", promptEn:'Form IV verb meaning "he sent":', correct:"أَرْسَلَ", options:["أَرْسَلَ","رَسَلَ","رَاسَلَ","اِرْسَلَ"] },
      { type:"grammar_mcq", promptEn:'Active participle (Form I) of كَتَبَ (to write):', correct:"كَاتِبٌ", options:["كَاتِبٌ","مَكْتُوبٌ","كِتَابَةٌ","كَتَّبَ"] },
      { type:"grammar_err", promptEn:'Find the error: "أُرِيدُ أَنْ يَذْهَبُ" (after أَنْ = subjunctive, not indicative)', correct:"يَذْهَبَ", options:["يَذْهَبَ","يَذْهَبُ","أَذْهَبَ","تَذْهَبَ"] },
    ],
    sentenceTiles:[
      { en:"I want to study.", answer:["أُرِيدُ","أَنْ","أَدْرُسَ"], tiles:["أُرِيدُ","أَنْ","أَدْرُسَ","أَدْرُسُ","يُمْكِنُ"], prebaked:[] },
      { en:"The teacher taught the students.", answer:["دَرَّسَ","الْمُعَلِّمُ","الطُّلَّابَ"], tiles:["دَرَّسَ","الْمُعَلِّمُ","الطُّلَّابَ","الطُّلَّابُ","عَلَّمَ"], prebaked:[] },
      { en:"Allah revealed the Quran.", answer:["أَنْزَلَ","اللهُ","الْقُرْآنَ"], tiles:["أَنْزَلَ","اللهُ","الْقُرْآنَ","أَرْسَلَ","الرَّسُولَ"], prebaked:[] },
      { en:"The written lesson is beautiful.", answer:["الدَّرْسُ","الْمَكْتُوبُ","جَمِيلٌ"], tiles:["الدَّرْسُ","الْمَكْتُوبُ","جَمِيلٌ","مَفْهُومٌ"], prebaked:[] },
      { en:"If only I had studied!", answer:["لَيْتَنِي","دَرَسْتُ"], tiles:["لَيْتَنِي","دَرَسْتُ","لَوْ","كُنْتُ"], prebaked:[{ar:"لَيْتَنِي",en:"I wish / if only I"}] },
    ]},
];

// ── ALL_SESSIONS: interleaved regular + review sessions in curriculum order ──
// Reviews after sessions 10, 20, 30, 40, 50, 60, 70, 80 (every 5 lessons = 10 sessions)
const sid = (id) => SESSIONS.find(s => s.id === id);
const ALL_SESSIONS = [
  ...SESSIONS.filter(s=>s.id>=1&&s.id<=10),   REVIEWS[0],
  ...SESSIONS.filter(s=>s.id>=11&&s.id<=20),  REVIEWS[1],
  ...SESSIONS.filter(s=>s.id>=21&&s.id<=30),  REVIEWS[2],
  ...SESSIONS.filter(s=>s.id>=31&&s.id<=40),  REVIEWS[3],
  ...SESSIONS.filter(s=>s.id>=41&&s.id<=50),  REVIEWS[4],
  ...SESSIONS.filter(s=>s.id>=51&&s.id<=60),  REVIEWS[5],
  ...SESSIONS.filter(s=>s.id>=61&&s.id<=70),  REVIEWS[6],
  ...SESSIONS.filter(s=>s.id>=71&&s.id<=80),  REVIEWS[7],
  ...SESSIONS.filter(s=>s.id>=81&&s.id<=84),
];


// ──────────────────────────────────────────────
// EXERCISE BUILDERS
// ──────────────────────────────────────────────
function buildExercises(session) {
  const vocab = session.vocab;
  const allPrior = SESSIONS.filter(s => s.id < session.id).flatMap(s => s.vocab);
  const pool = vocab.length >= 4 ? vocab : [...vocab, ...shuffle(allPrior).slice(0, 4 - vocab.length)];
  const exercises = [];

  // MCQ: Arabic → English (4 questions)
  shuffle(vocab).slice(0, 4).forEach(w => {
    const distractors = shuffle(pool.filter(x => x.en !== w.en)).slice(0, 3).map(x => x.en);
    exercises.push({ type:"ar_en", prompt:w.ar, promptEn:w.en, correct:w.en, options:shuffle([w.en,...distractors]) });
  });
  // MCQ: English → Arabic (4 questions)
  shuffle(vocab).slice(0, 4).forEach(w => {
    const distractors = shuffle(pool.filter(x => x.ar !== w.ar)).slice(0, 3).map(x => x.ar);
    const opts = shuffle([w.ar,...distractors]);
    const allVocab = [...vocab, ...allPrior];
    const meanings = {};
    opts.forEach(ar => { const found = allVocab.find(x => x.ar === ar); if (found) meanings[ar] = found.en; });
    exercises.push({ type:"en_ar", promptEn:w.en, correct:w.ar, options:opts, meanings });
  });
  // Match pairs
  if (vocab.length >= 4)
    exercises.push({ type:"match", pairs:shuffle(vocab).slice(0,4).map(w=>({ar:w.ar,en:w.en})) });
  // Spaced repetition tiles from session 15+
  if (session.id >= 15) {
    const eligibleReviews = REVIEWS.filter((_, i) => i < Math.floor((session.id - 1) / 10));
    const poolTiles = eligibleReviews.flatMap(r => r.sentenceTiles.filter(t => t.prebaked.length === 0));
    shuffle(poolTiles).slice(0, 2).forEach(t => exercises.push({ type:"tile", ...t }));
  }
  // Pattern sentence exercises (Book 1 only)
  if (session.patternTiles) {
    session.patternTiles.forEach(t => exercises.push({ type:"pattern_tile", ...t }));
  }
  return shuffle(exercises);
}

function buildReviewExercises(review) {
  const exercises = [];
  review.grammarExercises.forEach(ex => exercises.push({ ...ex }));
  review.sentenceTiles.forEach(t => exercises.push({ type:"review_tile", ...t }));
  return exercises; // keep in order: grammar first, then tiles
}

// ──────────────────────────────────────────────
// UI COMPONENTS
// ──────────────────────────────────────────────

function ProgressBar({ pct }) {
  return (
    <div style={{height:10,background:"#e5e7eb",borderRadius:5,overflow:"hidden"}}>
      <div style={{width:`${pct}%`,height:"100%",background:`linear-gradient(90deg,${GREEN},#16a34a)`,transition:"width 0.4s ease"}}/>
    </div>
  );
}

function TopBar({ onExit, streak, hearts, progress, total }) {
  return (
    <div style={{background:`linear-gradient(135deg,${GREEN},#047857)`,padding:"12px 16px",display:"flex",alignItems:"center",gap:10}}>
      <button onClick={onExit} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontWeight:700,fontSize:13}}>✕</button>
      <div style={{flex:1}}>
        <ProgressBar pct={total?(progress/total)*100:0}/>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginTop:3}}>{progress}/{total}</div>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        <div style={{background:streak>0?"#f97316":"rgba(255,255,255,0.2)",borderRadius:20,padding:"4px 10px",color:"white",fontWeight:700,fontSize:13}}>🔥{streak}</div>
        <div style={{display:"flex",gap:1}}>
          {[...Array(5)].map((_,i)=><span key={i} style={{fontSize:16,opacity:i<hearts?1:0.25}}>❤️</span>)}
        </div>
      </div>
    </div>
  );
}

// Standard MCQ (ar_en / en_ar / grammar_mcq / grammar_err)
function MCQ({ exercise, onResult }) {
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState(false);
  const { w } = useWindowSize();
  const isArEn = exercise.type === "ar_en";
  const isGrammar = exercise.type === "grammar_mcq" || exercise.type === "grammar_err";
  const arPromptSize = w >= 1024 ? 56 : w >= 640 ? 50 : 44;
  const enPromptSize = w >= 1024 ? 32 : w >= 640 ? 28 : 24;
  const optArSize = w >= 1024 ? 24 : w >= 640 ? 22 : 20;
  const optEnSize = w >= 1024 ? 16 : 14;
  const cols = w >= 1024 ? "1fr 1fr 1fr 1fr" : "1fr 1fr";

  const handleSelect = (opt) => { if (!done) { setSel(opt); if (isAr(opt)) speak(opt); } };
  const handleConfirm = () => {
    if (!sel || done) return;
    setDone(true);
    setTimeout(() => onResult(sel === exercise.correct), 1200);
  };

  return (
    <div style={{textAlign:"center",padding:"0 4px"}}>
      {isGrammar ? (
        <div style={{background:"#eff6ff",border:"1px solid #93c5fd",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          <div style={{fontSize:12,color:"#3b82f6",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>
            {exercise.type==="grammar_err"?"🔍 Spot the Error":"📖 Grammar"}
          </div>
          <p style={{fontSize:14,color:"#1e293b",fontWeight:600,margin:0,lineHeight:1.6}}>{exercise.promptEn}</p>
        </div>
      ) : isArEn ? (
        <>
          <p style={{color:"#64748b",fontSize:13,marginBottom:10}}>What does this mean?</p>
          {exercise.promptEn && getEmoji(exercise.promptEn) && (
            <div style={{fontSize:48,marginBottom:8,lineHeight:1}}>{getEmoji(exercise.promptEn)}</div>
          )}
          <div style={{marginBottom:24,lineHeight:1.4}}>
            <span style={{fontSize:arPromptSize,fontWeight:700,color:"#0f172a",fontFamily:arFont,direction:"rtl"}}>{exercise.prompt}</span>
            <SpeakBtn text={exercise.prompt} size={22} />
          </div>
        </>
      ) : (
        <>
          <p style={{color:"#64748b",fontSize:13,marginBottom:10}}>Select the Arabic for:</p>
          {getEmoji(exercise.promptEn) && (
            <div style={{fontSize:48,marginBottom:8,lineHeight:1}}>{getEmoji(exercise.promptEn)}</div>
          )}
          <div style={{fontSize:enPromptSize,fontWeight:700,color:"#0f172a",marginBottom:24}}>{exercise.promptEn}</div>
        </>
      )}
      <div style={{display:"grid",gridTemplateColumns:cols,gap:10}}>
        {exercise.options.map((opt,i)=>{
          const picked = sel===opt, correct = opt===exercise.correct;
          let bg="white", border="2px solid #e2e8f0", color="#1e293b";
          if (done && correct)              { bg="#dcfce7"; border="2px solid #22c55e"; color="#166534"; }
          else if (done && picked && !correct){ bg="#fee2e2"; border="2px solid #ef4444"; color="#991b1b"; }
          else if (!done && picked)          { bg="#dbeafe"; border="2px solid #3b82f6"; color="#1e40af"; }
          const arabic = isAr(opt);
          return (
            <button key={i} onClick={()=>handleSelect(opt)} style={{
              padding:"14px 8px",borderRadius:12,border,background:bg,color,
              fontSize:arabic?optArSize:optEnSize,fontWeight:600,
              cursor:done?"default":"pointer",
              fontFamily:arabic?arFont:"inherit",direction:arabic?"rtl":"ltr",
              boxShadow:"0 1px 4px rgba(0,0,0,0.07)",lineHeight:1.4,transition:"all 0.15s"}}
              onMouseEnter={e=>{if(!done&&sel!==opt)e.currentTarget.style.transform="scale(1.03)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"}}>
              {opt}
            </button>
          );
        })}
      </div>
      {/* Confirm button — shown when an option is selected but not yet submitted */}
      {!done && sel && (
        <button onClick={handleConfirm} style={{
          marginTop:16, width:"100%", padding:"14px",
          background:`linear-gradient(135deg,${GREEN},#047857)`,
          color:"white", border:"none", borderRadius:12,
          fontSize:16, fontWeight:700, cursor:"pointer",
          boxShadow:"0 4px 12px rgba(5,150,105,0.3)", transition:"opacity 0.2s"}}>
          Confirm ✓
        </button>
      )}
      {done && sel===exercise.correct && (
        <div style={{marginTop:14,padding:"10px 16px",borderRadius:10,background:"#dcfce7",color:"#166534",fontWeight:700,fontSize:15}}>
          ✓ Correct!
        </div>
      )}
      {done && sel!==exercise.correct && (
        <div style={{marginTop:14,borderRadius:10,overflow:"hidden",border:"1px solid #fca5a5"}}>
          <div style={{padding:"10px 16px",background:"#fee2e2",color:"#991b1b",fontWeight:700,fontSize:15}}>
            {isGrammar
              ? `✗ Correct answer: ${exercise.correct}`
              : exercise.type==="ar_en"
                ? <span>✗ <span style={{fontFamily:arFont,fontSize:18,direction:"rtl"}}>{exercise.prompt}</span> means "{exercise.correct}"</span>
                : <span>✗ The Arabic for "{exercise.promptEn}" is <span style={{fontFamily:arFont,fontSize:18,direction:"rtl"}}>{exercise.correct}</span></span>
            }
          </div>
          {!isGrammar && (
            <div style={{padding:"8px 16px",background:"#fff5f5",color:"#7f1d1d",fontSize:13,fontWeight:500}}>
              {exercise.type==="ar_en"
                ? `You chose "${sel}"`
                : <span>You chose <span style={{fontFamily:arFont,fontSize:16,direction:"rtl"}}>{sel}</span>{exercise.meanings?.[sel] ? ` — "${exercise.meanings[sel]}"` : ""}</span>
              }
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Match pairs
function MatchEx({ exercise, onResult }) {
  const [selAr, setSelAr] = useState(null);
  const [selEn, setSelEn] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);
  const arList = useRef(shuffle(exercise.pairs.map(p=>p.ar))).current;
  const enList = useRef(shuffle(exercise.pairs.map(p=>p.en))).current;
  const doneEns = matched.map(ar=>exercise.pairs.find(p=>p.ar===ar)?.en);

  const tryMatch = (ar, en) => {
    const pair = exercise.pairs.find(p=>p.ar===ar);
    if(pair?.en===en){
      const nm=[...matched,ar]; setMatched(nm); setSelAr(null); setSelEn(null);
      if(nm.length===exercise.pairs.length) setTimeout(()=>onResult(true),500);
    } else {
      setWrongPair({ar,en});
      setTimeout(()=>{setWrongPair(null);setSelAr(null);setSelEn(null);},700);
    }
  };

  const pickAr = (ar) => {
    if(matched.includes(ar)) return;
    speak(ar);
    if(selEn) { tryMatch(ar, selEn); return; }
    setSelAr(ar===selAr ? null : ar);
  };

  const pickEn = (en) => {
    if(doneEns.includes(en)) return;
    if(selAr) { tryMatch(selAr, en); return; }
    setSelEn(en===selEn ? null : en);
  };

  return (
    <div style={{textAlign:"center"}}>
      <p style={{color:"#64748b",fontSize:13,marginBottom:14}}>Match the pairs:</p>
      <div style={{display:"flex",gap:12,justifyContent:"center"}}>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {arList.map(ar=>{
            const done=matched.includes(ar);
            const isWrong=wrongPair?.ar===ar;
            const isSel=selAr===ar;
            return(
              <button key={ar} onClick={()=>pickAr(ar)} style={{
                width:140,height:52,borderRadius:10,
                border:isWrong?"2px solid #ef4444":isSel?"2px solid #3b82f6":"2px solid #e2e8f0",
                background:done?"#f0fdf4":isWrong?"#fee2e2":isSel?"#dbeafe":"white",
                fontSize:20,fontFamily:arFont,direction:"rtl",fontWeight:700,
                cursor:done?"default":"pointer",opacity:done?0.5:1,color:"#1e293b",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
              {ar}</button>);
          })}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {enList.map(en=>{
            const done=doneEns.includes(en);
            const isWrong=wrongPair?.en===en;
            const isSel=selEn===en;
            return(
              <button key={en} onClick={()=>pickEn(en)} style={{
                width:140,height:52,borderRadius:10,
                border:isWrong?"2px solid #ef4444":isSel?"2px solid #3b82f6":"2px solid #e2e8f0",
                background:done?"#f0fdf4":isWrong?"#fee2e2":isSel?"#dbeafe":"white",
                fontSize:14,fontWeight:600,cursor:done?"default":"pointer",
                opacity:done?0.5:1,color:"#1e293b",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
              {en}</button>);
          })}
        </div>
      </div>
    </div>
  );
}

// Tile sentence builder (regular sessions)
function TileEx({ exercise, onResult }) {
  const [placed, setPlaced] = useState([]);
  const [remaining, setRemaining] = useState(()=>shuffle(exercise.tiles));
  const { w } = useWindowSize();
  const tileFont = w >= 1024 ? 26 : w >= 640 ? 22 : 20;
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  const addTile=(tile,idx)=>{if(checked)return;setPlaced([...placed,tile]);setRemaining(remaining.filter((_,i)=>i!==idx));};
  const removeTile=(tile,idx)=>{if(checked)return;setPlaced(placed.filter((_,i)=>i!==idx));setRemaining([...remaining,tile]);};
  const check=()=>{const ok=JSON.stringify(placed)===JSON.stringify(exercise.answer);setCorrect(ok);setChecked(true);setTimeout(()=>onResult(ok),1200);};

  return (
    <div style={{textAlign:"center"}}>
      <p style={{color:"#64748b",fontSize:13,marginBottom:6}}>Build the sentence:</p>
      <p style={{fontSize:17,fontWeight:700,color:"#1e293b",marginBottom:4}}>"{exercise.en}"</p>
      <p style={{fontSize:12,color:"#94a3b8",marginBottom:12}}>
        <SpeakBtn text={exercise.answer.join(" ")} size={15} /> hear the sentence
      </p>
      <div style={{minHeight:60,background:"#f8fafc",borderRadius:12,border:checked?(correct?"2px solid #22c55e":"2px solid #ef4444"):"2px dashed #cbd5e1",padding:"10px 12px",marginBottom:12,display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",alignItems:"center",direction:"rtl"}}>
        {placed.length===0&&<span style={{color:"#94a3b8",fontSize:13}}>Tap tiles below to build the sentence</span>}
        {placed.map((tile,i)=>(
          <button key={`${tile}-${i}`} onClick={()=>removeTile(tile,i)} style={{padding:"8px 12px",background:checked?(correct?"#dcfce7":"#fee2e2"):"#dbeafe",border:"none",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,cursor:checked?"default":"pointer",color:"#1e293b"}}>{tile}</button>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:16,direction:"rtl"}}>
        {remaining.map((tile,i)=>(
          <button key={`${tile}-${i}`} onClick={()=>addTile(tile,i)} style={{padding:"8px 12px",background:"white",border:"2px solid #e2e8f0",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,cursor:"pointer",color:"#1e293b",transition:"transform 0.1s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.06)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"}}>
            {tile}</button>
        ))}
      </div>
      {!checked&&placed.length>0&&<button onClick={check} style={{padding:"12px 32px",background:`linear-gradient(135deg,${GREEN},#047857)`,color:"white",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(5,150,105,0.3)"}}>Check ✓</button>}
      {checked&&<div style={{padding:"10px 16px",borderRadius:10,background:correct?"#dcfce7":"#fee2e2",color:correct?"#166534":"#991b1b",fontWeight:700,fontSize:15}}>
        {correct?"✓ Perfect!":"✗ Correct: "+exercise.answer.join(" ")}
      </div>}
    </div>
  );
}

// Pattern sentence builder — emoji/Arabic question prompt, no English
function PatternTileEx({ exercise, onResult }) {
  const { w } = useWindowSize();
  const tileFont = w >= 1024 ? 26 : w >= 640 ? 22 : 20;
  const [placed, setPlaced] = useState([]);
  const [remaining, setRemaining] = useState(()=>shuffle([...exercise.tiles]));
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);

  const addTile=(tile,idx)=>{if(checked)return;setPlaced([...placed,tile]);setRemaining(remaining.filter((_,i)=>i!==idx));};
  const removeTile=(tile,idx)=>{if(checked)return;setPlaced(placed.filter((_,i)=>i!==idx));setRemaining([...remaining,tile]);};
  const check=()=>{const ok=JSON.stringify(placed)===JSON.stringify(exercise.answer);setCorrect(ok);setChecked(true);setTimeout(()=>onResult(ok),1200);};

  return (
    <div style={{textAlign:"center"}}>
      {exercise.emoji
        ? <div style={{fontSize:72,lineHeight:1,marginBottom:8}}>{exercise.emoji}</div>
        : exercise.en && <p style={{fontSize:15,fontWeight:700,color:"#1e293b",marginBottom:8}}>"{exercise.en}"</p>
      }
      {exercise.question && (
        <div style={{marginBottom:4}}>
          <span style={{fontSize:28,fontWeight:700,color:"#0f172a",fontFamily:arFont,direction:"rtl"}}>{exercise.question}</span>
          <SpeakBtn text={exercise.question} size={18}/>
        </div>
      )}
      <p style={{fontSize:12,color:"#94a3b8",marginBottom:14}}>
        <SpeakBtn text={exercise.answer.join(" ")} size={14}/> hear the answer
      </p>
      <div style={{minHeight:60,background:"#f8fafc",borderRadius:12,border:checked?(correct?"2px solid #22c55e":"2px solid #ef4444"):"2px dashed #cbd5e1",padding:"10px 12px",marginBottom:12,display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",alignItems:"center",direction:"rtl"}}>
        {placed.length===0&&<span style={{color:"#94a3b8",fontSize:13}}>Tap tiles to answer</span>}
        {placed.map((tile,i)=>(
          <button key={`${tile}-${i}`} onClick={()=>removeTile(tile,i)} style={{padding:"8px 12px",background:checked?(correct?"#dcfce7":"#fee2e2"):"#dbeafe",border:"none",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,cursor:checked?"default":"pointer",color:"#1e293b"}}>{tile}</button>
        ))}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:16,direction:"rtl"}}>
        {remaining.map((tile,i)=>(
          <button key={`${tile}-${i}`} onClick={()=>addTile(tile,i)} style={{padding:"8px 12px",background:"white",border:"2px solid #e2e8f0",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,cursor:"pointer",color:"#1e293b",transition:"transform 0.1s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.06)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"}}>
            {tile}</button>
        ))}
      </div>
      {!checked&&placed.length>0&&<button onClick={check} style={{padding:"12px 32px",background:`linear-gradient(135deg,${GREEN},#047857)`,color:"white",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(5,150,105,0.3)"}}>Check ✓</button>}
      {checked&&<div style={{padding:"10px 16px",borderRadius:10,background:correct?"#dcfce7":"#fee2e2",color:correct?"#166534":"#991b1b",fontWeight:700,fontSize:15}}>
        {correct?"✓ Perfect!":"✗ Correct: "+exercise.answer.join(" ")}
      </div>}
    </div>
  );
}

// Review tile builder with pre-baked words (tappable to toggle Arabic↔English)
function ReviewTileEx({ exercise, onResult }) {
  const { w } = useWindowSize();
  const tileFont = w >= 1024 ? 26 : w >= 640 ? 22 : 20;
  const [placed, setPlaced] = useState([]);
  const [remaining, setRemaining] = useState(()=>shuffle(exercise.tiles.filter(t=>!exercise.prebaked.some(p=>p.ar===t))));
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [toggled, setToggled] = useState({}); // { prebakedAr: true/false } — true = show English

  const prebakedSet = exercise.prebaked || [];
  const prebakedInAnswer = exercise.answer.filter(t => prebakedSet.some(p=>p.ar===t));

  const addTile=(tile,idx)=>{if(checked)return;setPlaced([...placed,tile]);setRemaining(remaining.filter((_,i)=>i!==idx));};
  const removeTile=(tile,idx)=>{if(checked)return;setPlaced(placed.filter((_,i)=>i!==idx));setRemaining([...remaining,tile]);};
  const togglePrebaked=(ar)=>setToggled(t=>({...t,[ar]:!t[ar]}));

  const check=()=>{
    // Correct answer = prebaked tiles + placed tiles in right order
    const fullAnswer = exercise.answer;
    const userAnswer = [];
    let pi=0, ri=0;
    for(const tile of fullAnswer){
      if(prebakedSet.some(p=>p.ar===tile)) userAnswer.push(tile);
      else userAnswer.push(placed[ri++]||"");
    }
    const ok = JSON.stringify(placed)===JSON.stringify(exercise.answer.filter(t=>!prebakedSet.some(p=>p.ar===t)));
    setCorrect(ok); setChecked(true); setTimeout(()=>onResult(ok),1200);
  };

  // Reconstruct full answer zone: prebaked tiles at their positions + placed tiles in gaps
  const answerZone = [];
  let gapIdx = 0;
  for(const tile of exercise.answer){
    const pb = prebakedSet.find(p=>p.ar===tile);
    if(pb){
      answerZone.push({tile, prebaked:true, en:pb.en});
    } else {
      answerZone.push({tile: placed[gapIdx], prebaked:false, gapIdx: gapIdx++});
    }
  }

  return (
    <div style={{textAlign:"center"}}>
      <p style={{color:"#64748b",fontSize:12,marginBottom:4}}>Build the sentence:</p>
      <p style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:4}}>"{exercise.en}"</p>
      <p style={{fontSize:12,color:"#94a3b8",marginBottom:prebakedSet.length>0?4:12}}>
        <SpeakBtn text={exercise.answer.join(" ")} size={15} /> hear the sentence
      </p>
      {prebakedSet.length>0&&<p style={{fontSize:11,color:"#d97706",fontWeight:600,marginBottom:12}}>✨ Gold tiles are pre-placed — tap to see their meaning</p>}
      {/* Answer zone */}
      <div style={{minHeight:60,background:"#f8fafc",borderRadius:12,border:checked?(correct?"2px solid #22c55e":"2px solid #ef4444"):"2px dashed #cbd5e1",padding:"10px 12px",marginBottom:12,display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",alignItems:"center",direction:"rtl"}}>
        {answerZone.length===0&&!prebakedSet.length&&<span style={{color:"#94a3b8",fontSize:13}}>Tap tiles to build</span>}
        {answerZone.map((item,i)=>{
          if(item.prebaked){
            const showing = toggled[item.tile];
            return <button key={`pb-${i}`} onClick={()=>togglePrebaked(item.tile)} style={{padding:"8px 12px",background:checked?"#fef3c7":"#fef9c3",border:"2px solid #f59e0b",borderRadius:8,fontSize:showing?13:20,fontFamily:showing?"inherit":arFont,fontWeight:700,cursor:"pointer",color:"#92400e",direction:showing?"ltr":"rtl",minWidth:50}}>
              {showing?item.en:item.tile}
            </button>;
          } else if(item.tile){
            return <button key={`pl-${i}`} onClick={()=>removeTile(item.tile,item.gapIdx)} style={{padding:"8px 12px",background:checked?(correct?"#dcfce7":"#fee2e2"):"#dbeafe",border:"none",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,cursor:checked?"default":"pointer",color:"#1e293b"}}>{item.tile}</button>;
          } else {
            return <span key={`gap-${i}`} style={{width:60,height:40,border:"2px dashed #cbd5e1",borderRadius:8,display:"inline-block"}}/>;
          }
        })}
      </div>
      {/* Tile bank */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:16,direction:"rtl"}}>
        {remaining.map((tile,i)=>(
          <button key={`${tile}-${i}`} onClick={()=>addTile(tile,i)} style={{padding:"8px 12px",background:"white",border:"2px solid #e2e8f0",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,cursor:"pointer",color:"#1e293b",transition:"transform 0.1s"}}
            onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.06)"}}
            onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"}}>
            {tile}</button>
        ))}
      </div>
      {!checked&&(placed.length>0||(prebakedSet.length>0&&prebakedSet.length===exercise.answer.length))&&
        <button onClick={check} style={{padding:"12px 32px",background:`linear-gradient(135deg,${GREEN},#047857)`,color:"white",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(5,150,105,0.3)"}}>Check ✓</button>}
      {checked&&<div style={{padding:"10px 16px",borderRadius:10,background:correct?"#dcfce7":"#fee2e2",color:correct?"#166534":"#991b1b",fontWeight:700,fontSize:15}}>
        {correct?"✓ Perfect!":"✗ Correct: "+exercise.answer.filter(t=>!prebakedSet.some(p=>p.ar===t)).join(" ")}
      </div>}
    </div>
  );
}

// Grammar intro card (regular sessions)
function GrammarCard({ session, onStart }) {
  const { w } = useWindowSize();
  const titleSize = w >= 1024 ? 32 : w >= 640 ? 28 : 24;
  const vocabArSize = w >= 1024 ? 26 : w >= 640 ? 24 : 22;
  return (
    <div style={{padding:"16px 16px 24px"}}>
      <div style={{background:"linear-gradient(135deg,#eff6ff,#dbeafe)",border:"1px solid #93c5fd",borderRadius:16,padding:"16px 16px 20px",marginBottom:16,textAlign:"center"}}>
        <div style={{fontSize:11,color:"#3b82f6",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>
          Book {session.book} · Lesson {session.lessonRef} · Part {session.part}
        </div>
        <div style={{fontSize:titleSize,fontWeight:700,color:"#1e40af",fontFamily:arFont,direction:"rtl",marginBottom:4,lineHeight:1.4}}>{session.title}</div>
        <div style={{fontSize:15,fontWeight:600,color:"#1e3a5f",marginBottom:10}}>{session.titleEn}</div>
        <p style={{color:"#475569",fontSize:13,lineHeight:1.7,margin:0,textAlign:"left"}}>{session.grammar}</p>
      </div>
      <h3 style={{fontSize:14,fontWeight:700,color:"#1e293b",margin:"0 0 10px"}}>New Words:</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {session.vocab.map((w,i)=>{
          const em = getEmoji(w.en);
          return (
            <div key={i} style={{background:"#f8fafc",borderRadius:10,padding:"10px",border:"1px solid #e2e8f0",textAlign:"center"}}>
              {em && <div style={{fontSize:28,lineHeight:1.3}}>{em}</div>}
              <div style={{fontSize:vocabArSize,fontWeight:700,color:"#1e293b",fontFamily:arFont,direction:"rtl",lineHeight:1.5}}>{w.ar}</div>
              <div style={{fontSize:13,color:"#475569",fontWeight:600}}>{w.en}</div>
            </div>
          );
        })}
      </div>
      <button onClick={onStart} style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#3b82f6,#2563eb)",color:"white",border:"none",borderRadius:14,fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(59,130,246,0.35)"}}>
        Start Practice →
      </button>
    </div>
  );
}

// Review intro card
function ReviewIntro({ review, onStart }) {
  const grammarCount = review.grammarExercises.length;
  const tileCount = review.sentenceTiles.length;
  return (
    <div style={{padding:"16px 16px 24px"}}>
      <div style={{background:"linear-gradient(135deg,#fef9c3,#fef3c7)",border:"1px solid #f59e0b",borderRadius:16,padding:"16px 16px 20px",marginBottom:16,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>🏆</div>
        <div style={{fontSize:11,color:"#d97706",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>REVIEW SESSION</div>
        <div style={{fontSize:18,fontWeight:800,color:"#92400e",marginBottom:6}}>{review.titleEn}</div>
        <div style={{fontSize:13,color:"#78350f",fontWeight:600,marginBottom:12}}>Covers: {review.coversLessons}</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <div style={{background:"rgba(255,255,255,0.6)",borderRadius:12,padding:"8px 14px",textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:"#d97706"}}>{grammarCount}</div>
            <div style={{fontSize:11,color:"#92400e",fontWeight:700}}>Grammar Qs</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.6)",borderRadius:12,padding:"8px 14px",textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:"#d97706"}}>{tileCount}</div>
            <div style={{fontSize:11,color:"#92400e",fontWeight:700}}>Sentence Tiles</div>
          </div>
        </div>
      </div>
      <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:14,marginBottom:20}}>
        <p style={{fontSize:12,color:"#92400e",fontWeight:700,margin:"0 0 4px"}}>💡 How this works</p>
        <p style={{fontSize:12,color:"#78350f",lineHeight:1.6,margin:0}}>
          First answer {grammarCount} grammar questions, then build {tileCount} Arabic sentences from English. Gold tiles are pre-placed — tap them to see their meaning!
        </p>
      </div>
      <button onClick={onStart} style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"white",border:"none",borderRadius:14,fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(245,158,11,0.4)"}}>
        Start Review 🏆
      </button>
    </div>
  );
}

// Complete screen
function CompleteScreen({ xp, accuracy, isReview, onContinue }) {
  return (
    <div style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontSize:64,marginBottom:12}}>{accuracy>=80?"🌟":accuracy>=60?"⭐":"💪"}</div>
      <h2 style={{fontSize:26,fontWeight:800,color:"#1e293b",margin:"0 0 4px"}}>{isReview?"Review Complete! 🏆":"Session Complete!"}</h2>
      {isReview&&<p style={{fontSize:13,color:"#d97706",fontWeight:600,margin:"0 0 20px"}}>Great work revising your Arabic!</p>}
      <div style={{display:"flex",justifyContent:"center",gap:32,marginBottom:28}}>
        <div><div style={{fontSize:38,fontWeight:800,color:"#f59e0b"}}>+{xp}</div><div style={{fontSize:12,color:"#6b7280"}}>XP Earned</div></div>
        <div><div style={{fontSize:38,fontWeight:800,color:accuracy>=80?"#22c55e":"#f59e0b"}}>{accuracy}%</div><div style={{fontSize:12,color:"#6b7280"}}>Accuracy</div></div>
      </div>
      <button onClick={onContinue} style={{padding:"14px 40px",background:`linear-gradient(135deg,${GREEN},#047857)`,color:"white",border:"none",borderRadius:14,fontSize:18,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(5,150,105,0.4)"}}>Continue</button>
    </div>
  );
}


// ──────────────────────────────────────────────
// MAIN APP
// ──────────────────────────────────────────────
export default function MadinahArabicApp() {
  const [screen, setScreen] = useState("home"); // home | map | intro | exercise | complete | settings
  const [sessionData, setSessionData] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [exIdx, setExIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ma_completed") || "{}"); } catch { return {}; }
  });
  const [unlockAll, setUnlockAll] = useState(() => localStorage.getItem("ma_unlock") === "1");

  // Persist completed + unlockAll
  useEffect(() => { localStorage.setItem("ma_completed", JSON.stringify(completed)); }, [completed]);
  useEffect(() => { localStorage.setItem("ma_unlock", unlockAll ? "1" : "0"); }, [unlockAll]);

  const numCompleted = Object.keys(completed).length;

  const startSession = (s) => {
    const exs = s.type === "review" ? buildReviewExercises(s) : buildExercises(s);
    setSessionData(s);
    setExercises(exs);
    setExIdx(0); setCorrect(0); setTotal(0); setHearts(5);
    setScreen("intro");
  };

  const handleResult = (wasCorrect) => {
    const newTotal = total + 1;
    const newCorrect = correct + (wasCorrect ? 1 : 0);
    setTotal(newTotal); setCorrect(newCorrect);
    if(wasCorrect) { setStreak(p=>p+1); }
    else { setHearts(p=>Math.max(0,p-1)); setStreak(0); }
    setTimeout(()=>{
      const last = exIdx+1 >= exercises.length || hearts<=1;
      if(last){
        const acc = newTotal>0 ? Math.round((newCorrect/newTotal)*100) : 0;
        const earned = Math.max(5, Math.round(acc/10)*5);
        setXp(p=>p+earned);
        setCompleted(prev=>({...prev,[sessionData.id]:acc}));
        setScreen("complete");
      } else { setExIdx(p=>p+1); }
    },400);
  };

  const { w, h } = useWindowSize();
  const isSm = w < 640;           // phone
  const isMd = w >= 640 && w < 1024; // iPad portrait, large phones landscape
  const isLg = w >= 1024;         // iPad landscape, desktop

  const cardStyle = {
    width: isSm ? "100%" : isMd ? "90%" : "80%",
    maxWidth: isSm ? "100%" : isMd ? 760 : 960,
    margin: "0 auto",
    background: "white",
    borderRadius: isSm ? 0 : 20,
    minHeight: isSm ? "100vh" : "auto",
    boxShadow: isSm ? "none" : "0 8px 30px rgba(0,0,0,0.10)",
    overflow: "hidden",
    fontFamily: "'Inter','Segoe UI',sans-serif",
  };
  const pageStyle = {
    minHeight: "100vh",
    background: `linear-gradient(180deg,${DARK} 0%,#1e293b 100%)`,
    padding: isSm ? 0 : isMd ? "24px 20px" : "32px 24px",
  };
  // Dynamic scroll area height — fills remaining viewport after top bar (~120px)
  const scrollH = `calc(${h}px - 120px)`;

  // ── HOME ──
  if(screen==="home"){
    const totalCount = ALL_SESSIONS.length;
    const doneCount = numCompleted;
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{background:`linear-gradient(135deg,${GREEN},#047857)`,padding:"32px 20px 24px",textAlign:"center",color:"white",position:"relative"}}>
            <button onClick={()=>setScreen("settings")} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:18,lineHeight:1}}>⚙️</button>
            <div style={{fontSize:52}}>🕌</div>
            <h1 style={{fontSize:28,fontWeight:800,margin:"8px 0 4px"}}>Madinah Arabic</h1>
            <p style={{fontSize:14,opacity:0.85,margin:"0 0 16px"}}>Complete course · Books 1–4 · 92 sessions</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <div style={{background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"6px 14px",fontWeight:700,fontSize:14}}>⭐ {xp} XP</div>
              <div style={{background:streak>0?"#f97316":"rgba(255,255,255,0.2)",borderRadius:20,padding:"6px 14px",fontWeight:700,fontSize:14}}>🔥 {streak}</div>
            </div>
          </div>
          <div style={{padding:"20px 18px"}}>
            <div style={{background:"#f8fafc",borderRadius:14,padding:16,marginBottom:18,border:"1px solid #e2e8f0"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>Overall Progress</span>
                <span style={{fontSize:13,color:"#64748b"}}>{doneCount}/{totalCount} sessions</span>
              </div>
              <ProgressBar pct={(doneCount/totalCount)*100}/>
            </div>
            <button onClick={()=>setScreen("map")} style={{width:"100%",padding:"15px",background:`linear-gradient(135deg,${GREEN},#047857)`,color:"white",border:"none",borderRadius:14,fontSize:17,fontWeight:700,cursor:"pointer",marginBottom:12,boxShadow:"0 4px 14px rgba(5,150,105,0.35)"}}>
              {doneCount===0?"Start Learning 🚀":"Continue Learning →"}
            </button>
            <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:14}}>
              <p style={{fontSize:12,color:"#92400e",fontWeight:700,margin:"0 0 4px"}}>📖 How it works</p>
              <p style={{fontSize:12,color:"#78350f",lineHeight:1.6,margin:0}}>
                5–15 min daily · 2 sessions per lesson · Review session every 5 lessons · Pre-baked word previews · Spaced repetition from Week 3 · 8 review sessions with grammar & sentence building
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── SETTINGS ──
  if(screen==="settings"){
    const totalSessions = ALL_SESSIONS.length;
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{background:`linear-gradient(135deg,${GREEN},#047857)`,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontWeight:700,fontSize:13}}>← Back</button>
            <span style={{color:"white",fontWeight:700,fontSize:16}}>⚙️ Settings</span>
            <div style={{width:60}}/>
          </div>
          <div style={{padding:"24px 20px",display:"flex",flexDirection:"column",gap:14}}>

            {/* Unlock all */}
            <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:14,padding:"16px 18px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontWeight:700,fontSize:15,color:"#1e293b",marginBottom:3}}>🔓 Unlock all lessons</div>
                <div style={{fontSize:12,color:"#64748b"}}>Jump to any session without completing previous ones</div>
              </div>
              <button onClick={()=>setUnlockAll(u=>!u)} style={{
                width:52,height:28,borderRadius:14,border:"none",cursor:"pointer",
                background:unlockAll?"#059669":"#cbd5e1",
                position:"relative",transition:"background 0.2s",flexShrink:0,marginLeft:12}}>
                <div style={{
                  width:22,height:22,borderRadius:11,background:"white",
                  position:"absolute",top:3,
                  left:unlockAll?27:3,transition:"left 0.2s",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.2)"}}/>
              </button>
            </div>

            {/* Reset progress */}
            <div style={{background:"#fff5f5",border:"1px solid #fecaca",borderRadius:14,padding:"16px 18px"}}>
              <div style={{fontWeight:700,fontSize:15,color:"#991b1b",marginBottom:3}}>🗑️ Reset all progress</div>
              <div style={{fontSize:12,color:"#b91c1c",marginBottom:12}}>This will clear all completed sessions, XP, and streaks. Cannot be undone.</div>
              <button onClick={()=>{
                if(window.confirm("Reset all progress? This cannot be undone.")){
                  setCompleted({}); setXp(0); setStreak(0);
                  localStorage.removeItem("ma_completed");
                  setScreen("home");
                }
              }} style={{padding:"9px 20px",background:"#ef4444",color:"white",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:"pointer"}}>
                Reset Progress
              </button>
            </div>

            {/* Stats */}
            <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:14,padding:"16px 18px"}}>
              <div style={{fontWeight:700,fontSize:14,color:"#1e293b",marginBottom:10}}>📊 Your Stats</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {[["Sessions done",numCompleted],["Total sessions",totalSessions],["XP earned",xp],["Streak",streak]].map(([label,val])=>(
                  <div key={label} style={{background:"white",border:"1px solid #e2e8f0",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:800,color:"#059669"}}>{val}</div>
                    <div style={{fontSize:11,color:"#64748b",marginTop:2}}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── SESSION MAP ──
  if(screen==="map"){
    const bookColors = {1:["#059669","#047857"],2:["#2563eb","#1d4ed8"],3:["#7c3aed","#6d28d9"],4:["#dc2626","#b91c1c"]};
    // Group by sections, showing reviews between book sections
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{background:`linear-gradient(135deg,${GREEN},#047857)`,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontWeight:700,fontSize:13}}>← Home</button>
            <span style={{color:"white",fontWeight:700,fontSize:16}}>All Sessions</span>
            <button onClick={()=>setScreen("settings")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:16,lineHeight:1}}>⚙️</button>
          </div>
          <div style={{overflowY:"auto",maxHeight:scrollH,padding:"14px 14px 20px"}}>
            {ALL_SESSIONS.map((s,idx)=>{
              const unlocked = unlockAll || idx <= numCompleted;
              const acc = completed[s.id];
              const done = acc !== undefined;
              const isReview = s.type==="review";
              const colors = isReview ? ["#f59e0b","#d97706"] : bookColors[s.book]||["#059669","#047857"];

              if(isReview) return (
                <button key={s.id} onClick={()=>unlocked&&startSession(s)} disabled={!unlocked} style={{
                  width:"100%",textAlign:"left",padding:"12px 14px",borderRadius:12,marginBottom:7,
                  border:done?`2px solid #f59e0b44`:"1px solid #fde68a",
                  background:done?"#fffbeb":"#fefce8",
                  cursor:unlocked?"pointer":"default",opacity:unlocked?1:0.4,
                  display:"flex",alignItems:"center",justifyContent:"space-between",transition:"transform 0.15s"}}
                  onMouseEnter={e=>{if(unlocked)e.currentTarget.style.transform="scale(1.01)"}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:12,fontWeight:800,color:"#d97706",marginBottom:2}}>🏆 REVIEW · {s.coversLessons}</div>
                    <div style={{fontSize:13,color:"#92400e",fontWeight:600}}>{s.titleEn}</div>
                    <div style={{fontSize:11,color:"#d97706",marginTop:2}}>{s.grammarExercises.length} grammar + {s.sentenceTiles.length} sentence tiles</div>
                  </div>
                  <div style={{marginLeft:10,textAlign:"center"}}>
                    {!unlocked?<span style={{fontSize:18}}>🔒</span>:done?(
                      <div><div style={{fontSize:18}}>✅</div><div style={{fontSize:10,color:"#d97706",fontWeight:700}}>{acc}%</div></div>
                    ):<span style={{fontSize:18}}>🏆</span>}
                  </div>
                </button>
              );

              // Show book header before first session of each book
              const isFirstInBook = s.part==="A" && s.lessonRef.endsWith(".1");
              return (
                <div key={s.id}>
                  {isFirstInBook&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,marginTop:idx>0?8:0}}>
                      <div style={{padding:"4px 12px",background:`linear-gradient(135deg,${colors[0]},${colors[1]})`,borderRadius:20,color:"white",fontWeight:700,fontSize:13}}>Book {s.book}</div>
                      <span style={{fontSize:12,color:"#64748b"}}>{SESSIONS.filter(x=>x.book===s.book&&completed[x.id]).length}/{SESSIONS.filter(x=>x.book===s.book).length} done</span>
                    </div>
                  )}
                  <button onClick={()=>unlocked&&startSession(s)} disabled={!unlocked} style={{
                    width:"100%",textAlign:"left",padding:"12px 14px",borderRadius:12,marginBottom:7,
                    border:done?`2px solid ${colors[0]}33`:"1px solid #e2e8f0",
                    background:done?`${colors[0]}08`:"white",
                    cursor:unlocked?"pointer":"default",opacity:unlocked?1:0.4,
                    display:"flex",alignItems:"center",justifyContent:"space-between",transition:"transform 0.15s"}}
                    onMouseEnter={e=>{if(unlocked)e.currentTarget.style.transform="scale(1.01)"}}
                    onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:16,fontWeight:700,color:"#0f172a",fontFamily:arFont,direction:"rtl",lineHeight:1.4}}>{s.title}</div>
                      <div style={{fontSize:12,color:"#64748b",marginTop:1}}>{s.titleEn}</div>
                      {s.id>=15&&<div style={{fontSize:11,color:"#059669",marginTop:2}}>🔁 Includes spaced review</div>}
                    </div>
                    <div style={{marginLeft:10,textAlign:"center"}}>
                      {!unlocked?<span style={{fontSize:18}}>🔒</span>:done?(
                        <div><div style={{fontSize:18}}>✅</div><div style={{fontSize:10,color:colors[0],fontWeight:700}}>{acc}%</div></div>
                      ):<span style={{fontSize:18}}>▶️</span>}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── INTRO (grammar card or review intro) ──
  if(screen==="intro"&&sessionData){
    const isReview = sessionData.type==="review";
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{background:isReview?`linear-gradient(135deg,#f59e0b,#d97706)`:`linear-gradient(135deg,${GREEN},#047857)`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>setScreen("map")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontWeight:700,fontSize:13}}>← Exit</button>
            <span style={{color:"white",fontWeight:600,fontSize:14}}>
              {isReview?`Review · ${sessionData.coversLessons}`:`Session ${sessionData.id} of 84`}
            </span>
          </div>
          <div style={{overflowY:"auto",maxHeight:scrollH}}>
            {isReview
              ? <ReviewIntro review={sessionData} onStart={()=>setScreen("exercise")}/>
              : <GrammarCard session={sessionData} onStart={()=>setScreen("exercise")}/>}
          </div>
        </div>
      </div>
    );
  }

  // ── EXERCISE ──
  if(screen==="exercise"&&sessionData&&exercises.length>0){
    const ex = exercises[exIdx];
    const isReview = sessionData.type==="review";
    const grammarCount = isReview ? sessionData.grammarExercises.length : 0;
    const phase = isReview && exIdx < grammarCount ? "Grammar" : isReview ? "Sentence Building" : null;
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <TopBar onExit={()=>setScreen("map")} streak={streak} hearts={hearts} progress={exIdx} total={exercises.length}/>
          {phase&&<div style={{background:phase==="Grammar"?"#eff6ff":"#fffbeb",padding:"6px 16px",fontSize:12,fontWeight:700,color:phase==="Grammar"?"#3b82f6":"#d97706",borderBottom:"1px solid",borderColor:phase==="Grammar"?"#bfdbfe":"#fde68a",textAlign:"center"}}>
            {phase==="Grammar"?"📖 Grammar Questions":"✏️ Sentence Building"} · {phase==="Grammar"?`${exIdx+1}/${grammarCount}`:`${exIdx-grammarCount+1}/${exercises.length-grammarCount}`}
          </div>}
          <div style={{padding:"16px 16px 24px",overflowY:"auto",maxHeight:scrollH}}>
            {(ex.type==="ar_en"||ex.type==="en_ar"||ex.type==="grammar_mcq"||ex.type==="grammar_err")
              ? <MCQ key={exIdx} exercise={ex} onResult={handleResult}/>
              : ex.type==="match"
                ? <MatchEx key={exIdx} exercise={ex} onResult={handleResult}/>
                : ex.type==="review_tile"
                  ? <ReviewTileEx key={exIdx} exercise={ex} onResult={handleResult}/>
                  : ex.type==="pattern_tile"
                    ? <PatternTileEx key={exIdx} exercise={ex} onResult={handleResult}/>
                    : <TileEx key={exIdx} exercise={ex} onResult={handleResult}/>}
          </div>
        </div>
      </div>
    );
  }

  // ── COMPLETE ──
  if(screen==="complete"&&sessionData){
    const acc = total>0?Math.round((correct/total)*100):0;
    const earned = Math.max(5,Math.round(acc/10)*5);
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <CompleteScreen xp={earned} accuracy={acc} isReview={sessionData.type==="review"} onContinue={()=>setScreen("map")}/>
        </div>
      </div>
    );
  }

  return null;
}
