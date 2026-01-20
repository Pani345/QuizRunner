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
   
   food1: [
     {
       text: "Question : In the article “Microbiological safety and quality of ceviche, poke, and sushi dishes sold at retail outlets in Orange County, CA”, at what annual rate has global seafood consumption increased (from 1961 to 2017)?\n\nคำถาม : บทความนี้ ระบุอัตราการบริโภคอาหารทะเลทั่วโลกเพิ่มขึ้นกี่เปอร์เซ็นต์ต่อปี\n\nHint : In the first paragraph of the introduction.\n\nDatabase : ScienceDirect",
       choices: { A: "3.0%", B: "3.1%", C: "3.2%" },
       correctOption: "B",
       timeLimit: 120,
     },
     {
       text: "Question : In the article “Kimchi and its antiobesity and anticancer functions”, what is the recommended cut size (in centimeters) for Matbaechu kimchi when preparing Baechu cabbage kimchi?\n\nคำถาม : บทความนี้ ระบุควรหั่น Matbaechu kimchi (ผักกาดขาว) ให้มีขนาดกี่เซนติเมตร สำหรับเตรียมทำเมนู Baechu cabbage kimchi (กิมจิผักกาดขาวแบบดั้งเดิมของเกาหลี)\n\nHint : In the Fig. 1.\n\nDatabase : SpringerNature Link",
       choices: { A: "3-5 centimeters", B: "3-4 centimeters", C: "2-3 centimeters" },
       correctOption: "A",
       timeLimit: 120,
     },
     {
       text: "Question : In the article “Nutritional quality of organic, conventional, and seasonally grown broccoli using vitamin C as a marker”, which vegetable contains the highest amount of ascorbic acid?\n\nคำถาม : บทความนี้ ผักชนิดใดมีปริมาณกรดแอสคอร์บิกมากที่สุด\n\nHint : In the Figure 4.\n\nDatabase : Taylor & Francis Online",
       choices: { A: "swamp cabbage", B: "Chinese kale", C: "spinach" },
       correctOption: "C",
       timeLimit: 120,
     },
     {
       text: "Question : Which email address should be used to contact the Research Support Service at the Central Library, Chulalongkorn University?\n\nคำถาม : อีเมลใด เป็นช่องทางสำหรับติดต่อบริการสนับสนุนงานวิจัย ของหอสมุดกลางจุฬาฯ\n\nHint : -\n\nDatabase : -",
       choices: { A: "rsp@car.chula.ac.th", B: "rcs@car.chula.ac.th", C: "rss@car.chula.ac.th" },
       correctOption: "C",
       timeLimit: 120,
     },
     {
       text: "Question : In the article \"Contribution of black olives and other vegetable toppings to acrylamide formation in pizzas\", what range does the acrylamide content in pizza fall (in µg/kg)?\n\nคำถาม : บทความนี้ ระบุว่าพิซซ่ามีปริมาณอะคริลาไมด์ (acrylamide) กี่ไมโครกรัมต่อกิโลกรัม\n\nHint : In the second paragraph of the introduction.\n\nDatabase : ScienceDirect",
       choices: { A: "60 - 250 µg/kg", B: "70 - 260 µg/kg", C: "80 - 270 µg/kg" },
       correctOption: "A",
       timeLimit: 120,
     },
     {
       text: "Question : In the article “Farmer Business School participation and its impact on cocoa productivity and food security in Ghana”, what percentage of Ghana’s export earnings comes from cocoa?\n\nคำถาม : บทความนี้ รายได้จากการส่งออกของกานามาจากโกโก้กี่ %?\n\nHint : In the first paragraph of the introduction.\n\nDatabase : Emerald Management",
       choices: { A: "about 18%", B: "about 28%", C: "about 38%" },
       correctOption: "A",
       timeLimit: 120,
     },
     {
       text: "Question : In the article “Sushi Delights and Parasites: The Risk of Fishborne and Foodborne Parasitic Zoonoses in Asia”, at what temperature and for how long should marine fish for raw consumption be frozen under the European Union–Hazard Analysis and Critical Control Points (HACCP) guidelines?\n\nคำถาม : บทความนี้ ระบุว่า HACCP (กฎหมายสำหรับธุรกิจอาหาร่ในสหภาพยุโรป) กำหนดให้แช่แข็งปลาทะเลเพื่อบริโภคแบบดิบที่อุณหภูมิเท่าไรและเป็นเวลานานเท่าใด\n\nHint : In the first paragraph of the conclusions.\n\nDatabase : Oxford Journals Online",
       choices: {
         A: "less than -10°C for more than 24 h.",
         B: "less than -15°C for more than 24 h.",
         C: "less than -20°C for more than 24 h."
       },
       correctOption: "C",
       timeLimit: 120,
     },
     {
       text: "Question : Which Boolean operator is used to exclude unwanted terms from search results?\n\nคำถาม : Boolean operator ข้อใดที่ใช้ในการตัดคำที่ไม่ต้องการออกจากผลลัพธ์\n\nHint : -\n\nDatabase : -",
       choices: { A: "AND", B: "OR", C: "NOT" },
       correctOption: "C",
       timeLimit: 120,
     },
     {
       text: "Question : In the article “Improving stability of frying oils and food quality with addition of dried olive mill wastewater”, which analytical technique was used to determine the polyphenolic composition of the dried olive mill wastewater?\n\nคำถาม : บทความนี้ ผู้วิจัยใช้เทคนิคใดวิเคราะห์องค์ประกอบของสารโพลีฟีนอลในน้ำเสียจากโรงงานผลิตน้ำมันมะกอกแห้ง\n\nHint : In the first paragraph of the results and discussion.\n\nDatabase : Nature",
       choices: { A: "GC-FID", B: "LC-MS", C: "HPLC" },
       correctOption: "C",
       timeLimit: 120,
     },
     {
       text: "Question : Which symbol is used to search for an exact phrase without splitting the words?\n\nคำถาม : เครื่องหมายใดใช้ช่วยค้นหาวลีหรือประโยคแบบตรงตัวโดยไม่แยกคำออกจากกัน\n\nHint : -\n\nDatabase : -",
       choices: {
         A: "Quotation marks หรือเครื่องหมายอัญประกาศ (\"...\")",
         B: "Question mark หรือเครื่องหมายคำถาม (?)",
         C: "Nesting หรือเครื่องหมายวงเล็บ ((...))"
       },
       correctOption: "A",
       timeLimit: 120,
     },
   ],
