/* =========================
   Question Sets
   ========================= */

/**
 * Collection of question sets for the quiz game.
 * Each set contains an array of questions with text, choices, correct answer, and time limit.
 */
export const QUESTION_SETS = {
  general: [
    {
      text: "ทำไมกาแฟถึงขม? (ตอบผิดไม่ดุ แต่อาจงอนนิดนึง)",
      choices: { A: "เพราะชีวิต", B: "เพราะน้ำตาลหมด", C: "เพราะเมล็ดกาแฟ", D: "เพราะแก้วมันเศร้า" },
      correctOption: "C",
      timeLimit: 30,
    },
    {
      text: "ถ้า Wi-Fi หลุดบ่อย เราควรทำอะไรก่อน?",
      choices: { A: "รีสตาร์ทเราเตอร์", B: "โทษชะตา", C: "เดินไปใกล้ ๆ แล้วทำเนียน", D: "อธิษฐานกับเสาสัญญาณ" },
      correctOption: "A",
      timeLimit: 30,
    },
    {
      text: "ข้อใดคือ 'งานด่วน' ที่แท้จริง?",
      choices: { A: "งานที่ต้องเสร็จเมื่อวาน", B: "งานที่หัวหน้าบอกว่าไม่รีบ", C: "งานที่ส่งแล้วแต่ยังต้องแก้", D: "งานที่ยังไม่เริ่มแต่ใกล้เดดไลน์" },
      correctOption: "A",
      timeLimit: 30,
    },
    {
      text: "ถ้าลืมรหัสผ่านบ่อย ควรตั้งรหัสใหม่ว่าอะไร?",
      choices: { A: "123456", B: "password", C: "ForgetMeNot2025!", D: "ชื่อแมว+วันเกิด+OTP" },
      correctOption: "C",
      timeLimit: 30,
    },
    {
      text: "เวลาพูดว่า 'เดี๋ยวทำ' โดยเฉลี่ยหมายถึง…",
      choices: { A: "ภายใน 5 นาที", B: "หลังอาหาร", C: "พรุ่งนี้แหละ", D: "เมื่อโลกสงบ" },
      correctOption: "C",
      timeLimit: 30,
    },
    {
      text: "ถ้าพบไฟล์ชื่อ final_v7_REALfinal จริง ๆ แล้วไฟล์ไหนคือไฟล์สุดท้าย?",
      choices: { A: "final", B: "final_v7_REALfinal", C: "final_v7_REALfinal_2", D: "ไฟล์ที่เปิดล่าสุด" },
      correctOption: "D",
      timeLimit: 30,
    },
    {
      text: "ข้อใดคือ 'การออกกำลังกาย' ของสายออฟฟิศ?",
      choices: { A: "เดินไปเข้าห้องน้ำ", B: "ยืดเส้นยืดสาย", C: "เดินไปหาเครื่องปริ้นท์แล้วเครื่องพัง", D: "ทั้งหมดที่กล่าวมา" },
      correctOption: "D",
      timeLimit: 30,
    },
    {
      text: "ถ้ากำลังจะชงมาม่า แต่หา 'ซองพริก' ไม่เจอ ควรทำยังไง?",
      choices: { A: "โทรแจ้งตำรวจ", B: "ทำใจแล้วกินแบบคลีน", C: "เขียนรายงานสาเหตุราก (RCA)", D: "เปิดซองอีกอันอย่างสง่างาม" },
      correctOption: "D",
      timeLimit: 30,
    },
    {
      text: "คำว่า 'เดี๋ยวส่งให้ครับ/ค่ะ' ในแชทงาน หมายถึงข้อใดมากที่สุด?",
      choices: { A: "ส่งทันที", B: "ส่งหลังประชุม", C: "ส่งก่อนเลิกงานถ้านึกได้", D: "ส่งเมื่อคุณทักมาครั้งที่ 3" },
      correctOption: "D",
      timeLimit: 30,
    },
    {
      text: "ถ้าตั้งนาฬิกาปลุก 10 อัน แต่ยังตื่นสาย สาเหตุคืออะไร?",
      choices: { A: "นาฬิกาปลุกผิด", B: "หมอนดูดวิญญาณ", C: "มือปิดเองแบบอัตโนมัติ (สกิลลับ)", D: "ทั้ง B และ C" },
      correctOption: "D",
      timeLimit: 30,
    },
  ],
  love: [
    {
      text: "คำว่า ‘ไม่เป็นไร’ ในเรื่องความรัก มักแปลว่าอะไร?",
      choices: {
        A: "ไม่เป็นไร…ตอนนี้นะ",
        B: "เป็นไร แต่ยังไม่อยากพูด",
        C: "เป็นไร แล้วเดี๋ยวค่อยว่ากัน",
        D: "เป็นไรนิดหน่อย (แต่จำได้หมด)"
      },
      correctOption: "B",
      timeLimit: 30,
    },
    {
      text: "ถ้าแฟนบอกว่า ‘ทำอะไรก็ได้’ ควรทำอย่างไรดีที่สุด?",
      choices: {
        A: "ยื่นตัวเลือก 3 อย่าง แล้วให้เลือกเอง",
        B: "ทำตามใจเรา แล้วภาวนา",
        C: "ทำตามที่เคยทำแล้วไม่โดนงอน",
        D: "ตอบว่า ‘งั้นกินข้าวก่อน’ เพื่อซื้อเวลา"
      },
      correctOption: "A",
      timeLimit: 30,
    },
    {
      text: "อ่านข้อความแล้วไม่ตอบ เป็นสัญญาณของอะไร?",
      choices: {
        A: "ไม่ว่างจริง ๆ (แต่ก็แอบอ่านอยู่)",
        B: "กำลังคิดคำตอบที่ไม่ทำให้มีภาคต่อ",
        C: "เผลอหลับ / มือถือคว่ำหน้า",
        D: "อยากให้เราเดาอารมณ์จากอักษรวิญญาณ"
      },
      correctOption: "B",
      timeLimit: 30,
    },
    {
      text: "เดตแรกที่ดี ควรจบลงด้วยอะไร?",
      choices: {
        A: "มีประโยค ‘กลับถึงแล้วบอกนะ’",
        B: "มีรูปคู่ 1 รูป (ถ่ายไม่ติดหน้าได้)",
        C: "มีนัดครั้งต่อไปแบบไม่ต้องฝืน",
        D: "มีความรู้สึกว่า ‘วันนี้เวลาหมดไว’"
      },
      correctOption: "C",
      timeLimit: 30,
    },
    {
      text: "ถ้าแฟนถามว่า ‘เราดูอ้วนขึ้นไหม’ คำตอบที่ปลอดภัยที่สุดคือ?",
      choices: {
        A: "ไม่นะ เหมือนเดิมเลย",
        B: "เราว่าดูสุขภาพดีขึ้นนะ",
        C: "เรามองว่าเธอน่ารักขึ้นทุกวัน",
        D: "คำถามนี้…ให้เราตอบตอนกินข้าวเสร็จได้ไหม"
      },
      correctOption: "C",
      timeLimit: 30,
    },
    {
      text: "การทะเลาะที่อันตรายที่สุดในความรักคือแบบไหน?",
      choices: {
        A: "เงียบใส่กัน แล้วบอกว่าไม่ได้เงียบ",
        B: "ทะเลาะเรื่องเดิม แต่ใช้คำใหม่",
        C: "ทะเลาะแล้วมีประโยค ‘ช่างมันเถอะ’",
        D: "ทะเลาะแล้วดึงเรื่องปี 2017 มาด้วย"
      },
      correctOption: "A",
      timeLimit: 30,
    },
    {
      text: "ถ้าแฟนบอกว่า ‘จำไม่ได้’ ส่วนใหญ่จำไม่ได้เรื่องอะไร?",
      choices: {
        A: "สิ่งที่เคยพูดไว้ตอนอารมณ์ดี",
        B: "สิ่งที่เราย้ำไป 3 รอบ",
        C: "วันสำคัญที่ไม่มีในปฏิทิน",
        D: "สิ่งที่ ‘ควรจำ’ พอดี"
      },
      correctOption: "D",
      timeLimit: 30,
    },
    {
      text: "ความสัมพันธ์จะเริ่มมีปัญหาเมื่อใด?",
      choices: {
        A: "เมื่อเริ่มคุยกันด้วยคำว่า ‘อืม’ บ่อยขึ้น",
        B: "เมื่อเริ่มต้องเดาว่าอีกฝ่ายคิดอะไร",
        C: "เมื่อเริ่มขอโทษทั้งที่ยังไม่รู้ว่าผิดอะไร",
        D: "เมื่อประโยค ‘ตามใจ’ เริ่มออกเสียงชัดเกินไป"
      },
      correctOption: "B",
      timeLimit: 30,
    },
    {
      text: "การงอนที่อันตรายที่สุดคือแบบไหน?",
      choices: {
        A: "งอนแล้วตอบ ‘ค่ะ/ครับ’ สุภาพจัด",
        B: "งอนแล้วโพสต์เพลงเศร้าแบบไม่เกี่ยว",
        C: "งอนแล้วบอกว่าไม่งอน พร้อมถอนหายใจ",
        D: "งอนแล้วทำเหมือนปกติ…แต่ปกติไม่เหมือนเดิม"
      },
      correctOption: "D",
      timeLimit: 30,
    },
    {
      text: "ความรักที่ดีควรมีอะไรเป็นพื้นฐาน?",
      choices: {
        A: "ความเข้าใจ (แบบไม่ต้องแปลภาษา)",
        B: "ความไว้ใจ (แบบไม่ต้องสืบสวน)",
        C: "การสื่อสาร (แบบไม่ต้องให้ AI แปลความหมาย)",
        D: "แบตมือถือที่ไม่หมดตอนกำลังเคลียร์กัน"
      },
      correctOption: "C",
      timeLimit: 30,
    },
  ],  
  friends: [
    {
      text: "นัดเพื่อนแบบไหนที่เลื่อนง่ายที่สุด?",
      choices: {
        A: "นัดหลายคน",
        B: "นัดด่วน",
        C: "นัดวันธรรมดา",
        D: "นัดที่ทุกคนบอกว่าว่าง"
      },
      correctOption: "D",
      timeLimit: 30,
    },
    {
      text: "แชทกลุ่มมักเงียบที่สุดตอนไหน?",
      choices: {
        A: "ถามสารทุกข์",
        B: "ถามความเห็น",
        C: "ถามใครว่าง",
        D: "ถามเรื่องเงิน"
      },
      correctOption: "D",
      timeLimit: 30,
    },
    {
      text: "เพื่อนประเภทไหนที่มักโผล่มาเฉพาะบางเวลา?",
      choices: {
        A: "เพื่อนยุ่ง",
        B: "เพื่อนเงียบ",
        C: "เพื่อนหาย",
        D: "เพื่อนชวนกิน"
      },
      correctOption: "C",
      timeLimit: 30,
    },
    {
      text: "คำว่า ‘เดี๋ยวไป’ จากเพื่อน มักหมายถึงอะไร?",
      choices: {
        A: "กำลังออกจากบ้าน",
        B: "อีกสักพัก",
        C: "ยังไม่พร้อม",
        D: "ขอดูก่อน"
      },
      correctOption: "B",
      timeLimit: 30,
    },
    {
      text: "เพื่อนแบบไหนที่วงขาดไม่ได้?",
      choices: {
        A: "เพื่อนตลก",
        B: "เพื่อนจำเก่ง",
        C: "เพื่อนชวนคุย",
        D: "เพื่อนประสานงาน"
      },
      correctOption: "D",
      timeLimit: 30,
    },
    {
      text: "เวลาที่เพื่อนมักตอบแชทเร็วที่สุดคือเมื่อใด?",
      choices: {
        A: "ชวนกิน",
        B: "ชวนเที่ยว",
        C: "ชวนทำงาน",
        D: "ชวนโอน"
      },
      correctOption: "A",
      timeLimit: 30,
    },
    {
      text: "ประโยคใดทำให้รู้ว่าเพื่อนเริ่มไม่แน่ใจ?",
      choices: {
        A: "ได้หมด",
        B: "แล้วแต่",
        C: "ขอดูก่อน",
        D: "ยังไงก็ได้"
      },
      correctOption: "B",
      timeLimit: 30,
    },
    {
      text: "เพื่อนมักนัดกันจริงจังในโอกาสใด?",
      choices: {
        A: "วันหยุดยาว",
        B: "วันเกิด",
        C: "วันเงินเดือนออก",
        D: "วันว่างตรงกัน"
      },
      correctOption: "C",
      timeLimit: 30,
    },
    {
      text: "วงเพื่อนเงียบลงมักเกิดจากอะไร?",
      choices: {
        A: "ต่างคนยุ่ง",
        B: "คุยกันบ่อยแล้ว",
        C: "ไม่มีเรื่องใหม่",
        D: "รอคนเริ่ม"
      },
      correctOption: "D",
      timeLimit: 30,
    },
    {
      text: "สิ่งใดทำให้รู้ว่าเพื่อนยังคิดถึงกัน?",
      choices: {
        A: "ทักมา",
        B: "ส่งมีม",
        C: "ชวนเจอ",
        D: "ยังอยู่ในกลุ่ม"
      },
      correctOption: "B",
      timeLimit: 30,
    },
  ],
  money: [
    {
      text: "ช่วงเวลาไหนที่รู้สึกว่าเงินในบัญชีดูใจดีที่สุด?",
      choices: {
        A: "ตอนเงินเดือนเข้า",
        B: "ตอนเปิดแอปดูครั้งแรก",
        C: "ตอนยังไม่เช็กยอด",
        D: "ตอนคิดว่าเดี๋ยวก็หาใหม่ได้"
      },
      correctOption: "A",
      timeLimit: 30,
    },
    {
      text: "ประโยคใดมักทำให้รูดบัตรเร็วขึ้น?",
      choices: {
        A: "ของมันต้องมี",
        B: "ซื้อเถอะ คุ้ม",
        C: "ลดวันนี้วันเดียว",
        D: "ไม่ซื้อก็ได้ (แต่ซื้อดีกว่า)"
      },
      correctOption: "C",
      timeLimit: 30,
    },
    {
      text: "สิ่งใดทำให้เงินหายแบบไม่รู้ตัวมากที่สุด?",
      choices: {
        A: "ของชิ้นใหญ่",
        B: "ของชิ้นเล็กหลายครั้ง",
        C: "ค่าเดินทาง",
        D: "ของที่เพื่อนชวนซื้อ"
      },
      correctOption: "B",
      timeLimit: 30,
    },
    {
      text: "ปลายเดือน อาหารแบบไหนดูอร่อยเป็นพิเศษ?",
      choices: {
        A: "มาม่า",
        B: "ชาบู",
        C: "ข้าวไข่เจียว",
        D: "อะไรก็ได้ที่ยังจ่ายไหว"
      },
      correctOption: "D",
      timeLimit: 30,
    },
    {
      text: "คำว่า ‘ไม่แพง’ ในใจเรา มักหมายถึงอะไร?",
      choices: {
        A: "ถูกจริง",
        B: "แพงแต่ยังรับได้",
        C: "ลดจากราคาเดิม",
        D: "แพง แต่ทำเป็นไม่คิด"
      },
      correctOption: "B",
      timeLimit: 30,
    },
    {
      text: "สิ่งใดมักเกิดขึ้นทันทีหลังเงินเดือนออก?",
      choices: {
        A: "เปิดแอปเช็กยอด",
        B: "วางแผนเก็บเงิน",
        C: "โอนเงินให้ตัวเองในอนาคต",
        D: "บอกตัวเองว่าเดือนนี้จะประหยัด"
      },
      correctOption: "A",
      timeLimit: 30,
    },
    {
      text: "ค่าใช้จ่ายใดที่มักโผล่มาแบบไม่ทันตั้งตัว?",
      choices: {
        A: "ค่าอาหาร",
        B: "ค่าเดินทาง",
        C: "ค่าอินเทอร์เน็ต",
        D: "ค่าสมาชิกที่ลืมไปแล้ว"
      },
      correctOption: "D",
      timeLimit: 30,
    },
    {
      text: "ช่วงไหนที่คำว่า ‘ประหยัด’ ดังที่สุดในใจ?",
      choices: {
        A: "ต้นเดือน",
        B: "กลางเดือน",
        C: "ปลายเดือน",
        D: "ก่อนเงินเข้า"
      },
      correctOption: "C",
      timeLimit: 30,
    },
    {
      text: "พฤติกรรมใดทำให้เงินอยู่ไม่นาน?",
      choices: {
        A: "ซื้อของตามอารมณ์",
        B: "จดรายจ่าย",
        C: "รอของลด",
        D: "คิดก่อนซื้อ"
      },
      correctOption: "A",
      timeLimit: 30,
    },
    {
      text: "สิ่งใดช่วยให้รู้สึกว่าตัวเองยังไม่จนเกินไป?",
      choices: {
        A: "ยังมีเงินสดติดกระเป๋า",
        B: "ยังรูดบัตรผ่าน",
        C: "ยังมีเพื่อนเลี้ยง",
        D: "ยังไม่ต้องยืมใคร"
      },
      correctOption: "B",
      timeLimit: 30,
    },
  ],  
};

