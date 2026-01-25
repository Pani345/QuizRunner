// dice.js
// Dice overlay + 3D dice engine (isolated module)

export function createDiceController({
    // DOM refs
    diceOverlayEl,
    dice3dEl,
    diceHintEl,
    diceRollHintEl,
    rollDiceBtn,
    closeDiceOverlayBtn,
  } = {}) {
    // ✅ LOG ทันทีเมื่อสร้าง controller
    console.log("[DICE] controller init", {
      diceOverlayEl,
      dice3dEl,
      diceHintEl,
      diceRollHintEl,
      rollDiceBtn,
      closeDiceOverlayBtn,
    });
  
    let diceOverlayState = "hidden"; // "hidden" | "waiting" | "rolling" | "committing" | "done"
    let TOP_VISIBLE_TO_POSES = null;
  
    const raf = () => new Promise((r) => requestAnimationFrame(r));
    const rand360 = () => Math.floor(Math.random() * 360);
    const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  
    function secureRandomInt(min, max) {
      const lo = Math.floor(min);
      const hi = Math.floor(max);
      const range = hi - lo + 1;
  
      if (!Number.isFinite(lo) || !Number.isFinite(hi) || range <= 0) {
        throw new Error(`secureRandomInt invalid range: ${min}..${max}`);
      }
  
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        // rejection sampling to avoid modulo bias
        const maxValid = Math.floor(256 / range) * range - 1;
        let v;
        do {
          const b = new Uint8Array(1);
          crypto.getRandomValues(b);
          v = b[0];
        } while (v > maxValid);
        return lo + (v % range);
      }
  
      // fallback
      return lo + Math.floor(Math.random() * range);
    }
  
    function getState() {
      return diceOverlayState;
    }
  
    function setState(state, opts = {}) {
      // opts: { roll, hint }
      const rollValue = opts.roll ?? null;
      const hint = opts.hint ?? null;
  
      diceOverlayState = state;
  
      if (!diceOverlayEl) {
        console.warn("[DICE] diceOverlayEl is null -> cannot render overlay");
        return;
      }
  
      if (state === "hidden") {
        diceOverlayEl.style.display = "none";
        if (closeDiceOverlayBtn) closeDiceOverlayBtn.style.display = "none";
        if (rollDiceBtn) rollDiceBtn.style.display = "none";
        if (diceRollHintEl) diceRollHintEl.classList.remove("show");
        return;
      }
  
      diceOverlayEl.style.display = "flex";
  
      if (diceHintEl) {
        if (hint != null) diceHintEl.textContent = hint;
        else {
          if (state === "rolling") diceHintEl.textContent = "ลูกเต๋ากำลังกลิ้ง…";
          else if (state === "committing")
            diceHintEl.textContent = `ได้แต้ม: ${rollValue ?? "-"} (กำลังบันทึกผล…)`;
          else if (state === "done")
            diceHintEl.textContent = rollValue != null ? `ได้แต้ม: ${rollValue}` : "เสร็จแล้ว";
        }
      }
  
      if (state === "waiting") {
        if (rollDiceBtn) {
          rollDiceBtn.style.display = "block";
          rollDiceBtn.disabled = false;
        }
        if (diceRollHintEl) diceRollHintEl.classList.add("show");
        if (closeDiceOverlayBtn) closeDiceOverlayBtn.style.display = "none";
      } else if (state === "rolling" || state === "committing") {
        if (rollDiceBtn) {
          rollDiceBtn.style.display = "block";
          rollDiceBtn.disabled = true;
        }
        if (diceRollHintEl) diceRollHintEl.classList.remove("show");
        if (closeDiceOverlayBtn) closeDiceOverlayBtn.style.display = "none";
      } else if (state === "done") {
        if (rollDiceBtn) rollDiceBtn.style.display = "none";
        if (diceRollHintEl) diceRollHintEl.classList.remove("show");
        if (closeDiceOverlayBtn) {
          closeDiceOverlayBtn.style.display = "inline-flex";
          closeDiceOverlayBtn.disabled = false;
        }
      }
    }
  
    function waitTransformEnd(el, timeoutMs = 6500) {
      return new Promise((resolve) => {
        let done = false;
  
        const cleanup = () => {
          if (done) return;
          done = true;
          el.removeEventListener("transitionend", onEnd);
          clearTimeout(t);
          resolve();
        };
  
        const onEnd = (e) => {
          if (e.target === el && e.propertyName === "transform") cleanup();
        };
  
        el.addEventListener("transitionend", onEnd, { once: false });
        const t = setTimeout(cleanup, timeoutMs);
      });
    }
  
    const FACE_CLASS_TO_VALUE = {
      "face-1": 5, // FRONT
      "face-2": 4, // RIGHT
      "face-3": 1, // TOP
      "face-4": 6, // BOTTOM
      "face-5": 3, // LEFT
      "face-6": 2, // BACK
    };
  
    function getTopVisibleValue() {
      const faces = dice3dEl?.querySelectorAll(".face");
      if (!faces || faces.length === 0) return null;
  
      let best = { y: Infinity, value: null };
  
      faces.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cy = rect.top + rect.height / 2;
        const cls = [...el.classList].find((c) => /^face-\d$/.test(c));
        const value = FACE_CLASS_TO_VALUE[cls];
        if (value != null && cy < best.y) best = { y: cy, value };
      });
  
      return best.value;
    }
  
    function genPoseList() {
      const A = [0, 90, 180, 270];
      const poses = [];
      for (const x of A) for (const y of A) for (const z of A) poses.push({ x, y, z, key: `${x}_${y}_${z}` });
      return poses;
    }
  
    async function buildTopVisiblePoseMap() {
      if (!dice3dEl) return null;
  
      const poses = genPoseList();
      const map = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
  
      const prevTransition = dice3dEl.style.transition;
      const prevTransform = dice3dEl.style.transform;
  
      dice3dEl.style.transition = "none";
  
      for (const p of poses) {
        dice3dEl.style.transform = `rotateX(${p.x}deg) rotateY(${p.y}deg) rotateZ(${p.z}deg)`;
        await raf();
        const topVal = getTopVisibleValue();
        if (topVal >= 1 && topVal <= 6) map[topVal].push(p);
      }
  
      dice3dEl.style.transform = prevTransform;
      dice3dEl.style.transition = prevTransition;
  
      console.log(
        "[DICE] TOP_VISIBLE_TO_POSES built:",
        Object.fromEntries(Object.entries(map).map(([k, v]) => [k, v.length]))
      );
  
      return map;
    }
  
    function prepDiceForAnimate(el) {
      if (!el) return;
      try {
        el.getAnimations().forEach((a) => a.cancel());
      } catch {}
      el.style.transition = "none";
      el.getBoundingClientRect();
    }
  
    function nearestEquivalentDeg(currentDeg, targetDeg) {
      const c = Number(currentDeg) || 0;
      const t = Number(targetDeg) || 0;
      const n = Math.round((c - t) / 360);
      return t + 360 * n;
    }
  
    function easeOutPow(t, p = 3.2) {
      return 1 - Math.pow(1 - t, p);
    }
  
    async function animateRollToPick(el, pick, rollMs) {
      prepDiceForAnimate(el);
  
      const s = { x: randInt(-18, 18), y: rand360(), z: randInt(-18, 18) };
      const kx = randInt(1, 3);
      const ky = randInt(2, 4);
      const kz = randInt(1, 3);
  
      const end = { x: pick.x + 360 * kx, y: pick.y + 360 * ky, z: pick.z + 360 * kz };
  
      const T = [0, 0.22, 0.48, 0.72, 0.88, 1.0];
      const frames = T.map((tt) => {
        const f = easeOutPow(tt, 3.2);
        const ax = s.x + (end.x - s.x) * f;
        const ay = s.y + (end.y - s.y) * f;
        const az = s.z + (end.z - s.z) * f;
        return { offset: tt, transform: `rotateX(${ax}deg) rotateY(${ay}deg) rotateZ(${az}deg)` };
      });
  
      const anim = el.animate(frames, { duration: rollMs, easing: "linear", fill: "forwards" });
      await anim.finished;
  
      try {
        el.getAnimations().forEach((a) => a.cancel());
      } catch {}
      el.style.transition = "none";
      el.style.transform = `rotateX(${end.x}deg) rotateY(${end.y}deg) rotateZ(${end.z}deg)`;
  
      return { s, end };
    }
  
    async function settleToPick(el, pick, settleMs, endAbs) {
      const targetAbs = {
        x: nearestEquivalentDeg(endAbs?.x ?? pick.x, pick.x),
        y: nearestEquivalentDeg(endAbs?.y ?? pick.y, pick.y),
        z: nearestEquivalentDeg(endAbs?.z ?? pick.z, pick.z),
      };
  
      const t = Math.max(0, Math.floor(settleMs));
  
      if (t > 0) {
        el.style.transition = `transform ${t}ms cubic-bezier(.18,.92,.22,1)`;
        el.style.transform = `rotateX(${targetAbs.x}deg) rotateY(${targetAbs.y}deg) rotateZ(${targetAbs.z}deg)`;
        await waitTransformEnd(el, t + 120);
      }
  
      el.style.transition = "none";
      el.style.transform = `rotateX(${pick.x}deg) rotateY(${pick.y}deg) rotateZ(${pick.z}deg)`;
      await raf();
    }
  
    function logDiceState(stage, finalRoll, endObj) {
      try {
        const cam = document.querySelector(".dice-cam");
        const diceEl = document.getElementById("dice3d");
  
        console.log(`%c[DICE LOG] ${stage}`, "color:#5a4bb0;font-weight:900;", {
          finalRoll,
          endObj,
          dice_style_transform: diceEl?.style?.transform || "",
          dice_computed_transform: diceEl ? getComputedStyle(diceEl).transform : "",
          cam_style_transform: cam?.style?.transform || "",
          cam_computed_transform: cam ? getComputedStyle(cam).transform : "",
          ts: Date.now(),
        });
      } catch (e) {
        console.warn("[DICE LOG] failed:", e);
      }
    }
  
    async function rollWithOverlay(durationMs = 5000) {
      const finalRoll = secureRandomInt(1, 6);
      logDiceState("before-roll", finalRoll, null);
  
      if (!diceOverlayEl || !dice3dEl) return finalRoll;
  
      setState("rolling", { hint: "ลูกเต๋ากำลังกลิ้ง…" });
      await raf();
      await raf();
  
      prepDiceForAnimate(dice3dEl);
      await raf();
  
      if (!TOP_VISIBLE_TO_POSES) {
        TOP_VISIBLE_TO_POSES = await buildTopVisiblePoseMap();
      }
      const candidates = TOP_VISIBLE_TO_POSES?.[finalRoll] || [];
      const pick = candidates.length ? candidates[randInt(0, candidates.length - 1)] : { x: 0, y: 0, z: 0 };
  
      const rollMs = Math.max(2000, Math.floor(durationMs * 0.94));
      const settleMs = Math.max(80, durationMs - rollMs);
  
      logDiceState("computed-end-before-animate", finalRoll, { pick, rollMs, settleMs });
  
      const { end } = await animateRollToPick(dice3dEl, pick, rollMs);
      await settleToPick(dice3dEl, pick, settleMs, end);
  
      const seenTop = getTopVisibleValue?.();
      if (seenTop != null && seenTop !== finalRoll) {
        console.warn("[DICE SNAP MISMATCH]", { finalRoll, seenTop, pick });
      }
      logDiceState("after-snap-final", finalRoll, { pick, seenTop });
  
      return finalRoll;
    }
  
    // ✅ bind ปุ่ม close ต้องอยู่ก่อน return
    if (!closeDiceOverlayBtn) {
      console.warn("[DICE] closeDiceOverlayBtn is null -> cannot bind close");
    } else {
      console.log("[DICE] binding closeDiceOverlayBtn click");
      closeDiceOverlayBtn.addEventListener("click", () => {
        console.log("[DICE] close clicked, state =", diceOverlayState);
        setState("hidden");
        document.getElementById("gameArea")?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      });
    }
  
    return {
      getState,
      setState,
      rollWithOverlay,
  
      // debug (ถ้าต้องการ)
      __getTopVisibleValue: getTopVisibleValue,
    };
  }
  
