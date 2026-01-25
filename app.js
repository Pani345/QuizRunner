// app.js
// Stable Multiplayer: transactions for dice/answer/host actions (patched)
// Refactor: grouped + ordered by flow (no core game logic changes)

/* =========================
   1) Imports
========================= */
import { initializeApp as firebaseInitializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  get,
  onValue,
  update,
  remove,
  runTransaction,
  onDisconnect,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

import {
  getQuestionSetLengthForRoom,
  getQuestionFromRoom,
  getQuestionSetIds,
  getQuestionSetName,
} from "./questions.js";

import { createDiceController } from "./dice.js";

/* =========================
   2) Firebase init + global error logs
========================= */
const firebaseConfig = {
  apiKey: "AIzaSyBUHaaYaSzluNnlI4pSmRk-oUomgydiq2I",
  authDomain: "quizrunner.firebaseapp.com",
  databaseURL: "https://quizrunner-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "quizrunner",
  storageBucket: "quizrunner.firebasestorage.app",
  messagingSenderId: "302500543999",
  appId: "1:302500543999:web:773c1cd297246f73c87bca",
  measurementId: "G-QWX3CDCRBE",
};

console.log("app.js loaded (Stable Transactions - patched)");

window.addEventListener("error", (e) => {
  console.error("[GLOBAL ERROR]", e.message, e.filename, e.lineno, e.colno);
});
window.addEventListener("unhandledrejection", (e) => {
  console.error("[UNHANDLED PROMISE]", e.reason);
});

const app = firebaseInitializeApp(firebaseConfig);
const db = getDatabase(app);

/* =========================
   3) Constants/Enums + Storage
========================= */
const BOARD_SIZE = 30;

const STORAGE_KEY = "SQ_SESSION_V1";
const STORAGE = sessionStorage; // ✅ แยกต่อแท็บ

const STATUS = Object.freeze({
  LOBBY: "lobby",
  IN_GAME: "inGame",
  FINISHED: "finished",
});

const PHASE = Object.freeze({
  IDLE: "idle",
  ROLLING: "rolling",
  QUESTION_COUNTDOWN: "questionCountdown",
  ANSWERING: "answering",
  RESULT: "result",
  ENDED: "ended",
});

/* =========================
   4) Runtime State
========================= */
let didRestoreSession = false;

let currentRoomCode = null;
let currentRole = null; // "host" | "player"
let currentPlayerId = null;

let roomUnsub = null;

let timerInterval = null;
let timerPhase = null;
let timerRound = 0;

let rollPending = false; // ✅ กันกดทอยซ้ำระหว่างรอ DB sync
let answerPending = false;

let resultQuestionDismissed = false;
let resultQuestionKey = null; // room|round|qIndex

// End-game question overlay (local dismiss)
let lastRoomData = null;

let endQuestionDismissed = false; // ผู้ใช้ปิดหน้าเฉลยตอนจบเกมแล้ว
let endQuestionKey = null;        // ใช้รีเซ็ต dismissed เมื่อเป็นคนละรอบ/คนละข้อ/คนละห้อง

/* =========================
   5) DOM Cache
========================= */
// ---------------- Admin Password Gate ----------------
const ADMIN_PIN = "8888";
const adminTopBtn = document.getElementById("adminTopBtn");
const adminPwOverlayEl = document.getElementById("adminPwOverlay");
const adminPwInputEl = document.getElementById("adminPwInput");
const adminPwErrorEl = document.getElementById("adminPwError");
const adminPwCancelBtn = document.getElementById("adminPwCancelBtn");

const headerHomeBtn = document.getElementById("headerHomeBtn");
const headerExitBtn = document.getElementById("headerExitBtn");

const createRoomBtn = document.getElementById("createRoomBtn");
const hostNameInput = document.getElementById("hostNameInput");
const hostGameOptionsEl = document.getElementById("hostGameOptions");
const questionSetSelect = document.getElementById("questionSetSelect");
const maxRoundsInput = document.getElementById("maxRoundsInput");
const maxWinnersInput = document.getElementById("maxWinnersInput");
const rewardCorrectInput = document.getElementById("rewardCorrectInput");
const penaltyWrongInput = document.getElementById("penaltyWrongInput");
const confirmCreateRoomBtn = document.getElementById("confirmCreateRoomBtn");

const joinRoomBtn = document.getElementById("joinRoomBtn");
const roomCodeInput = document.getElementById("roomCodeInput");
const playerNameInput = document.getElementById("playerNameInput");

const lobbyEl = document.getElementById("lobby");
// NOTE: roomInfo ไม่มีใน index.html ล่าสุด → ไม่ใช้งาน
const roleInfoEl = document.getElementById("roleInfo");
const playerListEl = document.getElementById("playerList");
const entrySectionEl = document.getElementById("entrySection");

const lobbyBadgesEl = document.getElementById("lobbyBadges");
const cancelRoomBtn = document.getElementById("cancelRoomBtn");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");

const startGameBtn = document.getElementById("startGameBtn");
if (!startGameBtn) console.warn("[UI] startGameBtn not found");

const hostGameControlsEl = document.getElementById("hostGameControls");
const playerGameControlsEl = document.getElementById("playerGameControls");

const startRoundBtn = document.getElementById("startRoundBtn");
const startQuestionBtn = document.getElementById("startQuestionBtn");
const toggleQuestionOverlayBtn = document.getElementById("toggleQuestionOverlayBtn");
let hostQuestionOverlayHidden = false; // local only
const revealAnswerBtn = document.getElementById("revealAnswerBtn");

const gameAreaEl = document.getElementById("gameArea");
const roundInfoEl = document.getElementById("roundInfo");
const phaseInfoEl = document.getElementById("phaseInfo");
const boardEl = document.getElementById("board");

const rollDiceBtn = document.getElementById("rollDiceBtn");

// Dice Overlay
const diceOverlayEl = document.getElementById("diceOverlay");
const dice3dEl = document.getElementById("dice3d");
const diceHintEl = document.getElementById("diceHint");
const diceRollHintEl = document.getElementById("diceRollHint");

const questionAreaOverlayEl = document.getElementById("questionAreaOverlay");
const closeQuestionAreaBtn = document.getElementById("closeQuestionAreaBtn");
const countdownDisplayEl = document.getElementById("countdownDisplay");
const questionTextEl = document.getElementById("questionText");
const choicesContainerEl = document.getElementById("choicesContainer");

// Question Countdown Overlay
const questionCountdownOverlayEl = document.getElementById("questionCountdownOverlay");
const questionCountdownNumberEl = document.getElementById("questionCountdownNumber");

const endGameAreaEl = document.getElementById("endGameArea");
const endGameSummaryEl = document.getElementById("endGameSummary");

// Entry pages
const joinGameBtn = document.getElementById("joinGameBtn");
const entryLandingEl = document.getElementById("entryLanding"); // หน้าแรกปุ่ม Join Game
const adminEntryPageEl = document.getElementById("adminEntryPage");
const playerEntryPageEl = document.getElementById("playerEntryPage");


// สร้าง controller หลัง DOM cache
// สำคัญ: ต้องสร้างหลังจาก diceOverlayEl, dice3dEl, rollDiceBtn ถูก cache แล้ว
const dice = createDiceController({
  diceOverlayEl,
  dice3dEl,
  diceHintEl,
  diceRollHintEl,
  closeDiceOverlayBtn,
  rollDiceBtn,
  gameAreaEl, // ใช้ scrollIntoView ตอนปิด overlay (จะส่งหรือไม่ส่งก็ได้)
});

/* =========================
   6) Utils
========================= */
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const MAX_NAME_LEN = 12;

function normalizeName(raw) {
  const s = String(raw || "").trim().replace(/\s+/g, " ");
  // ตัดความยาวเสมอ (กันกรณี paste/แก้ DOM)
  return s.slice(0, MAX_NAME_LEN);
}

function setEntryVisible(visible) {
  if (!entrySectionEl) return;
  entrySectionEl.style.display = visible ? "" : "none";
}

function clampPos(pos) {
  const p = Number(pos ?? 1);
  if (!Number.isFinite(p)) return 1;
  return Math.max(1, Math.min(BOARD_SIZE, Math.trunc(p)));
}

function createId(prefix) {
  return prefix + "_" + Math.random().toString(36).substring(2, 10);
}

function createRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
}

function pickColorAvoidDuplicate(players = {}) {
  const palette = [
    "#e53935", "#d81b60", "#8e24aa", "#5e35b1", "#3949ab",
    "#1e88e5", "#039be5", "#00acc1", "#00897b", "#43a047",
    "#7cb342", "#c0ca33", "#fdd835", "#ffb300", "#fb8c00",
    "#f4511e", "#6d4c41", "#757575", "#546e7a", "#c62828",
    "#ad1457", "#6a1b9a", "#4527a0", "#283593", "#1565c0",
    "#0277bd", "#006064", "#004d40", "#2e7d32", "#827717"
  ];

  const used = new Set(Object.values(players).map(p => p.color));
  const available = palette.filter(c => !used.has(c));

  return available.length
    ? available[Math.floor(Math.random() * available.length)]
    : palette[Math.floor(Math.random() * palette.length)];
}

function getPathCells(from, to) {
  const cells = [];
  if (from === to) return cells;
  const step = from < to ? 1 : -1;
  let pos = from + step;
  while (true) {
    if (pos >= 1 && pos <= BOARD_SIZE) cells.push(pos);
    if (pos === to) break;
    pos += step;
  }
  return cells;
}

