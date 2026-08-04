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
// MADINAH ARABIC LEARNER — Book 1 (26-session build)
// Madinah Book 1 · 12 lessons · 2 sessions/lesson + 2 review sessions
// ──────────────────────────────────────────────

const GREEN = "#059669";
const DARK = "#0f172a";
const isAr = (s) => /[\u0600-\u06FF]/.test(s);
const arFont = "'Noto Naskh Arabic', 'Scheherazade New', 'Amiri', serif";

// ── QURAN CONNECTIONS ─────────────────────────────────────────────────────────
// Keyed by stripped Arabic (no diacritics, no definite article, alif normalised).
// Show after correct answers: 1st time in session, then every 3rd (1, 4, 7, 10…)
const stripQ = s =>
  s.replace(/[\u064B-\u065F\u0670\u0640]/g, '') // strip all diacritics
   .replace(/^ال/, '')                           // strip definite article
   .replace(/[أإآ]/g, 'ا');                      // normalise alif

// Each key maps to an ARRAY of up to 3 verse examples.
// On the 1st show (count=1) → index 0; 4th show (count=4) → index 1; 7th → index 2; then wraps.
// All verses verified to contain the target word (stripped form matches the key).
const QURAN_CONNECTIONS = {
  'كتاب': [
    { ar: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ', en: 'This is the Book; there is no doubt in it — a guide for the righteous', ref: 'Al-Baqarah 2:2' },
    { ar: 'إِنَّا أَنزَلْنَا إِلَيْكَ الْكِتَابَ بِالْحَقِّ', en: 'Indeed, We have sent down to you the Book with the truth', ref: 'Al-Zumar 39:2' },
    { ar: 'كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ', en: 'A blessed Book We have revealed to you', ref: 'Ṣād 38:29' },
  ],
  'قلم': [
    { ar: 'وَالْقَلَمِ وَمَا يَسْطُرُونَ', en: 'By the pen and what they write', ref: 'Al-Qalam 68:1' },
    { ar: 'عَلَّمَ بِالْقَلَمِ', en: 'He taught by the pen', ref: 'Al-ʿAlaq 96:4' },
  ],
  'كرسي': [
    { ar: 'وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ', en: 'And His Kursī extends over the heavens and the earth', ref: 'Al-Baqarah 2:255 (Āyat al-Kursī)' },
  ],
  'بيت': [
    { ar: 'إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ لَلَّذِي بِبَكَّةَ', en: 'The first House established for mankind was that at Makkah', ref: 'Āl ʿImrān 3:96' },
    { ar: 'وَإِذْ جَعَلْنَا الْبَيْتَ مَثَابَةً لِّلنَّاسِ وَأَمْنًا', en: 'And when We made the House a place of return for mankind and a sanctuary', ref: 'Al-Baqarah 2:125' },
    { ar: 'أَن طَهِّرَا بَيْتِيَ لِلطَّائِفِينَ وَالْعَاكِفِينَ', en: 'Purify My House for those who circle it and those who stay there', ref: 'Al-Baqarah 2:125' },
  ],
  'مسجد': [
    { ar: 'وَأَنَّ الْمَسَاجِدَ لِلَّهِ', en: 'And the masājid belong to Allah', ref: 'Al-Jinn 72:18' },
    { ar: 'سُبْحَانَ الَّذِي أَسْرَى بِعَبْدِهِ لَيْلًا مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى', en: 'Glory be to Him who took His servant by night from Al-Masjid Al-Ḥarām to Al-Masjid Al-Aqṣā', ref: 'Al-Isrāʾ 17:1' },
  ],
  'نجم': [
    { ar: 'وَالنَّجْمِ إِذَا هَوَىٰ', en: 'And by the star when it sets', ref: 'Al-Najm 53:1' },
    { ar: 'وَالنُّجُومَ مُسَخَّرَاتٍ بِأَمْرِهِ', en: 'And the stars, subjected by His command', ref: 'Al-Naḥl 16:12' },
  ],
  'مفتاح': [
    { ar: 'وَعِندَهُ مَفَاتِحُ الْغَيْبِ لَا يَعْلَمُهَا إِلَّا هُوَ', en: 'With Him are the keys of the unseen; none knows them except Him', ref: 'Al-Anʿām 6:59' },
  ],
  'كلب': [
    { ar: 'وَكَلْبُهُم بَاسِطٌ ذِرَاعَيْهِ بِالْوَصِيدِ', en: 'And their dog stretching its forelegs at the entrance', ref: 'Al-Kahf 18:18' },
  ],
  'ذئب': [
    { ar: 'فَأَكَلَهُ الذِّئْبُ', en: 'The wolf has eaten him', ref: 'Yūsuf 12:17' },
    { ar: 'وَأَخَافُ أَن يَأْكُلَهُ الذِّئْبُ', en: 'And I fear the wolf may eat him', ref: 'Yūsuf 12:13' },
  ],
  'فيل': [
    { ar: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ', en: 'Have you not seen how your Lord dealt with the companions of the elephant?', ref: 'Al-Fīl 105:1' },
  ],
  'حمار': [
    { ar: 'كَمَثَلِ الْحِمَارِ يَحْمِلُ أَسْفَارًا', en: 'Like a donkey carrying volumes of books', ref: 'Al-Jumuʿah 62:5' },
  ],
  'جمل': [
    { ar: 'حَتَّىٰ يَلِجَ الْجَمَلُ فِي سَمِّ الْخِيَاطِ', en: 'Until the camel passes through the eye of a needle', ref: 'Al-Aʿrāf 7:40' },
  ],
  'رجل': [
    { ar: 'وَجَاءَ رَجُلٌ مِّنْ أَقْصَى الْمَدِينَةِ يَسْعَىٰ', en: 'And a man came running from the far end of the city', ref: 'Yā-Sīn 36:20' },
    { ar: 'وَجَاءَ مِنْ أَقْصَى الْمَدِينَةِ رَجُلٌ يَسْعَىٰ', en: 'And from the far end of the city a man came running', ref: 'Al-Qaṣaṣ 28:20' },
  ],
  'ولد': [
    { ar: 'يَطُوفُ عَلَيْهِمْ وِلْدَانٌ مُخَلَّدُونَ', en: 'There will circulate among them young boys of perpetual youth', ref: 'Al-Wāqiʿah 56:17' },
    { ar: 'وَيَطُوفُ عَلَيْهِمْ وِلْدَانٌ مُخَلَّدُونَ إِذَا رَأَيْتَهُمْ حَسِبْتَهُمْ لُؤْلُؤًا مَّنثُورًا', en: 'And there will circulate among them young boys of perpetual youth — when you see them, you would think them scattered pearls', ref: 'Al-Insān 76:19' },
  ],
  'رسول': [
    { ar: 'مُّحَمَّدٌ رَّسُولُ اللَّهِ', en: 'Muhammad is the messenger of Allah', ref: 'Al-Fatḥ 48:29' },
    { ar: 'وَمَا مُحَمَّدٌ إِلَّا رَسُولٌ', en: 'And Muhammad is not but a messenger', ref: 'Āl ʿImrān 3:144' },
    { ar: 'يَا أَيُّهَا الرَّسُولُ بَلِّغْ مَا أُنزِلَ إِلَيْكَ', en: 'O Messenger, convey what has been revealed to you', ref: 'Al-Māʾidah 5:67' },
  ],
  'سراج': [
    { ar: 'وَدَاعِيًا إِلَى اللَّهِ بِإِذْنِهِ وَسِرَاجًا مُّنِيرًا', en: 'And a caller to Allah by His permission, and a luminous lamp', ref: 'Al-Aḥzāb 33:46' },
    { ar: 'وَجَعَلَ الْقَمَرَ فِيهِنَّ نُورًا وَجَعَلَ الشَّمْسَ سِرَاجًا', en: 'And placed the moon therein as a light and made the sun a lamp', ref: 'Nūḥ 71:16' },
  ],
  'ملك': [
    { ar: 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً', en: 'And when your Lord said to the angels: I am placing a vicegerent on earth', ref: 'Al-Baqarah 2:30' },
    { ar: 'وَالْمَلَائِكَةُ يَدْخُلُونَ عَلَيْهِم مِّن كُلِّ بَابٍ', en: 'And the angels will enter upon them from every gate', ref: 'Al-Raʿd 13:23' },
  ],
  'نبي': [
    { ar: 'إِنَّهُ كَانَ صَادِقَ الْوَعْدِ وَكَانَ رَسُولًا نَّبِيًّا', en: 'Indeed, he was true to his promise and was a messenger and a prophet', ref: 'Maryam 19:54' },
    { ar: 'النَّبِيُّ أَوْلَى بِالْمُؤْمِنِينَ مِنْ أَنفُسِهِمْ', en: 'The Prophet is more worthy of the believers than themselves', ref: 'Al-Aḥzāb 33:6' },
  ],
  'شجرة': [
    { ar: 'أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ', en: 'Do you not see how Allah sets forth a parable — a good word is like a good tree', ref: 'Ibrāhīm 14:24' },
    { ar: 'وَلَا تَقْرَبَا هَٰذِهِ الشَّجَرَةَ', en: 'And do not approach this tree', ref: 'Al-Baqarah 2:35' },
  ],
  'سماء': [
    { ar: 'الَّذِي جَعَلَ لَكُمُ الْأَرْضَ فِرَاشًا وَالسَّمَاءَ بِنَاءً', en: 'Who made the earth a resting place for you and the sky a canopy', ref: 'Al-Baqarah 2:22' },
    { ar: 'وَأَنزَلَ مِنَ السَّمَاءِ مَاءً', en: 'And sent down water from the sky', ref: 'Al-Baqarah 2:22' },
  ],
  'ارض': [
    { ar: 'لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ', en: 'To Allah belongs all that is in the heavens and all that is on earth', ref: 'Al-Baqarah 2:284' },
    { ar: 'وَهُوَ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ', en: 'And He is the one who created the heavens and the earth', ref: 'Al-Anʿām 6:73' },
  ],
  'جنة': [
    { ar: 'وَبَشِّرِ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أَنَّ لَهُمْ جَنَّاتٍ', en: 'And give glad tidings to those who believe and do good deeds — that for them are gardens', ref: 'Al-Baqarah 2:25' },
    { ar: 'وَقِيلَ لَهُمُ ادْخُلُوا الْجَنَّةَ', en: 'And it is said to them: Enter Paradise', ref: 'Al-Zumar 39:73' },
  ],
  'نار': [
    { ar: 'وَاتَّقُوا النَّارَ الَّتِي أُعِدَّتْ لِلْكَافِرِينَ', en: 'And fear the Fire which has been prepared for the disbelievers', ref: 'Āl ʿImrān 3:131' },
    { ar: 'كُلَّمَا أَرَادُوا أَن يَخْرُجُوا مِنْهَا أُعِيدُوا فِيهَا', en: 'Every time they want to get out of it, they will be returned to it', ref: 'Al-Sajdah 32:20' },
  ],
  'امام': [
    { ar: 'إِنِّي جَاعِلُكَ لِلنَّاسِ إِمَامًا', en: 'I will make you a leader for the people', ref: 'Al-Baqarah 2:124' },
    { ar: 'أَمَامَهُمْ جَهَنَّمُ وَلَا يُغْنِي عَنْهُمْ مَا كَسَبُوا شَيْئًا', en: 'Before them is Hell, and what they earned will not avail them at all', ref: 'Al-Jāthiyah 45:10' },
  ],
  'شمس': [
    { ar: 'وَالشَّمْسُ تَجْرِي لِمُسْتَقَرٍّ لَّهَا', en: 'And the sun runs to its resting place', ref: 'Yā-Sīn 36:38' },
    { ar: 'وَالشَّمْسِ وَضُحَاهَا', en: 'By the sun and its brightness', ref: 'Al-Shams 91:1' },
  ],
  'قمر': [
    { ar: 'وَالْقَمَرَ قَدَّرْنَاهُ مَنَازِلَ', en: 'And We have measured out stages for the moon', ref: 'Yā-Sīn 36:39' },
    { ar: 'وَالْقَمَرِ إِذَا تَلَاهَا', en: 'And the moon when it follows it', ref: 'Al-Shams 91:2' },
  ],
  'سرير': [
    { ar: 'عَلَىٰ سُرُرٍ مُّتَقَابِلِينَ', en: 'On thrones, facing one another (in Paradise)', ref: 'Al-Ḥijr 15:47' },
    { ar: 'عَلَى سُرُرٍ مَّوْضُونَةٍ', en: 'On thrones woven with gold', ref: 'Al-Wāqiʿah 56:15' },
  ],
  'كبير': [
    { ar: 'إِنَّ اللَّهَ كَانَ عَلِيًّا كَبِيرًا', en: 'Indeed, Allah is ever Most High, Greatest', ref: 'Al-Nisāʾ 4:34' },
    { ar: 'وَهُوَ الْعَلِيُّ الْكَبِيرُ', en: 'And He is the Most High, the Most Great', ref: 'Sabaʾ 34:23' },
  ],
  'جميل': [
    { ar: 'فَاصْبِرْ صَبْرًا جَمِيلًا', en: 'So be patient with beautiful patience', ref: 'Al-Maʿārij 70:5' },
    { ar: 'فَصَبْرٌ جَمِيلٌ وَاللَّهُ الْمُسْتَعَانُ', en: 'Beautiful patience — and Allah is the one sought for help', ref: 'Yūsuf 12:18' },
  ],
  'باب': [
    { ar: 'وَادْخُلُوا الْبَابَ سُجَّدًا', en: 'Enter the gate bowing down', ref: 'Al-Baqarah 2:58' },
    { ar: 'وَلَوْ فَتَحْنَا عَلَيْهِم بَابًا مِّنَ السَّمَاءِ', en: 'And if We had opened for them a door from the sky', ref: 'Al-Ḥijr 15:14' },
  ],
  'صغير': [
    { ar: 'وَقُل رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا', en: 'Say: My Lord, have mercy on them as they raised me when I was small', ref: 'Al-Isrāʾ 17:24' },
  ],
  'جديد': [
    { ar: 'أَإِنَّا لَمَبْعُوثُونَ خَلْقًا جَدِيدًا', en: 'Shall we indeed be raised up as a new creation?', ref: 'Al-Isrāʾ 17:49' },
  ],
  'حجر': [
    { ar: 'وَإِنَّ مِنَ الْحِجَارَةِ لَمَا يَتَفَجَّرُ مِنْهُ الْأَنْهَارُ', en: 'And indeed, from some rocks rivers burst forth', ref: 'Al-Baqarah 2:74' },
    { ar: 'فَقُلْنَا اضْرِب بِّعَصَاكَ الْحَجَرَ', en: 'So We said: Strike the rock with your staff', ref: 'Al-Baqarah 2:60' },
  ],
  'فوق': [
    { ar: 'وَهُوَ الْقَاهِرُ فَوْقَ عِبَادِهِ', en: 'He is the Subjugator above His servants', ref: 'Al-Anʿām 6:18' },
    { ar: 'وَرَفَعْنَا فَوْقَكُمُ الطُّورَ', en: 'And We raised the mountain above you', ref: 'Al-Baqarah 2:63' },
  ],
  'تحت': [
    { ar: 'تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ', en: 'Beneath it rivers flow', ref: 'Al-Baqarah 2:25' },
    { ar: 'فِي جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ', en: 'In gardens beneath which rivers flow', ref: 'Āl ʿImrān 3:15' },
  ],
  'في': [
    { ar: 'لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ', en: 'To Allah belongs all that is in the heavens and all that is on earth', ref: 'Al-Baqarah 2:284' },
    { ar: 'فِي بُيُوتٍ أَذِنَ اللَّهُ أَن تُرْفَعَ وَيُذْكَرَ فِيهَا اسْمُهُ', en: 'In houses Allah has permitted to be raised and in which His name is mentioned', ref: 'Al-Nūr 24:36' },
    { ar: 'فِي جَنَّاتِ النَّعِيمِ', en: 'In gardens of delight', ref: 'Al-Wāqiʿah 56:12' },
  ],
  'على': [
    { ar: 'وَعَلَى اللَّهِ فَتَوَكَّلُوا', en: 'And upon Allah rely', ref: 'Al-Māʾidah 5:23' },
    { ar: 'إِنَّ اللَّهَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', en: 'Indeed, Allah is over all things competent', ref: 'Al-Baqarah 2:20' },
    { ar: 'وَعَلَيْهِ تَوَكَّلُوا إِن كُنتُم مُّؤْمِنِينَ', en: 'And upon Him rely, if you are believers', ref: 'Al-Māʾidah 5:23' },
  ],
  'من': [
    { ar: 'وَأَنزَلْنَا مِنَ السَّمَاءِ مَاءً طَهُورًا', en: 'And We sent down from the sky pure water', ref: 'Al-Furqān 25:48' },
    { ar: 'خَلَقَكُم مِّن تُرَابٍ', en: 'He created you from dust', ref: 'Fāṭir 35:11' },
    { ar: 'مِن نُّطْفَةٍ خَلَقَهُ فَقَدَّرَهُ', en: 'From a drop He created him and then determined his nature', ref: 'ʿAbasa 80:19' },
  ],
  'الى': [
    { ar: 'وَإِلَى اللَّهِ تُرْجَعُ الْأُمُورُ', en: 'And to Allah all matters return', ref: 'Al-Baqarah 2:210' },
    { ar: 'وَإِلَيْهِ الْمَصِيرُ', en: 'And to Him is the final return', ref: 'Al-Māʾidah 5:18' },
  ],
  'خلف': [
    { ar: 'لَهُ مُعَقِّبَاتٌ مِّن بَيْنِ يَدَيْهِ وَمِنْ خَلْفِهِ يَحْفَظُونَهُ', en: 'For him are angels before and behind him, protecting him', ref: 'Al-Raʿd 13:11' },
  ],
  // ── New entries ─────────────────────────────────────────────────────────────
  'قميص': [
    { ar: 'وَجَاءُوا عَلَى قَمِيصِهِ بِدَمٍ كَذِبٍ', en: 'And they brought his shirt with false blood on it', ref: 'Yūsuf 12:18' },
    { ar: 'اذْهَبُوا بِقَمِيصِي هَٰذَا فَأَلْقُوهُ عَلَى وَجْهِ أَبِي يَأْتِ بَصِيرًا', en: 'Take this shirt of mine and cast it over my father\'s face; he will regain his sight', ref: 'Yūsuf 12:93' },
  ],
  'جدار': [
    { ar: 'أَمَّا الْجِدَارُ فَكَانَ لِغُلَامَيْنِ يَتِيمَيْنِ فِي الْمَدِينَةِ', en: 'As for the wall, it belonged to two orphan boys in the city', ref: 'Al-Kahf 18:82' },
  ],
  'غرفة': [
    { ar: 'أُولَٰئِكَ يُجْزَوْنَ الْغُرْفَةَ بِمَا صَبَرُوا', en: 'Those will be rewarded with the highest chamber for their patience', ref: 'Al-Furqān 25:75' },
    { ar: 'وَهُمْ فِي الْغُرُفَاتِ آمِنُونَ', en: 'And they are in the chambers, secure', ref: 'Sabaʾ 34:37' },
  ],
  'حديقة': [
    { ar: 'وَحَدَائِقَ غُلْبًا', en: 'And dense gardens', ref: 'Al-Nabaʾ 78:16' },
    { ar: 'فَأَنبَتْنَا بِهِ حَدَائِقَ ذَاتَ بَهْجَةٍ', en: 'And We caused gardens of joyful beauty to grow by it', ref: 'Al-Naml 27:60' },
  ],
  'اب': [
    { ar: 'وَكَانَ أَبُوهُمَا صَالِحًا', en: 'And their father was a righteous man', ref: 'Al-Kahf 18:82' },
    { ar: 'وَإِذْ قَالَ إِبْرَاهِيمُ لِأَبِيهِ آزَرَ', en: 'And when Ibrahim said to his father Azar', ref: 'Al-Anʿām 6:74' },
  ],
  'ام': [
    { ar: 'وَأَوْحَيْنَا إِلَى أُمِّ مُوسَى أَنْ أَرْضِعِيهِ', en: 'And We inspired the mother of Mūsā: nurse him', ref: 'Al-Qaṣaṣ 28:7' },
    { ar: 'حَمَلَتْهُ أُمُّهُ كُرْهًا وَوَضَعَتْهُ كُرْهًا', en: 'His mother carried him with hardship and gave birth to him with hardship', ref: 'Al-Aḥqāf 46:15' },
  ],
  'اخ': [
    { ar: 'وَلَمَّا دَخَلُوا عَلَى يُوسُفَ آوَى إِلَيْهِ أَخَاهُ', en: 'And when they entered upon Yūsuf, he took his brother to himself', ref: 'Yūsuf 12:69' },
    { ar: 'وَاجْعَل لِّي وَزِيرًا مِّنْ أَهْلِي هَارُونَ أَخِي', en: 'And appoint for me a minister from my family — Hārūn, my brother', ref: 'Ṭā-Hā 20:29–30' },
  ],
  'اخت': [
    { ar: 'وَقَالَتْ لِأُخْتِهِ قُصِّيهِ', en: 'And she said to his sister: Follow him', ref: 'Al-Qaṣaṣ 28:11' },
  ],
  'ابن': [
    { ar: 'وَإِذْ قَالَ عِيسَى ابْنُ مَرْيَمَ يَا بَنِي إِسْرَائِيلَ إِنِّي رَسُولُ اللَّهِ إِلَيْكُمْ', en: 'And when ʿĪsā son of Maryam said: O Children of Israel, I am the messenger of Allah to you', ref: 'Al-Ṣaff 61:6' },
    { ar: 'يَا بُنَيَّ لَا تُشْرِكْ بِاللَّهِ إِنَّ الشِّرْكَ لَظُلْمٌ عَظِيمٌ', en: 'O my dear son, do not associate partners with Allah — indeed, shirk is a great injustice', ref: 'Luqmān 31:13' },
  ],
  'زوج': [
    { ar: 'وَخَلَقَ مِنْهَا زَوْجَهَا', en: 'And created from it its mate', ref: 'Al-Nisāʾ 4:1' },
    { ar: 'وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ', en: 'And of all things We created pairs', ref: 'Al-Dhāriyāt 51:49' },
  ],
  'قديم': [
    { ar: 'حَتَّى عَادَ كَالْعُرْجُونِ الْقَدِيمِ', en: 'Until it returns like an old palm-stalk', ref: 'Yā-Sīn 36:39' },
  ],
  'مسلم': [
    { ar: 'وَأَنَا أَوَّلُ الْمُسْلِمِينَ', en: 'And I am the first of those who submit', ref: 'Al-Anʿām 6:163' },
    { ar: 'إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ', en: 'Indeed, the Muslim men and Muslim women, the believing men and believing women…', ref: 'Al-Aḥzāb 33:35' },
  ],
  'اكبر': [
    { ar: 'وَلَذِكْرُ اللَّهِ أَكْبَرُ', en: 'And the remembrance of Allah is greater', ref: 'Al-ʿAnkabūt 29:45' },
    { ar: 'وَالْفِتْنَةُ أَكْبَرُ مِنَ الْقَتْلِ', en: 'And persecution is greater than killing', ref: 'Al-Baqarah 2:217' },
  ],
  'احسن': [
    { ar: 'الَّذِي أَحْسَنَ كُلَّ شَيْءٍ خَلَقَهُ', en: 'Who perfected everything He created', ref: 'Al-Sajdah 32:7' },
    { ar: 'وَمَنْ أَحْسَنُ قَوْلًا مِّمَّن دَعَا إِلَى اللَّهِ', en: 'And who is better in speech than one who calls to Allah', ref: 'Fuṣṣilat 41:33' },
  ],
  'ارسل': [
    { ar: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ', en: 'And We have not sent you except as a mercy to all worlds', ref: 'Al-Anbiyāʾ 21:107' },
    { ar: 'إِنَّا أَرْسَلْنَاكَ شَاهِدًا وَمُبَشِّرًا وَنَذِيرًا', en: 'Indeed We have sent you as a witness, a bringer of good tidings, and a warner', ref: 'Al-Fatḥ 48:8' },
  ],
  'انزل': [
    { ar: 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ', en: 'Indeed We sent it down during the Night of Decree', ref: 'Al-Qadr 97:1' },
    { ar: 'وَأَنزَلَ اللَّهُ عَلَيْكَ الْكِتَابَ وَالْحِكْمَةَ', en: 'And Allah has sent down to you the Book and wisdom', ref: 'Al-Nisāʾ 4:113' },
  ],
  'مومن': [
    { ar: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ', en: 'Certainly will the believers have succeeded', ref: 'Al-Muʾminūn 23:1' },
    { ar: 'إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ', en: 'The believers are but brothers', ref: 'Al-Ḥujurāt 49:10' },
  ],
  'كان': [
    { ar: 'وَكَانَ اللَّهُ غَفُورًا رَّحِيمًا', en: 'And Allah is ever Forgiving and Merciful', ref: 'Al-Nisāʾ 4:96' },
    { ar: 'إِنَّهُ كَانَ صَادِقَ الْوَعْدِ وَكَانَ رَسُولًا نَّبِيًّا', en: 'Indeed, he was true to his promise and was a messenger and a prophet', ref: 'Maryam 19:54' },
  ],
  'لا': [
    { ar: 'لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', en: 'There is no god except Him — the Ever-Living, the Sustainer of all existence', ref: 'Al-Baqarah 2:255' },
    { ar: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا', en: 'Do not grieve — indeed, Allah is with us', ref: 'Al-Tawbah 9:40' },
  ],
  'اين': [
    { ar: 'أَيْنَمَا تَكُونُوا يُدْرِككُّمُ الْمَوْتُ', en: 'Wherever you may be, death will overtake you', ref: 'Al-Nisāʾ 4:78' },
  ],
  // ── Pronouns ──────────────────────────────────────────────────────────────
  'هو': [
    { ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ', en: 'Say: He is Allah, the One', ref: 'Al-Ikhlāṣ 112:1' },
    { ar: 'وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ', en: 'And He has knowledge of all things', ref: 'Al-Baqarah 2:29' },
  ],
  'هي': [
    { ar: 'قَالَ هِيَ عَصَايَ أَتَوَكَّأُ عَلَيْهَا', en: 'He said: It is my staff — I lean upon it', ref: 'Ṭāhā 20:18' },
  ],
  'هم': [
    { ar: 'أُولَٰئِكَ هُمُ الْمُفْلِحُونَ', en: 'Those are the ones who will succeed', ref: 'Al-Baqarah 2:5' },
    { ar: 'إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ', en: 'The believers are but brothers', ref: 'Al-Ḥujurāt 49:10' },
  ],
  'انا': [
    { ar: 'إِنَّنِي أَنَا اللَّهُ لَا إِلَٰهَ إِلَّا أَنَا فَاعْبُدْنِي', en: 'Indeed, I am Allah — there is no god except Me, so worship Me', ref: 'Ṭāhā 20:14' },
  ],
  'انت': [
    { ar: 'إِنَّكَ أَنتَ الْعَلِيمُ الْحَكِيمُ', en: 'Indeed You are the All-Knowing, the All-Wise', ref: 'Al-Baqarah 2:32' },
  ],
  // ── Core verbs ────────────────────────────────────────────────────────────
  'قرا': [
    { ar: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', en: 'Read in the name of your Lord who created', ref: 'Al-ʿAlaq 96:1' },
    { ar: 'فَإِذَا قَرَأْتَ الْقُرْآنَ فَاسْتَعِذْ بِاللَّهِ', en: 'When you recite the Quran, seek refuge in Allah', ref: 'Al-Naḥl 16:98' },
  ],
  'كتب': [
    { ar: 'كَتَبَ رَبُّكُمْ عَلَىٰ نَفْسِهِ الرَّحْمَةَ', en: 'Your Lord has decreed upon Himself mercy', ref: 'Al-Anʿām 6:12' },
    { ar: 'كُتِبَ عَلَيْكُمُ الصِّيَامُ', en: 'Fasting has been prescribed for you', ref: 'Al-Baqarah 2:183' },
    { ar: 'كَتَبَ اللَّهُ لَأَغْلِبَنَّ أَنَا وَرُسُلِي', en: 'Allah has decreed: I and My messengers will surely prevail', ref: 'Al-Mujādilah 58:21' },
  ],
  'فتح': [
    { ar: 'إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا', en: 'Indeed We have given you a clear triumph', ref: 'Al-Fatḥ 48:1' },
    { ar: 'وَهُوَ الْفَتَّاحُ الْعَلِيمُ', en: 'And He is the Opener, the All-Knowing', ref: 'Sabaʾ 34:26' },
  ],
  'ذهب': [
    { ar: 'إِنِّي ذَاهِبٌ إِلَىٰ رَبِّي سَيَهْدِينِ', en: 'Indeed I am going to my Lord — He will guide me', ref: 'Al-Ṣāffāt 37:99' },
    { ar: 'وَلَوْ شَاءَ اللَّهُ لَذَهَبَ بِسَمْعِهِمْ وَأَبْصَارِهِمْ', en: 'If Allah willed, He could take away their hearing and their sight', ref: 'Al-Baqarah 2:20' },
  ],
  'دخل': [
    { ar: 'ادْخُلُوهَا بِسَلَامٍ آمِنِينَ', en: 'Enter it in peace, secure', ref: 'Al-Ḥijr 15:46' },
    { ar: 'وَقِيلَ لَهُمُ ادْخُلُوا الْجَنَّةَ', en: 'And it is said to them: Enter Paradise', ref: 'Al-Zumar 39:73' },
  ],
  'خرج': [
    { ar: 'يُخْرِجُهُم مِّنَ الظُّلُمَاتِ إِلَى النُّورِ', en: 'He brings them out from darkness into light', ref: 'Al-Baqarah 2:257' },
  ],
  'فهم': [
    { ar: 'فَفَهَّمْنَاهَا سُلَيْمَانَ وَكُلًّا آتَيْنَا حُكْمًا وَعِلْمًا', en: 'We gave Sulaymān its understanding, and to each We gave wisdom and knowledge', ref: 'Al-Anbiyāʾ 21:79' },
  ],
  'درس': [
    { ar: 'وَدَرَسُوا مَا فِيهِ', en: 'And they studied what was in it', ref: 'Al-Aʿrāf 7:169' },
  ],
  // ── Question words ────────────────────────────────────────────────────────
  'كيف': [
    { ar: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ', en: 'Have you not seen how your Lord dealt with the companions of the elephant?', ref: 'Al-Fīl 105:1' },
    { ar: 'كَيْفَ تَكْفُرُونَ بِاللَّهِ وَكُنتُمْ أَمْوَاتًا فَأَحْيَاكُمْ', en: 'How can you deny Allah when you were lifeless and He gave you life?', ref: 'Al-Baqarah 2:28' },
  ],
  'متى': [
    { ar: 'مَتَىٰ نَصْرُ اللَّهِ أَلَا إِنَّ نَصْرَ اللَّهِ قَرِيبٌ', en: 'When is the help of Allah? Unquestionably, the help of Allah is near', ref: 'Al-Baqarah 2:214' },
  ],
  // ── Prepositions ─────────────────────────────────────────────────────────
  'قبل': [
    { ar: 'لِلَّهِ الْأَمْرُ مِن قَبْلُ وَمِن بَعْدُ', en: 'The command belongs to Allah — before and after', ref: 'Al-Rūm 30:4' },
  ],
  'بعد': [
    { ar: 'لِلَّهِ الْأَمْرُ مِن قَبْلُ وَمِن بَعْدُ', en: 'The command belongs to Allah — before and after', ref: 'Al-Rūm 30:4' },
  ],
  // ── Numbers ───────────────────────────────────────────────────────────────
  'واحد': [
    { ar: 'وَإِلَٰهُكُمْ إِلَٰهٌ وَاحِدٌ لَّا إِلَٰهَ إِلَّا هُوَ الرَّحْمَٰنُ الرَّحِيمُ', en: 'Your God is One God — there is no god except Him, the Most Compassionate, the Most Merciful', ref: 'Al-Baqarah 2:163' },
  ],
  // ── Adjectives ────────────────────────────────────────────────────────────
  'كريم': [
    { ar: 'إِنَّهُ لَقُرْآنٌ كَرِيمٌ', en: 'Indeed it is a noble Quran', ref: 'Al-Wāqiʿah 56:77' },
    { ar: 'إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ', en: 'Indeed the most noble of you in the sight of Allah is the most righteous', ref: 'Al-Ḥujurāt 49:13' },
  ],
  'صادق': [
    { ar: 'وَكُونُوا مَعَ الصَّادِقِينَ', en: 'And be with the truthful', ref: 'Al-Tawbah 9:119' },
  ],
  // ── Colours ───────────────────────────────────────────────────────────────
  'ابيض': [
    { ar: 'يَوْمَ تَبْيَضُّ وُجُوهٌ وَتَسْوَدُّ وُجُوهٌ', en: 'The Day when faces will be brightened and faces will be darkened', ref: 'Āl ʿImrān 3:106' },
  ],
  'اسود': [
    { ar: 'يَوْمَ تَبْيَضُّ وُجُوهٌ وَتَسْوَدُّ وُجُوهٌ', en: 'The Day when faces will be brightened and faces will be darkened', ref: 'Āl ʿImrān 3:106' },
  ],
  'احمر': [
    { ar: 'جُدَدٌ بِيضٌ وَحُمْرٌ مُّخْتَلِفٌ أَلْوَانُهَا وَغَرَابِيبُ سُودٌ', en: 'White and red streaks of varying colours, and intensely black ones', ref: 'Fāṭir 35:27' },
  ],
  'اخضر': [
    { ar: 'وَيَلْبَسُونَ ثِيَابًا خُضْرًا مِّن سُنْدُسٍ وَإِسْتَبْرَقٍ', en: 'They will wear green garments of fine silk and brocade', ref: 'Al-Kahf 18:31' },
  ],
  'اصفر': [
    { ar: 'بَقَرَةٌ صَفْرَاءُ فَاقِعٌ لَّوْنُهَا تَسُرُّ النَّاظِرِينَ', en: 'A cow intensely yellow — its colour pleasing to those who behold it', ref: 'Al-Baqarah 2:69' },
  ],
  // ── Nouns ─────────────────────────────────────────────────────────────────
  'رجال': [
    { ar: 'رِجَالٌ صَدَقُوا مَا عَاهَدُوا اللَّهَ عَلَيْهِ', en: 'Men who were true to what they pledged to Allah', ref: 'Al-Aḥzāb 33:23' },
  ],
  // ── Verbs (retained for review-session vocabulary) ────────────────────────
  // present-tense يَـ forms (stripQ of يَقْرَأُ → يقرا, يَفْتَحُ → يفتح, etc.)
  'يقرا': [
    { ar: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ', en: 'Read in the name of your Lord who created', ref: 'Al-ʿAlaq 96:1' },
  ],
  'يفتح': [
    { ar: 'مَا يَفْتَحِ اللَّهُ لِلنَّاسِ مِن رَّحْمَةٍ فَلَا مُمْسِكَ لَهَا', en: 'Whatever Allah opens for people of mercy, none can withhold it', ref: 'Fāṭir 35:2' },
  ],
  'يدخل': [
    { ar: 'ادْخُلُوا الْجَنَّةَ بِمَا كُنتُمْ تَعْمَلُونَ', en: 'Enter Paradise for what you used to do', ref: 'Al-Naḥl 16:32' },
  ],
  'ياكل': [
    { ar: 'كُلُوا مِن طَيِّبَاتِ مَا رَزَقْنَاكُمْ', en: 'Eat from the wholesome things We have provided you', ref: 'Al-Baqarah 2:172' },
  ],
  'اعطى': [
    { ar: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', en: 'Indeed We have granted you abundance', ref: 'Al-Kawthar 108:1' },
  ],
  'اخذ': [
    { ar: 'لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ', en: 'Neither slumber overtakes Him nor sleep', ref: 'Al-Baqarah 2:255 (Āyat al-Kursī)' },
    { ar: 'وَأَخَذَ رَبُّكَ بَنِي آدَمَ مِن ظُهُورِهِمْ ذُرِّيَّتَهُمْ', en: 'And when your Lord took from the children of Adam — from their loins — their descendants', ref: 'Al-Aʿrāf 7:172' },
  ],
  'سال': [
    { ar: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ', en: 'When My servants ask you about Me — I am near', ref: 'Al-Baqarah 2:186' },
  ],
  // ── iḍāfa phrases — sessions 19–20 ──────────────────────────────────────────
  'رسول الله': [
    { ar: 'مُحَمَّدٌ رَّسُولُ اللَّهِ وَالَّذِينَ مَعَهُ أَشِدَّاءُ عَلَى الْكُفَّارِ', en: 'Muhammad is the messenger of Allah; those with him are firm against the disbelievers', ref: 'Al-Fatḥ 48:29' },
  ],
  'يوم الدين': [
    { ar: 'مَالِكِ يَوْمِ الدِّينِ', en: 'Master of the Day of Judgement', ref: 'Al-Fātiḥa 1:4' },
    { ar: 'وَإِنَّ الدِّينَ لَوَاقِعٌ', en: 'And the Day of Judgement will certainly come to pass', ref: 'Al-Dhāriyāt 51:6' },
  ],
  'رب العالمين': [
    { ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', en: 'All praise is for Allah, Lord of all the worlds', ref: 'Al-Fātiḥa 1:2' },
    { ar: 'قَالَ فِرْعَوْنُ وَمَا رَبُّ الْعَالَمِينَ', en: 'Pharaoh said: "And what is the Lord of the worlds?"', ref: 'Al-Shuʿarāʾ 26:23' },
  ],
  'عبد الله': [
    { ar: 'إِنِّي عَبْدُ اللَّهِ آتَانِيَ الْكِتَابَ وَجَعَلَنِي نَبِيًّا', en: 'I am the servant of Allah — He has given me the Scripture and made me a prophet', ref: 'Maryam 19:30' },
  ],
  // ── attached-pronoun forms — session 20 ──────────────────────────────────────
  'ربي': [
    { ar: 'لَّكِنَّا هُوَ اللَّهُ رَبِّي وَلَا أُشْرِكُ بِرَبِّي أَحَدًا', en: 'But He is Allah, my Lord — and I associate no one with my Lord', ref: 'Al-Kahf 18:38' },
  ],
  'ربك': [
    { ar: 'اقْرَأْ وَرَبُّكَ الْأَكْرَمُ', en: 'Read — and your Lord is the Most Generous', ref: 'Al-ʿAlaq 96:3' },
    { ar: 'وَمَا رَبُّكَ بِظَلَّامٍ لِّلْعَبِيدِ', en: 'Your Lord is never unjust to His servants', ref: 'Fuṣṣilat 41:46' },
  ],
  'رحمته': [
    { ar: 'وَاللَّهُ يَخْتَصُّ بِرَحْمَتِهِ مَن يَشَاءُ', en: 'Allah grants His mercy to whomever He wills', ref: 'Al-Baqarah 2:105' },
    { ar: 'يُدْخِلُهُم فِي رَحْمَتِهِ', en: 'He will admit them into His mercy', ref: 'Al-Insān 76:31' },
  ],
  'نوره': [
    { ar: 'وَاللَّهُ مُتِمُّ نُورِهِ وَلَوْ كَرِهَ الْكَافِرُونَ', en: 'Allah will perfect His light, even if the disbelievers hate it', ref: 'Al-Ṣaff 61:8' },
  ],
  // ── Animals (Book 1 sessions 3 & 16) ──────────────────────────────────────
  'حوت': [
    { ar: 'فَالْتَقَمَهُ الْحُوتُ وَهُوَ مُلِيمٌ', en: 'Then the whale swallowed him, while he was blameworthy', ref: 'Al-Ṣāffāt 37:142' },
    { ar: 'فَلَمَّا بَلَغَا مَجْمَعَ بَيْنِهِمَا نَسِيَا حُوتَهُمَا', en: 'But when they reached the junction between them, they forgot their fish', ref: 'Al-Kahf 18:61' },
  ],
  'خنزير': [
    { ar: 'إِنَّمَا حَرَّمَ عَلَيْكُمُ الْمَيْتَةَ وَالدَّمَ وَلَحْمَ الْخِنْزِيرِ', en: 'He has only forbidden you carrion, blood, and the flesh of swine', ref: 'Al-Baqarah 2:173' },
  ],
  'قرد': [
    { ar: 'فَقُلْنَا لَهُمْ كُونُوا قِرَدَةً خَاسِئِينَ', en: 'So We said to them: Be apes, despised (plural of قِرْدٌ)', ref: 'Al-Baqarah 2:65' },
    { ar: 'فَلَمَّا عَتَوْا عَنْ مَا نُهُوا عَنْهُ قُلْنَا لَهُمْ كُونُوا قِرَدَةً خَاسِئِينَ', en: 'When they persisted in what they were forbidden, We said: Be apes, despised', ref: 'Al-Aʿrāf 7:166' },
  ],
  'عنكبوت': [
    { ar: 'كَمَثَلِ الْعَنْكَبُوتِ اتَّخَذَتْ بَيْتًا', en: 'Like the spider that builds a house — note the feminine verb اتَّخَذَتْ', ref: 'Al-ʿAnkabūt 29:41' },
    { ar: 'وَإِنَّ أَوْهَنَ الْبُيُوتِ لَبَيْتُ الْعَنْكَبُوتِ', en: 'And indeed the frailest of houses is the spider\'s house', ref: 'Al-ʿAnkabūt 29:41' },
  ],
  'بقرة': [
    { ar: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَنْ تَذْبَحُوا بَقَرَةً', en: 'Indeed, Allah commands you to sacrifice a cow', ref: 'Al-Baqarah 2:67' },
    { ar: 'بَقَرَةٌ صَفْرَاءُ فَاقِعٌ لَوْنُهَا تَسُرُّ النَّاظِرِينَ', en: 'A cow intensely yellow — its colour pleasing to those who behold it', ref: 'Al-Baqarah 2:69' },
  ],
  'نملة': [
    { ar: 'قَالَتْ نَمْلَةٌ يَا أَيُّهَا النَّمْلُ ادْخُلُوا مَسَاكِنَكُمْ', en: 'An ant said: O ants, enter your dwellings — قَالَتْ is feminine, matching نَمْلَةٌ', ref: 'Al-Naml 27:18' },
  ],
  'نحلة': [
    { ar: 'وَأَوْحَى رَبُّكَ إِلَى النَّحْلِ أَنِ اتَّخِذِي مِنَ الْجِبَالِ بُيُوتًا', en: 'And your Lord inspired the bees: Take homes among the mountains (النَّحْل = bees, collective)', ref: 'Al-Naḥl 16:68' },
  ],
  'ذبابة': [
    { ar: 'إِنَّ الَّذِينَ تَدْعُونَ مِنْ دُونِ اللَّهِ لَنْ يَخْلُقُوا ذُبَابًا', en: 'Those you call upon besides Allah could never create a fly (ذُبَاب = flies, collective)', ref: 'Al-Ḥajj 22:73' },
  ],
};

// ── Quran Word Frequency ──────────────────────────────────────────────────────
// Term frequencies sourced from qurananalysis.com word-frequency data.
// Keys are the stripQ-processed form of the Quranic word (diacritics stripped,
// leading ال removed, أإآ→ا). Used to calculate "Quran Unlocked %" coverage.
const TOTAL_QURAN_TOKENS = 77800;
const QURAN_WORD_FREQ = {
  // ── Top 80 by term frequency ──────────────────────────────────────────────
  "من":     2763,  // مِن — from/of
  "له":     2428,  // اللَّه (2153) + لَه (275) — both strip to this key
  "في":     1185,  // فِي — in
  "ما":     1010,  // مَا — what/not
  "ان":      966,  // إِن/أَن — both normalise here; higher taken
  "لا":      812,  // لَا — no/not
  "ذين":     810,  // الَّذِين — those who (ال stripped)
  "على":     670,  // عَلَى — on/upon
  "الا":     664,  // إِلَّا — except
  "ولا":     658,  // وَلَا
  "وما":     646,  // وَمَا
  "قال":     416,  // قَال — he said
  "الى":     405,  // إِلَى — towards (إ→ا)
  "لهم":     373,  // لَهُم — for them
  "يا":      350,  // يَا — O! (vocative)
  "ومن":     342,  // وَمَن
  "لكم":     337,  // لَكُم — for you (pl.)
  "به":      327,  // بِه — with/by it
  "كان":     323,  // كَان — he was
  "بما":     296,  // بِمَا
  "قل":      294,  // قُل — say!
  "ارض":     287,  // أَرْض / الأَرْض — earth (أ→ا, ال stripped)
  "ذلك":     280,  // ذَلِك — that
  "او":      280,  // أَو — or (أ→ا)
  "ذي":      268,  // الَّذِي — who/which (ال stripped)
  "هو":      265,  // هُو — he
  "امنوا":   263,  // آمَنُوا — they believed (آ→ا)
  "هم":      261,  // هُم — they
  "وان":     254,  // وَإِن
  "قالوا":   250,  // قَالُوا — they said
  "كل":      245,  // كُل — every/all
  "فيها":    241,  // فِيهَا — in it/them
  "كانوا":   229,  // كَانُوا — they were
  "عن":      223,  // عَن — about/from
  "اذا":     221,  // إِذَا — when (إ→ا)
  "يوم":     217,  // يَوم — day
  "عليهم":   214,  // عَلَيهِم — upon them
  "شيء":     190,  // شَيء — thing
  "هذا":     190,  // هَذَا — this (m.)
  "كفروا":   189,  // كَفَرُوا — they disbelieved
  "كنتم":    188,  // كُنتُم — you were
  "سماوات":  182,  // السَّمَاوَات — heavens (ال stripped)
  "ناس":     182,  // النَّاس — people (ال stripped)
  "لم":      178,  // لَم — did not
  "وهو":     171,  // وَهُو
  "فان":     168,  // فَإِن (إ→ا)
  "هذه":     168,  // هَذِه — this (f.) [estimated rank ~70]
  "اذ":      165,  // إِذ — when/while (إ→ا)
  "عليكم":   164,  // عَلَيكُم — upon you
  "كتاب":    163,  // الكتاب / كِتَاب — book (ال stripped)
  "انا":     156,  // إِنَّا — indeed We (إ→ا)
  "منهم":    153,  // مِنهُم — from them
  "عذاب":    150,  // عَذَاب — punishment
  "انه":     147,  // إِنَّه — indeed he/it (إ→ا)
  "بعد":     146,  // بَعد — after
  "عليه":    146,  // عَلَيه — upon him/it
  "حتى":     142,  // حَتَّى — until
  "اولئك":   133,  // أُولَئِك — those (أ→ا)
  "اني":     131,  // إِنِّي — indeed I (إ→ا)
  "امر":     131,  // أَمر — command/matter (أ→ا)
  "رب":      130,  // رَب — Lord
  "موسى":    129,  // مُوسَى — Moses
  "بل":      127,  // بَل — rather/nay
  "قد":      126,  // قَد — indeed/already
  "قوم":     126,  // قَوم — people/tribe
  "عبد":     119,  // عَبد — servant/worshipper
  "قبل":     118,  // قَبل — before
  // ── Additional Quranic words taught in the app (verified frequencies) ─────
  "رسول":    332,  // رَسُول — messenger
  "ملك":     160,  // مَلَك/مَلِك — angel/king
  "جنة":     147,  // جَنَّة — paradise/garden
  "نار":     145,  // نَار — fire
  "سماء":    120,  // سَمَاء — sky/heaven (singular)
  "مومن":     95,  // مُؤْمِن — believer (m.)
  "مومنة":    45,  // مُؤْمِنَة — believer (f.)
  "رحيم":    114,  // رَحِيم — Most Merciful
  "كريم":     27,  // كَرِيم — generous/noble
  "نبي":      75,  // نَبِيّ — prophet
  "شجرة":     26,  // شَجَرَة — tree
  "رجل":      55,  // رَجُل — man
  "باب":      40,  // بَاب — door/gate
  "بيت":      65,  // بَيْت — house
  "مسجد":     28,  // مَسْجِد — mosque
  "كلب":       5,  // كَلْب — dog
  "ذئب":       2,  // ذِئْب — wolf
  "جمل":       6,  // جَمَل — camel
  "فيل":       5,  // فِيل — elephant
  "سراج":      6,  // سِرَاج — lamp
  "قوس":       1,  // قَوْس — bow (rare)
};

// Returns what share of Quranic word tokens the learner can recognise,
// based on the vocab from all completed sessions.
function getQuranCoverage(completedSessionIds) {
  const knownKeys = new Set();
  SESSIONS
    .filter(s => completedSessionIds.includes(s.id))
    .forEach(s => {
      s.vocab.forEach(w => {
        const k = stripQ(w.ar);
        if (QURAN_WORD_FREQ[k]) knownKeys.add(k);
      });
    });
  const total = Object.keys(QURAN_WORD_FREQ).length;
  return Math.round((knownKeys.size / total) * 1000) / 10; // one decimal %
}

// Returns the QURAN_CONNECTIONS key for the primary word in an exercise, or null.
// Skips keys already shown this session (present in shownKeys) and falls through
// to the next unseen word. If all words have been shown, returns the first available.
function getQuranWord(exercise, shownKeys = new Set()) {
  const candidates =
    exercise.type === 'ar_en' ? [exercise.prompt] :
    exercise.type === 'en_ar' ? [exercise.correct] :
    exercise.answer ? exercise.answer : [];
  // First pass: prefer an unseen key
  for (const w of candidates) {
    const key = stripQ(w);
    if (QURAN_CONNECTIONS[key] && !shownKeys.has(key)) return key;
  }
  // Fallback: all have been seen — return the first available key
  for (const w of candidates) {
    const key = stripQ(w);
    if (QURAN_CONNECTIONS[key]) return key;
  }
  return null;
}

// ── UI strings (English + Urdu) ──────────────────
const UI_TEXT = {
  en: {
    whatMean:       "What does this mean?",
    selectArabic:   "Select the Arabic for:",
    buildSentence:  "Build the sentence:",
    tapToBuild:     "Tap tiles below to build the sentence",
    tapToAnswer:    "Tap tiles to answer",
    hearSentence:   "hear the sentence",
    hearAnswer:     "hear the answer",
    matchPairs:     "Match the pairs:",
    checkBtn:       "Check ✓",
    confirmBtn:     "Confirm ✓",
    correctMsg:     "✓ Correct!",
    perfectMsg:     "✓ Perfect!",
    newWords:       "New Words:",
    startPractice:  "Start Practice →",
    grammarTag:     "📖 Grammar",
    spotError:      "🔍 Spot the Error",
    goldTiles:      "✨ Gold tiles are pre-placed — tap to see their meaning",
    grammarPhase:   "📖 Grammar Questions",
    sentencePhase:  "✏️ Sentence Building",
    overallProg:    "Overall Progress",
    sessions:       "sessions",
    startLearn:     "Start Learning 🚀",
    continueLearn:  "Continue Learning →",
    allSessions:    "All Sessions",
    howItWorks:     "📖 How it works",
    howItWorksText: "5–15 min daily · 2 sessions per lesson · Review every 5 lessons · 26 sessions",
    settingsTitle:  "⚙️ Settings",
    unlockLabel:    "🔓 Unlock all lessons",
    unlockDesc:     "Jump to any session without completing previous ones",
    resetLabel:     "🗑️ Reset all progress",
    resetDesc:      "This will clear all completed sessions, XP, and streaks. Cannot be undone.",
    resetBtn:       "Reset Progress",
    resetConfirm:   "Reset all progress? This cannot be undone.",
    statsLabel:     "📊 Your Stats",
    statDone:       "Sessions done",
    statTotal:      "Total sessions",
    statXp:         "XP earned",
    statStreak:     "Streak",
    langLabel:      "🌐 Language",
    back:           "← Back",
    homeBtn:        "← Home",
    wrongMeansAr:   (prompt, correct) => `✗ ${prompt} means "${correct}"`,
    wrongMeansEn:   (promptEn, correct) => `✗ The Arabic for "${promptEn}" is`,
    youChoseEn:     (sel) => `You chose "${sel}"`,
    youChoseAr:     (sel, meaning) => `You chose ${sel}${meaning ? ` — "${meaning}"` : ""}`,
    wrongCorrect:   (ans) => `✗ Correct: ${ans}`,
    correctAns:     (ans) => `✗ Correct answer: ${ans}`,
    reviewSession:  "REVIEW SESSION",
    reviewCovers:   "Covers:",
    grammarQs:      "Grammar Qs",
    sentenceTiles:  "Sentence Tiles",
    howItWorksRev:  "💡 How this works",
    howItWorksRevText: (g, t) => `First answer ${g} grammar questions, then build ${t} Arabic sentences from English. Gold tiles are pre-placed — tap them to see their meaning!`,
    startReview:    "Start Review 🏆",
    exitBtn:        "← Exit",
    sessionOf:      (n, total) => `Session ${n} of ${total}`,
    bookLessonPart: (b, l, p) => `Book ${b} · Part ${p}`,
  },
};

// ── Emoji lookup by English meaning ─────────────
const EMOJI = {
  // Objects
  "book":"📖","pen":"🖊️","key":"🔑","door":"🚪","pencil":"✏️",
  "house":"🏠","home":"🏠","mosque":"🕌","star":"⭐","stone":"🪨","rock":"🪨",
  "bed":"🛏️","chair":"🪑","desk":"🖥️","desk/office":"🗂️","office":"🏢","wall":"🧱",
  "table":"🪑","lamp":"🪔","light":"💡","window":"🪟","room":"🛋️",
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
  "teacher":"👨‍🏫","teacher (m.)":"👨‍🏫","teacher (f.)":"👩‍🏫",
  "student":"👨‍🎓","student (m.)":"👨‍🎓","student (f.)":"👩‍🎓",
  "friend":"🤝","servant":"🙇",
  "king":"👑","slave":"🙇",
  "doctor":"👨‍⚕️","doctor (m.)":"👨‍⚕️","doctor (f.)":"👩‍⚕️",
  "engineer":"👷","worker":"👷","merchant":"🧑‍💼","farmer":"🧑‍🌾",
  "imam":"👳🏼‍♂️","handkerchief":"🤧",
  // Animals
  "dog":"🐕","cat":"🐈","horse":"🐴","lion":"🦁","bird":"🐦",
  "cow":"🐄","camel":"🐪","sheep":"🐑","elephant":"🐘","fish":"🐟",
  // Religion / abstract
  "prayer":"🤲","fasting":"🌙","pilgrimage":"🕌","zakat":"💰",
  "paradise":"🌹","hellfire":"🔥","devil":"😈",
  "good":"✅","bad":"❌","mercy":"💚","patience":"⏳","gratitude":"🙏",
  "world":"🌍","hereafter":"⭐","death":"💀","life":"🌱",
  "heart":"❤️","hand":"✋","eye":"👁️","face":"😊","head":"🧠",
  "city":"🏙️","village":"🏘️","country":"🗺️","market":"🛒",
  "money":"💰","gold":"🥇","silver":"🥈",
  "war":"⚔️","peace":"☮️","victory":"🏆",
  "right":"➡️","left":"⬅️","near":"📍","far":"🔭",
  "big":"🔼","small":"🔽","new":"✨","old":"📜",
  "east":"🌅","west":"🌇","north":"⬆️","south":"⬇️",
  // Verbs — present tense (he)
  "he writes":"✍️","he reads":"📖","he goes":"🚶","he sits":"🪑",
  "he opens":"🔓","he goes out":"🚪","he enters":"🏠","he eats":"🍽️",
  // Verbs — I / you
  "i write":"✍️","you write (m.)":"✍️","i go":"🚶","you go (m.)":"🚶",
  // Verbs — we / they
  "we write":"✍️","they write (m.)":"✍️","we go":"🚶","they go (m.)":"🚶",
  // Commands
  "write! (m.)":"✍️","read! (m.)":"📖","sit! (m.)":"🪑","go out! (m.)":"🚪",
  "write! (f.)":"✍️","write! (pl.)":"✍️","open! (pl.)":"🔓","listen! (pl.)":"👂",
  // Days
  "sunday":"🌅","monday":"📅","tuesday":"📅","wednesday":"📅",
  "thursday":"📅","friday":"🕌","saturday":"🌙",
  "when?":"❓",
  // Numbers
  "one":"1️⃣","two":"2️⃣","three":"3️⃣","four":"4️⃣","five":"5️⃣",
  "six":"6️⃣","seven":"7️⃣","eight":"8️⃣","nine":"9️⃣","ten":"🔟",
  // Past tense
  "he went":"🚶","she went":"🚶‍♀️","he wrote":"✍️","she wrote":"✍️",
  "i went":"🚶","you went (m.)":"🚶","we went":"🚶","they went (m.)":"🚶",
  // Negation
  "is not":"❌","he does not go":"🚫","he did not go":"🚫",
  "he did not go (لَمْ)":"🚫","do not write (prohibition)":"✋",
  "don't go! (m.)":"✋","don't lie!":"✋","don't forget!":"✋","don't despair!":"🌟",
  // Question words
  "what? (what thing?)":"❓","how?":"❓","why?":"❓","which?":"❓",
  "how are you?":"💬",
  // Transitive verbs
  "he gave":"🤲","he took":"✋","he understood":"💡","he asked":"❓",
  "i gave him/it":"🤲","he asked me":"❓","they understood it":"💡","i took it (f.)":"✋",
  // Indirect object / possession
  "for him / his":"🔑","for her / hers":"🔑","for us / ours":"🔑","for you all":"🔑",
  "i have / at me":"🤲","he has / at him":"🤲","he has (formal)":"🤲","he had":"🤲",
  // Review verbs
  "he studies":"📖","he studied":"📖","study! (m.)":"📖","he did not study":"📖",
  // Adverbs
  "daily":"📅","sometimes":"🔄","always":"♾️","never":"🚫",
  // Plural pronouns
  "you (m. plural)":"👥","you (f. plural)":"👥","they (m.)":"👥","these (people)":"👥",
  // Dual
  "two books":"📚","two students (m.)":"👨‍🎓","the two of them":"👫","these two (m.)":"👉",
  // Book 1 vocab whose exact keys were previously unmapped
  "wolf":"🐺","donkey":"🫏","whale":"🐋","pig":"🐖","swine":"🐖",
  "monkey":"🐒","ape":"🐒","spider":"🕷️","ant":"🐜","bee":"🐝","honey bee":"🐝","fly":"🪰",
  // NOTE: no emoji for مَلَكٌ (angel) or رَسُولٌ (messenger) — these are not depicted.
  "sky/heaven":"☁️","paradise/garden":"🌿","classroom":"🏫",
  "husband":"🤵","wife":"👰",
};
const getEmoji = (en) => {
  const key = en.toLowerCase();
  // Try exact match first, then strip a leading "the " (for definite-form vocab like "the sun")
  return EMOJI[key] || EMOJI[en] || EMOJI[key.replace(/^the\s+/, "")] || null;
};

// ── Urdu vocabulary translations (English → Urdu) ──────────────

// ── Urdu grammar notes (by session id) ────────────────────────

// ── Urdu translations for English hint sentences (patternTiles & reviewTiles) ──

// ── Urdu translations for session subtitle (titleEn) ──

// ── Analytics helper ─────────────────────────────────────────────────────────
const track = (event, params = {}) => {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", event, params);
    }
  } catch (_) {}
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Case-form variant generator ────────────────────────────────────────────
// Given an Arabic word, returns alternative forms with different case endings
// (nominative / accusative / genitive) and definite/indefinite swaps.
// Used to generate plausible distractors in tile exercises so students must
// identify the correct iʿrāb ending, not just the word.
function makeCaseVariants(ar) {
  const NOM_I = '\u064C'; // ٌ  indefinite nominative (tanwīn ḍamm)
  const GEN_I = '\u064D'; // ٍ  indefinite genitive   (tanwīn kasr)
  const NOM_D = '\u064F'; // ُ  definite nominative   (ḍamm)
  const ACC_D = '\u064E'; // َ  definite accusative   (fatḥ)
  const GEN_D = '\u0650'; // ِ  definite genitive     (kasr)

  const last = ar[ar.length - 1];
  const stem = ar.slice(0, -1);
  const isDefinite = /^ال/.test(ar);
  const variants = new Set();

  if (last === NOM_I) {
    // Indefinite nominative → add indefinite genitive + definite nominative
    variants.add(stem + GEN_I);
    if (!isDefinite) variants.add('\u0627\u0644\u0652' + stem + NOM_D); // الْ + stem + ُ
  } else if (last === GEN_I) {
    // Indefinite genitive → add indefinite nominative
    variants.add(stem + NOM_I);
  } else if (last === NOM_D && isDefinite) {
    // Definite nominative → add accusative and genitive
    variants.add(stem + ACC_D);
    variants.add(stem + GEN_D);
  } else if (last === ACC_D && isDefinite) {
    // Definite accusative → add nominative and genitive
    variants.add(stem + NOM_D);
    variants.add(stem + GEN_D);
  } else if (last === GEN_D && isDefinite) {
    // Definite genitive → add nominative and accusative
    variants.add(stem + NOM_D);
    variants.add(stem + ACC_D);
  }

  // Only return variants that differ from the original and have real length
  return [...variants].filter(v => v !== ar && v.length > 2);
}

// ── Audio (Web Speech API) ──────────────────────
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  // Arabic TTS applies "pausal form" to utterance-final words, dropping the
  // final short vowel (case ending). For isolated words (MCQ options, vocab
  // taps) we want the full ending pronounced — append U+200C (ZWNJ) to
  // prevent pausal form. For sentences (text contains spaces) pausal form on
  // the last word is correct Classical Arabic, so leave those unchanged.
  const isIsolatedWord = !text.includes(" ");
  const ttsText = (isIsolatedWord && /[\u064B-\u0650]$/.test(text)) ? text + "\u200C" : text;

  const utt = new SpeechSynthesisUtterance(ttsText);
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
// SESSIONS (24 regular sessions, Book 1)
// ──────────────────────────────────────────────
const SESSIONS = [

// ═══ BOOK 1 · Lessons 1–10 · Sessions 1–20 ═══

  { id:1, book:1, lessonRef:"1.1", part:"A", title:"مَا هَذَا؟", titleEn:"What Is This? (Part 1)",
    grammar:'هَذَا means "this" for masculine objects. مَا هَذَا؟ = What is this? Answer: هَذَا كِتَابٌ. Nouns take ـٌ (tanwīn ḍamm) in the indefinite.',
    vocab:[{ar:"كِتَابٌ",en:"book"},{ar:"قَلَمٌ",en:"pen"},{ar:"مِفْتَاحٌ",en:"key"},{ar:"بَابٌ",en:"door"}],
    patternTiles:[
      {emoji:"📖", question:"مَا هَذَا؟", tiles:["هَذَا","كِتَابٌ","قَلَمٌ","مِفْتَاحٌ"], answer:["هَذَا","كِتَابٌ"]},
      {emoji:"🔑", question:"مَا هَذَا؟", tiles:["هَذَا","مِفْتَاحٌ","بَابٌ","كِتَابٌ"], answer:["هَذَا","مِفْتَاحٌ"]},
      {emoji:"🖊️", question:"مَا هَذَا؟", tiles:["هَذَا","قَلَمٌ","كِتَابٌ","بَابٌ"], answer:["هَذَا","قَلَمٌ"]},
      {emoji:"🚪", question:"مَا هَذَا؟", tiles:["هَذَا","بَابٌ","مِفْتَاحٌ","قَلَمٌ"], answer:["هَذَا","بَابٌ"]},
    ]},
  { id:2, book:1, lessonRef:"1.1", part:"B", title:"مَا هَذَا؟", titleEn:"What Is This? (Part 2)",
    grammar:'More هَذَا sentences. Nouns ending in ـٌ are indefinite ("a book"). Every Arabic noun has a gender — masculine or feminine.',
    vocab:[{ar:"بَيْتٌ",en:"house"},{ar:"مَسْجِدٌ",en:"mosque"},{ar:"نَجْمٌ",en:"star"},{ar:"حَجَرٌ",en:"stone"}],
    patternTiles:[
      {emoji:"🏠", question:"مَا هَذَا؟", tiles:["هَذَا","بَيْتٌ","مَسْجِدٌ","نَجْمٌ"], answer:["هَذَا","بَيْتٌ"]},
      {emoji:"🕌", question:"مَا هَذَا؟", tiles:["هَذَا","مَسْجِدٌ","بَيْتٌ","حَجَرٌ"], answer:["هَذَا","مَسْجِدٌ"]},
      {emoji:"⭐", question:"مَا هَذَا؟", tiles:["هَذَا","نَجْمٌ","حَجَرٌ","بَيْتٌ"], answer:["هَذَا","نَجْمٌ"]},
      {emoji:"🪨", question:"مَا هَذَا؟", tiles:["هَذَا","حَجَرٌ","نَجْمٌ","مَسْجِدٌ"], answer:["هَذَا","حَجَرٌ"]},
    ]},

  { id:3, book:1, lessonRef:"1.1", part:"C", title:"الْحَيَوَانَاتُ", titleEn:"Animals",
    grammar:'More هَذَا/ذَلِكَ with animals. All these nouns are masculine. وَ means "and" — it attaches directly to the next word: هَذَا فِيلٌ وَذَلِكَ جَمَلٌ. Note: عَنْكَبُوتٌ (spider) takes either gender — we treat it as masculine here, though the Quran uses a feminine verb with it in Sūrat al-ʿAnkabūt.',
    vocab:[{ar:"كَلْبٌ",en:"dog"},{ar:"ذِئْبٌ",en:"wolf"},{ar:"حِمَارٌ",en:"donkey"},{ar:"جَمَلٌ",en:"camel"},{ar:"فِيلٌ",en:"elephant"},{ar:"حُوتٌ",en:"whale"},{ar:"خِنْزِيرٌ",en:"pig"},{ar:"قِرْدٌ",en:"monkey"},{ar:"عَنْكَبُوتٌ",en:"spider"},{ar:"وَ",en:"and"}],
    patternTiles:[
      { en:"This is a wolf and that is a dog.",
        tiles:["هَذَا","ذِئْبٌ","وَ","ذَلِكَ","كَلْبٌ","حِمَارٌ"],
        answer:["هَذَا","ذِئْبٌ","وَ","ذَلِكَ","كَلْبٌ"] },
      { en:"This is a camel and that is an elephant.",
        tiles:["هَذَا","جَمَلٌ","وَ","ذَلِكَ","فِيلٌ","كَلْبٌ"],
        answer:["هَذَا","جَمَلٌ","وَ","ذَلِكَ","فِيلٌ"] },
      { en:"This is a donkey and that is a camel.",
        tiles:["هَذَا","حِمَارٌ","وَ","ذَلِكَ","جَمَلٌ","ذِئْبٌ"],
        answer:["هَذَا","حِمَارٌ","وَ","ذَلِكَ","جَمَلٌ"] },
      { en:"This is a whale and that is a monkey.",
        tiles:["هَذَا","حُوتٌ","وَ","ذَلِكَ","قِرْدٌ","خِنْزِيرٌ"],
        answer:["هَذَا","حُوتٌ","وَ","ذَلِكَ","قِرْدٌ"] },
      { emoji:"🕷️", question:"مَا هَذَا؟",
        tiles:["هَذَا","عَنْكَبُوتٌ","قِرْدٌ","حُوتٌ","خِنْزِيرٌ"],
        answer:["هَذَا","عَنْكَبُوتٌ"] },
      { en:"This is a wolf and that is an elephant.",
        tiles:["هَذَا","ذِئْبٌ","وَ","ذَلِكَ","فِيلٌ","جَمَلٌ"],
        answer:["هَذَا","ذِئْبٌ","وَ","ذَلِكَ","فِيلٌ"] },
    ]},

  { id:4, book:1, lessonRef:"1.1", part:"D", title:"الْمِهَنُ وَالْمَلَابِسُ", titleEn:"Professions & Clothing",
    grammar:'مَنْ هَذَا؟ = Who is this? Used for people: مَنْ هَذَا؟ هَذَا إِمَامٌ. مَا هَذَا؟ هَذَا قَمِيصٌ.',
    vocab:[{ar:"إِمَامٌ",en:"imam"},{ar:"رَسُولٌ",en:"messenger"},{ar:"تَاجِرٌ",en:"merchant"},{ar:"سِرَاجٌ",en:"lamp"},{ar:"قَمِيصٌ",en:"shirt"}],
    patternTiles:[
      {en:"This is a messenger.", tiles:["هَذَا","رَسُولٌ","إِمَامٌ","تَاجِرٌ"], answer:["هَذَا","رَسُولٌ"]},
      {emoji:"👕", question:"مَا هَذَا؟", tiles:["هَذَا","قَمِيصٌ","سِرَاجٌ","كِتَابٌ","قَلَمٌ"], answer:["هَذَا","قَمِيصٌ"]},
      {emoji:"👳🏼‍♂️", question:"مَنْ هَذَا؟", tiles:["هَذَا","إِمَامٌ","رَسُولٌ","تَاجِرٌ"], answer:["هَذَا","إِمَامٌ"]},
      {emoji:"🪔", question:"مَا هَذَا؟", tiles:["هَذَا","سِرَاجٌ","قَمِيصٌ","بَابٌ","كِتَابٌ"], answer:["هَذَا","سِرَاجٌ"]},
    ]},

  { id:5, book:1, lessonRef:"1.1", part:"E", title:"أَسْئِلَةُ نَعَمْ وَلَا", titleEn:"Yes/No Questions",
    grammar:'Both أَ and هَلْ are yes/no question particles — they are interchangeable. أَهَذَا مَسْجِدٌ؟ = هَلْ هَذَا مَسْجِدٌ؟ = Is this a mosque? Answer: نَعَمْ، هَذَا مَسْجِدٌ (Yes) or لَا، هَذَا بَيْتٌ (No). أَ attaches directly to the next word; هَلْ stands alone.',
    vocab:[{ar:"نَعَمْ",en:"yes"},{ar:"لَا",en:"no"},{ar:"أَهَذَا",en:"Is this...? (m.)"},{ar:"هَلْ",en:"Is...? (yes/no question)"}],
    patternTiles:[
      { emoji:"📖", question:"أَهَذَا كِتَابٌ؟",
        hint:"Yes, this is a book.",
        tiles:["نَعَمْ","هَذَا","كِتَابٌ","لَا","قَلَمٌ"],
        answer:["نَعَمْ","هَذَا","كِتَابٌ"] },
      { emoji:"🐈", question:"أَهَذَا كَلْبٌ؟",
        hint:"No, this is a cat.",
        tiles:["لَا","هَذَا","قِطٌّ","نَعَمْ","حِمَارٌ"],
        answer:["لَا","هَذَا","قِطٌّ"] },
      { emoji:"🏠", question:"أَهَذَا بَيْتٌ؟",
        hint:"Yes, this is a house.",
        tiles:["نَعَمْ","هَذَا","بَيْتٌ","لَا","مَسْجِدٌ"],
        answer:["نَعَمْ","هَذَا","بَيْتٌ"] },
      { emoji:"🐕", question:"أَهَذَا قِطٌّ؟",
        hint:"No, this is a dog.",
        tiles:["لَا","هَذَا","كَلْبٌ","نَعَمْ","حِمَارٌ"],
        answer:["لَا","هَذَا","كَلْبٌ"] },
    ]},

  { id:6, book:1, lessonRef:"1.2", part:"A", title:"ذَلِكَ — That Is...", titleEn:"Far Demonstratives (Part 1)",
    grammar:'ذَلِكَ = "that" for masculine objects far away. وَ ("and") joins the two sentences: هَذَا مَكْتَبٌ وَذَلِكَ سَرِيرٌ.',
    vocab:[{ar:"سَرِيرٌ",en:"bed"},{ar:"كُرْسِيٌّ",en:"chair"},{ar:"مَكْتَبٌ",en:"desk/office"},{ar:"جِدَارٌ",en:"wall"}],
    patternTiles:[
      { en:"This is a chair and that is a bed.",
        tiles:["هَذَا","كُرْسِيٌّ","وَ","ذَلِكَ","سَرِيرٌ","مَكْتَبٌ"],
        answer:["هَذَا","كُرْسِيٌّ","وَ","ذَلِكَ","سَرِيرٌ"] },
      { en:"This is a desk and that is a wall.",
        tiles:["هَذَا","مَكْتَبٌ","وَ","ذَلِكَ","جِدَارٌ","كُرْسِيٌّ"],
        answer:["هَذَا","مَكْتَبٌ","وَ","ذَلِكَ","جِدَارٌ"] },
      { en:"This is a book and that is a key.",
        tiles:["هَذَا","كِتَابٌ","وَ","ذَلِكَ","مِفْتَاحٌ","بَابٌ"],
        answer:["هَذَا","كِتَابٌ","وَ","ذَلِكَ","مِفْتَاحٌ"] },
      { en:"This is a wall and that is a door.",
        tiles:["هَذَا","جِدَارٌ","وَ","ذَلِكَ","بَابٌ","مَكْتَبٌ"],
        answer:["هَذَا","جِدَارٌ","وَ","ذَلِكَ","بَابٌ"] },
    ]},
  { id:7, book:1, lessonRef:"1.2", part:"B", title:"ذَلِكَ — That Is...", titleEn:"Far Demonstratives (Part 2)",
    grammar:'Practice هَذَا and ذَلِكَ with people. مَنْ هَذَا؟ = Who is this? (used for people, not objects). وَ joins two sentences: هَذَا طَالِبٌ وَذَلِكَ مُدَرِّسٌ.',
    vocab:[{ar:"وَلَدٌ",en:"boy"},{ar:"رَجُلٌ",en:"man"},{ar:"طَالِبٌ",en:"student (m.)"},{ar:"مُدَرِّسٌ",en:"teacher (m.)"}],
    patternTiles:[
      { en:"This is a boy and that is a teacher.",
        tiles:["هَذَا","وَلَدٌ","وَ","ذَلِكَ","مُدَرِّسٌ","رَجُلٌ"],
        answer:["هَذَا","وَلَدٌ","وَ","ذَلِكَ","مُدَرِّسٌ"] },
      { en:"This is a man and that is a student.",
        tiles:["هَذَا","رَجُلٌ","وَ","ذَلِكَ","طَالِبٌ","وَلَدٌ"],
        answer:["هَذَا","رَجُلٌ","وَ","ذَلِكَ","طَالِبٌ"] },
      {emoji:"👦", question:"مَنْ هَذَا؟", tiles:["هَذَا","وَلَدٌ","رَجُلٌ","طَالِبٌ"], answer:["هَذَا","وَلَدٌ"]},
      { en:"This is a teacher and that is a student.",
        tiles:["هَذَا","مُدَرِّسٌ","وَ","ذَلِكَ","طَالِبٌ","رَجُلٌ"],
        answer:["هَذَا","مُدَرِّسٌ","وَ","ذَلِكَ","طَالِبٌ"] },
    ]},

  { id:8, book:1, lessonRef:"1.3", part:"A", title:"الـ — The Definite Article (Part 1)", titleEn:"Making Nouns Definite",
    recognitionOpener:{
      enHeading:"You already know these words",
      words:[
        {ar:"الرَّحْمٰنِ", note_en:"from Bismillāh"},
        {ar:"الرَّحِيمِ", note_en:"from Bismillāh"},
        {ar:"الْحَمْدُ", note_en:"from Al-Ḥamdu lillāh"},
        {ar:"الْكِتَابُ", note_en:"Dhālikal-kitābu — Al-Baqarah 2:2"},
      ],
      enReveal:'Every word above contains "al-" — meaning "the specific, the particular one." You\'ve always been saying "the," you just didn\'t know it.',
    },
    grammar:'الـ makes a noun definite: كِتَابٌ → الْكِتَابُ. The ـٌ disappears, replaced by ـُ. With "moon letters" الـ is fully pronounced: الْبَيْتُ.',
    grammarExamples:[
      { ar:"كِتَابٌ ← الْكِتَابُ", en:"a book → the book (tanwīn drops, ـُ stays)" },
      { ar:"بَيْتٌ ← الْبَيْتُ", en:"a house → the house (moon letter: ل is heard)" },
    ],
    vocab:[
      {ar:"الْكِتَابُ", en:"the book",  indef:"كِتَابٌ"},
      {ar:"الْقَلَمُ",  en:"the pen",   indef:"قَلَمٌ"},
      {ar:"الْبَيْتُ",  en:"the house", indef:"بَيْتٌ"},
      {ar:"الْبَابُ",   en:"the door",  indef:"بَابٌ"},
    ],
    alTransformExercises:[
      { word:"كِتَابٌ", wordEn:"book", correct:"الْكِتَابُ",
        options:["الْكِتَابُ","الْكِتَابِ","كِتَابُ","الْكِتَابَ"] },
      { word:"قَلَمٌ", wordEn:"pen", correct:"الْقَلَمُ",
        options:["الْقَلَمُ","الْقَلَمِ","قَلَمُ","الْقَلَمَ"] },
      { word:"بَيْتٌ", wordEn:"house", correct:"الْبَيْتُ",
        options:["الْبَيْتُ","الْبَيْتِ","بَيْتُ","الْبَيْتَ"] },
      { word:"بَابٌ", wordEn:"door", correct:"الْبَابُ",
        options:["الْبَابُ","الْبَابِ","بَابُ","الْبَابَ"] },
    ],
    patternTiles:[
      {
        definiteCtx:true,
        en:"That is the Book — no doubt in it.",
        quran:{ref:"Al-Baqarah 2:2", en:"That is the Book, about which there is no doubt"},
        prebaked:[{ar:"لَا",en:"no"},{ar:"رَيْبَ",en:"doubt"},{ar:"فِيهِ",en:"in it"}],
        tiles:["ذَٰلِكَ","الْكِتَابُ","الْكِتَابِ","كِتَابٌ"],
        answer:["ذَٰلِكَ","الْكِتَابُ","لَا","رَيْبَ","فِيهِ"]
      },
      {
        definiteCtx:true,
        en:"The Ancient House.",
        quran:{ref:"Al-Hajj 22:29", en:"...and circumambulate the Ancient House"},
        prebaked:[{ar:"الْعَتِيقُ",en:"the Ancient"}],
        tiles:["الْبَيْتُ","الْبَيْتِ","بَيْتٌ"],
        answer:["الْبَيْتُ","الْعَتِيقُ"]
      },
    ]},
  { id:9, book:1, lessonRef:"1.3", part:"B", title:"الـ — Sun & Moon Letters", titleEn:"Sun Letters (Part 2)",
    recognitionOpener:{
      enHeading:"These are already on your tongue",
      words:[
        {ar:"الرَّحْمٰنِ", note_en:"ر sun letter → ar-raḥmān (ل silent)"},
        {ar:"الرَّحِيمِ",  note_en:"ر sun letter → ar-raḥīm (ل silent)"},
        {ar:"النَّاسِ",   note_en:"ن sun letter → an-nās (ل silent)"},
      ],
      enReveal:'When الـ precedes a sun letter, the ل is silent — the next letter doubles instead. You\'ve always pronounced this correctly without knowing the rule.',
    },
    grammar:'With "sun letters" (ت،ث،د،ذ،ر،ز،س،ش،ص،ض،ط،ظ،ل،ن) the ل of الـ assimilates. Written but not pronounced — the first letter doubles instead.',
    grammarExamples:[
      { ar:"الْقَمَرُ", en:"Moon letter ق → al-qamar (ل is heard)" },
      { ar:"الشَّمْسُ", en:"Sun letter ش → ash-shams (ل silent, ش doubles)" },
      { ar:"الرَّجُلُ", en:"Sun letter ر → ar-rajul (ل silent, ر doubles)" },
    ],
    vocab:[
      {ar:"الشَّمْسُ",  en:"the sun",     indef:"شَمْسٌ"},
      {ar:"الرَّجُلُ",  en:"the man",     indef:"رَجُلٌ"},
      {ar:"النَّجْمُ",  en:"the star",    indef:"نَجْمٌ"},
      {ar:"الطَّالِبُ", en:"the student", indef:"طَالِبٌ"},
    ],
    sunMoonExercises:[
      { words:[
          {ar:"الشَّمْسُ",  en:"the sun",     isSun:true },
          {ar:"الْقَمَرُ", en:"the moon",    isSun:false},
          {ar:"الرَّجُلُ", en:"the man",     isSun:true },
          {ar:"الطَّالِبُ",en:"the student", isSun:true },
          {ar:"الْبَيْتُ", en:"the house",   isSun:false},
          {ar:"النَّجْمُ", en:"the star",    isSun:true },
        ]
      },
    ],
    patternTiles:[
      {
        definiteCtx:true,
        en:"The sun and the moon move by precise measure.",
        quran:{ref:"Ar-Rahman 55:5", en:"The sun and the moon move by precise calculation"},
        prebaked:[{ar:"بِحُسْبَانٍ",en:"by precise measure"}],
        tiles:["الشَّمْسُ","وَالْقَمَرُ","الشَّمْسِ","الْقَمَرُ"],
        answer:["الشَّمْسُ","وَالْقَمَرُ","بِحُسْبَانٍ"]
      },
      {
        definiteCtx:true,
        en:"And the stars and the trees bow down.",
        quran:{ref:"Ar-Rahman 55:6", en:"And the stars and the trees prostrate"},
        prebaked:[{ar:"وَالشَّجَرُ",en:"and the trees"},{ar:"يَسْجُدَانِ",en:"bow down"}],
        tiles:["وَالنَّجْمُ","النَّجْمُ","النَّجْمِ"],
        answer:["وَالنَّجْمُ","وَالشَّجَرُ","يَسْجُدَانِ"]
      },
    ]},

  { id:10, book:1, lessonRef:"1.4", part:"A", title:"الصِّفَاتُ — Adjectives (Part 1)", titleEn:"Describing with Adjectives",
    grammar:'Adjectives come AFTER the noun and must match it. Definite noun → definite adjective. Indefinite noun → indefinite adjective.',
    grammarExamples:[
      { ar:"بَيْتٌ كَبِيرٌ", en:"a big house (both indefinite — ـٌ)" },
      { ar:"الْبَيْتُ الْكَبِيرُ", en:"the big house (both definite — الـ)" },
    ],
    vocab:[{ar:"كَبِيرٌ",en:"big"},{ar:"صَغِيرٌ",en:"small"},{ar:"جَدِيدٌ",en:"new"},{ar:"قَدِيمٌ",en:"old"}],
    patternTiles:[
      {en:"This is a big house.", tiles:["هَذَا","بَيْتٌ","كَبِيرٌ","صَغِيرٌ","قَدِيمٌ"], answer:["هَذَا","بَيْتٌ","كَبِيرٌ"]},
      {en:"That is a new book.", tiles:["ذَلِكَ","كِتَابٌ","جَدِيدٌ","قَدِيمٌ","قَلَمٌ"], answer:["ذَلِكَ","كِتَابٌ","جَدِيدٌ"]},
    ]},
  { id:11, book:1, lessonRef:"1.4", part:"B", title:"الصِّفَاتُ — More Adjectives (Part 2)", titleEn:"More Adjectives",
    grammar:'More masculine adjectives. The adjective follows the noun and takes the same tanwīn.',
    grammarExamples:[
      { ar:"هَذَا طَالِبٌ جَدِيدٌ", en:"This is a new student" },
      { ar:"ذَلِكَ رَجُلٌ طَوِيلٌ", en:"That is a tall man" },
      { ar:"هَذَا كِتَابٌ جَمِيلٌ", en:"This is a beautiful book" },
    ],
    vocab:[{ar:"جَمِيلٌ",en:"beautiful"},{ar:"طَوِيلٌ",en:"tall/long"},{ar:"قَصِيرٌ",en:"short"},{ar:"كَرِيمٌ",en:"generous/noble"}],
    patternTiles:[
      {en:"This is a tall man.", tiles:["هَذَا","رَجُلٌ","طَوِيلٌ","قَصِيرٌ","وَلَدٌ"], answer:["هَذَا","رَجُلٌ","طَوِيلٌ"]},
      {en:"That is a noble messenger.", tiles:["ذَلِكَ","رَسُولٌ","كَرِيمٌ","جَمِيلٌ","إِمَامٌ"], answer:["ذَلِكَ","رَسُولٌ","كَرِيمٌ"]},
      {
        en:"Indeed, a noble letter has been delivered to me.",
        quran:{ref:"An-Naml 27:29", en:"Indeed, a noble letter has been delivered to me"},
        prebaked:[{ar:"إِنِّي",en:"indeed"},{ar:"أُلْقِيَ",en:"was delivered"},{ar:"إِلَيَّ",en:"to me"}],
        tiles:["كِتَابٌ","كَرِيمٌ","جَمِيلٌ","طَوِيلٌ"],
        answer:["إِنِّي","أُلْقِيَ","إِلَيَّ","كِتَابٌ","كَرِيمٌ"]
      },
      {
        en:"Indeed it is the word of a noble messenger.",
        quran:{ref:"At-Takwir 81:19", en:"Indeed, it is the word of a noble messenger"},
        prebaked:[{ar:"إِنَّهُ",en:"indeed it is"},{ar:"لَقَوْلُ",en:"truly the word of"}],
        tiles:["رَسُولٍ","كَرِيمٍ","جَمِيلٍ","طَوِيلٍ"],
        answer:["إِنَّهُ","لَقَوْلُ","رَسُولٍ","كَرِيمٍ"]
      },
    ]},

  { id:12, book:1, lessonRef:"1.5", part:"A", title:"حُرُوفُ الْجَرِّ (Part 1)", titleEn:"Prepositions: في، عَلَى، مِنْ، إِلَى",
    grammar:'After a preposition, the noun takes genitive case — it loses ـٌ and takes ـٍ (or ـِ if definite).',
    grammarExamples:[
      { ar:"الْكِتَابُ فِي الْبَيْتِ", en:"The book is in the house" },
      { ar:"الْقَلَمُ عَلَى الْمَكْتَبِ", en:"The pen is on the desk" },
      { ar:"جَاءَ مِنَ الْمَسْجِدِ", en:"He came from the mosque" },
    ],
    vocab:[{ar:"فِي",en:"in"},{ar:"عَلَى",en:"on"},{ar:"مِنْ",en:"from"},{ar:"إِلَى",en:"to"}],
    patternTiles:[
      {en:"The book is on the desk.", tiles:["الْكِتَابُ","عَلَى","الْمَكْتَبِ","فِي","الْبَيْتِ","الْمَكْتَبُ"], answer:["الْكِتَابُ","عَلَى","الْمَكْتَبِ"]},
      {en:"The key is in the house.", tiles:["الْمِفْتَاحُ","فِي","الْبَيْتِ","عَلَى","الْبَابِ","الْبَيْتُ"], answer:["الْمِفْتَاحُ","فِي","الْبَيْتِ"]},
      {
        en:"To Allah is the final return.",
        quran:{ref:"Al-Imran 3:28", en:"And to Allah is the final destination"},
        prebaked:[{ar:"الْمَصِيرُ",en:"the final return"}],
        tiles:["إِلَى","اللَّهِ","مِنَ","اللَّهُ","فِي"],
        answer:["إِلَى","اللَّهِ","الْمَصِيرُ"]
      },
      {
        en:"Let the believers put their trust in Allah.",
        quran:{ref:"Al-Imran 3:160", en:"And upon Allah let the believers rely"},
        prebaked:[{ar:"فَلْيَتَوَكَّلِ",en:"so let them trust"},{ar:"الْمُؤْمِنُونَ",en:"the believers"}],
        tiles:["عَلَى","اللَّهِ","فِي","اللَّهُ","مِنَ"],
        answer:["عَلَى","اللَّهِ","فَلْيَتَوَكَّلِ","الْمُؤْمِنُونَ"]
      },
    ]},
  { id:13, book:1, lessonRef:"1.5", part:"B", title:"حُرُوفُ الْجَرِّ (Part 2)", titleEn:"Prepositions: تَحْتَ، فَوْقَ، أَمَامَ",
    grammar:'Location prepositions answer أَيْنَ؟ (where?). The noun after them is genitive — it loses ـٌ and takes ـٍ.',
    grammarExamples:[
      { ar:"أَيْنَ الْكِتَابُ؟", en:"Where is the book?" },
      { ar:"الْكِتَابُ عَلَى الْمَكْتَبِ", en:"The book is on the desk" },
      { ar:"الْقَلَمُ تَحْتَ الْكِتَابِ", en:"The pen is under the book" },
    ],
    vocab:[{ar:"تَحْتَ",en:"under"},{ar:"فَوْقَ",en:"above"},{ar:"أَمَامَ",en:"in front of"},{ar:"خَلْفَ",en:"behind"}],
    patternTiles:[
      {en:"The pen is under the book.", tiles:["الْقَلَمُ","تَحْتَ","الْكِتَابِ","فَوْقَ","الْمَكْتَبِ"], answer:["الْقَلَمُ","تَحْتَ","الْكِتَابِ"]},
      {en:"The door is in front of the house.", tiles:["الْبَابُ","أَمَامَ","الْبَيْتِ","خَلْفَ","الْمَسْجِدِ"], answer:["الْبَابُ","أَمَامَ","الْبَيْتِ"]},
      {
        en:"Rivers flow from beneath them.",
        quran:{ref:"Al-Baqarah 2:25", en:"...rivers flowing from beneath them"},
        prebaked:[{ar:"تَجْرِي",en:"flow"},{ar:"مِنْ",en:"from"},{ar:"الْأَنْهَارُ",en:"the rivers"}],
        tiles:["تَحْتِهَا","فَوْقِهَا","أَمَامَهَا"],
        answer:["تَجْرِي","مِنْ","تَحْتِهَا","الْأَنْهَارُ"]
      },
      {
        en:"And above them are coverings of Fire.",
        quran:{ref:"Az-Zumar 39:16", en:"They will have coverings of Fire above them"},
        prebaked:[{ar:"وَمِنْ",en:"and from"},{ar:"ظُلَلٌ",en:"coverings"},{ar:"مِنَ",en:"of"},{ar:"النَّارِ",en:"the Fire"}],
        tiles:["فَوْقِهِمْ","تَحْتِهِمْ","أَمَامَهُمْ"],
        answer:["وَمِنْ","فَوْقِهِمْ","ظُلَلٌ","مِنَ","النَّارِ"]
      },
    ]},

  { id:14, book:1, lessonRef:"1.6", part:"A", title:"الضَّمَائِرُ (Part 1)", titleEn:"Personal Pronouns",
    grammar:'Arabic has no verb "to be" in the present tense. The pronoun + noun alone forms a complete sentence.',
    grammarExamples:[
      { ar:"هُوَ طَبِيبٌ", en:"He is a doctor" },
      { ar:"هِيَ مُدَرِّسَةٌ", en:"She is a teacher" },
      { ar:"أَنَا طَالِبٌ", en:"I am a student" },
    ],
    vocab:[{ar:"هُوَ",en:"he"},{ar:"هِيَ",en:"she"},{ar:"أَنَا",en:"I"},{ar:"أَنْتَ",en:"you (m.)"}],
    patternTiles:[
      {en:"He is a student.", tiles:["هُوَ","طَالِبٌ","أَنَا","مُدَرِّسٌ"], answer:["هُوَ","طَالِبٌ"]},
      {en:"I am a teacher.", tiles:["أَنَا","مُدَرِّسٌ","هُوَ","طَالِبٌ"], answer:["أَنَا","مُدَرِّسٌ"]},
      {
        en:"He is Allah, the One.",
        quran:{ref:"Al-Ikhlas 112:1", en:"Say: He is Allah, the One"},
        prebaked:[{ar:"أَحَدٌ",en:"the One"}],
        tiles:["هُوَ","اللَّهُ","هِيَ","أَنَا","اللَّهَ"],
        answer:["هُوَ","اللَّهُ","أَحَدٌ"]
      },
      {
        en:"Indeed, I am Allah.",
        quran:{ref:"Ta-Ha 20:14", en:"Indeed, I am Allah"},
        prebaked:[{ar:"إِنَّنِي",en:"Indeed I"}],
        tiles:["أَنَا","اللَّهُ","هُوَ","اللَّهَ","أَنْتَ"],
        answer:["إِنَّنِي","أَنَا","اللَّهُ"]
      },
    ]},
  { id:15, book:1, lessonRef:"1.6", part:"B", title:"الضَّمَائِرُ (Part 2)", titleEn:"Pronouns with Professions",
    grammar:'مَنْ أَنْتَ؟ = Who are you? أَنَا طَالِبٌ = I am a student. هُوَ مُدَرِّسٌ = He is a teacher.',
    vocab:[{ar:"رَسُولٌ",en:"messenger"},{ar:"مَلَكٌ",en:"angel"},{ar:"تَاجِرٌ",en:"merchant"},{ar:"فَلَّاحٌ",en:"farmer"}],
    patternTiles:[
      {question:"مَنْ هُوَ؟", en:"He is a messenger.", tiles:["هُوَ","رَسُولٌ","أَنَا","مَلَكٌ"], answer:["هُوَ","رَسُولٌ"]},
      {en:"I am a merchant.", tiles:["أَنَا","تَاجِرٌ","هُوَ","فَلَّاحٌ"], answer:["أَنَا","تَاجِرٌ"]},
      {
        en:"Muhammad is the Messenger of Allah.",
        quran:{ref:"Al-Fath 48:29", en:"Muhammad is the Messenger of Allah"},
        prebaked:[{ar:"اللَّهِ",en:"of Allah"}],
        tiles:["مُحَمَّدٌ","رَسُولُ","رَسُولٌ","مَلَكٌ"],
        answer:["مُحَمَّدٌ","رَسُولُ","اللَّهِ"]
      },
      {
        en:"And Muhammad is nothing but a messenger.",
        quran:{ref:"Al-Imran 3:144", en:"And Muhammad is not but a messenger"},
        prebaked:[{ar:"وَمَا",en:"and not"},{ar:"إِلَّا",en:"but only"}],
        tiles:["مُحَمَّدٌ","رَسُولٌ","رَسُولُ","مَلَكٌ"],
        answer:["وَمَا","مُحَمَّدٌ","إِلَّا","رَسُولٌ"]
      },
    ]},

  { id:16, book:1, lessonRef:"1.7", part:"A", title:"الْمُؤَنَّثُ (Part 1)", titleEn:"Feminine Nouns & هَذِهِ",
    grammar:'Feminine nouns end in ةٌ. Use هَذِهِ (this, f.) and تِلْكَ (that, f.): هَذِهِ شَجَرَةٌ. Adjectives must match: هَذِهِ شَجَرَةٌ جَمِيلَةٌ.',
    vocab:[{ar:"شَجَرَةٌ",en:"tree"},{ar:"مَدْرَسَةٌ",en:"school"},{ar:"غُرْفَةٌ",en:"room"},{ar:"حَدِيقَةٌ",en:"garden"},{ar:"بَقَرَةٌ",en:"cow"},{ar:"نَمْلَةٌ",en:"ant"},{ar:"نَحْلَةٌ",en:"bee"},{ar:"ذُبَابَةٌ",en:"fly"}],
    patternTiles:[
      {emoji:"🌳", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","شَجَرَةٌ","مَدْرَسَةٌ","غُرْفَةٌ"], answer:["هَذِهِ","شَجَرَةٌ"]},
      {emoji:"🏫", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","مَدْرَسَةٌ","شَجَرَةٌ","حَدِيقَةٌ"], answer:["هَذِهِ","مَدْرَسَةٌ"]},
      {emoji:"🌸", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","حَدِيقَةٌ","غُرْفَةٌ","شَجَرَةٌ"], answer:["هَذِهِ","حَدِيقَةٌ"]},
      {emoji:"🛏️", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","غُرْفَةٌ","حَدِيقَةٌ","مَدْرَسَةٌ"], answer:["هَذِهِ","غُرْفَةٌ"]},
      {emoji:"🐄", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","بَقَرَةٌ","نَمْلَةٌ","نَحْلَةٌ","ذُبَابَةٌ"], answer:["هَذِهِ","بَقَرَةٌ"]},
      {emoji:"🐜", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","نَمْلَةٌ","نَحْلَةٌ","بَقَرَةٌ","ذُبَابَةٌ"], answer:["هَذِهِ","نَمْلَةٌ"]},
      {emoji:"🐝", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","نَحْلَةٌ","ذُبَابَةٌ","نَمْلَةٌ","شَجَرَةٌ"], answer:["هَذِهِ","نَحْلَةٌ"]},
    ]},
  { id:17, book:1, lessonRef:"1.7", part:"B", title:"الْمُؤَنَّثُ (Part 2)", titleEn:"Feminine Adjectives & Professions",
    grammar:'Feminine adjectives add ةٌ: كَبِيرٌ → كَبِيرَةٌ. Professions too: مُدَرِّسٌ → مُدَرِّسَةٌ. هِيَ مُدَرِّسَةٌ = She is a teacher.',
    vocab:[{ar:"مُدَرِّسَةٌ",en:"teacher (f.)"},{ar:"طَالِبَةٌ",en:"student (f.)"},{ar:"مُؤْمِنَةٌ",en:"believer (f.)"},{ar:"جَمِيلَةٌ",en:"beautiful (f.)"}],
    patternTiles:[
      {emoji:"👩‍🏫", question:"مَنْ هِيَ؟", en:"She is a teacher.", tiles:["هِيَ","مُدَرِّسَةٌ","طَالِبَةٌ","هُوَ"], answer:["هِيَ","مُدَرِّسَةٌ"]},
      {emoji:"👩‍🎓", question:"مَنْ هِيَ؟", en:"She is a student.", tiles:["هِيَ","طَالِبَةٌ","مُدَرِّسَةٌ","مُؤْمِنَةٌ"], answer:["هِيَ","طَالِبَةٌ"]},
      {emoji:"🧕", question:"مَنْ هِيَ؟", en:"She is a believer.", tiles:["هِيَ","مُؤْمِنَةٌ","مُدَرِّسَةٌ","طَالِبَةٌ"], answer:["هِيَ","مُؤْمِنَةٌ"]},
    ]},
  { id:18, book:1, lessonRef:"1.7", part:"C", title:"الطَّبِيعَةُ الْمُؤَنَّثَةُ", titleEn:"Quranic Nature Nouns (f.)",
    grammar:'High-frequency feminine nouns from the Quran. All use هَذِهِ: هَذِهِ سَمَاءٌ. The pair سَمَاءٌ (sky) and أَرْضٌ (earth) appear together constantly in the Quran. جَنَّةٌ (garden/paradise) and نَارٌ (fire) are the two ultimate outcomes described throughout.',
    grammarExamples:[
      { ar:"وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ", en:"His Kursī extends over the heavens and the earth (2:255)" },
      { ar:"وَقِيلَ لَهُمُ ادْخُلُوا الْجَنَّةَ", en:"And it is said to them: Enter Paradise (39:73)" },
    ],
    vocab:[{ar:"سَمَاءٌ",en:"sky/heaven"},{ar:"أَرْضٌ",en:"earth"},{ar:"جَنَّةٌ",en:"paradise/garden"},{ar:"نَارٌ",en:"fire"}],
    patternTiles:[
      {emoji:"🌌", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","سَمَاءٌ","أَرْضٌ","جَنَّةٌ"], answer:["هَذِهِ","سَمَاءٌ"]},
      {emoji:"🌍", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","أَرْضٌ","سَمَاءٌ","نَارٌ"], answer:["هَذِهِ","أَرْضٌ"]},
      {emoji:"🌿", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","جَنَّةٌ","نَارٌ","أَرْضٌ"], answer:["هَذِهِ","جَنَّةٌ"]},
      {emoji:"🔥", question:"مَا هَذِهِ؟", tiles:["هَذِهِ","نَارٌ","جَنَّةٌ","سَمَاءٌ"], answer:["هَذِهِ","نَارٌ"]},
      {
        en:"Who created the heavens and the earth.",
        quran:{ref:"Al-Furqan 25:59", en:"He who created the heavens and the earth and all between them"},
        prebaked:[{ar:"الَّذِي",en:"the One who"},{ar:"خَلَقَ",en:"created"}],
        tiles:["السَّمَاوَاتِ","وَالْأَرْضَ","السَّمَاءَ","الْأَرْضَ"],
        answer:["الَّذِي","خَلَقَ","السَّمَاوَاتِ","وَالْأَرْضَ"]
      },
      {
        en:"The companions of Paradise are the successful ones.",
        quran:{ref:"Al-Hashr 59:20", en:"The companions of Paradise — they are the successful ones"},
        prebaked:[{ar:"أَصْحَابُ",en:"companions of"},{ar:"هُمُ",en:"they are"},{ar:"الْفَائِزُونَ",en:"the successful"}],
        tiles:["الْجَنَّةِ","النَّارِ","الْجَنَّةُ","النَّارُ"],
        answer:["أَصْحَابُ","الْجَنَّةِ","هُمُ","الْفَائِزُونَ"]
      },
    ]},

  { id:19, book:1, lessonRef:"1.8", part:"A", title:"الْإِضَافَةُ (Part 1)", titleEn:"Possessive Constructions",
    grammar:'Iḍāfa (possessive construction): رَسُولُ اللهِ (messenger of Allah). The first noun (mudāf) loses tanwīn and CANNOT take الـ. The second noun (mudāf ilayhi) takes genitive ـِ. The first noun becomes definite automatically — رَبُّ الْعَالَمِينَ means THE Lord of the worlds, not "a lord". From Al-Fātiḥa: الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ — every word here is a Quranic iḍāfa or genitive link.',
    vocab:[{ar:"رَسُولُ اللهِ",en:"messenger of Allah"},{ar:"يَوْمُ الدِّينِ",en:"Day of Judgement"},{ar:"رَبُّ الْعَالَمِينَ",en:"Lord of the worlds"},{ar:"عَبْدُ اللهِ",en:"servant of Allah"}],
    patternTiles:[
      {en:"Muhammad is the messenger of Allah.", tiles:["مُحَمَّدٌ","رَسُولُ","اللهِ","عَبْدُ","نَبِيٌّ"], answer:["مُحَمَّدٌ","رَسُولُ","اللهِ"]},
      {en:"Today is the Day of Judgement.", tiles:["الْيَوْمُ","يَوْمُ","الدِّينِ","رَبُّ","الْعَالَمِينَ"], answer:["الْيَوْمُ","يَوْمُ","الدِّينِ"]},
    ]},
  { id:20, book:1, lessonRef:"1.8", part:"B", title:"الْإِضَافَةُ (Part 2)", titleEn:"Possessive Pronouns",
    grammar:'Attached pronouns suffix directly to the noun. رَبِّي (my Lord — ي replaces tanwīn), رَبُّكَ (your Lord — كَ attached), رَحْمَتُهُ (His mercy — هُ attached), نُورُهُ (His light — هُ attached). These exact forms occur throughout the Quran. Note: after ي, the preceding vowel shifts to kasra — رَبِّي not رَبُيِ.',
    vocab:[{ar:"رَبِّي",en:"my Lord"},{ar:"رَبُّكَ",en:"your Lord"},{ar:"رَحْمَتُهُ",en:"His mercy"},{ar:"نُورُهُ",en:"His light"}],
    patternTiles:[
      {en:"My Lord is generous.", tiles:["رَبِّي","كَرِيمٌ","رَبُّكَ","عَظِيمٌ"], answer:["رَبِّي","كَرِيمٌ"]},
      {en:"His light is great.", tiles:["نُورُهُ","عَظِيمٌ","رَحْمَتُهُ","كَبِيرٌ","رَبِّي"], answer:["نُورُهُ","عَظِيمٌ"]},
    ]},

  { id:21, book:1, lessonRef:"1.9", part:"A", title:"الْعَائِلَةُ (Part 1)", titleEn:"Family Vocabulary",
    grammar:'أَبٌ (father) and أَخٌ (brother) are irregular: أَبِي (my father), أَخِي (my brother). These are الْأَسْمَاءُ الْخَمْسَةُ — special nouns.',
    vocab:[{ar:"أَبٌ",en:"father"},{ar:"أُمٌّ",en:"mother"},{ar:"أَخٌ",en:"brother"},{ar:"أُخْتٌ",en:"sister"}],
    patternTiles:[
      {emoji:"👨", question:"كَيْفَ أَبُوكَ؟", en:"My father is generous.", tiles:["أَبِي","كَرِيمٌ","أُمِّي","أَخِي"], answer:["أَبِي","كَرِيمٌ"]},
      {en:"I have a brother and a sister.", tiles:["عِنْدِي","أَخٌ","وَأُخْتٌ","أَبٌ","وَأُمٌّ"], answer:["عِنْدِي","أَخٌ","وَأُخْتٌ"]},
    ]},
  { id:22, book:1, lessonRef:"1.9", part:"B", title:"الْعَائِلَةُ (Part 2)", titleEn:"Extended Family",
    grammar:'عِنْدِي أَخٌ وَأُخْتٌ = I have a brother and a sister. لِي أَبٌ كَرِيمٌ = I have a generous father.',
    vocab:[{ar:"زَوْجٌ",en:"husband"},{ar:"زَوْجَةٌ",en:"wife"},{ar:"اِبْنٌ",en:"son"},{ar:"بِنْتٌ",en:"daughter"}],
    patternTiles:[
      {en:"My son is a student.", tiles:["اِبْنِي","طَالِبٌ","بِنْتِي","مُدَرِّسٌ"], answer:["اِبْنِي","طَالِبٌ"]},
      {en:"His wife is a teacher.", tiles:["زَوْجَتُهُ","مُدَرِّسَةٌ","زَوْجُهُ","طَالِبَةٌ"], answer:["زَوْجَتُهُ","مُدَرِّسَةٌ"]},
    ]},

  { id:23, book:1, lessonRef:"1.10", part:"A", title:"الَّذِي — The One Who / Which", titleEn:"Relative Pronoun (Part 1)",
    grammar:'الَّذِي (who/which) for masculine singular. الَّتِي for feminine. الطَّالِبُ الَّذِي فِي الْفَصْلِ = The student who is in the class.',
    vocab:[{ar:"الَّذِي",en:"who/which (m.)"},{ar:"الَّتِي",en:"who/which (f.)"},{ar:"الَّذِينَ",en:"who/which (m.pl.)"},{ar:"الْفَصْلُ",en:"classroom"}],
    patternTiles:[
      {en:"The student who is in the classroom.", tiles:["الطَّالِبُ","الَّذِي","فِي","الْفَصْلِ","الَّتِي","الْبَيْتِ"], answer:["الطَّالِبُ","الَّذِي","فِي","الْفَصْلِ"]},
      {en:"The book which is on the desk.", tiles:["الْكِتَابُ","الَّذِي","عَلَى","الْمَكْتَبِ","الَّتِي","تَحْتَ"], answer:["الْكِتَابُ","الَّذِي","عَلَى","الْمَكْتَبِ"]},
    ]},
  { id:24, book:1, lessonRef:"1.10", part:"B", title:"مُرَاجَعَةٌ — Book 1 Review", titleEn:"Book 1 Revision",
    grammar:'Review all Book 1 patterns: هَذَا/ذَلِكَ/هَذِهِ/تِلْكَ, الـ, adjective agreement, prepositions, pronouns, iḍāfa, الَّذِي.',
    vocab:[{ar:"أَيْنَ",en:"where?"},{ar:"مَنْ",en:"who?"},{ar:"مَا",en:"what?"},{ar:"أَيْضًا",en:"also"}],
    patternTiles:[
      {emoji:"🪑", question:"مَا ذَلِكَ؟", tiles:["ذَلِكَ","كُرْسِيٌّ","هَذَا","سَرِيرٌ"], answer:["ذَلِكَ","كُرْسِيٌّ"]},
      {en:"Where is the key?", tiles:["أَيْنَ","الْمِفْتَاحُ؟","مَنْ","الْبَابُ؟"], answer:["أَيْنَ","الْمِفْتَاحُ؟"]},
    ]},

// ═══ BOOK 2 · Lessons 1–12 · Sessions 25–48 ═══

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
      { type:"grammar_mcq", promptEn:'Which word means "this" for a masculine noun?', correct:"هَذَا", options:["هَذَا","هَذِهِ","ذَلِكَ","تِلْكَ"], explanation:'هَذَا is for masculine nouns: هَذَا كِتَابٌ (this is a book). هَذِهِ is feminine: هَذِهِ سَيَّارَةٌ (this is a car). ذَلِكَ / تِلْكَ mean "that" (far away), not "this".' },
      { type:"grammar_mcq", promptEn:'Choose the correct definite form of قَلَمٌ (pen):', correct:"الْقَلَمُ", options:["الْقَلَمُ","الْقَلَمٌ","اَلْقَلَمِ","قَلَمُ"], explanation:'Adding الـ makes a noun definite and removes tanwīn: قَلَمٌ → الْقَلَمُ. The ـُ stays, only the ـٌ disappears. With sun letters the ل assimilates: النَّجْمُ, الشَّمْسُ.' },
      { type:"grammar_mcq", promptEn:'Complete: ___ الْبَيْتُ (the big house — definite adjective):', correct:"الْكَبِيرُ", options:["الْكَبِيرُ","كَبِيرٌ","كَبِيرُ","الْكَبِيرٌ"], explanation:'A definite noun needs a definite adjective: الْبَيْتُ الْكَبِيرُ (the big house). كَبِيرٌ alone is a predicate — الْبَيْتُ كَبِيرٌ means "the house IS big", not "the big house".' },
      { type:"grammar_mcq", promptEn:'Which preposition means "on"?', correct:"عَلَى", options:["عَلَى","فِي","مِنْ","تَحْتَ"], explanation:'عَلَى = on: الْكِتَابُ عَلَى الْمَكْتَبِ (the book is on the desk). فِي = in, مِنْ = from, تَحْتَ = under. All prepositions take genitive: الْمَكْتَبِ not الْمَكْتَبُ.' },
      { type:"grammar_err", promptEn:'Find the error: "هَذِهِ بَيْتٌ كَبِيرٌ" (بَيْتٌ is masculine)', correct:"هَذَا", options:["هَذَا","هَذِهِ","بَيْتٌ","كَبِيرٌ"], explanation:'بَيْتٌ (house) is masculine, so the demonstrative must also be masculine: هَذَا بَيْتٌ كَبِيرٌ. هَذِهِ is only for feminine nouns — those ending in ةٌ like سَيَّارَةٌ (car) or مَدْرَسَةٌ (school).' },
    ],
    sentenceTiles:[
      { en:"This is a new book.", answer:["هَذَا","كِتَابٌ","جَدِيدٌ"], tiles:["هَذَا","كِتَابٌ","جَدِيدٌ","قَلَمٌ","ذَلِكَ"], prebaked:[] },
      { en:"The pen is on the desk.", answer:["الْقَلَمُ","عَلَى","الْمَكْتَبِ"], tiles:["الْقَلَمُ","عَلَى","الْمَكْتَبِ","تَحْتَ","الْكِتَابُ","الْمَكْتَبُ"], prebaked:[] },
      { en:"That is a small chair.", answer:["ذَلِكَ","كُرْسِيٌّ","صَغِيرٌ"], tiles:["ذَلِكَ","كُرْسِيٌّ","صَغِيرٌ","هَذَا","كَبِيرٌ"], prebaked:[] },
      { en:"This is a beautiful garden.", answer:["هَذِهِ","حَدِيقَةٌ","جَمِيلَةٌ"], tiles:["هَذِهِ","جَمِيلَةٌ"], prebaked:[{ar:"حَدِيقَةٌ",en:"garden"}] },
      { en:"The star is above the house.", answer:["النَّجْمُ","فَوْقَ","الْبَيْتِ"], tiles:["النَّجْمُ","فَوْقَ","الْبَيْتِ","تَحْتَ","الشَّمْسُ","الْبَيْتُ"], prebaked:[] },
    ]},

  // R2: After B1 L6-10 (sessions 11-20) · pronouns, feminine, iḍāfa, family, الذي
  { id:"r2", type:"review", coversLessons:"B1 L6–10",
    titleEn:"Review: Pronouns, Feminine, Iḍāfa & Relative Pronoun",
    grammarExercises:[
      { type:"grammar_mcq", promptEn:'Which pronoun means "she"?', correct:"هِيَ", options:["هِيَ","هُوَ","أَنَا","أَنْتَ"] },
      { type:"grammar_mcq", promptEn:'Feminine form of مُدَرِّسٌ (teacher):', correct:"مُدَرِّسَةٌ", options:["مُدَرِّسَةٌ","مُدَرِّسٌ","مُدَرِّسِي","مُدَرِّسَات"] },
      { type:"grammar_mcq", promptEn:'In the iḍāfa كِتَابُ الطَّالِبِ, the second noun takes:', correct:"genitive (ـِ)", options:["genitive (ـِ)","nominative (ـُ)","accusative (ـَ)","no case ending"], explanation:'The second noun (mudāf ilayhi) always takes genitive ـِ: كِتَابُ الطَّالِبِ, بَابُ الْبَيْتِ, غُرْفَةُ الْوَلَدِ. Bonus rule: the first noun (mudāf) loses its tanwīn and becomes definite without الـ — بَابُ الْبَيْتِ = THE door of the house (not "a door"). Adding الـ to the first noun is a grammar error.' },
      { type:"grammar_mcq", promptEn:'الَّذِي is used for which type of noun?', correct:"masculine singular", options:["masculine singular","feminine singular","masculine plural","any noun"] },
      { type:"grammar_err", promptEn:'Find the error: "هُوَ مُدَرِّسَةٌ" (هُوَ = he)', correct:"مُدَرِّسٌ", options:["مُدَرِّسٌ","مُدَرِّسَةٌ","هُوَ","هِيَ"] },
    ],
    sentenceTiles:[
      { en:"She is a doctor.", answer:["هِيَ","طَبِيبَةٌ"], tiles:["هِيَ","طَبِيبَةٌ","هُوَ","طَبِيبٌ"], prebaked:[] },
      { en:"The boy's room is big.", answer:["غُرْفَةُ","الْوَلَدِ","كَبِيرَةٌ"], tiles:["غُرْفَةُ","الْوَلَدِ","كَبِيرَةٌ","صَغِيرَةٌ","الْبَيْتُ"], prebaked:[] },
      { en:"My father is in the house.", answer:["أَبِي","فِي","الْبَيْتِ"], tiles:["أَبِي","فِي","الْبَيْتِ","عَلَى","أُمِّي","الْبَيْتُ"], prebaked:[] },
      { en:"The student who is in the classroom is new.", answer:["الطَّالِبُ","الَّذِي","فِي","الْفَصْلِ","جَدِيدٌ"], tiles:["الطَّالِبُ","الَّذِي","فِي","الْفَصْلِ","جَدِيدٌ","قَدِيمٌ"], prebaked:[] },
      { en:"He is a generous merchant.", answer:["هُوَ","تَاجِرٌ","كَرِيمٌ"], tiles:["هُوَ","تَاجِرٌ","كَرِيمٌ","بَخِيلٌ"], prebaked:[{ar:"كَرِيمٌ",en:"generous"}] },
    ]},

];

// ── ALL_SESSIONS: interleaved regular + review sessions in curriculum order ──
// Reviews after each block of ~10 sessions (5 lessons). First block is 13 due to 3 new L1.1 sessions.
// Block boundaries: 1-13, 14-23, 24-33, 34-43, 44-53, 54-63, 64-73, 74-83, 84-87
// ── Quran-verse word highlighting ────────────────────────────────────────────
// Maps a QURAN_CONNECTIONS key (a diacritic-stripped vocab word) to the English
// gloss(es) worth highlighting in a translation. Built from session vocabulary.
const KEY_TO_EN_TERMS = (() => {
  const extra = {
    'حوت': ['fish'],            // 18:61 renders حُوت as "fish"
    'قرد': ['ape'],             // verses use the plural قِرَدَة → "apes"
    'خنزير': ['swine'],         // 2:173 renders الخنزير as "swine"
    'نحلة': ['bee'],            // 16:68 uses the collective النَّحْل → "bees"
    'ذبابة': ['fly'],           // 22:73 uses the collective ذُبَاب → "flies"
    'نملة': ['ant'],
  };
  const map = {};
  SESSIONS.forEach(s => s.vocab.forEach(w => {
    const k = stripQ(w.ar);
    if (!map[k]) {
      // "the book" → book · "student (m.)" → student · "desk/office" → desk, office
      map[k] = w.en.replace(/^the\s+/i, '').replace(/\s*\([^)]*\)/g, '').split('/')
                   .map(t => t.trim()).filter(Boolean);
    }
  }));
  Object.entries(extra).forEach(([k, terms]) => { map[k] = [...(map[k] || []), ...terms]; });
  return map;
})();

// Normalise an Arabic token for comparison: drop diacritics, tatweel and
// punctuation, and fold alif variants. Unlike stripQ this keeps a leading الـ,
// which is handled explicitly below (stripQ would turn اللَّهِ into لـه).
function arNorm(w) {
  return w.replace(/[ً-ٰٟـ]/g, '')
          .replace(/[أإآ]/g, 'ا')
          .replace(/[^ء-ي]/g, '');
}

// All plausible stems of a token: with attached conjunctions/prepositions
// (وَ، فَ، بِ، كَ، لِ، سَ) and/or the definite article removed, and with
// attached pronoun suffixes (ـهُ، ـهَا، ـهُمَا، ـكُم، ـنَا …) removed.
function arStems(token) {
  const base = arNorm(token);
  const out = new Set([base]);
  for (const p of ['و', 'ف', 'ب', 'ك', 'ل', 'س'])
    if (base.startsWith(p) && base.length > p.length + 1) out.add(base.slice(p.length));
  for (const x of [...out])
    if (x.startsWith('ال') && x.length > 3) out.add(x.slice(2));
  for (const x of [...out])
    for (const suf of ['هما', 'هم', 'هن', 'ها', 'كما', 'كم', 'كن', 'نا', 'ه', 'ك', 'ي'])
      if (x.endsWith(suf) && x.length - suf.length >= 3) out.add(x.slice(0, -suf.length));
  return out;
}

// True if an Arabic token from a verse is the word `key` (a stripQ'd vocab word).
// `strict` accepts only the bare word, optionally carrying الـ, an attached
// particle or a pronoun suffix. Loose mode additionally accepts derived forms and
// broken plurals — useful, but it must never win over an exact match elsewhere in
// the verse, hence the two passes in HighlightedVerse below.
function arTokenIsKey(token, key, strict) {
  if (!token || !key) return false;
  const k = arNorm(key);
  if (!k) return false;
  const stems = arStems(token);
  if (stems.has(k) || stems.has('ال' + k)) return true;
  if (strict) return false;
  // 2-letter kinship words (أَب, أُم, أَخ) appear with a case vowel written as a
  // letter: أَبُوهُمَا → ابو. Allow at most one extra letter, otherwise أَب would
  // match إِبْرَاهِيم.
  if (k.length < 3) {
    for (const st of stems) if (st.startsWith(k) && st.length <= k.length + 1) return true;
    return false;
  }
  for (const st of stems) if (st.startsWith(k) || st.includes(k)) return true;
  // Broken plurals and derived forms (مَسْجِد → مَسَاجِد, مَلَك → مَلَائِكَة) keep the
  // key's letters in order. Bounded by length so unrelated words can't match.
  for (const st of stems) {
    if (st.length > k.length + 3 || st.length < k.length) continue;
    let n = 0;
    for (const ch of st) if (ch === k[n]) n++;
    if (n === k.length) return true;
  }
  return false;
}

// Renders an Arabic verse with the target word emphasised. Multi-word keys such
// as 'رسول الله' match consecutive tokens.
function HighlightedVerse({ text, hlKey }) {
  if (!hlKey) return <>{text}</>;
  const keyWords = hlKey.split(' ').filter(Boolean);
  const parts = text.split(/(\s+)/);
  const hit = new Array(parts.length).fill(false);
  const wordIdx = parts.map((p, i) => (/^\s+$/.test(p) ? -1 : i)).filter(i => i >= 0);
  outer:
  for (const strict of [true, false]) {
    for (let a = 0; a < wordIdx.length; a++) {
      let ok = true;
      for (let b = 0; b < keyWords.length; b++) {
        const wi = wordIdx[a + b];
        if (wi === undefined || !arTokenIsKey(parts[wi], keyWords[b], strict)) { ok = false; break; }
      }
      if (ok) { for (let b = 0; b < keyWords.length; b++) hit[wordIdx[a + b]] = true; break outer; }
    }
  }
  return <>{parts.map((p, i) => hit[i]
    ? <span key={i} style={{color:"#fcd34d", fontWeight:800}}>{p}</span>
    : <span key={i}>{p}</span>)}</>;
}

// Renders an English translation with the target word emphasised. Matches the
// gloss plus simple inflections (bee → bees, fly → flies, wolf → wolves).
function HighlightedTranslation({ text, hlKey }) {
  const terms = (KEY_TO_EN_TERMS[hlKey] || []).filter(t => t.length >= 2);
  if (!terms.length) return <>{text}</>;
  const variants = new Set();
  for (const t of terms) {
    const b = t.toLowerCase();
    variants.add(b);
    variants.add(b + 's');
    variants.add(b + 'es');
    if (b.endsWith('y')) variants.add(b.slice(0, -1) + 'ies');
    if (b.endsWith('f')) variants.add(b.slice(0, -1) + 'ves');
    if (b.endsWith('fe')) variants.add(b.slice(0, -2) + 'ves');
  }
  const esc = [...variants].sort((a, b) => b.length - a.length)
                           .map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const m = text.match(new RegExp(`\\b(${esc.join('|')})\\b`, 'i'));
  if (!m) return <>{text}</>;
  return <>
    {text.slice(0, m.index)}
    <strong style={{color:"#fde68a", fontWeight:800,
      borderBottom:"1px solid rgba(253,230,138,0.5)"}}>{m[0]}</strong>
    {text.slice(m.index + m[0].length)}
  </>;
}

const REVIEW_BLOCK_ENDS = [13, 24];
const sid = (id) => SESSIONS.find(s => s.id === id);
const ALL_SESSIONS = [
  ...SESSIONS.filter(s=>s.id>=1 &&s.id<=13),  REVIEWS[0],
  ...SESSIONS.filter(s=>s.id>=14&&s.id<=24),  REVIEWS[1],
];


// ──────────────────────────────────────────────
// EXERCISE BUILDERS
// ──────────────────────────────────────────────
function buildExercises(session, lang = "en") {
  const vocab = session.vocab;
  const allPrior = SESSIONS.filter(s => s.id < session.id).flatMap(s => s.vocab);
  // Pool of at least 6 words: every word of the session's own vocab, topped up
  // with prior-session words when the session teaches fewer than 6.
  // Extra prior words give lightweight spaced-repetition alongside new vocab.
  const pool = vocab.length >= 6 ? [...vocab] : [...vocab, ...shuffle(allPrior).slice(0, 6 - vocab.length)];

  const getLabel = (w) => w.en;

  // ── BUCKET 1: Grammar / production exercises (shown first) ──────────────
  const grammarExs = [];

  // Pattern sentence exercises (Book 1 only)
  if (session.patternTiles) {
    session.patternTiles.forEach(t => {
      // Augment tile pool with case-form variants (nominative/genitive/accusative
      // alternates and definite↔indefinite swaps) to make students attend to iʿrāb.
      // Vocabulary distractors in t.tiles are preserved unchanged.
      const existingSet = new Set(t.tiles);
      // Skip prebaked tokens — they're pre-placed, not part of the interactive tile bank
      const prebakedArSet = new Set((t.prebaked || []).map(p => p.ar));
      const caseExtras = shuffle(
        t.answer.filter(tok => !prebakedArSet.has(tok)).flatMap(tok => makeCaseVariants(tok)).filter(v => !existingSet.has(v))
      ).slice(0, 2);
      const augTiles = [...t.tiles, ...caseExtras];
      grammarExs.push({ type:"pattern_tile", ...t, tiles: augTiles });
    });
  }
  // Definiteness transformation exercises (sessions teaching الـ)
  if (session.alTransformExercises) {
    session.alTransformExercises.forEach(ex => {
      grammarExs.push({ type:"al_transform", ...ex });
    });
  }
  // Sun/moon letter categorisation exercises
  if (session.sunMoonExercises) {
    session.sunMoonExercises.forEach(ex => {
      grammarExs.push({ type:"sun_moon", ...ex });
    });
  }
  // Near/far demonstrative exercises (هَذَا / ذَلِكَ)
  if (session.nearFarExercises) {
    session.nearFarExercises.forEach(ex => {
      grammarExs.push({ type:"near_far", ...ex });
    });
  }
  // Spaced repetition tiles from session 18+ (was 15 before 3 L1.1 sessions were added)
  if (session.id >= 19) {
    const eligibleReviews = REVIEWS.filter((_, i) => session.id > REVIEW_BLOCK_ENDS[i]);
    const poolTiles = eligibleReviews.flatMap(r => r.sentenceTiles.filter(t => t.prebaked.length === 0));
    shuffle(poolTiles).slice(0, 2).forEach(t => {
      grammarExs.push({ type:"tile", ...t });
    });
  }

  // ── BUCKET 2: Vocabulary recall MCQs (shown first) ─────────────────────
  const mcqExs = [];

  // MCQ: label → Arabic (en_ar) — English/Urdu prompt, pick the Arabic
  // Cover all 6 pool words (new session vocab + any prior top-up)
  const allVocab = [...vocab, ...allPrior];
  shuffle(pool).forEach(w => {
    // ── Morphological "near-miss" distractors ─────────────────────────────
    // Same root, different iʿrāb or definiteness — forces students to read
    // harakat rather than just recognise the word shape.
    const NOM_I = '\u064C', NOM_D = '\u064F'; // ٌ ُ
    const isDefWord = /^ال/.test(w.ar);
    const definiteAlts = [];
    if (isDefWord && w.ar.endsWith(NOM_D)) {
      // الْبَابُ → بَابٌ  (definite nominative → indefinite nominative)
      const stripped = w.ar.replace(/^الْ?/, '');
      if (stripped.length > 1) definiteAlts.push(stripped.slice(0, -1) + NOM_I);
    } else if (!isDefWord && w.ar.endsWith(NOM_I)) {
      // بَابٌ → الْبَابُ  (indefinite nominative → definite nominative)
      definiteAlts.push('\u0627\u0644\u0652' + w.ar.slice(0, -1) + NOM_D);
    }
    const poolArSet = new Set(pool.map(x => x.ar));
    const morphCandidates = shuffle(
      [...new Set([...makeCaseVariants(w.ar), ...definiteAlts])]
        .filter(v => v !== w.ar && !poolArSet.has(v))
    );
    // Up to 2 morph distractors; fill remaining slots with other pool words
    const morphDs = morphCandidates.slice(0, 2);
    const wordDs  = shuffle(pool.filter(x => x.ar !== w.ar))
      .slice(0, 3 - morphDs.length)
      .map(x => x.ar);
    const distractors = shuffle([...morphDs, ...wordDs]);
    const opts = shuffle([w.ar, ...distractors]);
    const meanings = {};
    opts.forEach(ar => { const found = allVocab.find(x => x.ar === ar); if (found) meanings[ar] = getLabel(found); });
    mcqExs.push({ type:"en_ar", promptEn:getLabel(w), correct:w.ar, options:opts, meanings });
  });
  // Match pairs — 3+3 split: two rounds of 3 pairs each
  if (pool.length >= 3) {
    const poolShuffled = shuffle([...pool]);
    const firstHalf  = poolShuffled.slice(0, 3);
    const secondHalf = poolShuffled.slice(3, 6);
    mcqExs.push({ type:"match", pairs: firstHalf.map(w => ({ ar:w.ar, en:getLabel(w) })) });
    if (secondHalf.length >= 2)
      mcqExs.push({ type:"match", pairs: secondHalf.map(w => ({ ar:w.ar, en:getLabel(w) })) });
  }

  // Vocabulary recall first (warm up with words), grammar/sentences second
  return [...shuffle(mcqExs), ...shuffle(grammarExs)];
}

function buildReviewExercises(review) {
  const exercises = [];
  review.grammarExercises.forEach(ex => exercises.push({ ...ex, options: shuffle([...ex.options]) }));
  review.sentenceTiles.forEach(t => {
    // Add up to 2 case-form variant distractors (keeping existing vocab distractors).
    // Skip prebaked tokens (already placed — no distractor needed for those).
    const existingSet = new Set(t.tiles);
    const nonPrebaked = t.answer.filter(tok => !t.prebaked.some(p => p.ar === tok));
    const caseExtras = shuffle(
      nonPrebaked.flatMap(tok => makeCaseVariants(tok)).filter(v => !existingSet.has(v))
    ).slice(0, 2);
    const augTiles = [...t.tiles, ...caseExtras];
    exercises.push({ type:"review_tile", ...t, tiles: augTiles });
  });
  return exercises; // keep in order: grammar first, then tiles
}

// ── GrammarPromptText ─────────────────────────────────────────────────────
// Renders grammar exercise prompt text with correct bidirectional handling.
// Arabic tokens are wrapped in arFont spans. The parent element should have
// dir="auto" so the browser picks RTL base-direction for fully-Arabic prompts
// (e.g. كَانَ الطَّالِبُ ___) and LTR for English-led prompts ("Complete: ___").
function GrammarPromptText({ text }) {
  return (
    <>
      {text.split(/(\s+)/).map((part, i) => {
        if (/^\s+$/.test(part)) return part;
        if (/[\u0600-\u06FF]/.test(part)) {
          // Inline span only — no display:inline-block, which would isolate each
          // word and break the Unicode bidi algorithm, reversing Arabic word order.
          return (
            <span key={i} style={{fontFamily:arFont, fontSize:"1.08em"}}>
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
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
function MCQ({ exercise, onResult, lang = "en" }) {
  const [sel, setSel] = useState(null);
  const [done, setDone] = useState(false);
  const { w } = useWindowSize();
  const t = UI_TEXT[lang];
  const isArEn = exercise.type === "ar_en";
  const isGrammar = exercise.type === "grammar_mcq" || exercise.type === "grammar_err";
  const arPromptSize = w >= 1024 ? 56 : w >= 640 ? 50 : 44;
  const enPromptSize = w >= 1024 ? 32 : w >= 640 ? 28 : 24;
  const optArSize = w >= 1024 ? 24 : w >= 640 ? 22 : 20;
  const optEnSize = w >= 1024 ? 16 : 14;
  const cols = w >= 1024 ? "1fr 1fr 1fr 1fr" : "1fr 1fr";

  // Only speak when the option is genuine Arabic (en_ar / grammar exercises) —
  // ar_en options are English or Urdu labels and should never be read aloud.
  const handleSelect = (opt) => { if (!done) { setSel(opt); if (!isArEn && isAr(opt)) speak(opt); } };
  const handleConfirm = () => {
    if (!sel || done) return;
    const ok = sel === exercise.correct;
    setDone(true);
    if (ok) setTimeout(() => onResult(true), 1200);
    // wrong: wait for user to tap Next
  };

  return (
    <div style={{textAlign:"center",padding:"0 4px"}}>
      {isGrammar ? (
        <div style={{background:"#eff6ff",border:"1px solid #93c5fd",borderRadius:12,padding:"14px 16px",marginBottom:20}}>
          <div style={{fontSize:12,color:"#3b82f6",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>
            {exercise.type==="grammar_err" ? t.spotError : t.grammarTag}
          </div>
          <p dir="auto" style={{fontSize:14,color:"#1e293b",fontWeight:600,margin:0,lineHeight:1.6}}>
            <GrammarPromptText text={exercise.promptEn} />
          </p>
        </div>
      ) : isArEn ? (
        <>
          <p style={{color:"#64748b",fontSize:13,marginBottom:10,fontFamily:"inherit"}}>{t.whatMean}</p>
          <div style={{marginBottom:24,lineHeight:1.4}}>
            <span style={{fontSize:arPromptSize,fontWeight:700,color:"#0f172a",fontFamily:arFont,direction:"rtl"}}>{exercise.prompt}</span>
            <SpeakBtn text={exercise.prompt} size={22} />
          </div>
        </>
      ) : (
        <>
          <p style={{color:"#64748b",fontSize:13,marginBottom:10,fontFamily:"inherit"}}>{t.selectArabic}</p>
          {getEmoji(exercise.promptEn) && (
            <div style={{marginBottom:8,lineHeight:1}}><EmojiImg emoji={getEmoji(exercise.promptEn)} size={48}/></div>
          )}
          <div style={{
            fontSize:enPromptSize,fontWeight:700,color:"#0f172a",marginBottom:24,
            fontFamily:"inherit",direction:"ltr",
          }}>{exercise.promptEn}</div>
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
              fontFamily:arabic?arFont:("inherit"),
              direction:arabic?"rtl":("ltr"),
              boxShadow:"0 1px 4px rgba(0,0,0,0.07)",lineHeight:1.4,transition:"all 0.15s"}}
              onMouseEnter={e=>{if(!done&&sel!==opt)e.currentTarget.style.transform="scale(1.03)"}}
              onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)"}}>
              {opt}
            </button>
          );
        })}
      </div>
      {/* Confirm button */}
      {!done && sel && (
        <button onClick={handleConfirm} style={{
          marginTop:16, width:"100%", padding:"14px",
          background:`linear-gradient(135deg,${GREEN},#047857)`,
          color:"white", border:"none", borderRadius:12,
          fontSize:16, fontWeight:700, cursor:"pointer",
          boxShadow:"0 4px 12px rgba(5,150,105,0.3)", transition:"opacity 0.2s",
          fontFamily:"inherit"}}>
          {t.confirmBtn}
        </button>
      )}
      {done && sel===exercise.correct && (
        <div style={{marginTop:14,padding:"10px 16px",borderRadius:10,background:"#dcfce7",color:"#166534",fontWeight:700,fontSize:15,fontFamily:"inherit"}}>
          {t.correctMsg}
        </div>
      )}
      {done && sel!==exercise.correct && (
        <div style={{marginTop:14,borderRadius:10,overflow:"hidden",border:"1px solid #fca5a5"}}>
          <div style={{padding:"10px 16px",background:"#fee2e2",color:"#991b1b",fontWeight:700,fontSize:15,fontFamily:"inherit"}}>
            {isGrammar ? (
              <span>✗ Correct answer: {exercise.correct}</span>
            ) : exercise.type==="ar_en" ? (
              <span>✗ <span style={{fontFamily:arFont,fontSize:18,direction:"rtl"}}>{exercise.prompt}</span> means "{exercise.correct}"</span>
            ) : (
              <span>✗ The Arabic for "{exercise.promptEn}" is <span style={{fontFamily:arFont,fontSize:18,direction:"rtl"}}>{exercise.correct}</span></span>
            )}
          </div>
          {isGrammar && exercise.explanation && (
            <div style={{padding:"10px 16px",background:"#fef9f0",borderTop:"1px solid #fde68a",color:"#78350f",fontSize:13,lineHeight:1.7}}>
              <GrammarPromptText text={exercise.explanation} />
            </div>
          )}
          {!isGrammar && (
            <div style={{padding:"8px 16px",background:"#fff5f5",color:"#7f1d1d",fontSize:13,fontWeight:500,fontFamily:"inherit",direction:"ltr"}}>
              {exercise.type==="ar_en"
                ? <span>You chose "{sel}"</span>
                : <span>You chose <span style={{fontFamily:arFont,fontSize:16,direction:"rtl"}}>{sel}</span>{exercise.meanings?.[sel] ? ` — "${exercise.meanings[sel]}"` : ""}</span>}
            </div>
          )}
          <button onClick={()=>onResult(false)} style={{width:"100%",padding:"11px",background:"#ef4444",color:"white",border:"none",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
            {"Next →"}
          </button>
        </div>
      )}
    </div>
  );
}

// Match pairs
function MatchEx({ exercise, onResult, lang = "en" }) {
  const [selAr, setSelAr] = useState(null);
  const [selEn, setSelEn] = useState(null);
  const [matched, setMatched] = useState([]);
  const [wrongPair, setWrongPair] = useState(null);
  const [[arList, enList]] = useState(() => {
    const ars = shuffle(exercise.pairs.map(p => p.ar));
    // correctOrder[i] = the English that matches ars[i]
    const correctOrder = ars.map(ar => exercise.pairs.find(p => p.ar === ar).en);
    let ens = shuffle(exercise.pairs.map(p => p.en));
    // Guarantee a derangement: no pair sits in the same row
    let attempts = 0;
    while (ens.some((en, i) => en === correctOrder[i]) && attempts < 30) {
      const i = Math.floor(Math.random() * ens.length);
      const j = (i + 1) % ens.length;
      [ens[i], ens[j]] = [ens[j], ens[i]];
      attempts++;
    }
    return [ars, ens];
  });
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

  const t = UI_TEXT[lang];
  return (
    <div style={{textAlign:"center"}}>
      <p style={{color:"#64748b",fontSize:13,marginBottom:14,fontFamily:"inherit"}}>{t.matchPairs}</p>
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
                fontFamily:"inherit",direction:"ltr",
                opacity:done?0.5:1,color:"#1e293b",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
              {en}</button>);
          })}
        </div>
      </div>
    </div>
  );
}

// ── Twemoji helpers — consistent cross-platform emoji rendering ───────────────
function emojiToUrl(emoji) {
  // Spread into Unicode code points, strip variation selector (U+FE0F), join with '-'
  const cps = [...emoji]
    .map(c => c.codePointAt(0))
    .filter(cp => cp !== 0xFE0F)
    .map(cp => cp.toString(16))
    .join('-');
  return `https://cdn.jsdelivr.net/npm/twemoji@15.0.3/assets/72x72/${cps}.png`;
}
function EmojiImg({ emoji, size = 28 }) {
  const [failed, setFailed] = useState(false);
  if (!emoji) return null;
  if (failed) return <span style={{fontSize: Math.round(size * 0.75)}}>{emoji}</span>;
  return (
    <img
      src={emojiToUrl(emoji)}
      alt={emoji}
      width={size}
      height={size}
      style={{display:'inline-block',verticalAlign:'middle',imageRendering:'auto',lineHeight:1}}
      onError={() => setFailed(true)}
    />
  );
}

// Tile sentence builder (regular sessions)
// ── Case-ending (إعراب) error detector ───────────────────────────────────────
const CASE_STRIP = /[\u064B\u064C\u064D\u064E\u064F\u0650]+$/; // strip final case diacritics
function arBase(w) { return w.replace(CASE_STRIP, ''); }
function arCaseKey(w) {
  const c = w.slice(-1);
  if (c === '\u064C') return 'nom_indef'; // ـٌ nominative indefinite
  if (c === '\u064B') return 'acc_indef'; // ـً accusative indefinite
  if (c === '\u064D') return 'gen_indef'; // ـٍ genitive indefinite
  if (c === '\u064F') return 'nom_def';   // ـُ nominative definite
  if (c === '\u064E') return 'acc_def';   // ـَ accusative definite
  if (c === '\u0650') return 'gen_def';   // ـِ genitive definite
  return null;
}
function caseLabel(k) {
  return { nom_indef:'nominative ـٌ (-un)', acc_indef:'accusative ـً (-an)', gen_indef:'genitive ـٍ (-in)',
           nom_def:'nominative ـُ (-u)',    acc_def:'accusative ـَ (-a)',    gen_def:'genitive ـِ (-i)' }[k] || k;
}
function caseUse(k) {
  return { nom_indef:'subject & predicate', acc_indef:'object & some particles', gen_indef:'after prepositions',
           nom_def:'subject & predicate',   acc_def:'object & some particles',   gen_def:'after prepositions' }[k] || '';
}
function detectCaseError(tile, answer) {
  const base = arBase(tile);
  const wrongKey = arCaseKey(tile);
  if (!wrongKey || base.length < 2) return null;
  for (const correct of answer) {
    const cb = arBase(correct);
    const ck = arCaseKey(correct);
    if (cb === base && ck && ck !== wrongKey) {
      const wl = caseLabel(wrongKey), cl = caseLabel(ck);
      const wu = caseUse(wrongKey),   cu = caseUse(ck);
      return `Case error: "${tile}" is ${wl} (${wu}) — here you need ${cl} (${cu}) → "${correct}"`;
    }
  }
  return null;
}

// ── Shared tile grading helpers ──────────────────────────────────────────────
function tileGradeStyle(grade) {
  if (grade === 'correct')   return {bg:'#dcfce7', border:'#22c55e', col:'#166534'};
  if (grade === 'misplaced') return {bg:'#fef3c7', border:'#f59e0b', col:'#92400e'};
                             return {bg:'#fee2e2', border:'#ef4444', col:'#991b1b'};
}
function tileGradeExp(tile, grade, answer) {
  if (grade === 'correct') return `✓ "${tile}" is in the correct position`;
  if (grade === 'misplaced') {
    const pos = answer.indexOf(tile) + 1;
    return `"${tile}" belongs in this sentence — should be word ${pos}`;
  }
  // Check for case ending error before falling back to generic message
  const caseErr = detectCaseError(tile, answer);
  if (caseErr) return caseErr;
  return `"${tile}" is not part of this sentence`;
}
function tileGetGrade(tile, idx, answer) {
  if (tile === answer[idx]) return 'correct';
  if (answer.includes(tile)) return 'misplaced';
  return 'wrong';
}
// ─────────────────────────────────────────────────────────────────────────────

function TileEx({ exercise, onResult, lang = "en" }) {
  const [placed, setPlaced] = useState([]);
  const [remaining, setRemaining] = useState(()=>shuffle(exercise.tiles));
  const { w } = useWindowSize();
  const t = UI_TEXT[lang];
  const tileFont = w >= 1024 ? 26 : w >= 640 ? 22 : 20;
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [activeExp, setActiveExp] = useState(null);

  const addTile=(tile,idx)=>{if(checked)return;setActiveExp(null);setPlaced([...placed,tile]);setRemaining(remaining.filter((_,i)=>i!==idx));};
  const removeTile=(tile,idx)=>{if(checked)return;setActiveExp(null);setPlaced(placed.filter((_,i)=>i!==idx));setRemaining([...remaining,tile]);};
  const check=()=>{const ok=JSON.stringify(placed)===JSON.stringify(exercise.answer);setCorrect(ok);setChecked(true);if(ok){speak(exercise.answer.join(" "));setTimeout(()=>onResult(true),1400);}};

  return (
    <div style={{textAlign:"center"}}>
      <p style={{color:"#64748b",fontSize:13,marginBottom:6,fontFamily:"inherit"}}>{t.buildSentence}</p>
      <p style={{fontSize:17,fontWeight:700,color:"#1e293b",marginBottom:4,fontFamily:"inherit",direction:"ltr"}}>"{exercise.en}"</p>
      {checked && !correct && (
        <p style={{fontSize:12,color:"#94a3b8",marginBottom:12}}>
          <SpeakBtn text={exercise.answer.join(" ")} size={15} /> <span style={{fontFamily:"inherit"}}>{t.hearAnswer}</span>
        </p>
      )}
      {/* Answer zone */}
      <div style={{minHeight:60,background:"#f8fafc",borderRadius:12,border:checked?(correct?"2px solid #22c55e":"2px solid #ef4444"):"2px dashed #cbd5e1",padding:"10px 12px",marginBottom:8,display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",alignItems:"center",direction:"rtl"}}>
        {placed.length===0&&<span style={{color:"#94a3b8",fontSize:13,fontFamily:"inherit"}}>{t.tapToBuild}</span>}
        {placed.map((tile,i)=>{
          const grade = checked ? tileGetGrade(tile,i,exercise.answer) : null;
          const s = grade ? tileGradeStyle(grade) : null;
          return (
            <button key={`${tile}-${i}`}
              onClick={checked ? ()=>setActiveExp(tileGradeExp(tile,grade,exercise.answer)) : ()=>removeTile(tile,i)}
              style={{padding:"8px 12px",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,
                background:s?s.bg:(checked?"#dcfce7":"#dbeafe"),
                border:s?`2px solid ${s.border}`:"none",
                color:s?s.col:"#1e293b",
                cursor:"pointer"}}>
              {tile}
            </button>
          );
        })}
      </div>
      {/* Explanation bar */}
      {checked&&!correct&&activeExp&&(
        <div style={{margin:"0 0 8px",padding:"8px 14px",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,fontSize:13,color:"#0c4a6e",lineHeight:1.5,fontFamily:arFont,direction:"rtl"}}>
          {activeExp}
        </div>
      )}
      {/* Tile bank */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:16,direction:"rtl"}}>
        {remaining.map((tile,i)=>{
          const missing = checked && exercise.answer.includes(tile);
          const bankExp = `"${tile}" was needed but not placed`;
          return (
            <button key={`${tile}-${i}`}
              onClick={checked?(missing?()=>setActiveExp(bankExp):undefined):()=>addTile(tile,i)}
              style={{padding:"8px 12px",background:missing?"#fee2e2":"white",border:missing?"2px solid #ef4444":"2px solid #e2e8f0",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,color:missing?"#991b1b":"#1e293b",cursor:checked?(missing?"pointer":"default"):"pointer",transition:"transform 0.1s"}}
              onMouseEnter={!checked?e=>{e.currentTarget.style.transform="scale(1.06)"}:undefined}
              onMouseLeave={!checked?e=>{e.currentTarget.style.transform="scale(1)"}:undefined}>
              {tile}
            </button>
          );
        })}
      </div>
      {!checked&&placed.length>0&&<button onClick={check} style={{padding:"12px 32px",background:`linear-gradient(135deg,${GREEN},#047857)`,color:"white",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(5,150,105,0.3)",fontFamily:"inherit"}}>{t.checkBtn}</button>}
      {checked&&correct&&<div style={{padding:"10px 16px",borderRadius:10,background:"#dcfce7",color:"#166534",fontWeight:700,fontSize:15,fontFamily:"inherit"}}>{t.perfectMsg}</div>}
      {checked&&!correct&&(
        <div style={{borderRadius:10,overflow:"hidden",border:"1px solid #fca5a5",marginBottom:10}}>
          <div style={{padding:"10px 16px",background:"#fee2e2",color:"#991b1b",fontWeight:700,fontSize:14,fontFamily:"inherit"}}>
            {"✗ Correct: "}
            <span style={{fontFamily:arFont,direction:"rtl",fontSize:18,display:"inline"}}>{exercise.answer.join(" ")}</span>
          </div>
          <button onClick={()=>onResult(false)} style={{width:"100%",padding:"11px",background:"#ef4444",color:"white",border:"none",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
            {"Next →"}
          </button>
        </div>
      )}
    </div>
  );
}

// Pattern sentence builder — emoji/Arabic question prompt, no English
// Supports prebaked gold tiles (same mechanism as ReviewTileEx) and a quran badge.
function PatternTileEx({ exercise, onResult, lang = "en" }) {
  const { w } = useWindowSize();
  const t = UI_TEXT[lang];
  const tileFont = w >= 1024 ? 26 : w >= 640 ? 22 : 20;

  const prebakedSet = exercise.prebaked || [];
  const hasPrebaked = prebakedSet.length > 0;
  // Tokens the user must actively place (non-prebaked)
  const nonPrebakedAnswer = exercise.answer.filter(tok => !prebakedSet.some(p => p.ar === tok));

  const [placed, setPlaced] = useState([]);
  const [remaining, setRemaining] = useState(() =>
    shuffle(exercise.tiles.filter(tile => !prebakedSet.some(p => p.ar === tile)))
  );
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [toggled, setToggled] = useState({}); // { ar: bool } — true = show English gloss
  const [activeExp, setActiveExp] = useState(null);

  const addTile    = (tile, idx) => { if (checked) return; setActiveExp(null); setPlaced([...placed, tile]); setRemaining(remaining.filter((_, i) => i !== idx)); };
  const removeTile = (tile, idx) => { if (checked) return; setActiveExp(null); setPlaced(placed.filter((_, i) => i !== idx)); setRemaining([...remaining, tile]); };
  const togglePrebaked = (ar) => setToggled(prev => ({ ...prev, [ar]: !prev[ar] }));

  const check = () => {
    const ok = JSON.stringify(placed) === JSON.stringify(nonPrebakedAnswer);
    setCorrect(ok);
    setChecked(true);
    if (ok) { speak(exercise.answer.join(" ")); setTimeout(() => onResult(true), 1400); }
  };

  // Build the answer zone: prebaked slots + user-placed slots in correct order
  const answerZone = [];
  let gapIdx = 0;
  for (const tile of exercise.answer) {
    const pb = prebakedSet.find(p => p.ar === tile);
    if (pb) {
      answerZone.push({ tile, prebaked: true, en: pb.en });
    } else {
      answerZone.push({ tile: placed[gapIdx], prebaked: false, gapIdx: gapIdx++ });
    }
  }

  // Show Check button when the user has placed something, or when all tiles are prebaked
  const canCheck = !checked && (placed.length > 0 || nonPrebakedAnswer.length === 0);

  return (
    <div style={{textAlign:"center"}}>
      {/* Quran badge */}
      {exercise.quran && (
        <div style={{display:"flex",alignItems:"center",gap:6,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"6px 12px",marginBottom:10,justifyContent:"center"}}>
          <span style={{fontSize:14}}>📖</span>
          <span style={{fontSize:12,fontWeight:700,color:"#92400e"}}>{exercise.quran.ref}</span>
        </div>
      )}
      {/* Definite article context cue */}
      {exercise.definiteCtx && (
        <div style={{display:"inline-block",fontSize:11,fontWeight:700,color:"#1d4ed8",background:"#dbeafe",border:"1px solid #93c5fd",borderRadius:20,padding:"2px 12px",marginBottom:8,fontFamily:"inherit"}}>
          {"definite form (الـ)"}
        </div>
      )}
      {/* Prompt — emoji, translated sentence, or Arabic question */}
      {exercise.emoji
        ? <div style={{lineHeight:1,marginBottom:8}}><EmojiImg emoji={exercise.emoji} size={72}/></div>
        : exercise.en && <p style={{fontSize:15,fontWeight:700,color:"#1e293b",marginBottom:8,fontFamily:"inherit",direction:"ltr"}}>"{exercise.en}"</p>
      }
      {exercise.question && (
        <div style={{marginBottom:4}}>
          <span style={{fontSize:28,fontWeight:700,color:"#0f172a",fontFamily:arFont,direction:"rtl"}}>{exercise.question}</span>
          <SpeakBtn text={exercise.question} size={18}/>
        </div>
      )}
      {exercise.hint && (
        <div style={{fontSize:13,color:"#475569",marginBottom:6,fontStyle:"italic",fontFamily:"inherit",direction:"ltr"}}>
          {exercise.hint}
        </div>
      )}
      {/* Gold tiles hint */}
      {hasPrebaked && <p style={{fontSize:11,color:"#d97706",fontWeight:600,marginBottom:8,fontFamily:"inherit"}}>{t.goldTiles}</p>}
      {checked && !correct && (
        <p style={{fontSize:12,color:"#94a3b8",marginBottom:10}}>
          <SpeakBtn text={exercise.answer.join(" ")} size={14}/> <span style={{fontFamily:"inherit"}}>{t.hearAnswer}</span>
        </p>
      )}
      {/* Answer zone */}
      <div style={{minHeight:60,background:"#f8fafc",borderRadius:12,border:checked?(correct?"2px solid #22c55e":"2px solid #ef4444"):"2px dashed #cbd5e1",padding:"10px 12px",marginBottom:8,display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",alignItems:"center",direction:"rtl"}}>
        {/* Empty hint — only when no prebaked tiles and nothing placed yet */}
        {!hasPrebaked && placed.length === 0 && (
          <span style={{color:"#94a3b8",fontSize:13,fontFamily:"inherit"}}>{t.tapToAnswer}</span>
        )}
        {answerZone.map((item, i) => {
          if (item.prebaked) {
            // Gold tile: tappable to toggle Arabic ↔ English gloss
            const showing = toggled[item.tile];
            const label = item.en;
            return (
              <button key={`pb-${i}`} onClick={() => togglePrebaked(item.tile)}
                style={{padding:"8px 12px",background:checked?"#fef3c7":"#fef9c3",border:"2px solid #f59e0b",borderRadius:8,
                  fontSize:showing?13:20,fontFamily:showing?("inherit"):arFont,
                  fontWeight:700,cursor:"pointer",color:"#92400e",
                  direction:showing?("ltr"):"rtl",minWidth:50}}>
                {showing ? label : item.tile}
              </button>
            );
          } else if (item.tile) {
            // User-placed tile
            const grade = checked ? tileGetGrade(item.tile, item.gapIdx, nonPrebakedAnswer) : null;
            const s = grade ? tileGradeStyle(grade) : null;
            return (
              <button key={`pl-${i}`}
                onClick={checked ? () => setActiveExp(tileGradeExp(item.tile, grade, nonPrebakedAnswer)) : () => removeTile(item.tile, item.gapIdx)}
                style={{padding:"8px 12px",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,
                  background:s?s.bg:(checked?"#dcfce7":"#dbeafe"),
                  border:s?`2px solid ${s.border}`:"none",
                  color:s?s.col:"#1e293b",cursor:"pointer"}}>
                {item.tile}
              </button>
            );
          } else if (hasPrebaked) {
            // Empty gap slot — only show when there are prebaked tiles (otherwise user sees no tiles at all initially)
            return <span key={`gap-${i}`} style={{width:60,height:40,border:"2px dashed #cbd5e1",borderRadius:8,display:"inline-block"}}/>;
          }
          return null;
        })}
      </div>
      {/* Explanation bar */}
      {checked && !correct && activeExp && (
        <div style={{margin:"0 0 8px",padding:"8px 14px",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,fontSize:13,color:"#0c4a6e",lineHeight:1.5,fontFamily:arFont,direction:"rtl"}}>
          {activeExp}
        </div>
      )}
      {/* Tile bank */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:16,direction:"rtl"}}>
        {remaining.map((tile, i) => {
          const missing = checked && nonPrebakedAnswer.includes(tile);
          const bankExp = `"${tile}" was needed but not placed`;
          return (
            <button key={`${tile}-${i}`}
              onClick={checked ? (missing ? () => setActiveExp(bankExp) : undefined) : () => addTile(tile, i)}
              style={{padding:"8px 12px",background:missing?"#fee2e2":"white",border:missing?"2px solid #ef4444":"2px solid #e2e8f0",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,color:missing?"#991b1b":"#1e293b",cursor:checked?(missing?"pointer":"default"):"pointer",transition:"transform 0.1s"}}
              onMouseEnter={!checked ? e => { e.currentTarget.style.transform = "scale(1.06)" } : undefined}
              onMouseLeave={!checked ? e => { e.currentTarget.style.transform = "scale(1)" } : undefined}>
              {tile}
            </button>
          );
        })}
      </div>
      {canCheck && (
        <button onClick={check} style={{padding:"12px 32px",background:`linear-gradient(135deg,${GREEN},#047857)`,color:"white",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(5,150,105,0.3)",fontFamily:"inherit"}}>
          {t.checkBtn}
        </button>
      )}
      {checked && correct && (
        <div style={{padding:"10px 16px",borderRadius:10,background:"#dcfce7",color:"#166534",fontWeight:700,fontSize:15,fontFamily:"inherit"}}>
          {t.perfectMsg}
        </div>
      )}
      {checked && !correct && (
        <div style={{borderRadius:10,overflow:"hidden",border:"1px solid #fca5a5",marginBottom:10}}>
          <div style={{padding:"10px 16px",background:"#fee2e2",color:"#991b1b",fontWeight:700,fontSize:15}}>
            {"✗ Correct: "}
            <span style={{fontFamily:arFont,direction:"rtl",fontSize:18}}>{exercise.answer.join(" ")}</span>
          </div>
          <button onClick={() => onResult(false)} style={{width:"100%",padding:"11px",background:"#ef4444",color:"white",border:"none",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
            {"Next →"}
          </button>
        </div>
      )}
    </div>
  );
}

// Review tile builder with pre-baked words (tappable to toggle Arabic↔English)
function ReviewTileEx({ exercise, onResult, lang = "en" }) {
  const { w } = useWindowSize();
  const t = UI_TEXT[lang];
  const tileFont = w >= 1024 ? 26 : w >= 640 ? 22 : 20;
  const [placed, setPlaced] = useState([]);
  const [remaining, setRemaining] = useState(()=>shuffle(exercise.tiles.filter(t=>!exercise.prebaked.some(p=>p.ar===t))));
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [toggled, setToggled] = useState({}); // { prebakedAr: true/false } — true = show label
  const [activeExp, setActiveExp] = useState(null);

  const prebakedSet = exercise.prebaked || [];
  const prebakedInAnswer = exercise.answer.filter(t => prebakedSet.some(p=>p.ar===t));
  const nonPrebakedAnswer = exercise.answer.filter(t => !prebakedSet.some(p=>p.ar===t));

  const addTile=(tile,idx)=>{if(checked)return;setActiveExp(null);setPlaced([...placed,tile]);setRemaining(remaining.filter((_,i)=>i!==idx));};
  const removeTile=(tile,idx)=>{if(checked)return;setActiveExp(null);setPlaced(placed.filter((_,i)=>i!==idx));setRemaining([...remaining,tile]);};
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
    if(ok) speak(exercise.answer.join(" "));
    setCorrect(ok); setChecked(true); setTimeout(()=>onResult(ok),1400);
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
      <p style={{color:"#64748b",fontSize:12,marginBottom:4,fontFamily:"inherit"}}>{t.buildSentence}</p>
      <p style={{fontSize:16,fontWeight:700,color:"#1e293b",marginBottom:4,fontFamily:"inherit",direction:"ltr"}}>"{exercise.en}"</p>
      {checked && !correct && (
        <p style={{fontSize:12,color:"#94a3b8",marginBottom:prebakedSet.length>0?4:12}}>
          <SpeakBtn text={exercise.answer.join(" ")} size={15} /> <span style={{fontFamily:"inherit"}}>{t.hearAnswer}</span>
        </p>
      )}
      {prebakedSet.length>0&&<p style={{fontSize:11,color:"#d97706",fontWeight:600,marginBottom:12,fontFamily:"inherit"}}>{t.goldTiles}</p>}
      {/* Answer zone */}
      <div style={{minHeight:60,background:"#f8fafc",borderRadius:12,border:checked?(correct?"2px solid #22c55e":"2px solid #ef4444"):"2px dashed #cbd5e1",padding:"10px 12px",marginBottom:12,display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",alignItems:"center",direction:"rtl"}}>
        {answerZone.length===0&&!prebakedSet.length&&<span style={{color:"#94a3b8",fontSize:13,fontFamily:"inherit"}}>{t.tapToBuild}</span>}
        {answerZone.map((item,i)=>{
          if(item.prebaked){
            const showing = toggled[item.tile];
            const label = item.en;
            return <button key={`pb-${i}`} onClick={()=>togglePrebaked(item.tile)} style={{padding:"8px 12px",background:checked?"#fef3c7":"#fef9c3",border:"2px solid #f59e0b",borderRadius:8,fontSize:showing?13:20,fontFamily:showing?("inherit"):arFont,fontWeight:700,cursor:"pointer",color:"#92400e",direction:showing?("ltr"):"rtl",minWidth:50}}>
              {showing?label:item.tile}
            </button>;
          } else if(item.tile){
            const grade = checked ? tileGetGrade(item.tile, item.gapIdx, nonPrebakedAnswer) : null;
            const s = grade ? tileGradeStyle(grade) : null;
            return <button key={`pl-${i}`}
              onClick={checked ? ()=>setActiveExp(tileGradeExp(item.tile,grade,nonPrebakedAnswer)) : ()=>removeTile(item.tile,item.gapIdx)}
              style={{padding:"8px 12px",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,
                background:s?s.bg:(checked?"#dcfce7":"#dbeafe"),
                border:s?`2px solid ${s.border}`:"none",
                color:s?s.col:"#1e293b",cursor:"pointer"}}>{item.tile}</button>;
          } else {
            return <span key={`gap-${i}`} style={{width:60,height:40,border:"2px dashed #cbd5e1",borderRadius:8,display:"inline-block"}}/>;
          }
        })}
      </div>
      {/* Explanation bar */}
      {checked&&!correct&&activeExp&&(
        <div style={{margin:"0 0 8px",padding:"8px 14px",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,fontSize:13,color:"#0c4a6e",lineHeight:1.5,fontFamily:arFont,direction:"rtl"}}>
          {activeExp}
        </div>
      )}
      {/* Tile bank */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:16,direction:"rtl"}}>
        {remaining.map((tile,i)=>{
          const missing = checked && nonPrebakedAnswer.includes(tile);
          const bankExp = `"${tile}" was needed but not placed`;
          return (
            <button key={`${tile}-${i}`}
              onClick={checked?(missing?()=>setActiveExp(bankExp):undefined):()=>addTile(tile,i)}
              style={{padding:"8px 12px",background:missing?"#fee2e2":"white",border:missing?"2px solid #ef4444":"2px solid #e2e8f0",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,color:missing?"#991b1b":"#1e293b",cursor:checked?(missing?"pointer":"default"):"pointer",transition:"transform 0.1s"}}
              onMouseEnter={!checked?e=>{e.currentTarget.style.transform="scale(1.06)"}:undefined}
              onMouseLeave={!checked?e=>{e.currentTarget.style.transform="scale(1)"}:undefined}>
              {tile}
            </button>
          );
        })}
      </div>
      {!checked&&(placed.length>0||(prebakedSet.length>0&&prebakedSet.length===exercise.answer.length))&&
        <button onClick={check} style={{padding:"12px 32px",background:`linear-gradient(135deg,${GREEN},#047857)`,color:"white",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(5,150,105,0.3)",fontFamily:"inherit"}}>{t.checkBtn}</button>}
      {checked&&correct&&<div style={{padding:"10px 16px",borderRadius:10,background:"#dcfce7",color:"#166534",fontWeight:700,fontSize:15,fontFamily:"inherit"}}>{t.perfectMsg}</div>}
      {checked&&!correct&&(
        <div style={{borderRadius:10,overflow:"hidden",border:"1px solid #fca5a5",marginBottom:10}}>
          <div style={{padding:"10px 16px",background:"#fee2e2",color:"#991b1b",fontWeight:700,fontSize:14}}>
            {"✗ Correct: "}
            <span style={{fontFamily:arFont,direction:"rtl",fontSize:18}}>{exercise.answer.filter(t=>!prebakedSet.some(p=>p.ar===t)).join(" ")}</span>
          </div>
          <button onClick={()=>onResult(false)} style={{width:"100%",padding:"11px",background:"#ef4444",color:"white",border:"none",fontWeight:700,fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
            {"Next →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── AlTransformEx — definiteness transformation exercise ──────────────────────
// Shows an indefinite noun; learner picks the correct definite (nominative) form.
// Two-step: tap to select (blue highlight), then press Check to submit.
function AlTransformEx({ exercise, onResult, lang = "en" }) {
  const [selected, setSelected] = useState(null);
  const [checked, setChecked]   = useState(false);
  const correct = exercise.correct;
  const t = UI_TEXT[lang];

  const select = (opt) => { if (checked) return; setSelected(opt); };

  const check = () => {
    if (!selected || checked) return;
    setChecked(true);
    if (selected === correct) setTimeout(() => onResult(true), 900);
  };

  // Transformation hint: "book → the book"
  const wordLabel = exercise.wordEn;
  const hint = `${exercise.wordEn} → the ${exercise.wordEn}`;

  return (
    <div style={{textAlign:"center", padding:"8px 0"}}>
      <div style={{fontSize:13, color:"#64748b", marginBottom:14, fontFamily:"inherit", direction:"ltr"}}>
        {"Add الـ to make this noun definite"}
      </div>
      {/* Indefinite word */}
      <div style={{fontSize:52, fontFamily:arFont, color:"#1e293b", direction:"rtl", lineHeight:1.4, marginBottom:4}}>
        {exercise.word}
      </div>
      {/* Transformation hint */}
      <div style={{fontSize:13, color:"#94a3b8", marginBottom:24, fontFamily:"inherit", direction:"ltr"}}>
        {hint}
      </div>
      {/* 2×2 option grid */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, maxWidth:340, margin:"0 auto 20px"}}>
        {exercise.options.map((opt, i) => {
          const isCorrect = opt === correct;
          const isSel     = selected === opt;
          let bg = "#f8fafc", border = "2px solid #e2e8f0", color = "#1e293b";
          if (!checked && isSel)                   { bg = "#dbeafe"; border = "2px solid #3b82f6"; }
          else if (checked && isSel && isCorrect)  { bg = "#dcfce7"; border = "2px solid #22c55e"; }
          else if (checked && isSel && !isCorrect) { bg = "#fee2e2"; border = "2px solid #ef4444"; }
          else if (checked && isCorrect)           { bg = "#dcfce7"; border = "2px solid #22c55e"; }
          return (
            <button key={i} onClick={() => select(opt)} style={{
              padding:"14px 8px", background:bg, border, borderRadius:12,
              fontSize:22, fontFamily:arFont, color, direction:"rtl",
              cursor:checked?"default":"pointer", fontWeight:700,
              boxShadow:"0 1px 4px rgba(0,0,0,0.06)", lineHeight:1.6,
              transition:"background 0.12s, border 0.12s",
            }}>
              {opt}
            </button>
          );
        })}
      </div>
      {/* Check button — only visible after a selection has been made */}
      {!checked && selected && (
        <button onClick={check} style={{padding:"12px 32px", background:`linear-gradient(135deg,${GREEN},#047857)`, color:"white", border:"none", borderRadius:12, fontSize:16, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 12px rgba(5,150,105,0.3)", fontFamily:"inherit"}}>
          {t.checkBtn}
        </button>
      )}
      {checked && selected === correct && (
        <div style={{padding:"10px 16px", borderRadius:10, background:"#dcfce7", color:"#166534", fontWeight:700, fontSize:15, fontFamily:"inherit"}}>
          {t.perfectMsg}
        </div>
      )}
      {checked && selected !== correct && (
        <div style={{borderRadius:10, overflow:"hidden", border:"1px solid #fca5a5"}}>
          <div style={{padding:"10px 16px", background:"#fee2e2", color:"#991b1b", fontWeight:700, fontSize:14}}>
            {"✗ Correct: "}
            <span style={{fontFamily:arFont, direction:"rtl", fontSize:20}}>{correct}</span>
          </div>
          <button onClick={() => onResult(false)} style={{width:"100%", padding:"11px", background:"#ef4444", color:"white", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", fontFamily:"inherit"}}>
            {"Next →"}
          </button>
        </div>
      )}
    </div>
  );
}

// ── SunMoonEx — sun/moon letter categorisation exercise ───────────────────────
// Shows a grid of words with الـ; learner taps ☀️ Sun or 🌙 Moon for each,
// then checks all at once.
function SunMoonEx({ exercise, onResult, lang = "en" }) {
  const [selections, setSelections] = useState({}); // ar → true (sun) | false (moon)
  const [checked, setChecked]       = useState(false);
  const words = exercise.words;
  const allDone = words.every(w => selections[w.ar] !== undefined);

  const select = (ar, isSun) => {
    if (checked) return;
    setSelections(prev => ({...prev, [ar]: isSun}));
  };

  const check = () => {
    setChecked(true);
    const allCorrect = words.every(w => selections[w.ar] === w.isSun);
    setTimeout(() => onResult(allCorrect), 1800);
  };

  return (
    <div style={{padding:"4px 0"}}>
      <div style={{fontSize:13, color:"#64748b", textAlign:"center", marginBottom:16, fontFamily:"inherit", direction:"ltr"}}>
        {"In each word: is the ل silent ☀️ or pronounced 🌙?"}
      </div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:10}}>
        {words.map((w,i) => {
          const sel = selections[w.ar];
          const isCorrect = checked ? sel === w.isSun : null;
          return (
            <div key={i} style={{
              background: checked ? (isCorrect?"#dcfce7":"#fee2e2") : "#f8fafc",
              border: checked ? `2px solid ${isCorrect?"#22c55e":"#ef4444"}` : "1px solid #e2e8f0",
              borderRadius:12, padding:"12px 8px", textAlign:"center", transition:"background 0.2s",
            }}>
              <div style={{fontSize:22, fontFamily:arFont, direction:"rtl", marginBottom:10, color:"#1e293b", lineHeight:1.7}}>
                {w.ar}
              </div>
              <div style={{display:"flex", gap:6, justifyContent:"center"}}>
                {[{label:"☀️ Sun", val:true, selBg:"#fef3c7", selBorder:"#f59e0b", selColor:"#92400e"},
                  {label:"🌙 Moon", val:false, selBg:"#ede9fe", selBorder:"#7c3aed", selColor:"#4c1d95"}
                ].map(btn => (
                  <button key={btn.label} onClick={()=>select(w.ar, btn.val)} style={{
                    padding:"5px 10px", borderRadius:8, fontSize:12, fontWeight:700,
                    cursor:checked?"default":"pointer",
                    background: sel===btn.val ? btn.selBg : "white",
                    border: sel===btn.val ? `2px solid ${btn.selBorder}` : "1.5px solid #e2e8f0",
                    color: sel===btn.val ? btn.selColor : "#64748b",
                    fontFamily: "inherit",
                  }}>
                    {btn.label}
                  </button>
                ))}
              </div>
              {checked && (
                <div style={{fontSize:11, marginTop:6, fontWeight:700,
                  color: isCorrect?"#166534":"#991b1b", fontFamily:"inherit"}}>
                  {w.isSun
                    ? ("☀️ Sun letter — ل is silent")
                    : ("🌙 Moon letter — ل is pronounced")}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!checked && allDone && (
        <button onClick={check} style={{
          width:"100%", marginTop:16, padding:"13px",
          background:`linear-gradient(135deg,${GREEN},#047857)`, color:"white",
          border:"none", borderRadius:12, fontSize:16, fontWeight:700,
          cursor:"pointer", boxShadow:"0 4px 12px rgba(5,150,105,0.3)",
          fontFamily:"inherit",
        }}>
          {"Check →"}
        </button>
      )}
    </div>
  );
}

// ── NearFarEx — هَذَا / ذَلِكَ contrast exercise ─────────────────────────────
// Shows two images: big (near = هَذَا) and small (far = ذَلِكَ).
// Learner builds both sentences in one tile pool.
// exercise: { near:{emoji,ar,en}, far:{emoji,ar,en}, tiles:[...], answer:[...] }
function NearFarEx({ exercise, onResult, lang = "en" }) {
  const { w } = useWindowSize();
  const tileFont = w >= 1024 ? 24 : 20;
  const [placed, setPlaced]     = useState([]);
  const [remaining, setRemaining] = useState(() => shuffle([...exercise.tiles]));
  const [checked, setChecked]   = useState(false);
  const [correct, setCorrect]   = useState(false);

  const addTile    = (tile,idx) => { if(checked)return; setPlaced([...placed,tile]); setRemaining(remaining.filter((_,i)=>i!==idx)); };
  const removeTile = (tile,idx) => { if(checked)return; setPlaced(placed.filter((_,i)=>i!==idx)); setRemaining([...remaining,tile]); };
  const check = () => {
    const ok = JSON.stringify(placed) === JSON.stringify(exercise.answer);
    setCorrect(ok); setChecked(true);
    if (ok) { speak(exercise.answer.join(" ")); setTimeout(()=>onResult(true),1400); }
  };
  const readyToCheck = placed.length === exercise.answer.length;

  return (
    <div style={{textAlign:"center"}}>
      {/* Scene — near (big, right in RTL) + far (small, left in RTL) */}
      <div style={{display:"flex",justifyContent:"center",alignItems:"flex-end",gap:40,marginBottom:20,direction:"rtl"}}>
        {/* Near */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          <EmojiImg emoji={exercise.near.emoji} size={88}/>
          <div style={{marginTop:8,padding:"4px 16px",background:"#dbeafe",borderRadius:20,
            fontSize:18,fontFamily:arFont,color:"#1d4ed8",fontWeight:700,letterSpacing:1}}>
            هَذَا
          </div>
        </div>
        {/* Far */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          <EmojiImg emoji={exercise.far.emoji} size={46}/>
          <div style={{marginTop:8,padding:"4px 14px",background:"#f1f5f9",borderRadius:20,
            fontSize:18,fontFamily:arFont,color:"#64748b",fontWeight:700,letterSpacing:1}}>
            ذَلِكَ
          </div>
        </div>
      </div>

      {/* Answer zone */}
      <div style={{minHeight:60,background:"#f8fafc",borderRadius:12,
        border:checked?(correct?"2px solid #22c55e":"2px solid #ef4444"):"2px dashed #cbd5e1",
        padding:"10px 12px",marginBottom:8,display:"flex",flexWrap:"wrap",gap:8,
        justifyContent:"center",alignItems:"center",direction:"rtl"}}>
        {placed.length===0 && <span style={{color:"#94a3b8",fontSize:13,fontFamily:"inherit"}}>
          {"Build both sentences"}
        </span>}
        {placed.map((tile,i)=>(
          <button key={`p-${tile}-${i}`}
            onClick={checked?undefined:()=>removeTile(tile,i)}
            style={{padding:"8px 12px",borderRadius:8,fontSize:tileFont,fontFamily:arFont,fontWeight:700,
              background:checked?(correct?"#dcfce7":"#fee2e2"):"#dbeafe",
              color:checked?(correct?"#166534":"#991b1b"):"#1e40af",
              border:"none",cursor:checked?"default":"pointer"}}>
            {tile}
          </button>
        ))}
      </div>

      {/* Tile bank */}
      <div style={{display:"flex",flexWrap:"wrap",gap:8,justifyContent:"center",marginBottom:12,direction:"rtl"}}>
        {remaining.map((tile,i)=>(
          <button key={`r-${tile}-${i}`} onClick={()=>addTile(tile,i)} disabled={checked}
            style={{padding:"8px 14px",borderRadius:10,fontSize:tileFont,fontFamily:arFont,fontWeight:700,
              background:"white",border:"2px solid #e2e8f0",color:"#0f172a",
              cursor:checked?"default":"pointer",opacity:checked?0.5:1}}>
            {tile}
          </button>
        ))}
      </div>

      {!checked && readyToCheck && (
        <button onClick={check} style={{width:"100%",padding:"13px",
          background:`linear-gradient(135deg,${GREEN},#047857)`,color:"white",
          border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",
          fontFamily:"inherit"}}>
          {"Check →"}
        </button>
      )}
      {checked && correct && (
        <div style={{padding:"10px 16px",borderRadius:10,background:"#dcfce7",
          color:"#166534",fontWeight:700,fontSize:15,fontFamily:"inherit"}}>
          {"Perfect! 🎉"}
        </div>
      )}
      {checked && !correct && (
        <div style={{borderRadius:10,overflow:"hidden",border:"1px solid #fca5a5"}}>
          <div style={{padding:"10px 16px",background:"#fee2e2",color:"#991b1b",fontWeight:700,fontSize:14}}>
            {"✗ Correct: "}
            <span style={{fontFamily:arFont,direction:"rtl",fontSize:18,display:"inline"}}>
              {exercise.answer.join(" ")}
            </span>
          </div>
          <button onClick={()=>onResult(false)} style={{width:"100%",padding:"11px",
            background:"#ef4444",color:"white",border:"none",fontWeight:700,
            fontSize:15,cursor:"pointer",fontFamily:"inherit"}}>
            {"Next →"}
          </button>
        </div>
      )}
    </div>
  );
}

// Grammar intro card (regular sessions)
function GrammarCard({ session, onStart, lang = "en" }) {
  const { w } = useWindowSize();
  const t = UI_TEXT[lang];
  const isSm = w < 640;
  const titleSize = w >= 1024 ? 32 : w >= 640 ? 28 : 24;
  const vocabArSize = 28; // was 22-26 — bumped for harakat legibility
  const grammarNote = session.grammar;
  const examples = session.grammarExamples || [];

  return (
    <div style={{padding:"16px 16px 24px"}}>

      {/* ── Session header ─────────────────────────────────────── */}
      <div style={{background:"linear-gradient(135deg,#eff6ff,#dbeafe)",border:"1px solid #93c5fd",borderRadius:16,padding:"16px 16px 14px",marginBottom:12,textAlign:"center"}}>
        <div style={{fontSize:11,color:"#3b82f6",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4,fontFamily:"inherit",direction:"ltr",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
          {t.bookLessonPart(session.book, session.lessonRef, session.part)}
        </div>
        <div style={{fontSize:titleSize,fontWeight:700,color:"#1e40af",fontFamily:arFont,direction:"rtl",marginBottom:4,lineHeight:1.4}}>
          {session.title}
        </div>
        <div style={{fontSize:15,fontWeight:600,color:"#1e3a5f",fontFamily:"inherit",direction:"ltr"}}>
          {session.titleEn}
        </div>
      </div>

      {/* ── Recognition opener (definite article sessions) ─────── */}
      {session.recognitionOpener && (() => {
        const ro = session.recognitionOpener;
        return (
          <div style={{background:"linear-gradient(135deg,#f0fdf4,#dcfce7)",border:"1px solid #86efac",borderRadius:14,padding:"14px 16px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,color:"#15803d",textTransform:"uppercase",letterSpacing:1,marginBottom:10,fontFamily:"inherit",textAlign:"left"}}>
              ✨ {ro.enHeading}
            </div>
            <div style={{display:"flex",gap:8,marginBottom:12,justifyContent:"center",flexWrap:"wrap"}}>
              {ro.words.map((w,i)=>(
                <div key={i} style={{background:"white",border:"1px solid #86efac",borderRadius:10,padding:"8px 12px",textAlign:"center",minWidth:84}}>
                  <div style={{fontSize:22,fontFamily:arFont,fontWeight:700,color:"#1e293b",direction:"rtl",lineHeight:1.6}}>{w.ar}</div>
                  <div style={{fontSize:10,color:"#16a34a",fontFamily:"inherit",direction:"ltr",marginTop:2,lineHeight:1.4}}>
                    {w.note_en}
                  </div>
                </div>
              ))}
            </div>
            <div style={{fontSize:13,color:"#14532d",lineHeight:1.8,fontFamily:"inherit",direction:"ltr",textAlign:"left",background:"rgba(255,255,255,0.65)",borderRadius:8,padding:"8px 12px"}}>
              {ro.enReveal}
            </div>
          </div>
        );
      })()}

      {/* ── Grammar section ────────────────────────────────────── */}
      {grammarNote && (
        <div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:14,padding:"14px 16px",marginBottom:14}}>
          {/* Label */}
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:10,flexDirection:"row"}}>
            <span style={{fontSize:16}}>📖</span>
            <span style={{fontSize:11,fontWeight:800,color:"#b45309",textTransform:"uppercase",letterSpacing:1.2,fontFamily:"inherit"}}>
              {"Grammar"}
            </span>
          </div>
          {/* Rule statement */}
          <div style={{
            fontSize:14,color:"#78350f",lineHeight:1.9,marginBottom:examples.length?14:0,
            textAlign:"left",direction:"ltr",
            fontFamily:"inherit",
          }}>
            {grammarNote}
          </div>
          {/* Example phrase cards */}
          {examples.length > 0 && (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {examples.map((ex, i) => (
                <div key={i} style={{background:"white",border:"1px solid #fde68a",borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexDirection:"row"}}>
                  <div style={{fontSize:isSm?20:22,fontFamily:arFont,fontWeight:700,color:"#1e293b",direction:"rtl",lineHeight:1.6,flex:1,textAlign:"right"}}>
                    {ex.ar}
                  </div>
                  <div style={{fontSize:13,color:"#92400e",fontWeight:600,fontFamily:"inherit",direction:"ltr",flex:1,textAlign:"left"}}>
                    {ex.en}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Vocabulary section ─────────────────────────────────── */}
      <h3 style={{
        fontSize:14,fontWeight:700,color:"#1e293b",margin:"0 0 10px",
        textAlign:"left",
        fontFamily:"inherit",
      }}>{t.newWords}</h3>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {session.vocab.map((word,i)=>{
          const em = getEmoji(word.en);
          const meaning = word.en;
          const hasContrast = !!word.indef;
          return (
            <div key={i} style={{background:"#f8fafc",borderRadius:10,padding:"12px 10px",border:hasContrast?"1px solid #93c5fd":"1px solid #e2e8f0",textAlign:"center"}}>
              {em && <div style={{lineHeight:1.3,marginBottom:4}}><EmojiImg emoji={em} size={32}/></div>}
              <div style={{fontSize:vocabArSize,fontWeight:700,color:"#1e293b",fontFamily:arFont,direction:"rtl",lineHeight:1.6}}>{word.ar}</div>
              <div style={{
                fontSize:13,color:"#475569",fontWeight:600,
                fontFamily:"inherit",
                direction:"ltr",
              }}>
                {meaning}
              </div>
              {hasContrast && (
                <div style={{marginTop:5,paddingTop:5,borderTop:"1px dashed #cbd5e1",display:"flex",alignItems:"center",justifyContent:"center",gap:4,direction:"rtl",flexWrap:"wrap"}}>
                  <span style={{fontSize:15,fontFamily:arFont,fontWeight:600,color:"#94a3b8"}}>{word.indef}</span>
                  <span style={{fontSize:10,color:"#94a3b8",fontFamily:"inherit",direction:"ltr"}}>
                    {`= ${word.en.replace("the ","")} (indef.)`}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button onClick={onStart} style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#3b82f6,#2563eb)",color:"white",border:"none",borderRadius:14,fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(59,130,246,0.35)",fontFamily:"inherit"}}>
        {t.startPractice}
      </button>
    </div>
  );
}

// Review intro card
function ReviewIntro({ review, onStart, lang = "en" }) {
  const grammarCount = review.grammarExercises.length;
  const tileCount = review.sentenceTiles.length;
  const t = UI_TEXT[lang];
  const reviewTitle = review.titleEn;
  return (
    <div style={{padding:"16px 16px 24px"}}>
      <div style={{background:"linear-gradient(135deg,#fef9c3,#fef3c7)",border:"1px solid #f59e0b",borderRadius:16,padding:"16px 16px 20px",marginBottom:16,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:8}}>🏆</div>
        <div style={{fontSize:11,color:"#d97706",fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:4,fontFamily:"inherit"}}>{t.reviewSession}</div>
        <div style={{fontSize:18,fontWeight:800,color:"#92400e",marginBottom:6,fontFamily:"inherit",direction:"ltr"}}>{reviewTitle}</div>
        <div style={{fontSize:13,color:"#78350f",fontWeight:600,marginBottom:12,fontFamily:"inherit",direction:"ltr"}}>{t.reviewCovers} {review.coversLessons}</div>
        <div style={{display:"flex",gap:10,justifyContent:"center"}}>
          <div style={{background:"rgba(255,255,255,0.6)",borderRadius:12,padding:"8px 14px",textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:"#d97706"}}>{grammarCount}</div>
            <div style={{fontSize:11,color:"#92400e",fontWeight:700,fontFamily:"inherit"}}>{t.grammarQs}</div>
          </div>
          <div style={{background:"rgba(255,255,255,0.6)",borderRadius:12,padding:"8px 14px",textAlign:"center"}}>
            <div style={{fontSize:22,fontWeight:800,color:"#d97706"}}>{tileCount}</div>
            <div style={{fontSize:11,color:"#92400e",fontWeight:700,fontFamily:"inherit"}}>{t.sentenceTiles}</div>
          </div>
        </div>
      </div>
      <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:14,marginBottom:20}}>
        <p style={{fontSize:12,color:"#92400e",fontWeight:700,margin:"0 0 4px",fontFamily:"inherit",direction:"ltr"}}>{t.howItWorksRev}</p>
        <p style={{fontSize:12,color:"#78350f",lineHeight:1.6,margin:0,fontFamily:"inherit",direction:"ltr"}}>
          {t.howItWorksRevText(grammarCount, tileCount)}
        </p>
      </div>
      <button onClick={onStart} style={{width:"100%",padding:"14px",background:"linear-gradient(135deg,#f59e0b,#d97706)",color:"white",border:"none",borderRadius:14,fontSize:17,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(245,158,11,0.4)",fontFamily:"inherit"}}>
        {t.startReview}
      </button>
    </div>
  );
}

// Complete screen
function CompleteScreen({ xp, accuracy, isReview, quranCoverage, onContinue }) {
  return (
    <div style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontSize:64,marginBottom:12}}>{accuracy>=80?"🌟":accuracy>=60?"⭐":"💪"}</div>
      <h2 style={{fontSize:26,fontWeight:800,color:"#1e293b",margin:"0 0 4px"}}>{isReview?"Review Complete! 🏆":"Session Complete!"}</h2>
      {isReview&&<p style={{fontSize:13,color:"#d97706",fontWeight:600,margin:"0 0 16px"}}>Great work revising your Arabic!</p>}
      <div style={{display:"flex",justifyContent:"center",gap:24,marginBottom:20}}>
        <div><div style={{fontSize:36,fontWeight:800,color:"#f59e0b"}}>+{xp}</div><div style={{fontSize:12,color:"#6b7280"}}>XP Earned</div></div>
        <div><div style={{fontSize:36,fontWeight:800,color:accuracy>=80?"#22c55e":"#f59e0b"}}>{accuracy}%</div><div style={{fontSize:12,color:"#6b7280"}}>Accuracy</div></div>
      </div>
      {/* Quran Unlocked stat */}
      <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:"12px 16px",marginBottom:24,textAlign:"left"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:13,fontWeight:700,color:"#78350f"}}>📖 Quran Unlocked</span>
          <span style={{fontSize:20,fontWeight:800,color:"#d97706"}}>{quranCoverage}%</span>
        </div>
        <div style={{background:"#fed7aa",borderRadius:99,height:6,overflow:"hidden"}}>
          <div style={{height:"100%",borderRadius:99,background:"linear-gradient(90deg,#f59e0b,#d97706)",width:`${quranCoverage}%`}}/>
        </div>
        <p style={{fontSize:11,color:"#92400e",margin:"5px 0 0"}}>of the Quran's most frequent words you now recognise</p>
      </div>
      <button onClick={onContinue} style={{padding:"14px 40px",background:`linear-gradient(135deg,${GREEN},#047857)`,color:"white",border:"none",borderRadius:14,fontSize:18,fontWeight:700,cursor:"pointer",boxShadow:"0 4px 14px rgba(5,150,105,0.4)"}}>Continue</button>
    </div>
  );
}


// ── QURAN CONNECTION OVERLAY ─────────────────────────────────────────────────
function QuranOverlay({ connection, lang, onContinue }) {
  return (
    <div style={{
      position:"absolute", inset:0, zIndex:100,
      background:"linear-gradient(160deg,#1a3a2a 0%,#0d2218 100%)",
      display:"flex", flexDirection:"column", alignItems:"center",
      justifyContent:"center", padding:"28px 24px 40px", textAlign:"center",
      overflowY:"auto",
    }}>
      {/* Crescent + star motif */}
      <div style={{fontSize:36, marginBottom:10}}>🌙✨</div>

      {/* Header */}
      <div style={{
        color:"#fbbf24", fontSize:12, fontWeight:700,
        letterSpacing:1.5, textTransform:"uppercase", marginBottom:18,
        fontFamily:"inherit",
      }}>
        {"This word appears in the Holy Quran"}
      </div>

      {/* Arabic verse */}
      <div style={{
        color:"white", fontSize:26, fontFamily:arFont,
        direction:"rtl", lineHeight:1.9, marginBottom:14,
        background:"rgba(255,255,255,0.07)", borderRadius:14,
        padding:"16px 20px", width:"100%", maxWidth:420,
        boxShadow:"inset 0 1px 0 rgba(255,255,255,0.1)",
      }}>
        <HighlightedVerse text={connection.ar} hlKey={connection.hlKey} />
      </div>

      {/* Surah reference */}
      <div style={{color:"#86efac", fontSize:12, fontWeight:600, marginBottom:14, fontFamily:"inherit", direction:"ltr"}}>
        — {connection.ref}
      </div>

      {/* Translation */}
      <div style={{
        color:"#d1fae5", fontSize:15, lineHeight:1.7,
        fontFamily:"inherit",
        direction:"ltr",
        maxWidth:380, marginBottom:28,
      }}>
        "<HighlightedTranslation text={connection.en} hlKey={connection.hlKey} />"
      </div>

      {/* Continue button */}
      <button onClick={onContinue} style={{
        background:GREEN, color:"white", border:"none",
        borderRadius:12, padding:"13px 44px",
        fontSize:16, fontWeight:700, cursor:"pointer",
        fontFamily:"inherit",
        boxShadow:"0 4px 14px rgba(5,150,105,0.45)",
      }}>
        {"Continue →"}
      </button>
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
  const [quranOverlay, setQuranOverlay] = useState(null); // {ar,en,ref,hlKey} or null
  const quranCounts = useRef({});   // word key → correct-answer count this session
  const pendingAdvance = useRef(null); // fn to call after overlay dismissed
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem("ma_completed") || "{}"); } catch { return {}; }
  });
  const [unlockAll, setUnlockAll] = useState(() => localStorage.getItem("ma_unlock") === "1");
  const lang = "en";
  const [openBooks, setOpenBooks] = useState(() => new Set([1]));
  const [showAbout, setShowAbout] = useState(false);

  // ── Install prompt ──
  const [installPromptEvt, setInstallPromptEvt] = useState(null); // Android beforeinstallprompt
  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isAndroid = /android/i.test(navigator.userAgent);
  const isInStandalone = window.navigator.standalone === true
    || window.matchMedia("(display-mode: standalone)").matches;
  const [installDismissed, setInstallDismissed] = useState(
    () => localStorage.getItem("ma_install_dismissed") === "1"
  );
  const showInstallBanner = !isInStandalone && !installDismissed && (isIos || isAndroid || installPromptEvt);
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setInstallPromptEvt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  const dismissInstall = () => {
    setInstallDismissed(true);
    localStorage.setItem("ma_install_dismissed", "1");
  };
  const triggerInstall = async () => {
    if (installPromptEvt) {
      installPromptEvt.prompt();
      await installPromptEvt.userChoice;
      setInstallPromptEvt(null);
    }
    dismissInstall();
  };

  // Persist completed + unlockAll + lang
  useEffect(() => { localStorage.setItem("ma_completed", JSON.stringify(completed)); }, [completed]);
  useEffect(() => { localStorage.setItem("ma_unlock", unlockAll ? "1" : "0"); }, [unlockAll]);

  const numCompleted = Object.keys(completed).length;

  const startSession = (s) => {
    const exs = s.type === "review" ? buildReviewExercises(s) : buildExercises(s, lang);
    setSessionData(s);
    setExercises(exs);
    setExIdx(0); setCorrect(0); setTotal(0); setHearts(5);
    setQuranOverlay(null); quranCounts.current = {}; pendingAdvance.current = null;
    setScreen("intro");
    track("session_start", {
      session_id: s.id,
      session_title: s.titleEn || s.title,
      book: s.book || "review",
      session_type: s.type || "regular",
      language: lang,
    });
  };

  // Advance to next exercise or complete session. Captured values prevent stale closure.
  const doAdvance = (nt, nc, capturedExIdx, capturedHearts, capturedSession) => {
    setTimeout(() => {
      const last = capturedExIdx + 1 >= exercises.length || capturedHearts <= 1;
      if (last) {
        const acc = nt > 0 ? Math.round((nc / nt) * 100) : 0;
        const earned = Math.max(5, Math.round(acc / 10) * 5);
        setXp(p => p + earned);
        setCompleted(prev => ({ ...prev, [capturedSession.id]: acc }));
        track("session_complete", {
          session_id: capturedSession?.id,
          session_title: capturedSession?.titleEn || capturedSession?.title,
          book: capturedSession?.book || "review",
          accuracy: acc, xp_earned: earned, language: lang,
        });
        setScreen("complete");
      } else { setExIdx(p => p + 1); }
    }, 400);
  };

  const dismissQuranOverlay = () => {
    setQuranOverlay(null);
    const fn = pendingAdvance.current;
    pendingAdvance.current = null;
    if (fn) fn();
  };

  const handleResult = (wasCorrect) => {
    const newTotal = total + 1;
    const newCorrect = correct + (wasCorrect ? 1 : 0);
    setTotal(newTotal); setCorrect(newCorrect);
    if (wasCorrect) { setStreak(p => p + 1); }
    else {
      setHearts(p => Math.max(0, p - 1)); setStreak(0);
      track("exercise_wrong", {
        session_id: sessionData?.id,
        exercise_type: exercises[exIdx]?.type,
        book: sessionData?.book || "review",
        language: lang,
      });
    }

    // Check for Quran connection on correct answers
    if (wasCorrect) {
      const counts = quranCounts.current;
      const shownKeys = new Set(Object.keys(counts).filter(k => counts[k] > 0));
      const qKey = getQuranWord(exercises[exIdx], shownKeys);
      if (qKey) {
        counts[qKey] = (counts[qKey] || 0) + 1;
        // Show on 1st, 4th, 7th, 10th… correct answer for this word (formula: (n-1) % 3 === 0)
        if ((counts[qKey] - 1) % 3 === 0) {
          const capturedExIdx = exIdx, capturedHearts = hearts, capturedSession = sessionData;
          pendingAdvance.current = () => doAdvance(newTotal, newCorrect, capturedExIdx, capturedHearts, capturedSession);
          const qExamples = QURAN_CONNECTIONS[qKey];
          const qArr = Array.isArray(qExamples) ? qExamples : [qExamples];
          const showIdx = Math.floor((counts[qKey] - 1) / 3) % qArr.length;
          setQuranOverlay({ ...qArr[showIdx], hlKey: qKey });
          return; // don't advance yet — overlay requires tap to continue
        }
      }
    }

    doAdvance(newTotal, newCorrect, exIdx, hearts, sessionData);
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
    position: "relative",
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
    const completedIds = Object.keys(completed).map(Number);
    const quranCoverage = getQuranCoverage(completedIds);
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          {/* ── Add to Home Screen banner ── */}
          {showInstallBanner && (
            <div style={{
              background:"#fef3c7", borderBottom:"1px solid #fcd34d",
              padding:"12px 16px", display:"flex", alignItems:"flex-start", gap:10,
            }}>
              <div style={{fontSize:22, lineHeight:1, flexShrink:0}}>📱</div>
              <div style={{flex:1, fontSize:13, color:"#78350f", lineHeight:1.5}}>
                {isIos ? (
                  <>
                    <strong>Add to your Home Screen</strong> for the best experience.<br/>
                    Tap <strong style={{whiteSpace:"nowrap"}}>Share <span style={{fontSize:15}}>⎙</span></strong> then <strong>"Add to Home Screen"</strong>
                  </>
                ) : (
                  <>
                    <strong>Install as an app</strong> for the best experience.<br/>
                    {installPromptEvt
                      ? <button onClick={triggerInstall} style={{marginTop:6,background:GREEN,color:"white",border:"none",borderRadius:8,padding:"5px 14px",fontSize:13,fontWeight:700,cursor:"pointer"}}>Install app</button>
                      : <>Tap your browser menu → <strong>"Add to Home Screen"</strong></>
                    }
                  </>
                )}
              </div>
              <button onClick={dismissInstall} style={{
                background:"none", border:"none", color:"#92400e",
                fontSize:18, cursor:"pointer", lineHeight:1, flexShrink:0, padding:2,
              }}>✕</button>
            </div>
          )}
          <div style={{background:`linear-gradient(135deg,${GREEN},#047857)`,padding:"32px 20px 24px",textAlign:"center",color:"white",position:"relative"}}>
            <button onClick={()=>setScreen("settings")} style={{position:"absolute",top:12,right:12,background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:18,lineHeight:1}}>⚙️</button>
            <button onClick={()=>setShowAbout(true)} style={{position:"absolute",top:12,left:12,background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:15,lineHeight:1,fontWeight:700}}>ℹ️</button>
            <div style={{fontSize:52}}>🕌</div>
            <h1 style={{fontSize:28,fontWeight:800,margin:"8px 0 4px"}}>Madinah Arabic</h1>
            <p style={{fontSize:14,opacity:0.85,margin:"0 0 12px"}}>Madinah Book 1 · 24 sessions + 2 reviews</p>
            <div style={{display:"flex",gap:10,justifyContent:"center"}}>
              <div style={{background:"rgba(255,255,255,0.2)",borderRadius:20,padding:"6px 14px",fontWeight:700,fontSize:14}}>⭐ {xp} XP</div>
              <div style={{background:streak>0?"#f97316":"rgba(255,255,255,0.2)",borderRadius:20,padding:"6px 14px",fontWeight:700,fontSize:14}}>🔥 {streak}</div>
            </div>
          </div>
          <div style={{padding:"20px 18px"}}>
            <div style={{background:"#f8fafc",borderRadius:14,padding:16,marginBottom:12,border:"1px solid #e2e8f0"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                <span style={{fontWeight:700,fontSize:14,color:"#1e293b"}}>{UI_TEXT[lang].overallProg}</span>
                <span style={{fontSize:13,color:"#64748b"}}>{doneCount}/{totalCount} {UI_TEXT[lang].sessions}</span>
              </div>
              <ProgressBar pct={(doneCount/totalCount)*100}/>
            </div>
            {/* ── Quran Unlocked ── */}
            <div style={{background:"#fffbeb",borderRadius:14,padding:16,marginBottom:18,border:"1px solid #fde68a"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:18}}>📖</span>
                  <span style={{fontWeight:700,fontSize:14,color:"#78350f"}}>
                    {"Quran Unlocked"}
                  </span>
                </div>
                <span style={{fontWeight:800,fontSize:18,color:"#d97706"}}>{quranCoverage}%</span>
              </div>
              <div style={{background:"#fed7aa",borderRadius:99,height:8,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:99,background:"linear-gradient(90deg,#f59e0b,#d97706)",width:`${quranCoverage}%`,transition:"width 0.6s ease"}}/>
              </div>
              <p style={{fontSize:11,color:"#92400e",margin:"6px 0 0",fontFamily:"inherit",textAlign:"left"}}>
                {`You recognise ${quranCoverage}% of the Quran's most frequent words`}
              </p>
            </div>
            <button onClick={()=>setScreen("map")} style={{width:"100%",padding:"15px",background:`linear-gradient(135deg,${GREEN},#047857)`,color:"white",border:"none",borderRadius:14,fontSize:17,fontWeight:700,cursor:"pointer",marginBottom:12,boxShadow:"0 4px 14px rgba(5,150,105,0.35)",fontFamily:"inherit"}}>
              {doneCount===0 ? UI_TEXT[lang].startLearn : UI_TEXT[lang].continueLearn}
            </button>
            <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:12,padding:14}}>
              <p style={{fontSize:12,color:"#92400e",fontWeight:700,margin:"0 0 4px"}}>{UI_TEXT[lang].howItWorks}</p>
              <p style={{fontSize:12,color:"#78350f",lineHeight:1.6,margin:0,fontFamily:"inherit",textAlign:"left",direction:"ltr"}}>
                {UI_TEXT[lang].howItWorksText}
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

            {/* Credits */}
            <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:14,padding:"16px 18px",textAlign:"center"}}>
              <div style={{fontSize:13,color:"#166534",fontWeight:700,marginBottom:6}}>🕌 Madinah Arabic</div>
              <div style={{fontSize:12,color:"#15803d",lineHeight:1.8}}>
                Based on the <strong>Madinah Arabic Reader</strong> series<br/>
                by <strong>Dr. V. Abdur Rahim</strong><br/>
                (Islamic University of Madinah)
              </div>
              <div style={{height:1,background:"#bbf7d0",margin:"10px 0"}}/>
              <div style={{fontSize:12,color:"#15803d",lineHeight:1.7}}>
                Built by <strong>Muhammad Ibrahim Khan</strong>
              </div>
              <div style={{fontSize:11,color:"#4ade80",marginTop:6}}>
                Powered by Claude · v1.3
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── SESSION MAP ──
  if(screen==="map"){
    const bookColors = {1:["#059669","#047857"]};
    const bookMeta = {
      1:{ar:"الْكِتَابُ الْأَوَّلُ", en:"Core Grammar"},
    };

    // Group ALL_SESSIONS by book (reviews inherit the current book context)
    let curBook = 1;
    const grouped = {1:[]};
    ALL_SESSIONS.forEach((s,idx) => {
      if(s.book) curBook = s.book;
      grouped[curBook].push({s,idx});
    });

    const toggleBook = (b) => setOpenBooks(prev => {
      const next = new Set(prev);
      next.has(b) ? next.delete(b) : next.add(b);
      return next;
    });

    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{background:`linear-gradient(135deg,${GREEN},#047857)`,padding:"14px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <button onClick={()=>setScreen("home")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit"}}>{"← Home"}</button>
            <span style={{color:"white",fontWeight:700,fontSize:16,fontFamily:"inherit"}}>{UI_TEXT[lang].allSessions}</span>
            <button onClick={()=>setScreen("settings")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:16,lineHeight:1}}>⚙️</button>
          </div>

          <div style={{overflowY:"auto",maxHeight:scrollH,padding:"12px 12px 24px"}}>
            {[1].map(bookNum => {
              const colors   = bookColors[bookNum];
              const meta     = bookMeta[bookNum];
              const entries  = grouped[bookNum];
              const bookSess = SESSIONS.filter(s=>s.book===bookNum);
              const bookDone = bookSess.filter(s=>completed[s.id]).length;
              const bookTotal= bookSess.length;
              const pct      = bookTotal>0 ? Math.round(bookDone/bookTotal*100) : 0;
              const isOpen   = openBooks.has(bookNum);
              // Book unlocked if its first session is reachable
              const firstIdx = entries[0]?.idx ?? Infinity;
              const bookUnlocked = unlockAll || firstIdx <= numCompleted;

              return (
                <div key={bookNum} style={{marginBottom:10}}>
                  {/* ── Book header ── */}
                  <button
                    onClick={()=>bookUnlocked&&toggleBook(bookNum)}
                    style={{
                      width:"100%",textAlign:"left",padding:"14px 16px",
                      background:bookUnlocked?`linear-gradient(135deg,${colors[0]},${colors[1]})`:"#f1f5f9",
                      border:bookUnlocked?"none":"1px solid #e2e8f0",
                      borderRadius:isOpen&&bookUnlocked?"14px 14px 0 0":14,
                      cursor:bookUnlocked?"pointer":"default",
                      opacity:bookUnlocked?1:0.55,
                      display:"flex",alignItems:"center",justifyContent:"space-between",
                    }}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:10,color:bookUnlocked?"rgba(255,255,255,0.75)":"#94a3b8",fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,fontFamily:"inherit",display:"flex",alignItems:"center",gap:5}}>
                        {`BOOK ${bookNum}`}
                      </div>
                      <div style={{fontSize:18,fontWeight:800,color:bookUnlocked?"white":"#475569",fontFamily:arFont,direction:"rtl",lineHeight:1.3,marginTop:2}}>
                        {meta.ar}
                      </div>
                      <div style={{fontSize:12,color:bookUnlocked?"rgba(255,255,255,0.85)":"#64748b",marginTop:1,fontFamily:"inherit"}}>
                        {meta.en}
                      </div>
                      {bookUnlocked&&(
                        <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}>
                          <div style={{flex:1,background:"rgba(255,255,255,0.25)",borderRadius:6,height:5,overflow:"hidden"}}>
                            <div style={{height:"100%",width:`${pct}%`,background:"white",borderRadius:6,transition:"width 0.4s"}}/>
                          </div>
                          <span style={{fontSize:11,color:"rgba(255,255,255,0.9)",fontWeight:700,whiteSpace:"nowrap"}}>{bookDone}/{bookTotal}</span>
                        </div>
                      )}
                    </div>
                    <div style={{marginLeft:12,fontSize:20,color:bookUnlocked?"white":"#94a3b8"}}>
                      {!bookUnlocked?"🔒":isOpen?"▲":"▼"}
                    </div>
                  </button>

                  {/* ── Session list ── */}
                  {isOpen&&bookUnlocked&&(
                    <div style={{background:"#f8fafc",border:`1px solid ${colors[0]}33`,borderTop:"none",borderRadius:"0 0 14px 14px",overflow:"hidden"}}>
                      {entries.map(({s,idx})=>{
                        const unlocked = unlockAll || idx <= numCompleted;
                        const acc = completed[s.id];
                        const done = acc !== undefined;
                        const isRev = s.type==="review";

                        if(isRev) return (
                          <button key={s.id} onClick={()=>unlocked&&startSession(s)} disabled={!unlocked}
                            style={{width:"100%",textAlign:"left",padding:"10px 14px",
                              background:done?"#fffbeb":unlocked?"#fefce8":"transparent",
                              border:"none",borderBottom:"1px solid #fde68a",
                              cursor:unlocked?"pointer":"default",opacity:unlocked?1:0.4,
                              display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:10,fontWeight:800,color:"#d97706",fontFamily:"inherit",direction:"ltr"}}>🏆 {"REVIEW"} · {s.coversLessons}</div>
                              <div style={{fontSize:12,color:"#92400e",fontWeight:600,fontFamily:"inherit",direction:"ltr"}}>{s.titleEn}</div>
                              <div style={{fontSize:10,color:"#b45309",marginTop:1,fontFamily:"inherit"}}>{`${s.grammarExercises.length} grammar · ${s.sentenceTiles.length} tiles`}</div>
                            </div>
                            <span style={{fontSize:18,marginLeft:8}}>{!unlocked?"🔒":done?"✅":"🏆"}{done&&<div style={{fontSize:10,color:"#d97706",fontWeight:700}}>{acc}%</div>}</span>
                          </button>
                        );

                        return (
                          <button key={s.id} onClick={()=>unlocked&&startSession(s)} disabled={!unlocked}
                            style={{width:"100%",textAlign:"left",padding:"10px 14px",
                              background:done?`${colors[0]}08`:unlocked?"white":"transparent",
                              border:"none",borderBottom:"1px solid #e2e8f0",
                              cursor:unlocked?"pointer":"default",opacity:unlocked?1:0.4,
                              display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{flex:1}}>
                              <div style={{fontSize:10,color:"#94a3b8",fontWeight:600,marginBottom:1,fontFamily:"inherit",direction:"ltr"}}>
                                {`Part ${s.part}`}
                              </div>
                              <div style={{fontSize:15,fontWeight:700,color:"#0f172a",fontFamily:arFont,direction:"rtl",lineHeight:1.3}}>
                                {s.title}
                              </div>
                              <div style={{fontSize:11,color:"#64748b",marginTop:1,fontFamily:"inherit",direction:"ltr"}}>
                                {s.titleEn}
                              </div>
                            </div>
                            <div style={{marginLeft:8,textAlign:"center",minWidth:32}}>
                              {!unlocked?<span style={{fontSize:18}}>🔒</span>:done?(
                                <div><span style={{fontSize:16}}>✅</span><div style={{fontSize:10,color:colors[0],fontWeight:700}}>{acc}%</div></div>
                              ):<span style={{fontSize:18}}>▶️</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
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
            <button onClick={()=>setScreen("map")} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit"}}>{UI_TEXT[lang].exitBtn}</button>
            <span style={{color:"white",fontWeight:600,fontSize:14,fontFamily:"inherit"}}>
              {isReview?`${UI_TEXT[lang].reviewSession} · ${sessionData.coversLessons}`:UI_TEXT[lang].sessionOf(sessionData.id, SESSIONS.length)}
            </span>
          </div>
          <div style={{overflowY:"auto",maxHeight:scrollH}}>
            {isReview
              ? <ReviewIntro review={sessionData} onStart={()=>setScreen("exercise")} lang={lang}/>
              : <GrammarCard session={sessionData} onStart={()=>setScreen("exercise")} lang={lang}/>}
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
              ? <MCQ key={exIdx} exercise={ex} onResult={handleResult} lang={lang}/>
              : ex.type==="match"
                ? <MatchEx key={exIdx} exercise={ex} onResult={handleResult} lang={lang}/>
                : ex.type==="review_tile"
                  ? <ReviewTileEx key={exIdx} exercise={ex} onResult={handleResult} lang={lang}/>
                  : ex.type==="near_far"
                    ? <NearFarEx key={exIdx} exercise={ex} onResult={handleResult} lang={lang}/>
                    : ex.type==="al_transform"
                      ? <AlTransformEx key={exIdx} exercise={ex} onResult={handleResult} lang={lang}/>
                      : ex.type==="sun_moon"
                      ? <SunMoonEx key={exIdx} exercise={ex} onResult={handleResult} lang={lang}/>
                      : ex.type==="pattern_tile"
                        ? <PatternTileEx key={exIdx} exercise={ex} onResult={handleResult} lang={lang}/>
                        : <TileEx key={exIdx} exercise={ex} onResult={handleResult} lang={lang}/>}
          </div>
          {quranOverlay && (
            <QuranOverlay
              connection={quranOverlay}
              lang={lang}
              onContinue={dismissQuranOverlay}
            />
          )}
        </div>
      </div>
    );
  }

  // ── COMPLETE ──
  if(screen==="complete"&&sessionData){
    const acc = total>0?Math.round((correct/total)*100):0;
    const earned = Math.max(5,Math.round(acc/10)*5);
    // Coverage is calculated from the updated `completed` state (which already
    // includes the session just finished, set in doAdvance before setScreen).
    const completedIds = Object.keys(completed).map(Number);
    const quranCoverage = getQuranCoverage(completedIds);
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <CompleteScreen xp={earned} accuracy={acc} isReview={sessionData.type==="review"} quranCoverage={quranCoverage} onContinue={()=>setScreen("map")}/>
        </div>
      </div>
    );
  }

  // ── ABOUT MODAL ── (overlays any screen)
  if (showAbout) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={{background:`linear-gradient(135deg,${GREEN},#047857)`,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{color:"white",fontWeight:700,fontSize:16}}>{"About"}</span>
            <button onClick={()=>setShowAbout(false)} style={{background:"rgba(255,255,255,0.2)",border:"none",color:"white",borderRadius:8,padding:"6px 12px",cursor:"pointer",fontWeight:700,fontSize:13}}>✕ {"Close"}</button>
          </div>
          <div style={{padding:"24px 20px",overflowY:"auto",maxHeight:scrollH}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:52,marginBottom:8}}>🕌</div>
              <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>Madinah Arabic</h2>
              <p style={{fontSize:13,color:"#64748b",margin:0}}>
                {"Learn Arabic to understand the Quran"}
              </p>
            </div>
            <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,padding:16,marginBottom:16}}>
              <p style={{fontSize:13,color:"#166534",lineHeight:1.7,margin:0,fontFamily:"inherit",direction:"ltr",textAlign:"left"}}>
                {"This app is completely free — no ads, no payments. The goal is simply to help you understand the words and sentences of the Quran directly."}
              </p>
            </div>
            <div style={{background:"#fefce8",border:"1px solid #fde68a",borderRadius:12,padding:16,marginBottom:16}}>
              <p style={{fontSize:12,fontWeight:700,color:"#78350f",marginBottom:6,fontFamily:"inherit",direction:"ltr",textAlign:"left"}}>
                {"📚 Inspiration & Attribution"}
              </p>
              <p style={{fontSize:12,color:"#92400e",lineHeight:1.7,margin:0,fontFamily:"inherit",direction:"ltr",textAlign:"left"}}>
                {"The grammar sequence is inspired by the Madinah Arabic curriculum, developed at the Islamic University of Madinah. Quranic phrases and vocabulary are drawn directly from the Quran."}
              </p>
            </div>
            <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:12,padding:16,marginBottom:24}}>
              <p style={{fontSize:12,color:"#475569",lineHeight:1.7,margin:0,fontFamily:"inherit",direction:"ltr",textAlign:"left"}}>
                {"Feel free to share with friends and family."}
              </p>
            </div>
            <button onClick={()=>setShowAbout(false)} style={{width:"100%",padding:"13px",background:`linear-gradient(135deg,${GREEN},#047857)`,color:"white",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
              {"← Back"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export { QURAN_CONNECTIONS, QuranOverlay, SESSIONS, REVIEWS, ALL_SESSIONS, buildExercises, buildReviewExercises, getQuranCoverage, stripQ, getEmoji };