food2: [
  {
    text: "Question : Which email address should be used to contact the Research Support Service at the Central Library, Chulalongkorn University?\n\nคำถาม : อีเมลใด เป็นช่องทางสำหรับติดต่อบริการสนับสนุนงานวิจัย ของหอสมุดกลางจุฬาฯ\n\nHint : -\n\nDatabase : -",
    choices: { A: "rsp@car.chula.ac.th", B: "rcs@car.chula.ac.th", C: "rss@car.chula.ac.th" },
    correctOption: "C",
    timeLimit: 120,
  },
  {
    text: "Question : Which Boolean operator is used to exclude unwanted terms from search results?\n\nคำถาม : Boolean operator ข้อใดที่ใช้ในการตัดคำที่ไม่ต้องการออกจากผลลัพธ์\n\nHint : -\n\nDatabase : -",
    choices: { A: "AND", B: "OR", C: "NOT" },
    correctOption: "C",
    timeLimit: 120,
  },
  {
    text: "Question : Which symbol is used to search for an exact phrase without splitting the words?\n\nคำถาม : เครื่องหมายใดใช้ช่วยค้นหาวลีหรือประโยคแบบตรงตัวโดยไม่แยกคำออกจากกัน\n\nHint : -\n\nDatabase : -",
    choices: {
      A: "Quotation marks หรือเครื่องหมายอัญประกาศ (\"...\")",
      B: "Question mark หรือเครื่องหมายคำถาม (?)",
      C: "Nesting หรือเครื่องหมายวงเล็บ ((...))",
    },
    correctOption: "A",
    timeLimit: 120,
  },
  {
    text: "Question : Which Boolean operator should be used to broaden the search results?\n\nคำถาม : ควรใช้ Boolean operator ใด หากต้องการให้ผลการสืบค้นกว้างขึ้น\n\nHint : -\n\nDatabase : -",
    choices: { A: "AND", B: "OR", C: "NOT" },
    correctOption: "B",
    timeLimit: 120,
  },
  {
    text: "Question : Which symbol should be used if you want to search for words with the same root, such as educate, education, educational?\n\nคำถาม : ควรใช้เครื่องหมายใด หากต้องการค้นหาคำที่มีรากศัพท์เดียวกัน เช่น educate, education, educational\n\nHint : -\n\nDatabase : -",
    choices: { A: "*", B: "+", C: "&" },
    correctOption: "A",
    timeLimit: 120,
  },
  {
    text: "Question : What is the purpose of using a Year filter in database searching?\n\nคำถาม : การใช้ตัวกรองปี มีประโยชน์อย่างไร\n\nHint : -\n\nDatabase : -",
    choices: {
      A: "To increase the number of results (เพิ่มจำนวนผลลัพธ์ให้มากขึ้น)",
      B: "To limit results to a specific time period (จำกัดผลลัพธ์ให้เฉพาะช่วงเวลาที่ต้องการ)",
      C: "To find similar words (ค้นหาคำที่คล้ายกัน)",
    },
    correctOption: "B",
    timeLimit: 120,
  },
  {
    text: "Question : If you want the results to show food safety as an exact phrase, how should you type the query?\n\nคำถาม : หากต้องการให้ผลลัพธ์ปรากฏคำว่า food safety แบบติดกัน ควรพิมพ์คำค้นอย่างไร\n\nHint : -\n\nDatabase : -",
    choices: { A: "food AND safety", B: "\"food safety\"", C: "food-safety" },
    correctOption: "B",
    timeLimit: 120,
  },
  {
    text: "Question : If you want the results to appear for the years 2019–2024, which filter should you use in the database?\n\nคำถาม : หากต้องการให้ผลลัพธ์ปรากฏในช่วงปี 2019–2024 ควรใช้ตัวใดในฐานข้อมูล\n\nHint : -\n\nDatabase : -",
    choices: { A: "Language filter", B: "Document type filter", C: "Publication date filter" },
    correctOption: "C",
    timeLimit: 120,
  },
  {
    text: "Question : If you want the results to show pizza or pasta (either one), how should you type the query?\n\nคำถาม : หากต้องการให้ผลลัพธ์ปรากฏคำว่า pizza หรือ pasta (อย่างใดอย่างหนึ่ง) ควรพิมพ์คำค้นอย่างไร\n\nHint : -\n\nDatabase : -",
    choices: { A: "pizza OR pasta", B: "pizza or pasta", C: "pizza Or pasta" },
    correctOption: "A",
    timeLimit: 120,
  },
  {
    text: "Question : If you can’t find the full text of a research article, which Facebook page should Chulalongkorn University members message for help?\n\nคำถาม : หากชาวจุฬาฯ ค้นหา full text ของบทความวิจัยไม่พบ สามารถติดต่อสอบถามผ่าน Facebook เพจใด\n\nHint : -\n\nDatabase : -",
    choices: { A: "RefCU", B: "CURef", C: "ChulaRef" },
    correctOption: "B",
    timeLimit: 120,
  },
],
food3: [
  {
    text: "Question : Why do onions make you cry when cutting them?\n\nคำถาม : ทำไมหั่นหัวหอมแล้วน้ำตาไหลเหมือนโดนเท\n\nHint : -\n\nDatabase : -",
    choices: {
      A: "เพราะหัวหอมสะเทือนใจ",
      B: "เพราะปล่อยสารระเหยไปทำปฏิกิริยากับน้ำตา",
      C: "เพราะมีพริกซ่อนอยู่",
    },
    correctOption: "B",
    timeLimit: 120,
  },
  {
    text: "Question : Which type of cheese is generally smellier?\n\nคำถาม : “ชีส” แบบไหนมักมีกลิ่นแรงจนเพื่อนร้องขอชีวิต\n\nHint : -\n\nDatabase : -",
    choices: {
      A: "ชีสสด",
      B: "ชีสแข็งอายุสั้น",
      C: "ชีสบ่ม/ชีสอายุเยอะ",
    },
    correctOption: "C",
    timeLimit: 120,
  },
  {
    text: "Question : Which Boolean operator is used to exclude unwanted terms from search results?\n\nคำถาม : Boolean operator ข้อใดที่ใช้ในการตัดคำที่ไม่ต้องการออกจากผลลัพธ์\n\nHint : -\n\nDatabase : -",
    choices: { A: "AND", B: "OR", C: "NOT" },
    correctOption: "C",
    timeLimit: 120,
  },
  {
    text: "Question : If you want the results to show pizza or pasta (either one), how should you type the query?\n\nคำถาม : หากต้องการให้ผลลัพธ์ปรากฏคำว่า pizza หรือ pasta (อย่างใดอย่างหนึ่ง) ควรพิมพ์คำค้นอย่างไร\n\nHint : -\n\nDatabase : -",
    choices: { A: "pizza OR pasta", B: "pizza or pasta", C: "pizza Or pasta" },
    correctOption: "A",
    timeLimit: 120,
  },
  {
    text: "Question : How many authors are there in the article “Would offering vegetables to children for breakfast increase their total daily vegetable intake?”?\n\nคำถาม : บทความเรื่องนี้ มีผู้แต่งกี่คน\n\nHint : -\n\nDatabase : Cambridge Journals Online",
    choices: { A: "2 people", B: "3 people", C: "4 people" },
    correctOption: "B",
    timeLimit: 120,
  },
  {
    text: "Question : In Figure 1 of the article “What We Talk about when We Talk about Food Experiences”, which stimulus was used for the umami taste?\n\nคำถาม : ในภาพที่ 1 ของบทความนี้ อาหารชนิดใดถูกใช้เพื่อกระตุ้นรสอูมามิ\n\nHint : In the Figure 1.\n\nDatabase : ACM",
    choices: { A: "Plain cookie", B: "Cheese ball", C: "Mango juice" },
    correctOption: "B",
    timeLimit: 120,
  },
  {
    text: "Question : If you want the results to appear for the years 2019–2024, which filter should you use in the database?\n\nคำถาม : หากต้องการให้ผลลัพธ์ปรากฏในช่วงปี 2019–2024 ควรใช้ตัวใดในฐานข้อมูล\n\nHint : -\n\nDatabase : -",
    choices: { A: "Language filter", B: "Document type filter", C: "Publication date filter" },
    correctOption: "C",
    timeLimit: 120,
  },
  {
    text: "Question : In the article “Investigation of key chemical species from durian peduncles and their correlations with durian maturity”, which part shown in Figure 1 is the edible portion?\n\nคำถาม : ส่วนของเนื้อทุเรียนที่สามารถรับประทานได้ในภาพที่ 1 ของบทความนี้ เรียกว่าอะไร\n\nHint : -\n\nDatabase : Nature",
    choices: { A: "Aril", B: "Husk", C: "Peduncle" },
    correctOption: "A",
    timeLimit: 120,
  },
  {
    text: "Question : In the article “Contents and Risk Assessment of Heavy Metals in Marine Invertebrates from Korean Coastal Fish Markets”, which heavy metal has the highest recovery (%) in Table 2?\n\nคำถาม : โลหะหนักชนิดใดมีค่า Recovery (%) สูงที่สุดในตารางที่ 2 ของบทความนี้\n\nHint : -\n\nDatabase : ScienceDirect",
    choices: { A: "Ni", B: "Cd", C: "Cu" },
    correctOption: "A",
    timeLimit: 120,
  },
  {
    text: "Question : If you want the results to show food safety as an exact phrase, how should you type the query?\n\nคำถาม : หากต้องการให้ผลลัพธ์ปรากฏคำว่า food safety แบบติดกัน ควรพิมพ์คำค้นอย่างไร\n\nHint : -\n\nDatabase : -",
    choices: { A: "food AND safety", B: "\"food safety\"", C: "food-safety" },
    correctOption: "B",
    timeLimit: 120,
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
  food1: "Food Quest set 1",
  food2: "Food Quest set 2",
  food3: "Food Quest set 3",
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