function saveSession() {
  const payload = { room: currentRoomCode, role: currentRole, pid: currentPlayerId };
  STORAGE.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function clearSession() {
  STORAGE.removeItem(STORAGE_KEY);
}

function setHeaderPills() {
  const uiRoomPill = document.getElementById("uiRoomPill");
  const uiRolePill = document.getElementById("uiRolePill");
  if (uiRoomPill) uiRoomPill.textContent = `Room: ${currentRoomCode || "-"}`;
  if (uiRolePill) uiRolePill.textContent = `Role: ${currentRole || "-"}`;
}

function lockEntryUIForRole(role) {
  const lockHost = role === "host";
  const lockPlayer = role === "player";

  // Host block
  if (hostNameInput) hostNameInput.disabled = lockHost;
  if (createRoomBtn) createRoomBtn.disabled = lockHost;
  if (confirmCreateRoomBtn) confirmCreateRoomBtn.disabled = lockHost;

  // Player block
  if (roomCodeInput) roomCodeInput.disabled = lockPlayer;
  if (playerNameInput) playerNameInput.disabled = lockPlayer;
  if (joinRoomBtn) joinRoomBtn.disabled = lockPlayer;
}

function renderLobbyBadges(roomData) {
  if (!lobbyBadgesEl) return;

  const gs = roomData.gameSettings || {};
  const hostName = roomData.hostName || "-";
  const code = currentRoomCode || "-";

  const questionSetId = gs.questionSetId || "general";
  const maxRounds = gs.maxRounds ?? 10;
  const maxWinners = gs.maxWinners ?? 5;

  const rewardCorrect = Number.isFinite(gs.rewardCorrect) ? gs.rewardCorrect : 1;
  const penaltyWrong = Number.isFinite(gs.penaltyWrong) ? gs.penaltyWrong : -1;

  const rewardText = rewardCorrect >= 0 ? `+${rewardCorrect}` : `${rewardCorrect}`;
  const penaltyText = penaltyWrong >= 0 ? `+${penaltyWrong}` : `${penaltyWrong}`;

  const items = [
    `Room: ${code}`,
    `Host: ${hostName}`,
    `ชุดคำถาม: ${getQuestionSetName(questionSetId || "general")}`,
    `รอบสูงสุด: ${maxRounds}`,
    `เข้าเส้นชัย: ${maxWinners} คน`,
    `ถูก: ${rewardText}`,
    `ผิด/ไม่ทัน: ${penaltyText}`,
  ];

  lobbyBadgesEl.innerHTML = "";
  for (const t of items) {
    const el = document.createElement("div");
    el.className = "lobby-badge";
    el.textContent = t;
    lobbyBadgesEl.appendChild(el);
  }
}

function updateHeaderActionsUI(roomData = null) {
  const onLanding = entryLandingEl && entryLandingEl.style.display !== "none";
  const onAdminEntry = adminEntryPageEl && adminEntryPageEl.style.display !== "none";
  const onPlayerEntry = playerEntryPageEl && playerEntryPageEl.style.display !== "none";

  const inEntry = !onLanding && (onAdminEntry || onPlayerEntry);

  const status = roomData?.status || null;
  const inRoom = !!currentRoomCode && !!currentRole; // เข้าห้องแล้ว (lobby/inGame/finished)

  // 1) Admin: เฉพาะหน้าแรกเท่านั้น
  if (adminTopBtn) adminTopBtn.style.display = onLanding ? "inline-flex" : "none";

  // 2) Exit: แสดงเมื่อ "เข้าห้องแล้ว" (รวม lobby ก่อนเริ่มเกมด้วย!)
  //    และให้ไปแทนที่ Home
  const showExit = inRoom && (status === STATUS.LOBBY || status === STATUS.IN_GAME || status === STATUS.FINISHED);

  if (headerExitBtn) {
    headerExitBtn.style.display = showExit ? "inline-flex" : "none";
    if (showExit) headerExitBtn.textContent = currentRole === "host" ? "ยกเลิกห้อง" : "ออกจากห้อง";
  }

  // 3) Home: แสดงเฉพาะตอนอยู่หน้า entry (adminEntry/playerEntry)
  //    แต่ถ้า showExit = true ให้ซ่อน Home (เพราะ Exit มาแทน)
  const showHome = inEntry && !showExit;

  if (headerHomeBtn) {
    headerHomeBtn.style.display = showHome ? "inline-flex" : "none";
  }
}

function diceToGlyph(n) {
  const map = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  return map[n] || "";
}

function setupPlayerOnDisconnect(roomCode, pid) {
  try {
    const roomRef = ref(db, `rooms/${roomCode}`);
    const pRef = ref(db, `rooms/${roomCode}/players/${pid}`);

    // อ่านสถานะห้องครั้งเดียวตอนตั้งค่า (พอแล้วสำหรับ use-case นี้)
    get(roomRef)
      .then((snap) => {
        const room = snap.exists() ? snap.val() : null;

        const inLobby = room && room.status === STATUS.LOBBY && (room.currentRound || 0) === 0;

        // ✅ ถ้ายังไม่เริ่มเกม: หลุด = ลบชื่อออก (เปลี่ยนชื่อได้)
        if (inLobby) {
          onDisconnect(pRef).remove();
        } else {
          // ✅ เริ่มเกมแล้ว: หลุด = mark disconnected เพื่อให้ rejoin ได้
          onDisconnect(pRef).update({
            connected: false,
            disconnectedAt: Date.now(),
            lastSeen: Date.now(),
          });
        }
      })
      .catch((e) => {
        console.warn("setupPlayerOnDisconnect read room failed:", e);

        // fallback ปลอดภัย: ถ้าอ่านไม่ได้ให้ mark disconnected ไว้ก่อน
        onDisconnect(pRef).update({
          connected: false,
          disconnectedAt: Date.now(),
          lastSeen: Date.now(),
        });
      });
  } catch (e) {
    console.warn("onDisconnect setup failed:", e);
  }
}

/* =========================
   7) QuestionSet UI init
========================= */
/**
 * Populate question set options in the select dropdown.
 * This makes it so adding question sets only requires editing questions.js.
 */
function populateQuestionSetSelect() {
  if (!questionSetSelect) return;

  // Clear existing options
  questionSetSelect.innerHTML = "";

  // Get all question set IDs and populate options
  const setIds = getQuestionSetIds();
  setIds.forEach((setId) => {
    const option = document.createElement("option");
    option.value = setId;
    option.textContent = getQuestionSetName(setId);
    questionSetSelect.appendChild(option);
  });

  // Set default to "general" if it exists
  if (setIds.includes("general")) {
    questionSetSelect.value = "general";
  }
}

/* =========================
   8) Entry Navigation (SPA)
========================= */
function showEntryLanding() {
  if (entryLandingEl) entryLandingEl.style.display = "block";
  if (adminEntryPageEl) adminEntryPageEl.style.display = "none";
  if (playerEntryPageEl) playerEntryPageEl.style.display = "none";

  if (hostGameOptionsEl) hostGameOptionsEl.classList.remove("is-open");

  // enable entry inputs
  if (hostNameInput) hostNameInput.disabled = false;
  if (createRoomBtn) createRoomBtn.disabled = false;
  if (confirmCreateRoomBtn) confirmCreateRoomBtn.disabled = false;

  if (roomCodeInput) roomCodeInput.disabled = false;
  if (playerNameInput) playerNameInput.disabled = false;
  if (joinRoomBtn) joinRoomBtn.disabled = false;

  entryLandingEl?.scrollIntoView({ behavior: "smooth", block: "start" });

  updateHeaderActionsUI(null);
}

function showAdminEntryPage() {
  if (entryLandingEl) entryLandingEl.style.display = "none";
  if (adminEntryPageEl) adminEntryPageEl.style.display = "grid";
  if (playerEntryPageEl) playerEntryPageEl.style.display = "none";

  adminEntryPageEl?.scrollIntoView({ behavior: "smooth", block: "start" });

  updateHeaderActionsUI(null);
}

function showPlayerEntryPage() {
  if (entryLandingEl) entryLandingEl.style.display = "none";
  if (adminEntryPageEl) adminEntryPageEl.style.display = "none";
  if (playerEntryPageEl) playerEntryPageEl.style.display = "grid";

  playerEntryPageEl?.scrollIntoView({ behavior: "smooth", block: "start" });

  updateHeaderActionsUI(null);
}

/* =========================
   9) Admin PIN overlay functions
========================= */
function openAdminPwOverlay() {
  if (!adminPwOverlayEl || !adminPwInputEl) {
    alert("ไม่พบหน้ากรอกรหัส Admin (#adminPwOverlay / #adminPwInput) กรุณาตรวจสอบ index.html");
    return;
  }

  adminPwInputEl.value = "";
  if (adminPwErrorEl) adminPwErrorEl.style.display = "none";

  adminPwOverlayEl.style.display = "flex";
  setTimeout(() => adminPwInputEl.focus(), 0);
}

function closeAdminPwOverlay() {
  if (adminPwOverlayEl) adminPwOverlayEl.style.display = "none";
  if (adminPwInputEl) adminPwInputEl.value = "";
  if (adminPwErrorEl) adminPwErrorEl.style.display = "none";
}

function failPin() {
  if (adminPwErrorEl) adminPwErrorEl.style.display = "block";
  if (adminPwInputEl) {
    adminPwInputEl.value = "";
    adminPwInputEl.focus();
  }
}

/* =========================
   10) Room subscribe + Lobby view
========================= */
function enterLobbyView() {
  if (lobbyEl) lobbyEl.style.display = "block";
  setEntryVisible(false);

  if (cancelRoomBtn) cancelRoomBtn.style.display = "none";
  if (leaveRoomBtn) leaveRoomBtn.style.display = "none";

  if (roleInfoEl) roleInfoEl.textContent = "";
  setHeaderPills();
}

function subscribeRoom(roomCode) {
  if (roomUnsub) {
    try {
      roomUnsub();
    } catch {}
    roomUnsub = null;
  }

  const roomRef = ref(db, `rooms/${roomCode}`);
  roomUnsub = onValue(roomRef, (snapshot) => {
    try {
      if (!snapshot.exists()) {
        resetToHome("ห้องนี้ถูกยกเลิก/ปิดแล้ว");
        return;
      }

      const roomData = snapshot.val();
      const players = roomData.players || {};

      // ✅ เก็บ roomData ล่าสุดไว้ให้ปุ่ม close ใช้อ้างอิง
      lastRoomData = roomData;

      updateHeaderActionsUI(roomData);

      // เงื่อนไข "เริ่มเล่นแล้ว" (ง่ายสุด = status inGame/finished)
      if (roomData.status === STATUS.IN_GAME || roomData.status === STATUS.FINISHED) {
        enterInGameLayout();
      } else {
        exitInGameLayout();
      }

      console.log("[ROOM UPDATE]", {
        roomCode,
        status: roomData.status,
        phase: roomData.phase,
        playerCount: Object.keys(players).length,
        currentRole,
      });

      renderLobbyBadges(roomData);
      renderPlayerList(roomData, players);
      updateGameView(roomData, players);
      updateStartGameButton(roomData, players);
    } catch (e) {
      console.error("[subscribeRoom] crashed:", e);
    }
  });
}

function updateStartGameButton(roomData, players) {
  if (!startGameBtn) return;

  // ซ่อนปุ่มสำหรับ player เสมอ
  if (currentRole !== "host") {
    startGameBtn.style.display = "none";
    startGameBtn.disabled = true;
    return;
  }

  const totalPlayers = Object.keys(players || {}).length;
  const shouldShow = currentRoomCode && roomData?.status === "lobby" && totalPlayers > 0;

  startGameBtn.style.display = shouldShow ? "inline-flex" : "none";
  startGameBtn.disabled = !shouldShow;
}

function enterInGameLayout() {
  document.body.classList.add("in-game");

  const lobby = document.getElementById("lobby");
  const lobbyCard = lobby ? lobby.querySelector(".lobby-card") : null;
  const host = document.getElementById("lobbyCardHost");
  if (lobbyCard && host && !host.contains(lobbyCard)) {
    host.appendChild(lobbyCard);
  }
}

function exitInGameLayout() {
  document.body.classList.remove("in-game");

  const lobby = document.getElementById("lobby");
  const lobbyCard = document.querySelector("#lobbyCardHost .lobby-card");
  const host = document.getElementById("lobbyCardHost");
  if (lobbyCard && lobby && host) {
    lobby.appendChild(lobbyCard);
  }
  if (host) host.style.display = "none"; // เผื่อ inline ถูกตั้งไว้
}

/* =========================
   11) Host flows (create room/start game/start round/start question/reveal)
       Host question flow (hostStartQuestionFlow/hostToggleQuestionOverlay/hostRevealAnswerFlow)
========================= */
// Host: Step 1 – เปิด panel ตั้งค่าเกม
function hostOpenGameOptionsFlow() {
  const hostName = normalizeName(hostNameInput?.value);
  if (!hostName) {
    alert("กรุณากรอกชื่อของ Host ก่อน");
    return;
  }
  if (hostNameInput) hostNameInput.value = hostName;

  if (hostNameInput) hostNameInput.disabled = true;
  if (createRoomBtn) createRoomBtn.disabled = true;

  if (!hostGameOptionsEl) {
    alert("ไม่พบแผงตั้งค่าเกม (#hostGameOptions) กรุณาตรวจสอบ id ใน index.html");
    if (hostNameInput) hostNameInput.disabled = false;
    if (createRoomBtn) createRoomBtn.disabled = false;
    return;
  }

  const card = createRoomBtn?.closest?.(".card");
  if (card) {
    const h = card.getBoundingClientRect().height;
    card.classList.add("lock-height");
    card.style.height = `${h}px`;
  }

  hostGameOptionsEl.classList.add("is-open");
  hostGameOptionsEl.style.display = "block";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (card) {
        card.style.height = "";
        card.classList.remove("lock-height");
      }
    });
  });

  console.log("[UI] open hostGameOptions");
}

// Host Step 2: create room
async function hostConfirmCreateRoomFlow() {
  const hostName = normalizeName(hostNameInput?.value);
  if (!hostName) {
    alert("กรุณากรอกชื่อของ Host ก่อน");
    return;
  }
  if (hostNameInput) hostNameInput.value = hostName;

  const questionSetId = questionSetSelect?.value || "general";
  const maxRounds = Math.max(1, parseInt(maxRoundsInput?.value, 10) || 10);
  const maxWinners = Math.max(1, parseInt(maxWinnersInput?.value, 10) || 5);

  const rewardRaw = parseInt(rewardCorrectInput?.value, 10);
  const rewardCorrect = Number.isFinite(rewardRaw) ? rewardRaw : 1;

  const penaltyRaw = parseInt(penaltyWrongInput?.value, 10);
  const penaltyWrong = Number.isFinite(penaltyRaw) ? -Math.abs(penaltyRaw) : -1;

  const roomRefBase = (code) => ref(db, `rooms/${code}`);

  let roomCode = null;
  for (let i = 0; i < 6; i++) {
    const c = createRoomCode();
    const s = await get(roomRefBase(c));
    if (!s.exists()) {
      roomCode = c;
      break;
    }
  }

  if (!roomCode) {
    alert("สร้างห้องไม่สำเร็จ (รหัสชนกันหลายครั้ง) ลองใหม่อีกครั้ง");
    if (hostNameInput) hostNameInput.disabled = false;
    if (createRoomBtn) createRoomBtn.disabled = false;
    return;
  }

  const hostId = createId("host");

  currentRoomCode = roomCode;
  currentRole = "host";
  currentPlayerId = null;

  try {
    await set(roomRefBase(roomCode), {
      createdAt: Date.now(),
      status: STATUS.LOBBY,
      hostId,
      hostName,
      boardSize: BOARD_SIZE,
      currentRound: 0,
      phase: PHASE.IDLE,
      questionIndex: null,
      questionCountdownStartAt: null,
      questionCountdownSeconds: 3,
      answerStartAt: null,
      answerTimeSeconds: null,
      answerDeadlineExpired: false,
      winners: [],
      history: {},
      gameSettings: {
        questionSetId,
        maxRounds,
        maxWinners,
        rewardCorrect,
        penaltyWrong,
      },
    });

    hostGameOptionsEl?.classList?.remove("is-open");
    enterLobbyView();
    subscribeRoom(roomCode);
    lockEntryUIForRole("host");
    saveSession();

    alert(`สร้างห้องสำเร็จ!\nRoom Code: ${roomCode}\nแชร์รหัสนี้ให้นักเรียนใช้ Join ได้เลย`);
  } catch (err) {
    console.error("Error creating room:", err);
    alert("มีปัญหาในการสร้างห้อง ดู error ใน Console");
    if (hostNameInput) hostNameInput.disabled = false;
    if (createRoomBtn) createRoomBtn.disabled = false;
  }
}

