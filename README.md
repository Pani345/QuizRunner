# QuizRunner
Searching online database

**QuizRunner SPA (Firebase RTDB Multiplayer)**
  เกมกระดาน + คำถามแบบ Multiplayer (Host 1 คน + ผู้เล่นหลายคน)
  ทำงานแบบ SPA โดยใช้ Firebase Realtime Database เป็น state กลางของห้อง

**แนวคิดหลัก**
  •	ห้องเกม 1 ห้อง = 1 node ใน RTDB: rooms/{ROOM_CODE}
  •	ทุก client (host/player) subscribe ห้องเดียวกันด้วย onValue() แล้ว render UI จาก roomData
  •	การกระทำสำคัญที่ต้องกันชนกัน (start round / roll / submit / reveal) ใช้ runTransaction() เพื่อความ atomic

**ลำดับ Code**
  1) Imports
  2) Firebase init + global error logs
  3) Constants/Enums + Storage
  4) Runtime state
  5) DOM cache (และคอมเมนต์ “unused?” ไว้ชัด)
  6) Utils (รวม normalize/clamp/session/header)
  7) QuestionSet UI init (populateQuestionSetSelect)
  8) Entry Navigation (SPA) (showEntryLanding/showAdminEntryPage/showPlayerEntryPage)
  9) Admin PIN overlay functions
  10) Room subscribe + Lobby view (enterLobbyView/subscribeRoom/updateStartGameButton/...)
  11) Host flows (create room/start game/start round/start question/reveal)
  12) Player flows (join/roll/submit)
  13) Transactions helpers (finalizeRollTransaction/submitAnswerTx/moveCountdownToAnsweringTx)
  14) UI render (updateGameView/updateRoleControls/updateQuestionUI/renderChoices/renderPlayerList/renderBoard/renderEndGameSummary)
  15) Timer (ensureTimer/clearTimer)
  16) Dice overlay state + Dice engine subsystem
  17) Leave/cancel/reset
  18) bindUIEvents()
  19) Restore Session + Boot (single entry point)
 
**Data Model (ย่อ)**
  rooms/{code} มีคีย์หลัก ๆ:
    •	status: lobby | inGame | finished
    •	phase:
      o	idle รอ host เริ่มรอบ
      o	rolling ให้ผู้เล่นทอย
      o	questionCountdown นับถอยหลัง 3 วิ
      o	answering ช่วงตอบคำถาม (จับเวลา)
      o	result เฉลย/สรุปรอบ
      o	ended เกมจบ
    •	currentRound (เริ่มที่ 0)
    •	questionIndex (ผูกกับรอบ)
    •	players/{pid}: name, color, position, hasRolled, answered, answer, finished ฯลฯ
    •	history/round_{n}:
      o	diceMoves/{pid}: from/to/roll/pathCells
      o	answers/{pid}: selectedOption/correct/basePosition/finalPosition/configuredMove ฯลฯ
    •	winners[]: ลำดับเข้าเส้นชัย
    •	gameSettings: questionSetId, maxRounds, maxWinners, rewardCorrect, penaltyWrong
    •	ตอนเกมจบ: finalPlayers, finalWinners (snapshot เพื่อให้สรุปคงอยู่แม้ player ออก)
 
**User Roles**
  Host
    •	สร้างห้อง + ตั้งค่าเกม
    •	เริ่มเกม (เปลี่ยนจาก lobby -> inGame)
    •	เริ่มรอบใหม่
    •	เริ่มคำถาม (หลังทุกคนทอยแล้ว)
    •	เฉลยคำถาม (คำนวณผลขยับตำแหน่ง/ผู้ชนะ/จบเกม)
  Player
    •	Join ห้อง (เฉพาะตอน lobby และยังไม่เริ่มรอบ)
    •	ทอยเต๋า (เฉพาะตอน phase=rolling และยังไม่ finish)
    •	ตอบคำถาม (เฉพาะตอน phase=answering และยังไม่หมดเวลา)
 
**App Lifecycle / Entry Flow**
  Boot
    1.	boot()
    2.	populateQuestionSetSelect()
    3.	attemptRestoreSession()
      o	ถ้าพบ session ใน sessionStorage และห้องยังอยู่ → ตั้ง currentRoomCode/currentRole/currentPlayerId แล้ว
        	enterLobbyView()
        	subscribeRoom(roomCode)
        	lockEntryUIForRole(role)
      o	ถ้า restore ไม่ได้ → showEntryLanding()
      
  Entry Navigation
    •	หน้าแรก:
      o	Player กด Join Game → showPlayerEntryPage()
      o	Admin กดปุ่ม Admin → openAdminPwOverlay() → ใส่ PIN ถูก → showAdminEntryPage()
 
