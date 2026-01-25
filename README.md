# QuizRunner
Searching online database
QuizRunner SPA (Firebase RTDB Multiplayer)

เกมกระดาน + คำถามแบบ Multiplayer (Host 1 คน + ผู้เล่นหลายคน) ทำงานแบบ SPA โดยใช้ Firebase Realtime Database เป็น state กลางของห้อง

แนวคิดหลัก

ห้องเกม 1 ห้อง = 1 node ใน RTDB: rooms/{ROOM_CODE}

ทุก client (host/player) subscribe ห้องเดียวกันด้วย onValue() แล้ว render UI จาก roomData

การกระทำสำคัญที่ต้องกันชนกัน (start round / roll / submit / reveal) ใช้ runTransaction() เพื่อความ atomic

Data Model (ย่อ)

rooms/{code} มีคีย์หลัก ๆ:

status: lobby | inGame | finished

phase:

idle รอ host เริ่มรอบ

rolling ให้ผู้เล่นทอย

questionCountdown นับถอยหลัง 3 วิ

answering ช่วงตอบคำถาม (จับเวลา)

result เฉลย/สรุปรอบ

ended เกมจบ

currentRound (เริ่มที่ 0)

questionIndex (ผูกกับรอบ)

players/{pid}: name, color, position, hasRolled, answered, answer, finished ฯลฯ

history/round_{n}:

diceMoves/{pid}: from/to/roll/pathCells

answers/{pid}: selectedOption/correct/basePosition/finalPosition/configuredMove ฯลฯ

winners[]: ลำดับเข้าเส้นชัย

gameSettings: questionSetId, maxRounds, maxWinners, rewardCorrect, penaltyWrong

ตอนเกมจบ: finalPlayers, finalWinners (snapshot เพื่อให้สรุปคงอยู่แม้ player ออก)

User Roles
Host

สร้างห้อง + ตั้งค่าเกม

เริ่มเกม (เปลี่ยนจาก lobby -> inGame)

เริ่มรอบใหม่

เริ่มคำถาม (หลังทุกคนทอยแล้ว)

เฉลยคำถาม (คำนวณผลขยับตำแหน่ง/ผู้ชนะ/จบเกม)

Player

Join ห้อง (เฉพาะตอน lobby และยังไม่เริ่มรอบ)

ทอยเต๋า (เฉพาะตอน phase=rolling และยังไม่ finish)

ตอบคำถาม (เฉพาะตอน phase=answering และยังไม่หมดเวลา)

App Lifecycle / Entry Flow
Boot

boot()

populateQuestionSetSelect()

attemptRestoreSession()

ถ้าพบ session ใน sessionStorage และห้องยังอยู่ → ตั้ง currentRoomCode/currentRole/currentPlayerId แล้ว

enterLobbyView()

subscribeRoom(roomCode)

lockEntryUIForRole(role)

ถ้า restore ไม่ได้ → showEntryLanding()

Entry Navigation

หน้าแรก:

Player กด Join Game → showPlayerEntryPage()

Admin กดปุ่ม Admin → openAdminPwOverlay() → ใส่ PIN ถูก → showAdminEntryPage()

Room Subscription (หัวใจของการ render)

เมื่อเข้าห้องแล้วจะเรียก:

subscribeRoom(roomCode)

onValue(ref(db, rooms/{roomCode})) ทุกครั้งที่ state ห้องเปลี่ยน:

ถ้าห้องหาย → resetToHome()

เก็บ lastRoomData = roomData (ใช้กับ UI ปิดเฉลยตอนจบเกม)

updateHeaderActionsUI(roomData)

จัด layout lobby/in-game:

ถ้า status เป็น inGame/finished → enterInGameLayout()

ไม่งั้น → exitInGameLayout()

render และอัปเดต UI หลัก:

renderLobbyBadges(roomData)

renderPlayerList(roomData, players)

updateGameView(roomData, players)

updateStartGameButton(roomData, players)

Core Game Loop (Phase Flow)
Phase A: Host เริ่มเกม