// Host: Start Game
async function hostStartGameFlow() {
  if (currentRole !== "host" || !currentRoomCode) return;

  const roomRef = ref(db, `rooms/${currentRoomCode}`);
  const snap = await get(roomRef);
  if (!snap.exists()) return;

  const roomData = snap.val();
  const players = roomData.players || {};
  const totalPlayers = Object.keys(players).length;

  if (roomData.status !== STATUS.LOBBY) {
    alert("ห้องนี้เริ่มเกมแล้ว");
    return;
  }
  if (totalPlayers <= 0) {
    alert("ยังไม่มีผู้เล่นเข้าห้อง");
    return;
  }

  await update(roomRef, {
    status: STATUS.IN_GAME,
    phase: PHASE.IDLE,
    gameStartedAt: Date.now(),
  });

  enterInGameLayout();
  document.getElementById("gameArea")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Host: Start New Round (Transaction)
async function hostStartRoundFlow() {
  if (currentRole !== "host" || !currentRoomCode) return;

  const roomRef = ref(db, `rooms/${currentRoomCode}`);

  const result = await runTransaction(roomRef, (room) => {
    if (!room) return room;

    const phase = room.phase || PHASE.IDLE;
    if (phase === PHASE.ENDED) return;

    if (phase === PHASE.QUESTION_COUNTDOWN || phase === PHASE.ANSWERING) return;
    if (phase !== PHASE.IDLE && phase !== PHASE.RESULT) return;
    if (room.status !== STATUS.IN_GAME) return;

    const gs = room.gameSettings || {};
    const maxRounds = Math.max(1, gs.maxRounds ?? 10);
    const currentRound = room.currentRound || 0;
    if (currentRound >= maxRounds) return;

    const players = room.players || {};
    const questionSetLen = getQuestionSetLengthForRoom(room);

    const newRound = currentRound + 1;
    room.currentRound = newRound;
    room.phase = PHASE.ROLLING;
    room.questionIndex = (newRound - 1) % (questionSetLen || 1);
    room.questionCountdownStartAt = null;
    room.answerStartAt = null;
    room.answerTimeSeconds = null;
    room.answerDeadlineExpired = false;

    for (const [pid, p] of Object.entries(players)) {
      const posNow = clampPos(p.position);
      p.startOfRoundPos = posNow;

      if (p.finished || posNow >= BOARD_SIZE) {
        p.hasRolled = true;
      } else {
        p.lastRoll = null;
        p.hasRolled = false;
      }

      p.answered = false;
      p.answer = null;
      p.lastAnswerCorrect = null;
      players[pid] = p;
    }

    room.players = players;
    return room;
  });

  if (!result.committed) {
    alert("เริ่มรอบใหม่ไม่ได้ (อาจถึงรอบสูงสุดแล้ว หรืออยู่ในช่วงตอบ/นับถอยหลัง)");
    return;
  }

  // success effects (UI local)
  if (questionAreaOverlayEl) questionAreaOverlayEl.style.display = "none";
  if (closeQuestionAreaBtn) closeQuestionAreaBtn.style.display = "none";
  clearTimer();
}

async function hostStartQuestionFlow() {
  if (currentRole !== "host" || !currentRoomCode) return;

  const roomRef = ref(db, `rooms/${currentRoomCode}`);
  const now = Date.now();

  const tx = await runTransaction(roomRef, (room) => {
    if (!room) return room;

    // ✅ ถ้าไม่ใช่ช่วง rolling ให้ "ไม่ทำอะไร" แต่ต้องคืน room เสมอ
    if (room.phase !== PHASE.ROLLING) return room;

    const players = room.players || {};

    // ✅ ต้องมี currentRound > 0 (กันเริ่มคำถามก่อนเริ่มรอบ)
    const currentRound = room.currentRound || 0;
    if (currentRound <= 0) return room;

    // ✅ prepare history round
    room.history = room.history || {};
    const roundKey = `round_${currentRound}`;
    room.history[roundKey] = room.history[roundKey] || {};
    room.history[roundKey].diceMoves = room.history[roundKey].diceMoves || {};

    // ✅ auto-skip: ใครยัง active แต่ยังไม่ทอย -> ให้ทอย 0 (☐)
    for (const [pid, p] of Object.entries(players)) {
      const posNow = clampPos(p.position);
      const isActive = !p.finished && posNow < BOARD_SIZE;

      if (isActive && !p.hasRolled) {
        p.hasRolled = true;
        p.lastRoll = 0; // 0 แต้ม
        // position ไม่เปลี่ยน
        players[pid] = p;

        // กันเขียนซ้ำ ถ้าเคย auto-skip ไปแล้ว
        if (!room.history[roundKey].diceMoves[pid]) {
          room.history[roundKey].diceMoves[pid] = {
            playerId: pid,
            playerName: p.name || "",
            fromPosition: posNow,
            toPosition: posNow,
            diceRoll: 0,
            pathCells: [],
            timestamp: now,
            missed: true,
          };
        }
      }
    }

    room.players = players;

    // ✅ ต้องหา question ได้ ไม่งั้น "ไม่ทำอะไร" แต่คืน room
    const questionIndex = room.questionIndex ?? 0;
    const q = getQuestionFromRoom(room, questionIndex);
    if (!q) return room;

    // ✅ set phase -> questionCountdown
    room.phase = PHASE.QUESTION_COUNTDOWN;
    room.questionCountdownStartAt = now;
    room.questionCountdownSeconds = 3;

    room.answerStartAt = null;
    room.answerTimeSeconds = q.timeLimit;
    room.answerDeadlineExpired = false;

    return room;
  });

  if (!tx.committed) {
    alert("เริ่มคำถามไม่ได้ (phase ไม่ถูกต้อง)");
    return;
  }

  // ไม่ต้อง clearTimer() ที่นี่ เพราะ Firebase sync จะเรียก updateQuestionUI → ensureTimer เอง
}

function hostToggleQuestionOverlay() {
  if (currentRole !== "host") return;

  hostQuestionOverlayHidden = !hostQuestionOverlayHidden;

  // ซ่อน/โชว์ overlay (เฉพาะ local)
  if (questionAreaOverlayEl) {
    questionAreaOverlayEl.style.display = hostQuestionOverlayHidden ? "none" : "flex";
  }

  // เปลี่ยนข้อความปุ่ม
  if (toggleQuestionOverlayBtn) {
    toggleQuestionOverlayBtn.textContent = hostQuestionOverlayHidden ? "แสดงคำถาม" : "ซ่อนคำถาม";
  }
}

async function hostRevealAnswerFlow() {
  if (currentRole !== "host" || !currentRoomCode) return;

  const roomRef = ref(db, `rooms/${currentRoomCode}`);
  const now = Date.now();

  const tx = await runTransaction(roomRef, (room) => {
    if (!room) return room;
    if (room.phase !== PHASE.ANSWERING) return;

    const players = room.players || {};
    const gs = room.gameSettings || {};

    const rewardCorrect = Number.isFinite(gs.rewardCorrect) ? gs.rewardCorrect : 1;
    const penaltyWrong = Number.isFinite(gs.penaltyWrong) ? gs.penaltyWrong : -1;
    const maxRounds = Math.max(1, gs.maxRounds ?? 10);
    const maxWinners = Math.max(1, gs.maxWinners ?? 5);

    const questionIndex = room.questionIndex ?? 0;
    const q = getQuestionFromRoom(room, questionIndex);
    if (!q) return;

    const questionSetId = gs.questionSetId || "general";
    const currentRound = room.currentRound || 0;

    room.history = room.history || {};
    const roundKey = `round_${currentRound}`;
    room.history[roundKey] = room.history[roundKey] || {};
    room.history[roundKey].answers = room.history[roundKey].answers || {};

    room.winners = Array.isArray(room.winners) ? room.winners : [];
    const winnerIds = new Set(room.winners.map((w) => w.playerId));

    for (const [pid, p] of Object.entries(players)) {
      const basePos = clampPos(p.position);
      const alreadyFinished = !!p.finished || basePos >= BOARD_SIZE;
    
      let answered = !!p.answered;
      let ans = p.answer ?? null;
    
      const missedByRoundFlag = (p.missedAnswerRound === currentRound);
    
      const missedByStillDisconnected =
        (p.connected === false) && (answered === false) && (ans == null);
    
      const missedAnswer =
        (!alreadyFinished) &&
        (answered === false) &&
        (ans == null) &&
        (missedByRoundFlag || missedByStillDisconnected);
    
      let correct = null;
      let configuredMove = 0;
      let finalPos = basePos;
    
      if (!alreadyFinished) {
        if (missedAnswer) {
          correct = null;
          configuredMove = 0;
          finalPos = basePos;
    
          p.position = finalPos;       // ✅ เพิ่ม
          p.lastAnswerCorrect = null;
        } else {
          correct = answered && ans === q.correctOption;
          configuredMove = correct ? rewardCorrect : penaltyWrong;
          finalPos = clampPos(basePos + configuredMove);
    
          p.position = finalPos;
          p.lastAnswerCorrect = correct;
    
          if (finalPos >= BOARD_SIZE) {
            p.finished = true;
            p.finishedRound = currentRound;
            p.finishedBy = "answer";
          }
        }
      } else {
        answered = false;
        ans = null;
        correct = null;
        configuredMove = 0;
        finalPos = basePos;
      }
    
      room.history[roundKey].answers[pid] = {
        playerId: pid,
        playerName: p.name || "",
        questionSetId,
        questionIndex,
        questionText: q.text,
        selectedOption: ans,
        correct,
        answered,
        missedAnswer,
        diceRoll: p.lastRoll ?? null,
        basePosition: basePos,
        finalPosition: finalPos,
        configuredMove,
        actualDelta: finalPos - basePos,
        timestamp: now,
      };
    
      players[pid] = p;
    }

    room.players = players;

    const totalPlayers = Object.keys(players).length;
    const targetWinners = Math.min(maxWinners, totalPlayers);

    let gameEnded = false;
    let endReason = null;

    if (room.winners.length >= targetWinners || room.winners.length === totalPlayers) {
      gameEnded = true;
      endReason = "winners";
    } else if (currentRound >= maxRounds) {
      gameEnded = true;
      endReason = "rounds";
    }

    if (gameEnded) {
      room.phase = PHASE.ENDED;
      room.status = STATUS.FINISHED;

      // ✅ บอก UI ให้ค้างหน้าเฉลยข้อสุดท้าย
      room.ui = room.ui || {};
      room.ui.keepQuestionOnEnd = true;
      room.ui.keepQuestionRound = currentRound;
      room.ui.keepQuestionIndex = questionIndex;
      room.ui.keepQuestionSetId = questionSetId;

      room.endInfo = {
        endedAt: now,
        endReason,
        maxRounds,
        maxWinners,
        winnerCount: room.winners.length,
      };

      // ✅ snapshot ผู้เล่นตอนเกมจบ (ทำครั้งเดียว)
      if (!room.finalPlayers) {
        const clonePlayers = (obj) => {
          try {
            return structuredClone(obj);
          } catch {
            return JSON.parse(JSON.stringify(obj));
          }
        };
        room.finalPlayers = clonePlayers(players || {});
        room.finalWinners = Array.isArray(room.winners) ? room.winners.slice() : [];
      }
    } else {
      room.phase = PHASE.RESULT;
    }

    return room;
  });

  if (!tx.committed) alert("เฉลยไม่ได้ (phase ไม่ถูกต้อง)");
  clearTimer();
}

/* =========================
   12) Player flows (join/roll/submit)
========================= */
// Player: Join Room
joinRoomBtn?.addEventListener("click", async () => {
  const roomCode = (roomCodeInput?.value || "").trim().toUpperCase();
  const playerName = normalizeName(playerNameInput?.value);

  if (!roomCode || !playerName) {
    alert("กรุณากรอกทั้ง Room Code และชื่อนักเรียน");
    return;
  }

  if (playerNameInput) playerNameInput.value = playerName;

  const playerNameKey = playerName.toLowerCase();

  const roomRef = ref(db, `rooms/${roomCode}`);
  const snap = await get(roomRef);

  if (!snap.exists()) {
    alert("ไม่พบห้องนี้ กรุณาตรวจสอบ Room Code");
    return;
  }

  const roomData = snap.val();
  const players = roomData.players || {};

  // กันชื่อซ้ำกับ host (case-insensitive)
  const hostNameKey = normalizeName(roomData.hostName).toLowerCase();
  if (hostNameKey && hostNameKey === playerNameKey) {
    alert("ชื่อนี้ซ้ำกับชื่อ Host กรุณาใช้ชื่ออื่น");
    return;
  }

  // หา player เดิมด้วยชื่อ (case-insensitive)
  let existingPid = null;
  for (const [pid, p] of Object.entries(players)) {
    const existingNameKey = normalizeName(p.name).toLowerCase();
    if (existingNameKey === playerNameKey) {
      existingPid = pid;
      break;
    }
  }

  // เกมเริ่มแล้วไหม (กัน join เพิ่มกลางเกม)
  const started =
    roomData.status !== STATUS.LOBBY || (roomData.currentRound || 0) > 0;

  // ✅ NEW RULE:
  // - ถ้ายังไม่เริ่มเกม (lobby) แล้วชื่อซ้ำ (confirm case-insensitive) => ถือว่าซ้ำ "ห้าม join" (ไม่ rejoin)
  if (!started && existingPid) {
    alert("มีผู้เล่นใช้ชื่อนี้ในห้องแล้ว (ไม่สนตัวพิมพ์เล็ก/ใหญ่) กรุณาใช้ชื่ออื่น");
    return;
  }

  // ✅ ถ้าเริ่มเกมแล้ว: อนุญาตเฉพาะ rejoin (ต้องมีชื่อเดิม)
  if (started && !existingPid) {
    alert("ห้องนี้เริ่มเกมแล้ว ไม่สามารถ Join เพิ่มได้");
    return;
  }

  // ✅ rejoin: ทำได้เฉพาะตอน started=true และมี existingPid
  if (started && existingPid) {
    // ✅ ถ้าพบชื่อเดิม แต่เจ้าของชื่อยัง connected อยู่ -> ห้ามแย่ง rejoin
    const existingPlayer = players?.[existingPid] || null;
    if (existingPlayer && existingPlayer.connected !== false) {
      alert("ชื่อนี้กำลังออนไลน์อยู่ในห้องแล้ว กรุณาใช้ชื่อของตนเอง (หรือแจ้งครูหากเป็นชื่อซ้ำ)");
      return;
    }

    currentRoomCode = roomCode;
    currentRole = "player";
    currentPlayerId = existingPid;

    try {
      await update(ref(db, `rooms/${roomCode}/players/${existingPid}`), {
        connected: true,
        lastSeen: Date.now(),
        disconnectedAt: null,
      });

      setupPlayerOnDisconnect(roomCode, existingPid);

      enterLobbyView();
      subscribeRoom(roomCode);
      lockEntryUIForRole("player");
      saveSession();

      alert(`กลับเข้าห้องสำเร็จ! คุณอยู่ในห้อง ${roomCode}`);
    } catch (err) {
      console.error("Error rejoining room:", err);
      alert("กลับเข้าห้องไม่สำเร็จ ดู error ใน Console");
    }
    return;
  }

  // ✅ join ใหม่ (เฉพาะ lobby และชื่อไม่ซ้ำ)
  const playerId = createId("p");

  currentRoomCode = roomCode;
  currentRole = "player";
  currentPlayerId = playerId;

  try {
    await set(ref(db, `rooms/${roomCode}/players/${playerId}`), {
      name: playerName,
      color: pickColorAvoidDuplicate(roomData.players || {}),
      position: 1,
      lastRoll: null,
      hasRolled: false,
      answered: false,
      answer: null,
      lastAnswerCorrect: null,
      joinedAt: Date.now(),
      finished: false,
      finishedRound: null,
      finishedBy: null,
      startOfRoundPos: 1,

      connected: true,
      lastSeen: Date.now(),
      disconnectedAt: null,
      missedRollRound: null,
    });

    setupPlayerOnDisconnect(roomCode, playerId);

    enterLobbyView();
    subscribeRoom(roomCode);
    lockEntryUIForRole("player");
    saveSession();

    alert(`เข้าห้องสำเร็จ! คุณอยู่ในห้อง ${roomCode}`);
  } catch (err) {
    console.error("Error joining room:", err);
    alert("มีปัญหาในการ Join ห้อง ดู error ใน Console");
  }
});

// Player: Roll Dice (Transaction-safe)
rollDiceBtn?.addEventListener("click", async () => {
  if (currentRole !== "player" || !currentRoomCode || !currentPlayerId) return;
  if (rollPending) return;

  // Hide hint immediately when dice is clicked
  diceRollHintEl?.classList.remove("show");

  rollPending = true;
  rollDiceBtn.disabled = true;

  const roomRef = ref(db, `rooms/${currentRoomCode}`);

  try {
    const snap = await get(roomRef);
    if (!snap.exists()) {
      rollPending = false;
      rollDiceBtn.disabled = false;
      return;
    }

    const roomData = snap.val();
    if (roomData.phase !== PHASE.ROLLING) {
      rollPending = false;
      rollDiceBtn.disabled = false;
      alert("ตอนนี้ยังไม่ใช่ช่วงทอยลูกเต๋า (รอครูเริ่มรอบ)");
      return;
    }

    const me = roomData.players?.[currentPlayerId];
    if (!me) {
      rollPending = false;
      rollDiceBtn.disabled = false;
      alert("ไม่พบข้อมูลผู้เล่นของคุณในห้อง");
      return;
    }

    const pos = me.position || 1;
    if (me.finished || pos >= BOARD_SIZE) {
      rollPending = false;
      rollDiceBtn.disabled = false;
      alert("คุณเข้าเส้นชัยแล้ว ไม่ต้องทอยลูกเต๋า");
      return;
    }

    if (me.hasRolled) {
      rollPending = false;
      rollDiceBtn.disabled = false;
      return;
    }

    // ✅ เปลี่ยน state เป็น rolling และลูกเต๋าจะแสดง (ผ่าน dice controller)
    const roll = await dice.rollWithOverlay(5000);

    // ✅ committing
    dice.setState("committing", roll, `ได้แต้ม: ${roll} (กำลังบันทึกผล…)`);

    const ok = await finalizeRollTransaction(roll);
    if (!ok) {
      dice.setState("done", roll, "บันทึกผลไม่สำเร็จ (สถานะห้องเปลี่ยน) ลองกดทอยใหม่หรือรอ Host");
      rollPending = false;
      rollDiceBtn.disabled = false;
      return;
    }

    // ✅ done
    dice.setState("done", roll, `ได้แต้ม: ${roll}`);
    // ปล่อยให้ DB sync มาปลด rollPending ใน updateRoleControls
  } catch (e) {
    console.error(e);

    rollPending = false;

    // ✅ ต้องเรียกผ่าน dice controller
    dice.setState("waiting");

    // กันกรณีปุ่มยัง disable ค้าง
    rollDiceBtn.disabled = false;

    alert("ทอยเต๋าไม่สำเร็จ (เครือข่าย/ระบบมีปัญหา ลองใหม่)");
  }
});

/* =========================
   13) Transactions helpers (finalizeRollTransaction/submitAnswerTx/moveCountdownToAnsweringTx)
========================= */
async function finalizeRollTransaction(roll) {
  const roomRef = ref(db, `rooms/${currentRoomCode}`);
  const now = Date.now();

  const tx = await runTransaction(roomRef, (room) => {
    if (!room) return room;

    if (room.phase !== PHASE.ROLLING) return room;
    if ((room.currentRound || 0) <= 0) return room;

    const players = room.players || {};
    const me = players[currentPlayerId];
    if (!me) return room;

    const pos = clampPos(me.position);
    const finished = !!me.finished || pos >= BOARD_SIZE;
    if (finished) return room;
    if (me.hasRolled) return room;

    const startPos = pos;
    const newPos = clampPos(startPos + roll);

    me.lastRoll = roll;
    me.position = newPos;
    me.hasRolled = true;

    if (newPos >= BOARD_SIZE) {
      me.finished = true;
      me.finishedRound = room.currentRound || 0;
      me.finishedBy = "dice";
    }

    // ✅ เขียน me กลับเข้าห้อง "ก่อน" ตรวจจบเกม
    players[currentPlayerId] = me;
    room.players = players;

    // history diceMoves
    const r = room.currentRound || 0;
    room.history = room.history || {};
    const roundKey = `round_${r}`;
    room.history[roundKey] = room.history[roundKey] || {};
    room.history[roundKey].diceMoves = room.history[roundKey].diceMoves || {};
    room.history[roundKey].diceMoves[currentPlayerId] = {
      playerId: currentPlayerId,
      playerName: me.name || "",
      fromPosition: startPos,
      toPosition: newPos,
      diceRoll: roll,
      pathCells: getPathCells(startPos, newPos),
      timestamp: now,
    };

    // winners
    room.winners = Array.isArray(room.winners) ? room.winners : [];
    const winnerIds = new Set(room.winners.map((w) => w.playerId));
    if (newPos >= BOARD_SIZE && !winnerIds.has(currentPlayerId)) {
      room.winners.push({
        playerId: currentPlayerId,
        playerName: me.name || currentPlayerId,
        finishedRound: r,
        rank: room.winners.length + 1,
      });
    }

    // ✅ ตรวจจบเกม
    const gs = room.gameSettings || {};
    const maxWinners = Math.max(1, gs.maxWinners ?? 5);
    const totalPlayers = Object.keys(players).length;
    const targetWinners = Math.min(maxWinners, totalPlayers);

    const finishedCount = Object.values(players).filter(
      (p) => p.finished || clampPos(p.position) >= BOARD_SIZE
    ).length;

    if (room.winners.length >= targetWinners || finishedCount === totalPlayers) {
      room.phase = PHASE.ENDED;
      room.status = STATUS.FINISHED;

      room.endInfo = {
        endedAt: now,
        endReason: "winners",
        maxRounds: gs.maxRounds ?? 10,
        maxWinners,
        winnerCount: room.winners.length,
      };

      // ✅ snapshot ตอนจบเกม (ครั้งเดียว) จาก room.players ที่อัปเดตแล้ว
      if (!room.finalPlayers) {
        const clonePlayers = (obj) => {
          try { return structuredClone(obj); }
          catch { return JSON.parse(JSON.stringify(obj)); }
        };

        room.finalPlayers = clonePlayers(room.players || {});
        room.finalWinners = Array.isArray(room.winners) ? room.winners.slice() : [];
      }
    }

    return room;
  });

  return !!tx.committed;
}

// Player: Submit Answer (Transaction-safe)
async function submitAnswerTx(optionKey) {
  if (currentRole !== "player" || !currentRoomCode || !currentPlayerId) return;
  if (answerPending) return;

  answerPending = true;

  const roomRef = ref(db, `rooms/${currentRoomCode}`);
  const now = Date.now();

  try {
    const tx = await runTransaction(roomRef, (room) => {
      if (!room) return;
      if (room.phase !== PHASE.ANSWERING) return;

      const startAt = room.answerStartAt;
      const duration = room.answerTimeSeconds;

      if (!Number.isFinite(startAt) || !Number.isFinite(duration)) return;

      const expired = now > startAt + duration * 1000;

      if (room.answerDeadlineExpired === true || expired) {
        room.answerDeadlineExpired = true;
        return room;
      }

      const players = room.players || {};
      const me = players[currentPlayerId];
      if (!me) return;

      const pos = clampPos(me.position);
      if (me.finished || pos >= BOARD_SIZE) return;

      me.answer = optionKey;
      me.answered = true;
      me.answerUpdatedAt = now;

      players[currentPlayerId] = me;
      room.players = players;

      return room;
    });

    if (!tx.committed) {
      const snap = await get(roomRef);
      if (!snap.exists()) {
        alert("ส่งคำตอบไม่สำเร็จ (ไม่พบห้องแล้ว)");
        return;
      }

      const room = snap.val();
      if (room.phase !== PHASE.ANSWERING) {
        alert("ส่งคำตอบไม่สำเร็จ (ยังไม่ใช่ช่วงตอบคำถาม)");
        return;
      }

      const me = room.players?.[currentPlayerId];
      if (!me) {
        alert("ส่งคำตอบไม่สำเร็จ (ไม่พบข้อมูลผู้เล่น)");
        return;
      }

      if (room.answerDeadlineExpired === true) {
        alert("ส่งคำตอบไม่สำเร็จ (หมดเวลาแล้ว)");
        return;
      }

      const startAt = room.answerStartAt;
      const duration = room.answerTimeSeconds;
      if (!Number.isFinite(startAt) || !Number.isFinite(duration)) {
        alert("ส่งคำตอบไม่สำเร็จ (ระบบยังไม่เริ่มจับเวลา)");
        return;
      }

      alert("ส่งคำตอบไม่สำเร็จ (ลองใหม่)");
      return;
    }

    const after = tx.snapshot?.val?.() || null;
    const meAfter = after?.players?.[currentPlayerId] || null;

    if (after?.answerDeadlineExpired === true) {
      alert("ส่งคำตอบไม่สำเร็จ (หมดเวลาแล้ว)");
      return;
    }

    if (!meAfter || meAfter.answered !== true || meAfter.answer !== optionKey) {
      alert("ส่งคำตอบไม่สำเร็จ (ลองใหม่)");
      return;
    }
  } catch (e) {
    console.error("submitAnswerTx failed:", e);
    alert("ส่งคำตอบไม่สำเร็จ (เครือข่าย/ระบบมีปัญหา ลองใหม่)");
  } finally {
    answerPending = false;
  }
}

async function moveCountdownToAnsweringTx() {
  if (!currentRoomCode) return;

  const roomRef = ref(db, `rooms/${currentRoomCode}`);
  const now = Date.now();

  await runTransaction(roomRef, (room) => {
    if (!room) return room;
    if (room.phase !== PHASE.QUESTION_COUNTDOWN) return; // ถ้าเลยไปแล้ว ไม่ต้องทำอะไร

    room.phase = PHASE.ANSWERING;
    room.answerStartAt = now;
    room.answerDeadlineExpired = false;

    return room;
  });
}

async function markAnswerDeadlineExpiredTx() {
  if (!currentRoomCode) return;

  const roomRef = ref(db, `rooms/${currentRoomCode}`);
  const now = Date.now();

  await runTransaction(roomRef, (room) => {
    if (!room) return room;
    if (room.phase !== PHASE.ANSWERING) return room;

    const round = room.currentRound || 0;
    if (round <= 0) return room;

    // ✅ กันทำซ้ำ
    if (room.answerDeadlineExpired === true) return room;

    room.answerDeadlineExpired = true;
    room.answerDeadlineExpiredAt = now;

    const players = room.players || {};
    for (const [pid, p] of Object.entries(players)) {
      const pos = clampPos(p.position);
      const finished = !!p.finished || pos >= BOARD_SIZE;

      // ✅ เฉพาะคนที่ยังเล่นอยู่ + หลุดตอนหมดเวลา + ยังไม่ตอบ
      if (!finished && p.connected === false && p.answered !== true) {
        p.missedAnswerRound = round;  // ✅ ล็อกว่า missed รอบนี้
        p.missedAnswerAt = now;
        players[pid] = p;
      }
    }
    room.players = players;

    return room;
  });
}

/* =========================
   14) UI render (updateGameView/updateRoleControls/updateQuestionUI
                 renderChoicesForPhase/renderPlayerList/renderBoard/renderEndGameSummary)
========================= */
function updateGameView(roomData, players) {
  const round = roomData.currentRound || 0;
  const phase = roomData.phase || PHASE.IDLE;
  const deadlineExpired = roomData.answerDeadlineExpired === true;

  const status = roomData.status || STATUS.LOBBY;
  const ended = phase === PHASE.ENDED || status === STATUS.FINISHED;

  // ✅ ใช้ finalPlayers เมื่อเกมจบ (ถ้ามี) เพื่อให้ view คงอยู่แม้ player ออกจากห้อง
  const viewPlayers =
    ended && roomData.finalPlayers && typeof roomData.finalPlayers === "object"
      ? roomData.finalPlayers
      : (players || {});

  const showGameArea = status === STATUS.IN_GAME || round > 0 || phase === PHASE.ENDED;

  if (gameAreaEl) gameAreaEl.style.display = showGameArea ? "block" : "none";

  const gameBarEl = document.getElementById("gameBar");
  if (gameBarEl) gameBarEl.style.display = showGameArea ? "flex" : "none";

  if (roundInfoEl) {
    if (round > 0) roundInfoEl.textContent = `รอบที่: ${round}`;
    else if (status === STATUS.IN_GAME) roundInfoEl.textContent = `รอบที่: -`;
    else roundInfoEl.textContent = "ยังไม่ได้เริ่มรอบ";
  }

  let phaseText = "";
  switch (phase) {
    case PHASE.ROLLING:
      phaseText = "กำลังทอยลูกเต๋า";
      break;
    case PHASE.QUESTION_COUNTDOWN:
      phaseText = "เตรียมคำถาม";
      break;
    case PHASE.ANSWERING:
      phaseText = "กำลังตอบคำถาม";
      break;
    case PHASE.RESULT:
      phaseText = "สรุปผลคำถามรอบนี้";
      break;
    case PHASE.ENDED:
      phaseText = "เกมจบแล้ว";
      break;
    default:
      phaseText = "รอ Host เริ่มรอบใหม่";
  }

  // ✅ hostSuffix ควรอิง players จริงระหว่างเล่น
  // แต่ถ้า ended แล้ว จะไม่ต้องโชว์ suffix ก็ได้ (หรือคำนวณจาก viewPlayers ก็ได้)
  let hostSuffix = "";
  if (currentRole === "host" && !ended) {
    const playerList = Object.values(players || {});
    const activePlayers = playerList.filter((p) => !p.finished && (p.position || 1) < BOARD_SIZE);
    const totalActive = activePlayers.length;

    if (phase === PHASE.ROLLING) {
      const rolledActive = activePlayers.filter((p) => !!p.hasRolled).length;
      hostSuffix = ` | ทอยแล้ว ${rolledActive}/${totalActive} คน`;
    } else if (phase === PHASE.ANSWERING) {
      const answeredActive = activePlayers.filter((p) => !!p.answered).length;
      hostSuffix = ` | ตอบแล้ว ${answeredActive}/${totalActive} คน`;
      if (deadlineExpired) hostSuffix += " | หมดเวลาแล้ว";
    }
  }

  if (phaseInfoEl) {
    phaseInfoEl.textContent = round > 0 ? `[สถานะรอบ: ${phaseText}${hostSuffix}]` : "";
  }

  // ✅ ใช้ viewPlayers ทั้งกระดาน + ปุ่ม/คำถามยังใช้ players จริงได้
  // แต่เพื่อความสอดคล้อง UI ตอนจบเกม: renderBoard/renderEndGameSummary ใช้ viewPlayers
  renderBoard(roomData, viewPlayers);
  updateRoleControls(roomData, players);   // controls ใช้ state จริง
  updateQuestionUI(roomData, players);     // question UI ใช้ state จริง

  const lobbyEl = document.getElementById("lobby");
  const hostEl = document.getElementById("lobbyCardHost");

  if (ended) {
    // ✅ เกมจบ: ซ่อนทั้ง host และ lobby (ไม่ต้องย้ายการ์ดกลับ)
    if (hostEl) hostEl.style.display = "none";
    if (lobbyEl) lobbyEl.style.display = "none";
    document.body.classList.remove("in-game");
  } else if (showGameArea) {
    // ✅ กำลังเล่น: โชว์ host และย้ายการ์ดไปอยู่ใต้กระดาน
    if (hostEl) hostEl.style.display = "block";
    enterInGameLayout();
  } else {
    // ✅ ยังไม่เริ่ม: ซ่อน host (กันค้าง)
    if (hostEl) hostEl.style.display = "none";
  }

  if (endGameAreaEl) endGameAreaEl.style.display = ended ? "block" : "none";
  if (ended) renderEndGameSummary(roomData, viewPlayers);
}

function updateRoleControls(roomData, players) {
  const phase = roomData.phase || PHASE.IDLE;
  const ended = phase === PHASE.ENDED;

  // ✅ ย้ายไปใช้ controller แทนตัวแปร global
  // ถ้า dice ยังไม่ถูกสร้าง (กันพัง) ให้ถือว่า hidden
  const overlayState = (dice && typeof dice.getState === "function")
    ? dice.getState()
    : "hidden";

  if (hostGameControlsEl) {
    hostGameControlsEl.style.display = currentRole === "host" ? "flex" : "none";
    hostGameControlsEl.style.visibility = "visible";
    hostGameControlsEl.style.pointerEvents = currentRole === "host" ? "auto" : "none";
  }

  if (playerGameControlsEl) {
    playerGameControlsEl.style.display = currentRole === "player" ? "flex" : "none";
    playerGameControlsEl.style.visibility = "visible";
    playerGameControlsEl.style.pointerEvents = currentRole === "player" ? "auto" : "none";
  }

  if (currentRole === "player") {
    const me = (players && currentPlayerId && players[currentPlayerId]) || {};
    const pos = me.position || 1;
    const finished = !!me.finished || pos >= BOARD_SIZE;
    const rolled = !!me.hasRolled;

    if (rollPending && (rolled || roomData.phase !== PHASE.ROLLING || finished)) {
      rollPending = false;
      if (rollDiceBtn) rollDiceBtn.textContent = "ทอยลูกเต๋า";
    }

    const rolledOrPending = rolled || rollPending;
    const canRoll = roomData.phase === PHASE.ROLLING && !rolledOrPending && !finished;

    // แสดง overlay เฉพาะตอน ROLLING และยังไม่ทอย
    if (roomData.phase === PHASE.ROLLING && !finished && !rolled && overlayState === "hidden") {
      dice?.setState?.("waiting");
    } else if (roomData.phase !== PHASE.ROLLING || finished) {
      if (overlayState !== "hidden") dice?.setState?.("hidden");
    }

    // ปุ่มทอย: enable/disable เฉพาะตอน overlayState=waiting
    // (หมายเหตุ: setState("waiting") จะ enable ให้แล้ว แต่กันเหนียวไว้)
    if (rollDiceBtn && overlayState === "waiting") {
      rollDiceBtn.disabled = !canRoll;
    }
  } else {
    // Host: ซ่อน overlay ถ้ายังแสดงอยู่
    if (overlayState !== "hidden") dice?.setState?.("hidden");
  }

  if (currentRole === "host") {
    const list = Object.values(players || {});
    const activePlayers = list.filter((p) => {
      const pos = clampPos(p.position);
      const isActive = !p.finished && pos < BOARD_SIZE;
      const isConnected = (p.connected !== false); // undefined ถือว่า connected
      return isActive && isConnected;
    });
    
    const totalActive = activePlayers.length;
    const rolledActive = activePlayers.filter((p) => p.hasRolled).length;    

    // 1) startRound
    if (startRoundBtn) {
      startRoundBtn.style.display = ended ? "none" : "inline-flex";
      startRoundBtn.disabled = ended;
    }

    // 2) ปุ่มกลาง: สลับทันที ไม่มีช่วงหาย
    const inCountdown = phase === PHASE.QUESTION_COUNTDOWN;
    const inAnswering = phase === PHASE.ANSWERING;

    const showToggle = !ended && (inCountdown || inAnswering);
    const showStartQuestion = !ended && !showToggle; // = ROLLING หรือ RESULT

    if (startQuestionBtn) {
      startQuestionBtn.style.display = showStartQuestion ? "inline-block" : "none";

      const canStartQuestion =
        phase === PHASE.ROLLING && (totalActive === 0 || rolledActive === totalActive);

      startQuestionBtn.disabled = !canStartQuestion;
    }

    if (toggleQuestionOverlayBtn) {
      toggleQuestionOverlayBtn.style.display = showToggle ? "inline-block" : "none";

      // ✅ NEW: ตอน QUESTION_COUNTDOWN ให้เห็นปุ่มแต่กดไม่ได้
      toggleQuestionOverlayBtn.disabled = inCountdown;

      // reset สถานะเมื่อหลุดจากโหมดที่โชว์ toggle (กันค้าง)
      if (!showToggle) hostQuestionOverlayHidden = false;

      toggleQuestionOverlayBtn.textContent =
        hostQuestionOverlayHidden ? "แสดงคำถาม" : "ซ่อนคำถาม";
    }

    // 3) reveal
    if (revealAnswerBtn) {
      revealAnswerBtn.style.display = ended ? "none" : "inline-block";
      revealAnswerBtn.disabled = phase !== PHASE.ANSWERING;
    }
  } else {
    // ✅ ไม่ใช่ host: ซ่อนปุ่ม host ทั้งหมดให้ชัด
    if (startRoundBtn) startRoundBtn.style.display = "none";
    if (startQuestionBtn) startQuestionBtn.style.display = "none";
    if (revealAnswerBtn) revealAnswerBtn.style.display = "none";

    if (startRoundBtn) startRoundBtn.disabled = true;
  }
}

function updateQuestionUI(roomData, players) {
  const phase = roomData.phase || PHASE.IDLE;
  const round = roomData.currentRound || 0;

  const ui = roomData.ui || {};
  const keepOnEnd = phase === PHASE.ENDED && ui.keepQuestionOnEnd === true;

  // เลือก "ข้อ" ที่จะโชว์:
  // - ปกติ: ใช้ roomData.questionIndex
  // - เกมจบและต้องค้าง: ใช้ ui.keepQuestionIndex (fallback ไป roomData.questionIndex)
  const questionIndex =
    keepOnEnd ? (ui.keepQuestionIndex ?? roomData.questionIndex) : roomData.questionIndex;

  const question =
    questionIndex != null ? getQuestionFromRoom(roomData, questionIndex) : null;

  // ถ้ายังไม่เริ่มเกม
  if (round === 0) {
    if (questionAreaOverlayEl) questionAreaOverlayEl.style.display = "none";
    if (countdownDisplayEl) countdownDisplayEl.textContent = "";
    if (questionCountdownOverlayEl) questionCountdownOverlayEl.style.display = "none";
    if (closeQuestionAreaBtn) closeQuestionAreaBtn.style.display = "none";
    clearTimer();
    return;
  }

  // =========================
  // ✅ NEW: เกมจบแต่ต้องการ "ค้างหน้าเฉลย"
  // + ✅ FIX: ถ้าผู้ใช้กดปิดไปแล้ว จะไม่เปิดเด้งกลับมา
  // =========================
  if (keepOnEnd && question) {
    const showRound = ui.keepQuestionRound ?? round;
    const showQIndex = ui.keepQuestionIndex ?? roomData.questionIndex;

    // สร้าง key เพื่อรีเซ็ต dismissed เมื่อเป็นคนละรอบ/คนละข้อ/คนละห้อง
    const nextKey = `${currentRoomCode || "-"}|${showRound}|${showQIndex}`;
    if (endQuestionKey !== nextKey) {
      endQuestionKey = nextKey;
      endQuestionDismissed = false; // เปลี่ยนเฉลยที่ค้าง -> ให้แสดงได้ใหม่
    }

    // ถ้าผู้ใช้ปิดแล้ว ให้ค้างเป็น "ปิด" ไม่เด้งกลับ
    if (endQuestionDismissed) {
      if (questionAreaOverlayEl) questionAreaOverlayEl.style.display = "none";
      if (closeQuestionAreaBtn) closeQuestionAreaBtn.style.display = "none";
      clearTimer();
      return;
    }

    // แสดง overlay ค้างเฉลย
    if (questionAreaOverlayEl) questionAreaOverlayEl.style.display = "flex";
    if (questionTextEl) questionTextEl.textContent = question.text;

    if (countdownDisplayEl) countdownDisplayEl.textContent = `เฉลยรอบที่ ${showRound}:`;

    // ดึง selectedOption ของตัวเองให้แม่นขึ้นจาก history (เผื่อ player ถูก remove แล้ว players ไม่มี)
    let selectedOption = null;
    if (currentPlayerId) {
      const hk = `round_${showRound}`;
      const rec = roomData.history?.[hk]?.answers?.[currentPlayerId] || null;
      selectedOption = rec
        ? (rec.selectedOption ?? null)
        : (players?.[currentPlayerId]?.answer ?? null);
    }

    renderChoicesForPhase(question, selectedOption, question.correctOption, true, true);

    // ให้ปิดได้ (local)
    if (closeQuestionAreaBtn) closeQuestionAreaBtn.style.display = "inline-flex";

    clearTimer();
    return;
  }

  // เดิม: ตอนนับถอยหลัง ใช้ countdown overlay แทน question area
  if (phase === PHASE.QUESTION_COUNTDOWN) {
    if (questionAreaOverlayEl) questionAreaOverlayEl.style.display = "none";
    if (questionTextEl) questionTextEl.textContent = "";
    if (choicesContainerEl) choicesContainerEl.innerHTML = "";
    if (closeQuestionAreaBtn) closeQuestionAreaBtn.style.display = "none";
    ensureTimer(roomData, PHASE.QUESTION_COUNTDOWN);
    return;
  }

  // เดิม: ช่วงตอบ
  if (phase === PHASE.ANSWERING && question) {
    const shouldShow = !(currentRole === "host" && hostQuestionOverlayHidden);
    if (questionAreaOverlayEl) questionAreaOverlayEl.style.display = shouldShow ? "flex" : "none";
    if (questionTextEl) questionTextEl.textContent = question.text;

    // ซ่อนปุ่ม close เมื่อกำลังตอบ
    if (closeQuestionAreaBtn) closeQuestionAreaBtn.style.display = "none";

    const me = players?.[currentPlayerId] || {};
    const selectedOption = me.answer || null;

    const startAt = roomData.answerStartAt;
    const duration = roomData.answerTimeSeconds;

    // fallback: answering แต่ยังไม่มีเวลาเริ่ม
    if (!Number.isFinite(startAt)) {
      if (countdownDisplayEl) countdownDisplayEl.textContent = "กำลังซิงค์เวลาเริ่ม…";
      if (currentRoomCode) moveCountdownToAnsweringTx().catch(() => {});
      renderChoicesForPhase(question, selectedOption, question.correctOption, false, true);
      clearTimer();
      return;
    }

    const now = Date.now();
    const computedExpired = Number.isFinite(duration) ? now > startAt + duration * 1000 : false;

    const deadlineExpired = roomData.answerDeadlineExpired === true || computedExpired;
    const disableButtons = deadlineExpired || !!me.finished;

    renderChoicesForPhase(question, selectedOption, question.correctOption, false, disableButtons);
    ensureTimer(roomData, PHASE.ANSWERING);
    return;
  }

  if (phase === PHASE.RESULT && question) {
    // สร้าง key เพื่อรีเซ็ตเมื่อเป็น "คนละรอบ/คนละข้อ/คนละห้อง"
    const showQIndex = roomData.questionIndex;
    const nextKey = `${currentRoomCode || "-"}|${round}|${showQIndex}`;
  
    if (resultQuestionKey !== nextKey) {
      resultQuestionKey = nextKey;
      resultQuestionDismissed = false; // เปลี่ยนรอบ/ข้อ -> ให้แสดงใหม่ได้
    }
  
    // ถ้าผู้ใช้ปิดแล้ว -> อย่าเด้งกลับ
    if (resultQuestionDismissed) {
      if (questionAreaOverlayEl) questionAreaOverlayEl.style.display = "none";
      if (closeQuestionAreaBtn) closeQuestionAreaBtn.style.display = "none";
      clearTimer();
      return;
    }
  
    if (questionAreaOverlayEl) questionAreaOverlayEl.style.display = "flex";
    if (questionTextEl) questionTextEl.textContent = question.text;
    if (countdownDisplayEl) countdownDisplayEl.textContent = `เฉลยรอบที่ ${round}:`;
  
    let selectedOption = null;
    if (currentRole === "player") {
      const me = players?.[currentPlayerId] || {};
      selectedOption = me.answer || null;
    }
  
    renderChoicesForPhase(question, selectedOption, question.correctOption, true, true);
  
    if (closeQuestionAreaBtn) closeQuestionAreaBtn.style.display = "inline-flex";
  
    clearTimer();
    return;
  }  

  // fallback: ซ่อนทุกอย่าง
  if (closeQuestionAreaBtn) closeQuestionAreaBtn.style.display = "none";
  if (questionAreaOverlayEl) questionAreaOverlayEl.style.display = "none";
  if (countdownDisplayEl) countdownDisplayEl.textContent = "";
  if (questionCountdownOverlayEl) questionCountdownOverlayEl.style.display = "none";
  clearTimer();
}

function renderChoicesForPhase(question, selectedOption, correctOption, showResultOnly, disableAnswerButtons = false) {
  if (!choicesContainerEl) return;

  choicesContainerEl.innerHTML = "";
  if (!question) return;

  for (const [key, text] of Object.entries(question.choices)) {
    const btn = document.createElement("button");
    btn.classList.add("choice-btn");
    btn.textContent = `${key}. ${text}`;

    if (showResultOnly) {
      if (key === correctOption) btn.classList.add("correct");
      if (selectedOption && selectedOption === key && selectedOption !== correctOption) btn.classList.add("wrong");
      btn.disabled = true;
    } else {
      if (selectedOption && key === selectedOption) btn.classList.add("selected");
      btn.disabled = disableAnswerButtons;

      if (!disableAnswerButtons && currentRole === "player") {
        btn.addEventListener("click", () => submitAnswerTx(key));
      }
    }

    choicesContainerEl.appendChild(btn);
  }
}

function renderPlayerList(roomData, playersObj) {
  if (!playerListEl) return;

  const players = playersObj || {};
  const entries = Object.entries(players);

  if (entries.length === 0) {
    playerListEl.innerHTML = `<div class="muted">ยังไม่มีผู้เล่นเข้าห้อง</div>`;
    return;
  }

  const history = roomData.history || {};
  const currentRound = Number(roomData.currentRound || 0);
  const roundsToShow = Math.max(0, currentRound);

  const currRoundData = history[`round_${currentRound}`] || {};
  const currDiceMoves = currRoundData.diceMoves || {};
  const currAnswers = currRoundData.answers || {};

  // เตรียม perPlayer
  const perPlayer = {};
  for (const [pid, p] of entries) {
    const pos = clampPos(p.position);
    perPlayer[pid] = {
      id: pid,
      name: normalizeName(p.name || pid),
      position: pos,
      hasRolled: !!p.hasRolled,
      answered: !!p.answered,
      finished: !!p.finished || pos >= BOARD_SIZE,
      finishRound: Number.isFinite(p.finishedRound) ? Number(p.finishedRound) : null,
      connected: (p.connected !== false),

      rollsByRound: Array(roundsToShow).fill(null), // number | "☐" | null
      ansByRound: Array(roundsToShow).fill(null),   // "✅"/"❌"/"⚠️"/"➖" | null
    };
  }

  // เติมผลทอย/ผลคำตอบจาก history ต่อรอบ
  for (let rn = 1; rn <= roundsToShow; rn++) {
    const idx = rn - 1;
    const rd = history[`round_${rn}`] || {};

    const diceMoves = rd.diceMoves || {};
    const answers = rd.answers || {};
    const hasAnswers = rd.answers && Object.keys(rd.answers).length > 0;

    for (const [pid, s] of Object.entries(perPlayer)) {
      // 1) ถ้าเข้าเส้นชัยแล้ว -> รอบถัดไปทั้งหมดเป็น ☐ และ ➖
      if (s.finishRound != null && rn > s.finishRound) {
        s.rollsByRound[idx] = "☐";
        if (hasAnswers) s.ansByRound[idx] = "➖";
        continue;
      }

      // 2) ผลทอย: อ่านจาก diceMoves
      const dm = diceMoves[pid];
      if (dm && dm.diceRoll != null) {
        s.rollsByRound[idx] = Number(dm.diceRoll);
      }

      // 3) ผลคำตอบ: อ่านจาก answers
      const ar = answers[pid];
      if (ar) {
        const basePos = ar.basePosition ?? null;
        const finalPos = ar.finalPosition ?? null;
        const neutralFinishByDice =
          ar.correct == null &&
          ar.answered === false &&
          Number.isFinite(basePos) &&
          Number.isFinite(finalPos) &&
          basePos >= BOARD_SIZE &&
          finalPos >= BOARD_SIZE;

        if (neutralFinishByDice) {
          if (hasAnswers) s.ansByRound[idx] = "➖";
        } else {
          // PRIORITY 1: missed (หลุด/กลับมาหลังหมดเวลา) => ⚠️
          if (ar.missedAnswer === true) {
            s.ansByRound[idx] = "⚠️";
          }
          // PRIORITY 2: ไม่ตอบ/หมดเวลา (แต่ไม่ได้ missed) => ❌
          else if (ar.answered === false && ar.selectedOption == null) {
            s.ansByRound[idx] = "❌";
          }
          // PRIORITY 3: ตอบแล้ว => ✅/❌
          else {
            s.ansByRound[idx] = (ar.correct === true) ? "✅" : "❌";
          }
        }
      }
    }
  }

  // แปลงเป็นข้อความ
  const rollsToText = (arr) => {
    const out = arr
      .map((v) => {
        if (v === "☐") return "☐";
        if (Number.isFinite(v)) {
          if (v === 0) return "☐";
          return diceToGlyph(v);
        }
        return "";
      })
      .join("");
    return out || "-";
  };

  const ansToText = (arr) => {
    const out = arr.map((v) => (v ? v : "")).join("");
    return out || "-";
  };

  const list = Object.values(perPlayer).sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || ""))
  );

  let html = `
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th class="name-col">รายชื่อผู้เล่น</th>
          <th>ตำแหน่ง</th>
          <th>ทอยแล้ว</th>
          <th>ตอบแล้ว</th>
          <th>ผลทอย</th>
          <th>ผลคำตอบ</th>
          <th>สถานะผู้เล่น</th>
        </tr>
      </thead>
      <tbody>
  `;

  list.forEach((s, index) => {
    // --- สรุปรอบปัจจุบันจาก HISTORY เป็นหลัก ---
    const dm = currDiceMoves[s.id] || null;
    const ar = currAnswers[s.id] || null;

    // ทอยเองจริง ๆ = มี diceRoll และไม่ได้ถูก auto-skip (missed=true) และแต้มไม่ใช่ 0
    const rolledByMeThisRound =
      !!dm &&
      dm.diceRoll != null &&
      dm.missed !== true &&
      Number(dm.diceRoll) > 0;

    // ตอบแล้วจริง ๆ ในรอบนี้:
    // - ถ้ามี record ใน history แปลว่า host เฉลยแล้ว -> ใช้ answered/selectedOption ใน record
    // - ถ้ายังไม่มี record (ยังไม่เฉลย) -> ใช้ state realtime (p.answered)
    const answeredByMeThisRound =
      ar
        ? (ar.answered === true && ar.selectedOption != null)
        : !!s.answered;

    // --- ไอคอนตาม requirement ---
    // ถ้าหลุด:
    // - ยังไม่ทอย -> ⚠️ , ถ้าทอยแล้ว -> 🎲
    // - ยังไม่ตอบ -> ⚠️ , ถ้าตอบแล้ว -> ✔️
    // ถ้ายังอยู่:
    // - ยังไม่ทำ -> "-"
    const rollIcon = rolledByMeThisRound ? "🎲" : (s.connected ? "-" : "⚠️");
    const ansIcon  = answeredByMeThisRound ? "✔️" : (s.connected ? "-" : "⚠️");

    const rollsText = rollsToText(s.rollsByRound);
    const ansText = ansToText(s.ansByRound);

    html += `
      <tr>
        <td>${index + 1}</td>
        <td class="name-col">${escapeHtml(normalizeName(s.name))}</td>
        <td>${s.position}</td>
        <td>${rollIcon}</td>
        <td>${ansIcon}</td>
        <td class="rolls-col"><span class="rolls-text">${escapeHtml(rollsText)}</span></td>
        <td>${ansText}</td>
        <td>${s.finished ? "🏁 เข้าเส้นชัย" : "-"}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  playerListEl.innerHTML = html;
}

function renderBoard(roomData, players) {
  if (!boardEl) return;

  const currentRound = roomData.currentRound || 0;
  const history = roomData.history || {};

  boardEl.innerHTML = "";

  // ===== Label row =====
  const labelRow = document.createElement("div");
  labelRow.className = "board-label-row";

  const labelTrack = document.createElement("div");
  labelTrack.className = "board-track";

  const startLabelCell = document.createElement("div");
  startLabelCell.className = "cell-card start-cell";
  startLabelCell.innerHTML = `<span class="cell-label">START</span>`;
  labelTrack.appendChild(startLabelCell);

  for (let i = 1; i <= BOARD_SIZE; i++) {
    const c = document.createElement("div");
    c.className = "cell-card play-cell";
    c.innerHTML = `<span class="cell-label">${i}</span>`;
    labelTrack.appendChild(c);
  }

  const finishLabelCell = document.createElement("div");
  finishLabelCell.className = "cell-card finish-cell";
  finishLabelCell.innerHTML = `<span class="cell-label">FINISH</span>`;
  labelTrack.appendChild(finishLabelCell);

  labelRow.appendChild(labelTrack);
  boardEl.appendChild(labelRow);

  // ===== Helper: build per-cell state (past/dice/wrong/correct) =====
  function buildCellStateForPlayer(pid, p) {
    const state = new Array(BOARD_SIZE + 1).fill("none");
    const priority = { none: 0, past: 1, dice: 2, wrong: 3, correct: 4 };

    const setState = (pos, value) => {
      if (pos < 1 || pos > BOARD_SIZE) return;
      if (priority[value] > priority[state[pos]]) state[pos] = value;
    };

    const startOfRound = clampPos(p.startOfRoundPos ?? 1);
    const currentPos = clampPos(p.position);

    for (let pos = 1; pos <= Math.min(startOfRound, BOARD_SIZE); pos++) {
      setState(pos, "past");
    }

    const currKey = `round_${currentRound}`;
    const currRoundData = history[currKey] || {};
    const recNow = (currRoundData.answers || {})[pid] || null;

    if (!recNow) {
      if (p.hasRolled && p.lastRoll != null) {
        const from = startOfRound;
        const to = currentPos;
        if (to >= from) {
          for (let pos = from + 1; pos <= to; pos++) setState(pos, "dice");
        }
      }
    } else {
      const basePos = clampPos(recNow.basePosition ?? startOfRound);
      const finalPos = clampPos(recNow.finalPosition ?? currentPos);

      for (let pos = startOfRound + 1; pos <= basePos; pos++) setState(pos, "dice");

      const moveType = recNow.correct ? "correct" : "wrong";
      const qStart = Math.min(basePos, finalPos);
      const qEnd = Math.max(basePos, finalPos);
      for (let pos = qStart + 1; pos <= qEnd; pos++) setState(pos, moveType);
    }

    return state;
  }

  // ===== Sort players by name =====
  const sorted = Object.entries(players || {}).sort(([, a], [, b]) =>
    String(a.name || "").localeCompare(String(b.name || ""))
  );

  // ===== Player rows =====
  for (const [pid, p] of sorted) {
    const row = document.createElement("div");
    row.className = "player-row";

    const isDisconnected = (p.connected === false);
    if (isDisconnected) row.classList.add("player-disconnected");

    if (currentRole === "player" && currentPlayerId && pid === currentPlayerId) {
      row.classList.add("is-me");
    }

    const track = document.createElement("div");
    track.className = "board-track";

    // START cell (player name)
    const startCell = document.createElement("div");
    startCell.className = "cell-card start-cell";
    if (isDisconnected) startCell.classList.add("cell-disconnected");
    startCell.textContent = p.name || pid;
    track.appendChild(startCell);

    const cellState = buildCellStateForPlayer(pid, p);
    const playerPos = clampPos(p.position);

    // PLAY cells
    for (let pos = 1; pos <= BOARD_SIZE; pos++) {
      const cell = document.createElement("div");
      cell.className = "cell-card play-cell";

      if (isDisconnected) cell.classList.add("cell-disconnected");

      if (cellState[pos] === "past") cell.classList.add("cell-past");
      if (cellState[pos] === "dice") cell.classList.add("cell-dice");
      if (cellState[pos] === "wrong") cell.classList.add("cell-wrong");
      if (cellState[pos] === "correct") cell.classList.add("cell-correct");

      if (playerPos === pos) {
        const token = document.createElement("div");
        token.className = "token";
        token.style.backgroundColor = p.color || "#ffb300";

        const inner = document.createElement("div");
        inner.className = "token-inner";
        inner.textContent = String(p.name || "?").charAt(0);

        token.appendChild(inner);
        cell.appendChild(token);
      }

      track.appendChild(cell);
    }

    // FINISH cell
    const finishCell = document.createElement("div");
    finishCell.className = "cell-card finish-cell";
    if (isDisconnected) finishCell.classList.add("cell-disconnected");
    track.appendChild(finishCell);

    row.appendChild(track);
    boardEl.appendChild(row);
  }
}

function renderEndGameSummary(roomData, players) {
  const history = roomData.history || {};
  const winners = Array.isArray(roomData.winners) ? roomData.winners : [];
  const endInfo = roomData.endInfo || {};
  const gs = roomData.gameSettings || {};
  const maxRounds = gs.maxRounds ?? "-";
  const maxWinners = gs.maxWinners ?? "-";
  const endReason = endInfo.endReason || "unknown";

  let reasonText = "เกมจบแล้ว";
  if (endReason === "winners") {
    reasonText = `เกมจบเพราะมีผู้เข้าเส้นชัยครบ ${Math.min(Number(maxWinners) || 0, Object.keys(players || {}).length)} คน`;
  } else if (endReason === "rounds") {
    reasonText = `เกมจบเพราะเล่นครบ ${maxRounds} รอบแล้ว`;
  }

  const perPlayer = {};
  for (const [pid, p] of Object.entries(players || {})) {
    perPlayer[pid] = {
      id: pid,
      name: p.name || pid,
      finalPosition: p.position ?? 1,
      finished: !!p.finished || (p.position ?? 1) >= BOARD_SIZE,
      finishRound: p.finishedRound ?? null,
      finishBy: p.finishedBy ?? null,
      correct: 0,
      wrong: 0,
      timeout: 0,
      rolls: [],
      answerSymbols: [],
      pctCorrect: 0,
      rank: null,
    };
  }

  const roundKeys = Object.keys(history)
    .filter((k) => k.startsWith("round_"))
    .sort((a, b) => parseInt(a.split("_")[1] || "0", 10) - parseInt(b.split("_")[1] || "0", 10));

    for (const rk of roundKeys) {
      const roundData = history[rk] || {};
      const diceMoves = roundData.diceMoves || {};
      const answers = roundData.answers || {};
      const rn = parseInt(rk.split("_")[1] || "0", 10);
    
      // 1) ✅ อัปเดตจาก "ทอยเต๋า" ก่อน (สำคัญมากสำหรับจบด้วย dice)
      for (const [pid, dm] of Object.entries(diceMoves)) {
        if (!perPlayer[pid]) {
          perPlayer[pid] = {
            id: pid,
            name: dm.playerName || players?.[pid]?.name || pid,
            finalPosition: players?.[pid]?.position ?? 1,
            finished: !!players?.[pid]?.finished || (players?.[pid]?.position ?? 1) >= BOARD_SIZE,
            finishRound: players?.[pid]?.finishedRound ?? null,
            finishBy: players?.[pid]?.finishedBy ?? null,
            correct: 0,
            wrong: 0,
            timeout: 0,
            rolls: [],
            answerSymbols: [],
            pctCorrect: 0,
            rank: null,
          };
        }
    
        const s = perPlayer[pid];
    
        // เก็บผลทอย
        if (dm.diceRoll != null) s.rolls.push(Number(dm.diceRoll));
    
        // ✅ อัปเดตตำแหน่งจากการทอย (ใช้ toPosition)
        const toPos = dm.toPosition;
        if (Number.isFinite(toPos)) s.finalPosition = toPos;
    
        // ✅ ถ้าทอยถึงเส้นชัย ให้ mark การจบด้วย dice
        if (Number.isFinite(toPos) && toPos >= BOARD_SIZE && s.finishRound == null) {
          s.finishRound = rn;
          s.finishBy = "dice";
          s.finished = true;
        }
      }
    
      // 2) อัปเดตจาก "เฉลยคำตอบ" ทีหลัง (ถ้ามี answers)
      for (const [pid, rec] of Object.entries(answers)) {
        if (!perPlayer[pid]) {
          perPlayer[pid] = {
            id: pid,
            name: rec.playerName || pid,
            finalPosition: players?.[pid]?.position ?? 1,
            finished: !!players?.[pid]?.finished || (players?.[pid]?.position ?? 1) >= BOARD_SIZE,
            finishRound: players?.[pid]?.finishedRound ?? null,
            finishBy: players?.[pid]?.finishedBy ?? null,
            correct: 0,
            wrong: 0,
            timeout: 0,
            rolls: [],
            answerSymbols: [],
            pctCorrect: 0,
            rank: null,
          };
        }
    
        const s = perPlayer[pid];
    
        const basePos = rec.basePosition ?? null;
        const finalPos = rec.finalPosition ?? null;
        const neutralFinishByDice =
          rec.correct == null &&
          rec.answered === false &&
          Number.isFinite(basePos) &&
          Number.isFinite(finalPos) &&
          basePos >= BOARD_SIZE &&
          finalPos >= BOARD_SIZE;
    
        if (!neutralFinishByDice) {
          if (rec.correct === true) {
            s.correct += 1;
            s.answerSymbols.push("✅");
          } else {
            if (rec.missedAnswer === true) s.answerSymbols.push("⚠️");
            else s.answerSymbols.push("❌");
    
            if (rec.answered) s.wrong += 1;
            else s.timeout += 1;
          }
        }
    
        // ✅ ตำแหน่งหลังเฉลย (ทับค่าจาก diceMoves ได้ถ้ารอบนั้นมีคำถาม)
        if (Number.isFinite(finalPos)) s.finalPosition = finalPos;
    
        if (Number.isFinite(finalPos) && finalPos >= BOARD_SIZE && s.finishRound == null) {
          s.finishRound = rn;
          s.finishBy = "answer";
          s.finished = true;
        }
      }
    }    

  for (const s of Object.values(perPlayer)) {
    const totalQ = s.correct + s.wrong + s.timeout;
    s.pctCorrect = totalQ > 0 ? (s.correct / totalQ) * 100 : 0;
  }

  const winMap = new Map();
  winners.forEach((w) => winMap.set(w.playerId, w));

  const stats = Object.values(perPlayer);

  stats.sort((a, b) => {
    const wa = winMap.has(a.id) ? (winMap.get(a.id).rank ?? 9999) : 9999;
    const wb = winMap.has(b.id) ? (winMap.get(b.id).rank ?? 9999) : 9999;
    if (wa !== wb) return wa - wb;

    const fa = a.finishRound ?? 9999;
    const fb = b.finishRound ?? 9999;
    if (fa !== fb) return fa - fb;

    if (b.finalPosition !== a.finalPosition) return b.finalPosition - a.finalPosition;
    if (b.pctCorrect !== a.pctCorrect) return b.pctCorrect - a.pctCorrect;
    return (a.name || "").localeCompare(b.name || "");
  });

  stats.forEach((s, i) => (s.rank = i + 1));

  /* =========================================================
     ✅ NEW: สร้าง rollsByRound / ansByRound แบบเดียวกับ renderPlayerList
     + ✅ FIX: กรณีเข้าเส้นชัยด้วยการทอยในรอบเดียวกัน แล้ว host reveal
             ให้แสดง "➖" ในรอบนั้นเอง (rn == finishRound) ด้วย
     ========================================================= */
  const roundsToShow = Math.max(0, Number(roomData.currentRound || roundKeys.length || 0));

  // map pid -> { rollsByRound[], ansByRound[], finishRound, finishBy }
  const perPlayerRounds = {};
  for (const s of stats) {
    perPlayerRounds[s.id] = {
      finishRound: Number.isFinite(s.finishRound) ? Number(s.finishRound) : null,
      finishBy: s.finishBy ?? null,
      rollsByRound: Array(roundsToShow).fill(null), // number | "☐" | null
      ansByRound: Array(roundsToShow).fill(null),   // "✅"/"❌"/"➖" | null
    };
  }

  for (let rn = 1; rn <= roundsToShow; rn++) {
    const idx = rn - 1;
    const rd = history[`round_${rn}`] || {};
    const diceMoves = rd.diceMoves || {};
    const answers = rd.answers || {};

    const hasAnswers = rd.answers && Object.keys(rd.answers).length > 0;

    for (const [pid, rr] of Object.entries(perPlayerRounds)) {
      // 1) ถ้าเข้าเส้นชัยแล้ว -> รอบถัดไปทั้งหมดเป็น ☐ และ ➖
      if (rr.finishRound != null && rn > rr.finishRound) {
        rr.rollsByRound[idx] = "☐";
        if (hasAnswers) rr.ansByRound[idx] = "➖";
        continue;
      }

      // 2) ผลทอย: อ่านจาก diceMoves
      const dm = diceMoves[pid];
      if (dm && dm.diceRoll != null) {
        rr.rollsByRound[idx] = Number(dm.diceRoll);
      }

      // 3) ผลคำตอบ: อ่านจาก answers
      const ar = answers[pid];
      if (ar) {
        const basePos = ar.basePosition ?? null;
        const finalPos = ar.finalPosition ?? null;
        const neutralFinishByDice =
          ar.correct == null &&
          ar.answered === false &&
          Number.isFinite(basePos) &&
          Number.isFinite(finalPos) &&
          basePos >= BOARD_SIZE &&
          finalPos >= BOARD_SIZE;

          if (!neutralFinishByDice) {
            if (ar.missedAnswer === true) {
              rr.ansByRound[idx] = "⚠️";
            } else if (ar.answered === false && ar.selectedOption == null) {
              rr.ansByRound[idx] = "❌";
            } else {
              rr.ansByRound[idx] = (ar.correct === true) ? "✅" : "❌";
            }
          }          
      }

      // ✅ FIX: เข้าเส้นชัยด้วย "ทอยถึง" ในรอบเดียวกัน + มีการเฉลย (answers เกิดแล้ว)
      // ให้ใส่ "➖" ในรอบนั้น (rn == finishRound) ด้วย
      if (
        hasAnswers &&
        rr.finishRound != null &&
        rn === rr.finishRound &&
        rr.finishBy === "dice" &&
        rr.ansByRound[idx] == null
      ) {
        rr.ansByRound[idx] = "➖";
      }
    }
  }

  const rollsToText = (arr) => {
    const out = arr.map((v) => {
      if (v === "☐") return "☐";
      if (Number.isFinite(v)) {
        if (v === 0) return "☐";
        return diceToGlyph(v);
      }
      return "";
    }).join("");
    return out || "-";
  };

  const ansToText = (arr) => {
    const out = arr.map((v) => (v ? v : "")).join("");
    return out || "-";
  };

  /* =========================
     HTML
  ========================= */
  const endGameTitleEl = document.getElementById("endGameTitle");
  if (endGameTitleEl) {
    endGameTitleEl.innerHTML =
      `สรุปผลเกม <span class="muted" style="font-weight:700; color: var(--text);">• ${escapeHtml(reasonText)}</span>`;
  }

  let 
  html = `
    <h4 style="
      margin:15px 0 6px 0;
      padding:0;
      line-height:1.2;
      color: var(--p-800);
    ">
      ตารางอันดับผู้เล่น
    </h4>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th class="name-col">รายชื่อผู้เล่น</th>
          <th>ตำแหน่ง</th>
          <th>เข้าเส้นชัย?</th>
          <th>รอบที่เข้า</th>
          <th>วิธีเข้า</th>
          <th>ผลทอย</th>
          <th>ผลคำตอบ</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const s of stats) {
    const totalQ = s.correct + s.wrong + s.timeout;
    const pctText = totalQ > 0 ? `${Math.round(s.pctCorrect)}%` : "-";

    // ✅ ใช้ชุดข้อมูลแบบ renderPlayerList
    const rr = perPlayerRounds[s.id] || { rollsByRound: [], ansByRound: [] };
    const rollsText = rollsToText(rr.rollsByRound);
    const ansText = ansToText(rr.ansByRound);

    const finishFlag = s.finished ? "🏆" : "-";
    const finishRoundText = s.finishRound != null ? s.finishRound : "-";
    const finishByText = s.finished
      ? (s.finishBy === "dice" ? "🎲" : s.finishBy === "answer" ? "📝" : "✖️")
      : "-";

    html += `
      <tr>
        <td>${s.rank ?? "-"}</td>
        <td class="name-col">${escapeHtml(s.name)}</td>
        <td>${s.finalPosition ?? "-"}</td>
        <td>${finishFlag}</td>
        <td>${finishRoundText}</td>
        <td>${finishByText}</td>
        <td class="rolls-col"><span class="rolls-text">${escapeHtml(rollsText)}</span></td>
        <td>${ansText}</td>
      </tr>
    `;
  }

  html += `</tbody></table>`;
  if (endGameSummaryEl) endGameSummaryEl.innerHTML = html;
}