/**
 * Get a question set by its ID.
 * @param {string} id - The ID of the question set
 * @returns {Array} The question set array, or the general set if not found, or empty array as fallback
 */
export function getQuestionSetById(id) {
  return QUESTION_SETS[id] || QUESTION_SETS.general || [];
}

/**
 * Get the length of the question set for a room.
 * @param {Object} roomData - The room data object
 * @returns {number} The length of the question set, or 1 as fallback
 */
export function getQuestionSetLengthForRoom(roomData) {
  const setId = roomData.gameSettings?.questionSetId || "general";
  const set = getQuestionSetById(setId);
  return set.length || 1;
}

/**
 * Get a question from a room's question set by index.
 * @param {Object} roomData - The room data object
 * @param {number} index - The index of the question
 * @returns {Object|null} The question object, or null if not found
 */
export function getQuestionFromRoom(roomData, index) {
  const setId = roomData.gameSettings?.questionSetId || "general";
  const set = getQuestionSetById(setId);
  if (!set.length) return null;
  const i = (index ?? 0) % set.length;
  return set[i];
}

/**
 * Mapping of question set IDs to their display names.
 * If a set ID is not in this mapping, it will use a formatted version of the ID.
 */
export const QUESTION_SET_NAMES = {
  general: "Work ไร้ Balance",
  love: "ไม่เป็นไร (แต่จำได้หมด)",
  friends: "Friends, Fun & Facts",
  money: "Money Coach ที่ยังต้องรอเงินเดือน",
};

/**
 * Get display name for a question set ID.
 * @param {string} setId - The question set ID
 * @returns {string} The display name
 */
export function getQuestionSetName(setId) {
  return QUESTION_SET_NAMES[setId] || setId;
}

/**
 * Get array of question set IDs available in QUESTION_SETS.
 * @returns {Array<string>} Array of question set IDs
 */
export function getQuestionSetIds() {
  return Object.keys(QUESTION_SETS);
}