Host กด Start Game:

update(roomRef, { status: inGame, phase: idle, gameStartedAt })

enterInGameLayout()

Phase B: Host เริ่มรอบใหม่ → phase=rolling

Host กด Start Round → runTransaction() ใน startRoundBtn handler:

currentRound++

ตั้ง phase = rolling

ตั้ง questionIndex = (round-1) % questionSetLength

reset flags ของผู้เล่น: hasRolled=false, answered=false, answer=null (ยกเว้นคนที่ finish แล้ว)

Phase C: Player ทอยเต๋า

Player กดทอย:

rollDiceWithOverlay() (สุ่มด้วย secureRandomInt + แอนิเมชัน 3D)

finalizeRollTransaction(roll):

update position

เขียน history/round_n/diceMoves

update winners ถ้าถึงเส้นชัย

เช็คเงื่อนไขจบเกมจากจำนวน winners/ผู้เล่นทั้งหมด

ถ้าจบ: phase=ended, status=finished, สร้าง finalPlayers/finalWinners

Phase D: Host เริ่มคำถาม → phase=questionCountdown

Host กด Start Question → transaction:

ตรวจว่าผู้เล่นที่ยัง active “ทอยครบ” แล้ว

ตั้ง phase = questionCountdown

ตั้ง questionCountdownStartAt = now, questionCountdownSeconds = 3

เตรียม answering: answerTimeSeconds = q.timeLimit, reset answerDeadlineExpired=false

Phase E: Countdown → phase=answering (ขยับอัตโนมัติ)

ทุก client เรียก updateQuestionUI() แล้วไป ensureTimer(roomData, questionCountdown)

ensureTimer() นับถอยหลังและเมื่อหมดเวลา:

เรียก moveCountdownToAnsweringTx() เพื่อ set:

phase = answering

answerStartAt = now

Phase F: Player ตอบคำถาม

ปุ่มตัวเลือกเรียก submitAnswerTx(optionKey):

transaction ตรวจ phase=answering และยังไม่หมดเวลา

set me.answer, me.answered=true

Phase G: Host เฉลย → phase=result หรือ ended

Host กด Reveal → transaction:

โหลดคำถามจาก getQuestionFromRoom(room, questionIndex)

สำหรับผู้เล่นแต่ละคน:

ถ้าตอบถูก: ขยับ rewardCorrect

ถ้าตอบผิด/ไม่ตอบ: ขยับ penaltyWrong

เขียน history/round_n/answers/{pid}

update winners ถ้าถึงเส้นชัย

เช็คจบเกม:

ถ้าจบ: phase=ended, status=finished, ตั้ง ui.keepQuestionOnEnd=true เพื่อค้างหน้าเฉลยข้อสุดท้าย + snapshot finalPlayers/finalWinners

ถ้าไม่จบ: phase=result

Phase H: Host เริ่มรอบใหม่ (วนซ้ำ)

จาก result → host กด Start Round → กลับ Phase B

End Game UX

เมื่อ phase=ended:

updateGameView() จะใช้ finalPlayers (ถ้ามี) เพื่อให้ตาราง/กระดานยังคงแม้ผู้เล่นออก

renderEndGameSummary() สร้างตารางอันดับ + สรุปผลรายรอบ

updateQuestionUI() รองรับ “ค้างหน้าเฉลยข้อสุดท้าย” และถ้าผู้ใช้กดปิดแล้วจะไม่เด้งกลับ (endQuestionDismissed)

Key Functions (เรียงตามการถูกเรียกบ่อยใน runtime)

Entry/Boot: boot() → populateQuestionSetSelect() → attemptRestoreSession()

Subscribe: subscribeRoom() → updateGameView() → updateRoleControls() / updateQuestionUI() / renderBoard()

Host: start round (tx) → start question (tx) → reveal (tx)

Player: roll overlay → finalizeRollTransaction() (tx) → submitAnswerTx() (tx)

Timer: ensureTimer() → moveCountdownToAnsweringTx() (tx)