/* =========================
   15) Timer (ensureTimer/clearTimer)
========================= */
function ensureTimer(roomData, targetPhase) {
  const phase = roomData.phase || PHASE.IDLE;
  const round = roomData.currentRound || 0;

  if (phase !== targetPhase || round === 0) {
    clearTimer();
    if (countdownDisplayEl) countdownDisplayEl.textContent = "";
    if (questionCountdownOverlayEl) questionCountdownOverlayEl.style.display = "none";
    return;
  }

  // ตรวจสอบว่า timer ยังทำงานอยู่หรือไม่
  // สำหรับ QUESTION_COUNTDOWN: ต้องระวังการเรียกซ้ำจาก Firebase sync
  // ปัญหาคือเมื่อ host กดปุ่ม Firebase sync กลับมาเร็วมาก
  // ทำให้ ensureTimer ถูกเรียกหลายครั้ง และการตรวจสอบอาจทำให้ return ก่อนที่ timer จะทำงาน
  // ดังนั้นสำหรับ QUESTION_COUNTDOWN ให้ตรวจสอบว่า timer ยังทำงานอยู่จริงๆ
  if (timerPhase === phase && timerRound === round && timerInterval) {
    if (phase === PHASE.QUESTION_COUNTDOWN) {
      // สำหรับ QUESTION_COUNTDOWN: ตรวจสอบว่า timer ยังทำงานอยู่จริงๆ
      // โดยดูว่า overlay ยังแสดงอยู่และ element ยังมีอยู่
      // แต่ถ้า Firebase sync เร็วมาก อาจจะเรียก ensureTimer ก่อนที่ timer จะทำงาน
      // ดังนั้นให้ตรวจสอบว่า timer ยังทำงานอยู่จริงๆ โดยดูว่า questionCountdownNumberEl ยังมีอยู่
      // และ overlay ยังแสดงอยู่
      if (questionCountdownNumberEl && questionCountdownOverlayEl) {
        // Element ยังมีอยู่ แต่ต้องตรวจสอบว่า timer ยังทำงานอยู่จริงๆ
        // โดยดูว่า overlay ยังแสดงอยู่ (ใช้ getComputedStyle เพื่อให้แน่ใจ)
        const overlayDisplay = window.getComputedStyle(questionCountdownOverlayEl).display;
        if (overlayDisplay !== "none") {
          // Timer ยังทำงานอยู่ ไม่ต้องสร้างใหม่
          // แต่ต้องแน่ใจว่า timer ยังทำงานอยู่จริงๆ โดยดูว่า questionCountdownNumberEl.textContent ยังมีค่า
          // ถ้า textContent เป็น empty string แสดงว่า timer อาจจะจบแล้ว
          if (questionCountdownNumberEl.textContent && questionCountdownNumberEl.textContent.trim() !== "") {
            return;
          }
        }
      }
      // Timer อาจไม่ทำงาน หรือ element ไม่มี หรือ textContent เป็น empty string
      // ให้สร้างใหม่
      clearTimer();
      timerPhase = phase;
      timerRound = round;
    } else {
      // Phase อื่นๆ: Timer ยังทำงานอยู่ ไม่ต้องสร้างใหม่
      return;
    }
  }

  // ถ้า timerPhase/timerRound ไม่ตรง หรือ timerInterval ไม่มี ให้สร้างใหม่
  clearTimer();
  timerPhase = phase;
  timerRound = round;

  if (phase === PHASE.QUESTION_COUNTDOWN) {
    const start = roomData.questionCountdownStartAt || Date.now();
    const duration = roomData.questionCountdownSeconds || 3;

    // แสดง countdown overlay
    if (questionCountdownOverlayEl) {
      questionCountdownOverlayEl.style.display = "flex";
    }

    // ฟังก์ชันอัพเดทตัวเลข
    const updateCountdown = () => {
      const now = Date.now();
      let remaining = Math.ceil((start + duration * 1000 - now) / 1000);
      if (remaining < 0) remaining = 0;

      // แสดงตัวเลขนับถอยหลัง (3, 2, 1)
      if (questionCountdownNumberEl) {
        if (remaining > 0) {
          questionCountdownNumberEl.textContent = remaining;
        } else {
          questionCountdownNumberEl.textContent = "";
        }
      }

      if (remaining <= 0) {
        // ซ่อน countdown overlay เมื่อนับถอยหลังเสร็จ
        if (questionCountdownOverlayEl) {
          questionCountdownOverlayEl.style.display = "none";
        }
        clearTimer();
        if (currentRoomCode) {
          moveCountdownToAnsweringTx().catch((e) => console.error(e));
        }
      }
    };

    // อัพเดททันทีครั้งแรก (สำคัญ: ต้องเรียกก่อน setInterval)
    updateCountdown();

    // ตั้ง timer เพื่ออัพเดทต่อเนื่อง (ใช้ 50ms เพื่อให้อัพเดทบ่อยขึ้น)
    timerInterval = setInterval(updateCountdown, 50);
  } else {
    // ซ่อน countdown overlay ถ้า phase ไม่ใช่ QUESTION_COUNTDOWN
    if (questionCountdownOverlayEl) {
      questionCountdownOverlayEl.style.display = "none";
    }
  }

  if (phase === PHASE.ANSWERING) {
    const duration = roomData.answerTimeSeconds || 20;

    if (!Number.isFinite(roomData.answerStartAt)) {
      if (countdownDisplayEl) countdownDisplayEl.textContent = "กำลังรอ Host เริ่มจับเวลา…";
      return;
    }

    const start = roomData.answerStartAt;

    timerInterval = setInterval(() => {
      const now = Date.now();
      let remaining = Math.ceil((start + duration * 1000 - now) / 1000);
      if (remaining < 0) remaining = 0;

      if (countdownDisplayEl) countdownDisplayEl.textContent = `⏱ เหลือเวลา ${remaining} วินาที`;

      if (remaining <= 0) {
        clearTimer();
      
        // ✅ ใช้ transaction เพื่อ set expired + mark missedAnswerRound ให้คนที่หลุด
        if (currentRole === "host" && currentRoomCode) {
          markAnswerDeadlineExpiredTx().catch((e) => console.error(e));
        }
      }      
    }, 250);
  }
}

function clearTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerPhase = null;
  timerRound = 0;
}

/* =========================
   16) Leave/cancel/reset
========================= */
async function leaveRoomFlow() {
  if (!currentRoomCode || !currentPlayerId) {
    resetToHome("ออกจากห้องเรียบร้อย");
    updateHeaderActionsUI(null);
    return;
  }

  try {
    const roomRef = ref(db, `rooms/${currentRoomCode}`);
    const snap = await get(roomRef);

    const room = snap.exists() ? snap.val() : null;
    const inLobby = room && room.status === STATUS.LOBBY && (room.currentRound || 0) === 0;

    if (inLobby) {
      // ✅ ยังไม่เริ่มเกม: ออก = ลบชื่อออกจาก list
      await remove(ref(db, `rooms/${currentRoomCode}/players/${currentPlayerId}`));
    } else {
      // ✅ เริ่มเกมแล้ว: ออก = mark disconnected (ยังกลับมาได้)
      await update(ref(db, `rooms/${currentRoomCode}/players/${currentPlayerId}`), {
        connected: false,
        disconnectedAt: Date.now(),
        lastSeen: Date.now(),
      });
    }
  } catch (e) {
    console.warn("leaveRoomFlow failed:", e);
  }

  resetToHome("ออกจากห้องเรียบร้อย");
  updateHeaderActionsUI(null);
}