**Room Subscription (หัวใจของการ render)**
  เมื่อเข้าห้องแล้วจะเรียก:
  subscribeRoom(roomCode)
    •	onValue(ref(db, rooms/{roomCode})) ทุกครั้งที่ state ห้องเปลี่ยน:
      1.	ถ้าห้องหาย → resetToHome()
      2.	เก็บ lastRoomData = roomData (ใช้กับ UI ปิดเฉลยตอนจบเกม)
      3.	updateHeaderActionsUI(roomData)
      4.	จัด layout lobby/in-game:
        	ถ้า status เป็น inGame/finished → enterInGameLayout()
        	ไม่งั้น → exitInGameLayout()
      5.	render และอัปเดต UI หลัก:
        	renderLobbyBadges(roomData)
        	renderPlayerList(roomData, players)
        	updateGameView(roomData, players)
        	updateStartGameButton(roomData, players)
 
**Core Game Loop (Phase Flow)**
  Phase A: Host เริ่มเกม
    •	Host กด Start Game:
      o	update(roomRef, { status: inGame, phase: idle, gameStartedAt })
      o	enterInGameLayout()
  Phase B: Host เริ่มรอบใหม่ → phase=rolling
    •	Host กด Start Round → runTransaction() ใน startRoundBtn handler:
      o	currentRound++
      o	ตั้ง phase = rolling
      o	ตั้ง questionIndex = (round-1) % questionSetLength
      o	reset flags ของผู้เล่น: hasRolled=false, answered=false, answer=null (ยกเว้นคนที่ finish แล้ว)
  Phase C: Player ทอยเต๋า
    •	Player กดทอย:
      1.	rollDiceWithOverlay() (สุ่มด้วย secureRandomInt + แอนิเมชัน 3D)
      2.	finalizeRollTransaction(roll):
        	update position
        	เขียน history/round_n/diceMoves
        	update winners ถ้าถึงเส้นชัย
        	เช็คเงื่อนไขจบเกมจากจำนวน winners/ผู้เล่นทั้งหมด
        	ถ้าจบ: phase=ended, status=finished, สร้าง finalPlayers/finalWinners
  Phase D: Host เริ่มคำถาม → phase=questionCountdown
    •	Host กด Start Question → transaction:
      o	ตรวจว่าผู้เล่นที่ยัง active “ทอยครบ” แล้ว
      o	ตั้ง phase = questionCountdown
      o	ตั้ง questionCountdownStartAt = now, questionCountdownSeconds = 3
      o	เตรียม answering: answerTimeSeconds = q.timeLimit, reset answerDeadlineExpired=false
  Phase E: Countdown → phase=answering (ขยับอัตโนมัติ)
    •	ทุก client เรียก updateQuestionUI() แล้วไป ensureTimer(roomData, questionCountdown)
    •	ensureTimer() นับถอยหลังและเมื่อหมดเวลา:
      o	เรียก moveCountdownToAnsweringTx() เพื่อ set:
        	phase = answering
        	answerStartAt = now
  Phase F: Player ตอบคำถาม
    •	ปุ่มตัวเลือกเรียก submitAnswerTx(optionKey):
      o	transaction ตรวจ phase=answering และยังไม่หมดเวลา
      o	set me.answer, me.answered=true
  Phase G: Host เฉลย → phase=result หรือ ended
    •	Host กด Reveal → transaction:
      o	โหลดคำถามจาก getQuestionFromRoom(room, questionIndex)
      o	สำหรับผู้เล่นแต่ละคน:
        	ถ้าตอบถูก: ขยับ rewardCorrect
        	ถ้าตอบผิด/ไม่ตอบ: ขยับ penaltyWrong
        	เขียน history/round_n/answers/{pid}
        	update winners ถ้าถึงเส้นชัย
      o	เช็คจบเกม:
        	ถ้าจบ: phase=ended, status=finished, ตั้ง ui.keepQuestionOnEnd=true เพื่อค้างหน้าเฉลยข้อสุดท้าย + snapshot finalPlayers/finalWinners
        	ถ้าไม่จบ: phase=result
  Phase H: Host เริ่มรอบใหม่ (วนซ้ำ)
    •	จาก result → host กด Start Round → กลับ Phase B
________________________________________
**End Game UX**
  •	เมื่อ phase=ended:
    o	updateGameView() จะใช้ finalPlayers (ถ้ามี) เพื่อให้ตาราง/กระดานยังคงแม้ผู้เล่นออก
    o	renderEndGameSummary() สร้างตารางอันดับ + สรุปผลรายรอบ
    o	updateQuestionUI() รองรับ “ค้างหน้าเฉลยข้อสุดท้าย” และถ้าผู้ใช้กดปิดแล้วจะไม่เด้งกลับ (endQuestionDismissed)
________________________________________
**Key Functions (เรียงตามการถูกเรียกบ่อยใน runtime)**
  •	Entry/Boot: boot() → populateQuestionSetSelect() → attemptRestoreSession()
  •	Subscribe: subscribeRoom() → updateGameView() → updateRoleControls() / updateQuestionUI() / renderBoard()
  •	Host: start round (tx) → start question (tx) → reveal (tx)
  •	Player: roll overlay → finalizeRollTransaction() (tx) → submitAnswerTx() (tx)
  •	Timer: ensureTimer() → moveCountdownToAnsweringTx() (tx)

