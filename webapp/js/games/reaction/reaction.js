import { registerGame } from "../../core/engine.js";

const reactionGame = {
  timer: null,
  startTime: null,

  start() {
    const app = document.getElementById("app");

    if (!document.getElementById("reaction-extreme-style")) {
      const style = document.createElement("style");
      style.id = "reaction-extreme-style";
      style.textContent = `
        .react-wrapper {
          position: relative; width: 100%; height: 100vh;
          background: #02040a; color: white; overflow: hidden;
          font-family: 'Orbitron', system-ui, sans-serif;
          display: flex; flex-direction: column; user-select: none;
        }

        /* HUD */
        .react-hud {
          position: absolute; top: 0; left: 0; width: 100%;
          padding: 20px; display: flex; justify-content: space-between;
          box-sizing: border-box; z-index: 100; pointer-events: none;
        }
        .hud-left { display: flex; gap: 12px; align-items: stretch; }

        .interactive-box {
          background: rgba(10, 15, 25, 0.8);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px; backdrop-filter: blur(10px);
          display: flex; flex-direction: column; justify-content: center;
          transition: all 0.1s; pointer-events: auto; cursor: pointer;
          min-height: 58px; position: relative; overflow: hidden;
        }

        .hud-box { padding: 0 20px; }
        .back-btn { width: 58px; align-items: center; justify-content: center; font-size: 24px; }

        /* --- ЭФФЕКТЫ МОЛНИИ (BEST RECORD) --- */
        .lightning {
          position: absolute; background: #ff00ea;
          filter: blur(1px) drop-shadow(0 0 5px #ff00ea);
          pointer-events: none; z-index: 100; opacity: 0;
        }
        @keyframes bolt-anim {
          0% { opacity: 1; width: 2px; }
          100% { opacity: 0; width: 0px; }
        }

        /* --- ЭФФЕКТ ПОРТАЛА (BACK) --- */
        .portal-ring {
          position: absolute; border: 2px solid #a855f7; border-radius: 50%;
          pointer-events: none; animation: portal-out 0.4s ease-out forwards;
        }
        @keyframes portal-out {
          0% { width: 0; height: 0; opacity: 1; transform: translate(-50%, -50%) rotate(0deg); }
          100% { width: 150px; height: 150px; opacity: 0; transform: translate(-50%, -50%) rotate(180deg); border-width: 10px; }
        }

        /* --- ЭФФЕКТ СКАНЕРА (STATUS) --- */
        .scan-line {
          position: absolute; inset: 0; background: linear-gradient(to bottom, transparent, #00f2fe, transparent);
          height: 20%; opacity: 0; pointer-events: none;
        }
        .animate-scan { animation: scan-anim 0.3s linear forwards; }
        @keyframes scan-anim {
          0% { top: -20%; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        /* ГЛАВНАЯ ЗОНА */
        .react-main-zone {
          flex: 1; width: 100%; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          cursor: pointer; position: relative; z-index: 5;
        }
        .state-idle { background: #02040a; }
        .state-waiting { background: #05080f; box-shadow: inset 0 0 100px rgba(0,242,254,0.05); }
        .state-ready { background: #0ddb0d; }
        .state-too-early { background: #3f0000; }
        .state-result { background: #0f0a1f; }

        .react-label { font-size: clamp(40px, 15vw, 100px); font-weight: 900; letter-spacing: -2px; }

        .flash {
          position: absolute; inset: 0; background: white; opacity: 0;
          pointer-events: none; z-index: 200;
        }
        .animate-flash { animation: flash-fx 0.2s ease-out; }
        @keyframes flash-fx { 0% { opacity: 0.3; } 100% { opacity: 0; } }
      `;
      document.head.appendChild(style);
    }

    let bestTime = localStorage.getItem("react-best") || "--";
    let currentState = "idle";

    app.innerHTML = `
      <div class="react-wrapper">
        <div class="flash" id="fx-flash"></div>
        <div class="react-hud">
          <div class="hud-left">
            <div id="btn-back" class="interactive-box back-btn">←</div>
            <div id="box-best" class="interactive-box hud-box">
              <div style="font-size: 8px; opacity: 0.6; letter-spacing: 2px;">BEST RECORD</div>
              <div id="react-best-val" style="font-size: 20px; font-weight: 800; color: #ff00ea;">${bestTime}${bestTime === "--" ? "" : "ms"}</div>
            </div>
          </div>
          <div id="box-status" class="interactive-box hud-box" style="text-align: right;">
            <div class="scan-line" id="fx-scan"></div>
            <div style="font-size: 8px; opacity: 0.6; letter-spacing: 2px;">SYSTEM STATUS</div>
            <div id="react-status-val" style="font-size: 20px; font-weight: 800; color: #00f2fe;">READY</div>
          </div>
        </div>

        <div id="react-zone" class="react-main-zone state-idle">
          <div id="react-main-text" class="react-label">START</div>
        </div>
      </div>
    `;

    const flash = document.getElementById("fx-flash");
    const scan = document.getElementById("fx-scan");

    // Функция создания МОЛНИИ
    const createLightning = (x, y) => {
      for(let i=0; i<5; i++) {
        const bolt = document.createElement("div");
        bolt.className = "lightning";
        const h = Math.random() * 100 + 50;
        const ang = Math.random() * 360;
        bolt.style.height = h + "px";
        bolt.style.left = x + "px";
        bolt.style.top = y - (h/2) + "px";
        bolt.style.transform = `rotate(${ang}deg) translateY(${-h/2}px)`;
        bolt.style.animation = `bolt-anim 0.2s ease-out forwards`;
        document.body.appendChild(bolt);
        setTimeout(() => bolt.remove(), 200);
      }
    };

    // Функция создания ПОРТАЛА
    const createPortal = (x, y) => {
      const ring = document.createElement("div");
      ring.className = "portal-ring";
      ring.style.left = x + "px";
      ring.style.top = y + "px";
      document.body.appendChild(ring);
      setTimeout(() => ring.remove(), 400);
    };

    const triggerFlash = () => {
      flash.classList.remove("animate-flash");
      void flash.offsetWidth;
      flash.classList.add("animate-flash");
    };

    // ОБРАБОТЧИКИ
    document.getElementById("btn-back").onmousedown = (e) => {
      e.stopPropagation();
      createPortal(e.clientX, e.clientY);
      setTimeout(() => location.reload(), 200);
    };

    document.getElementById("box-best").onmousedown = (e) => {
      e.stopPropagation();
      createLightning(e.clientX, e.clientY);
      triggerFlash();
    };

    document.getElementById("box-status").onmousedown = (e) => {
      e.stopPropagation();
      scan.classList.remove("animate-scan");
      void scan.offsetWidth;
      scan.classList.add("animate-scan");
      triggerFlash();
    };

    // Игровая логика
    const zone = document.getElementById("react-zone");
    const mainText = document.getElementById("react-main-text");

    const update = (st, txt, color) => {
      currentState = st;
      zone.className = `react-main-zone state-${st}`;
      mainText.innerText = txt;
      const sVal = document.getElementById("react-status-val");
      sVal.innerText = st.toUpperCase();
      sVal.style.color = color;
    };

    zone.onmousedown = (e) => {
      triggerFlash();
      if (currentState === "idle" || currentState === "result" || currentState === "too-early") {
        update("waiting", "WAIT", "#00f2fe");
        this.timer = setTimeout(() => {
          update("ready", "TAP!", "#22c55e");
          this.startTime = performance.now();
        }, Math.random() * 3000 + 1500);
      } else if (currentState === "waiting") {
        clearTimeout(this.timer);
        createLightning(e.clientX, e.clientY);
        update("too-early", "EARLY", "#ff4444");
      } else if (currentState === "ready") {
        const ms = Math.floor(performance.now() - this.startTime);
        createLightning(e.clientX, e.clientY);
        if (bestTime === "--" || ms < parseInt(bestTime)) {
          bestTime = ms;
          localStorage.setItem("react-best", ms);
          document.getElementById("react-best-val").innerText = ms + "ms";
        }
        update("result", ms + "ms", "#ff00ea");
      }
    };
  }
};

registerGame("reaction", reactionGame);