async function cancelRoomFlow() {
  if (currentRole !== "host" || !currentRoomCode) return;

  const ok = confirm("ต้องการยกเลิกห้องนี้ใช่ไหม? ผู้เล่นทุกคนจะถูกเตะออก");
  if (!ok) return;

  try {
    await set(ref(db, `rooms/${currentRoomCode}`), null);
  } catch (e) {
    console.error(e);
    alert("ยกเลิกห้องไม่สำเร็จ (ดู Console)");
    return;
  }
  updateHeaderActionsUI(null);
}

function resetToHome(message) {
  clearTimer();

  if (roomUnsub) {
    try {
      roomUnsub();
    } catch {}
    roomUnsub = null;
  }

  clearSession();

  currentRoomCode = null;
  currentRole = null;
  currentPlayerId = null;

  const gameBarEl = document.getElementById("gameBar");
  if (gameBarEl) gameBarEl.style.display = "none";

  if (lobbyEl) lobbyEl.style.display = "none";
  if (gameAreaEl) gameAreaEl.style.display = "none";
  if (endGameAreaEl) endGameAreaEl.style.display = "none";
  if (questionAreaOverlayEl) questionAreaOverlayEl.style.display = "none";
  if (countdownDisplayEl) countdownDisplayEl.textContent = "";
  if (questionCountdownOverlayEl) questionCountdownOverlayEl.style.display = "none";

  if (playerListEl) playerListEl.innerHTML = "";
  if (boardEl) boardEl.innerHTML = "";
  if (roleInfoEl) roleInfoEl.textContent = "";

  if (lobbyBadgesEl) lobbyBadgesEl.innerHTML = "";

  setEntryVisible(true);
  showEntryLanding(); // (refactor) ให้กลับ landing ชัดเจน

  if (hostGameOptionsEl) hostGameOptionsEl.classList.remove("is-open");

  if (hostNameInput) hostNameInput.disabled = false;
  if (createRoomBtn) createRoomBtn.disabled = false;
  if (confirmCreateRoomBtn) confirmCreateRoomBtn.disabled = false;

  if (roomCodeInput) roomCodeInput.disabled = false;
  if (playerNameInput) playerNameInput.disabled = false;
  if (joinRoomBtn) joinRoomBtn.disabled = false;

  const uiRoomPill = document.getElementById("uiRoomPill");
  const uiRolePill = document.getElementById("uiRolePill");
  if (uiRoomPill) uiRoomPill.textContent = "Room: -";
  if (uiRolePill) uiRolePill.textContent = "Role: -";

  dice.setState("hidden");

  rollPending = false;
  answerPending = false;

  if (message) alert(message);
}

/* =========================
   17) bindUIEvents
========================= */
function logEntryDomWiring() {
  const items = {
    adminTopBtn,
    joinGameBtn,
    entryLandingEl,
    adminEntryPageEl,
    playerEntryPageEl,
  };

  console.groupCollapsed("%c[ENTRY DOM] wiring check", "color:#5a4bb0;font-weight:900;");
  for (const [k, el] of Object.entries(items)) {
    console.log(k, el ? "✅ found" : "❌ MISSING", el || "");
  }
  console.groupEnd();
}

function bindUIEvents() {
  headerHomeBtn?.addEventListener("click", () => {
    showEntryLanding();
    updateHeaderActionsUI(null);
  });

  headerExitBtn?.addEventListener("click", async () => {
    if (currentRole === "host") await cancelRoomFlow();
    else if (currentRole === "player") await leaveRoomFlow();
  });

  joinGameBtn?.addEventListener("click", () => {
    if (!playerEntryPageEl) {
      alert("ไม่พบหน้า Player (#playerEntryPage) กรุณาตรวจสอบ id ใน index.html");
      return;
    }
    showPlayerEntryPage();
  });

  adminTopBtn?.addEventListener("click", () => {
    if (currentRole === "host" && currentRoomCode) return;
    openAdminPwOverlay();
  });

  adminPwCancelBtn?.addEventListener("click", closeAdminPwOverlay);
  adminPwOverlayEl?.addEventListener("click", (e) => {
    if (e.target === adminPwOverlayEl) closeAdminPwOverlay();
  });

  adminPwInputEl?.addEventListener("input", () => {
    let v = String(adminPwInputEl.value || "");
    v = v.replace(/\D/g, "").slice(0, 4);
    adminPwInputEl.value = v;

    if (adminPwErrorEl) adminPwErrorEl.style.display = "none";

    if (v.length === 4) {
      if (v === ADMIN_PIN) {
        closeAdminPwOverlay();
        showAdminEntryPage();
      } else {
        failPin();
      }
    }
  });

  adminPwInputEl?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") e.preventDefault();
  });

  closeQuestionAreaBtn?.addEventListener("click", () => {
    if (questionAreaOverlayEl) questionAreaOverlayEl.style.display = "none";
    if (closeQuestionAreaBtn) closeQuestionAreaBtn.style.display = "none";
  
    const rd = lastRoomData;
    if (rd) {
      const phase = rd.phase || PHASE.IDLE;
      const ui = rd.ui || {};
      const keepOnEnd = phase === PHASE.ENDED && ui.keepQuestionOnEnd === true;
  
      if (keepOnEnd) {
        endQuestionDismissed = true;
      } else if (phase === PHASE.RESULT) {
        resultQuestionDismissed = true;
      }
    }
  });  

  // ✅ Host flows bindings
  createRoomBtn?.addEventListener("click", hostOpenGameOptionsFlow);
  confirmCreateRoomBtn?.addEventListener("click", hostConfirmCreateRoomFlow);
  startGameBtn?.addEventListener("click", hostStartGameFlow);
  startRoundBtn?.addEventListener("click", hostStartRoundFlow);

  // ✅ Leave/cancel 
  leaveRoomBtn?.addEventListener("click", leaveRoomFlow);
  cancelRoomBtn?.addEventListener("click", cancelRoomFlow);

  // ✅ Host question flow bindings
  startQuestionBtn?.addEventListener("click", hostStartQuestionFlow);
  toggleQuestionOverlayBtn?.addEventListener("click", hostToggleQuestionOverlay);
  revealAnswerBtn?.addEventListener("click", hostRevealAnswerFlow);

  // NOTE: ถ้ายังอยากมี debug wiring check ให้เรียกจากในนี้ด้วย
  logEntryDomWiring?.();
}

/* =========================
   18) Restore Session + Boot (single entry point)
========================= */
async function attemptRestoreSession() {
  try {
    const raw = STORAGE.getItem(STORAGE_KEY);
    if (!raw) return false;

    let s = null;
    try {
      s = JSON.parse(raw);
    } catch {
      STORAGE.removeItem(STORAGE_KEY);
      return false;
    }

    if (!s?.room || !s?.role) return false;

    const roomCode = String(s.room).trim().toUpperCase();
    if (!roomCode) return false;

    const roomRef = ref(db, `rooms/${roomCode}`);
    const snap = await get(roomRef);
    if (!snap.exists()) return false;

    const roomData = snap.val();
    const players = roomData.players || {};

    if (s.role === "host") {
      didRestoreSession = true;
      currentRoomCode = roomCode;
      currentRole = "host";
      currentPlayerId = null;

      console.log("[RESTORE] host", { roomCode });

      enterLobbyView();
      subscribeRoom(currentRoomCode);
      lockEntryUIForRole("host");
      return true;
    }

    if (s.role === "player") {
      const pid = s.pid ? String(s.pid) : null;
      if (!pid || !players[pid]) return false;
    
      didRestoreSession = true;
      currentRoomCode = roomCode;
      currentRole = "player";
      currentPlayerId = pid;
    
      // ✅ ใส่ตรงนี้ (ก่อน enterLobbyView ก็ได้)
      await update(ref(db, `rooms/${roomCode}/players/${pid}`), {
        connected: true,
        lastSeen: Date.now(),
        disconnectedAt: null,
      });
      setupPlayerOnDisconnect(roomCode, pid);
    
      enterLobbyView();
      subscribeRoom(currentRoomCode);
      lockEntryUIForRole("player");
      return true;
    }    

    return false;
  } catch (e) {
    console.warn("restore session failed:", e);
    return false;
  }
}

async function boot() {
  bindUIEvents();
  populateQuestionSetSelect();

  const restored = await attemptRestoreSession();
  if (!restored) showEntryLanding();
}

boot();
