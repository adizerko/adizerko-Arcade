import { registerGame } from "../../core/engine.js";

const mathGame = {
  timerInterval: null,

  start() {
    const app = document.getElementById("app");

    if (!document.getElementById("math-dynamic-style")) {
      const style = document.createElement("style");
      style.id = "math-dynamic-style";
      style.textContent = `
        /* БАЗОВЫЕ СТИЛИ */
        .math-overlay {
          display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
          padding: 30px 20px; min-height: 100vh; background: #0f172a; color: white;
          font-family: system-ui, -apple-system, sans-serif; box-sizing: border-box; user-select: none;
          position: relative; overflow: hidden;
        }

        #math-viewport {
          transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform-style: preserve-3d;
        }

        /* УЛУЧШЕНИЕ 5: "Экшен" Взрыв вопроса (Масштаб, Свечение, Гравитация) */
        .math-shatter-piece {
          position: fixed; pointer-events: none; font-weight: 900;
          z-index: 1500;
          /* ЭФФЕКТ СВЕЧЕНИЯ (Bloom) + Зависимость от переменной --glow */
          filter: drop-shadow(0 0 var(--glow, 7px) var(--piece-color)) drop-shadow(0 0 calc(var(--glow, 7px) * 2) var(--piece-color));
          /* Случайный размер осколка + множитель размера */
          font-size: calc((15px + 15 * var(--size-multi)) * var(--power-scale, 1)); 
          color: var(--piece-color);
          
          /* Анимация: сначала выстрел, потом падение */
          animation: shatterArced 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        
        @keyframes shatterArced {
          0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
          25% { transform: translate(calc(-50% + var(--dx) * 0.4), calc(-50% + var(--dy) * 0.4 - 50px)) scale(1.3) rotate(calc(var(--rot) * 0.25)); opacity: 1; }
          100% { transform: translate(calc(-50% + var(--dx)), 110vh) scale(0.6) rotate(var(--rot)); opacity: 0; }
        }

        .ghost-number {
          position: fixed; pointer-events: none; font-weight: 900;
          font-size: 32px; color: #22c55e; z-index: 2500;
          text-shadow: 0 0 15px rgba(34, 197, 94, 0.8);
          animation: ghostFly 0.8s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        }
        @keyframes ghostFly {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -150px) scale(2.5); opacity: 0; }
        }

        .math-particle {
          position: fixed; pointer-events: none; border-radius: 50%; z-index: 1000;
          animation: particleFade 0.6s ease-out forwards;
        }
        @keyframes particleFade {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
        }

        .shake-screen { animation: screenShake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes screenShake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(3px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        .question-container {
          background: rgb(52 228 176 / 7%); border: 3px solid rgba(255, 255, 255, 0.08);
          padding: 16px 20px; border-radius: 24px; margin-bottom: 25px;
          width: 100%; max-width: 440px; 
          text-align: center; position: relative;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: visible; cursor: pointer;
          z-index: 5;
        }

        .q-scanline {
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.01) 50%, transparent);
          opacity: 0; pointer-events: none; z-index: 1;
        }

        .q-neon-pulse {
          position: absolute; inset: -2px; border: 2px solid transparent;
          border-radius: 24px; pointer-events: none; z-index: 2; opacity: 0;
        }

        .question-container.on-fire {
          animation: qPlasmaPulse 2s infinite alternate;
          border-color: var(--streak-color);
          box-shadow: 0 0 15px var(--streak-color), inset 0 0 5px var(--streak-color);
        }

        @keyframes qPlasmaPulse {
          0% { box-shadow: 0 0 10px var(--streak-color), inset 0 0 3px var(--streak-color); }
          100% { box-shadow: 0 0 20px var(--streak-color), inset 0 0 8px var(--streak-color); }
        }

        .math-overlay.q-action .question-container { animation: qNeoGlitchShake 0.2s ease-out; }
        .math-overlay.q-action #math-question { animation: qNeoTextGlitch 0.3s ease-out; }
        .math-overlay.q-action .q-scanline { animation: qScanlineFlash 0.3s ease-out; }
        .math-overlay.q-action .q-neon-pulse { 
          animation: qNeoCyberPulse 0.4s ease-out; 
          border-color: var(--streak-active-color); 
        }

        @keyframes qNeoGlitchShake {
          0%, 100% { transform: translate(0) scale(1); }
          20% { transform: translate(-2px, 1px) scale(0.99); }
          40% { transform: translate(2px, -1px) scale(0.99); }
          60% { transform: translate(-1px, -1px) scale(1); }
          80% { transform: translate(1px, 1px) scale(1); }
        }

        @keyframes qNeoTextGlitch {
          0%, 100% { text-shadow: none; color: #f1f5f9; filter: blur(0); }
          10% { text-shadow: 0 0 10px #fff, 2px 0 var(--streak-active-color), -2px 0 cyan; color: #fff; filter: blur(1px); }
          30% { text-shadow: 0 0 5px #fff, -2px 0 var(--streak-active-color), 2px 0 cyan; color: #f1f5f9; filter: blur(0px); }
          50% { text-shadow: 0 0 15px #fff, 1px 0 green, -1px 0 magenta; color: #fff; }
          80% { text-shadow: 0 0 5px #fff; color: #f1f5f9; }
        }

        @keyframes qScanlineFlash {
          0% { opacity: 0; transform: translateY(-100%); }
          50% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(100%); }
        }

        @keyframes qNeoCyberPulse {
          0% { transform: scale(1); opacity: 1; border-width: 2px; box-shadow: 0 0 5px var(--streak-active-color); }
          100% { transform: scale(1.15, 1.4); opacity: 0; border-width: 1px; box-shadow: 0 0 20px var(--streak-active-color); }
        }

        .math-stat-box {
          background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 24px; border-radius: 16px; text-align: center; min-width: 90px;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative; cursor: pointer;
        }
        
        /* ИНТЕРАКТИВ БЛОКОВ */
        .math-stat-box:active { transform: scale(1.15); background: rgba(255, 255, 255, 0.1); }
        
        .score-shockwave {
          position: absolute; inset: 0; border: 2px solid #a855f7; border-radius: 16px;
          pointer-events: none; animation: shockwave 0.5s ease-out forwards;
        }
        @keyframes shockwave {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }

        .timer-svg {
          position: absolute; inset: -3px; width: calc(100% + 6px); height: calc(100% + 6px);
          pointer-events: none; fill: none; z-index: 10;
        }
        .timer-path {
          stroke: #60a5fa; stroke-width: 3; stroke-linecap: round;
          transition: stroke-dashoffset 1s linear, stroke 0.3s;
        }

        .timer-add { transform: scale(1.2); border-color: #22c55e !important; background: rgba(34, 197, 94, 0.1) !important; }
        .timer-sub { transform: scale(0.8); border-color: #ef4444 !important; background: rgba(239, 68, 68, 0.1) !important; }
        
        .timer-panic-mode { 
          animation: panicPulse 0.5s infinite alternate !important;
          border-color: #ef4444 !important;
        }
        .timer-panic-mode .timer-path { stroke: #ef4444 !important; filter: drop-shadow(0 0 5px #ef4444); }

        @keyframes panicPulse { from { transform: scale(1); } to { transform: scale(1.05); } }

        .math-indicator {
          position: absolute; font-weight: 900; font-size: 20px;
          pointer-events: none; z-index: 100; left: 50%; top: 50%;
          transform: translate(-50%, -50%);
          animation: indicatorPop 0.8s cubic-bezier(0.2, 0, 0.2, 1) forwards;
          white-space: nowrap;
        }
        @keyframes indicatorPop {
          0% { transform: translate(-50%, -20%) scale(0.5); opacity: 0; }
          20% { transform: translate(-50%, -100%) scale(1.2); opacity: 1; }
          100% { transform: translate(-50%, -250%) scale(1); opacity: 0; }
        }

        .math-header-block { text-align: center; margin-top: 15px; margin-bottom: 25px; }
        .math-title {
          font-size: clamp(34px, 9vw, 52px); font-weight: 900; letter-spacing: 2px;
          text-transform: uppercase; background: linear-gradient(135deg, #60a5fa 0%, #a855f7 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.4)); margin: 0;
        }

        .math-stats-row { display: flex; gap: 20px; margin-bottom: 25px; position: relative; z-index: 10; }
        .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px; }
        .stat-value { font-size: 22px; font-weight: 800; color: #f1f5f9; transition: color 0.3s; }

        .streak-tag {
          position: absolute; top: 15px; right: 20px; font-size: 11px; font-weight: 900;
          color: #94a3b8; opacity: 0; transform: translateY(-10px); transition: all 0.3s ease;
          text-transform: uppercase; letter-spacing: 1px; z-index: 10;
        }
        .on-fire .streak-tag { opacity: 1; transform: translateY(0); }

        .math-question { 
          font-size: 48px; font-weight: 800; color: #f1f5f9; position: relative; 
          z-index: 2; transition: opacity 0.15s, transform 0.15s cubic-bezier(0.18, 0.89, 0.32, 1.28); 
        }

        .math-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; max-width: 440px; margin-bottom: 25px; z-index: 5; }
        
        .math-btn {
          background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 20px; border-radius: 18px; color: white; font-size: 26px; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease; -webkit-tap-highlight-color: transparent;
        }

        @media (hover: hover) {
          .math-btn:hover { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.2); transform: translateY(-3px); }
          .btn-danger:hover { background: rgba(239, 68, 68, 0.2); border-color: #ef4444; color: #fca5a5; }
          .btn-play-again:hover {
            background: rgba(168, 85, 247, 0.1); border-color: rgba(168, 85, 247, 1);
            box-shadow: 0 0 25px rgba(168, 85, 247, 0.5); transform: translateY(-2px);
          }
        }
        
        .math-btn.correct { background: rgba(34, 197, 94, 0.35) !important; border-color: #22c55e !important; box-shadow: 0 0 25px rgba(34, 197, 94, 0.4); }
        .math-btn.wrong { background: rgba(239, 68, 68, 0.35) !important; border-color: #ef4444 !important; animation: shake 0.4s ease-in-out; }

        .action-btn { 
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50px; padding: 16px 32px; color: rgba(255, 255, 255, 0.8);
          font-size: 13px; font-weight: 700; text-transform: uppercase; cursor: pointer; transition: 0.3s;
        }

        .btn-play-again {
          background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(168, 85, 247, 0.4);
          color: #f1f5f9; box-shadow: 0 0 10px rgba(168, 85, 247, 0.15);
        }

        .win-modal {
          display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%) scale(0.8);
          background: rgba(15, 23, 42, 0.98); backdrop-filter: blur(20px);
          padding: 40px; border-radius: 35px; text-align: center; z-index: 2000;
          width: 90%; max-width: 360px; opacity: 0; transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .win-modal.active { display: block; opacity: 1; transform: translate(-50%, -50%) scale(1); }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          50% { transform: translateX(10px); }
          75% { transform: translateX(-10px); }
        }
      `;
      document.head.appendChild(style);
    }

    let score = 0, timeLeft = 30, streak = 0, maxStreak = 0;
    const initialTime = 30;

    if (this.timerInterval) clearInterval(this.timerInterval);

    app.innerHTML = `
      <div id="math-viewport" class="math-overlay">
        <div class="math-header-block"><h1 class="math-title">CHALLENGE</h1></div>
        <div class="math-stats-row">
          <div id="timer-box" class="math-stat-box">
            <svg class="timer-svg">
               <rect class="timer-path" x="3" y="3" rx="16" width="100%" height="100%" 
                     style="width: calc(100% - 6px); height: calc(100% - 6px);"/>
            </svg>
            <span class="stat-label">Time</span>
            <span id="math-timer" class="stat-value">30s</span>
          </div>
          <div id="score-box" class="math-stat-box">
            <span class="stat-label">Score</span>
            <span id="math-score" class="stat-value">0</span>
          </div>
        </div>
        <div id="q-container" class="question-container">
          <div class="q-scanline"></div>
          <div class="q-neon-pulse"></div>
          <span id="streak-tag" class="streak-tag">STREAK x0</span>
          <div class="math-question" id="math-question"></div>
        </div>
        <div class="math-grid" id="math-grid"></div>
        <button id="quit-game" class="action-btn btn-danger">Quit Game</button>

        <div id="math-modal" class="win-modal">
          <h2 style="margin:0; font-size: 28px; color:#a855f7;">GAME OVER</h2>
          <div style="margin: 20px 0; display:flex; justify-content: space-around; background: rgba(255,255,255,0.03); padding: 15px; border-radius: 20px;">
            <div><small style="color:#64748b">SCORE</small><div id="final-score" style="font-size:32px; font-weight:900">0</div></div>
            <div><small style="color:#64748b">MAX STREAK</small><div id="final-streak" style="font-size:32px; font-weight:900; color:#a855f7">0</div></div>
          </div>
          <button id="math-restart" class="action-btn btn-play-again" style="width:100%; margin-bottom:10px">Play Again</button>
          <button id="math-menu" class="action-btn btn-danger" style="width:100%">Main Menu</button>
        </div>
      </div>
    `;

    const qContainer = document.getElementById("q-container");
    const qText = document.getElementById("math-question");
    const streakTag = document.getElementById("streak-tag");
    const viewport = document.getElementById("math-viewport");
    const timerBox = document.getElementById("timer-box");
    const scoreBox = document.getElementById("score-box");
    const timerPath = timerBox.querySelector(".timer-path");
    const scoreDiv = document.getElementById("math-score");
    const timerText = document.getElementById("math-timer");

    const pathLength = timerPath.getTotalLength();
    timerPath.style.strokeDasharray = pathLength;
    timerPath.style.strokeDashoffset = 0;

    // ИНТЕРАКТИВ БОКСОВ (Score & Timer)
    scoreBox.onclick = () => {
      const sw = document.createElement("div");
      sw.className = "score-shockwave";
      scoreBox.appendChild(sw);
      setTimeout(() => sw.remove(), 500);
      spawnIndicator(scoreBox, "LEVEL UP", "#a855f7");
    };

    timerBox.onclick = () => {
      timerText.style.color = "#60a5fa";
      spawnIndicator(timerBox, "HURRY!", "#60a5fa");
      setTimeout(() => { timerText.style.color = ""; }, 300);
    };

    qContainer.onclick = () => {
      viewport.classList.remove("q-action");
      void viewport.offsetWidth; 
      viewport.classList.add("q-action");
      setTimeout(() => viewport.classList.remove("q-action"), 450);
    };

    const spawnIndicator = (container, text, color) => {
      const ind = document.createElement("div");
      ind.className = "math-indicator";
      ind.textContent = text;
      ind.style.color = color;
      container.appendChild(ind);
      setTimeout(() => ind.remove(), 800);
    };

    const createExplosion = (x, y, color) => {
      for (let i = 0; i < 12; i++) {
        const p = document.createElement('div');
        p.className = 'math-particle';
        const size = Math.random() * 6 + 4;
        p.style.width = `${size}px`; p.style.height = `${size}px`;
        p.style.background = color; p.style.left = `${x}px`; p.style.top = `${y}px`;
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * 80 + 40;
        p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
        p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 600);
      }
    };

    // УЛУЧШЕНИЕ 5 + 6: Взрыв, зависящий от СТРИКА
    const createQuestionExplosion = (text, x, y, currentStreak) => {
      const pieces = [...text.split('').filter(c => c.trim() !== ''), '+', '-', '×', '÷', '?', '=', '!', '#', '%', '$'];
      const colors = ['#22c55e', '#a855f7', '#f1f5f9', '#60a5fa', '#3b82f6'];
      
      // ЧЕМ БОЛЬШЕ СТРИК, ТЕМ БОЛЬШЕ ОСКОЛКОВ
      const count = Math.min(20 + currentStreak, 45); 
      // Мощность свечения и размера растет со стриком
      const power = 1 + (currentStreak * 0.05);

      for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'math-shatter-piece';
        p.innerText = pieces[Math.floor(Math.random() * pieces.length)];
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        
        const colors_pick = colors[Math.floor(Math.random() * colors.length)];
        p.style.setProperty('--piece-color', colors_pick);
        p.style.setProperty('--size-multi', Math.random());
        p.style.setProperty('--glow', `${7 * power}px`);
        p.style.setProperty('--power-scale', power);

        const angle = Math.random() * Math.PI * 2;
        const dist = (Math.random() * 250 + 100) * power; 
        
        p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
        p.style.setProperty('--dy', `${Math.sin(angle) * (dist * 0.7)}px`); 
        p.style.setProperty('--rot', `${Math.random() * 1000 - 500}deg`); 
        
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 1200); 
      }
    };

    const animateTimerAction = (isCorrect) => {
        const cls = isCorrect ? 'timer-add' : 'timer-sub';
        timerBox.classList.add(cls);
        setTimeout(() => timerBox.classList.remove(cls), 300);
        spawnIndicator(timerBox, isCorrect ? "+3s" : "-4s", isCorrect ? "#22c55e" : "#ef4444");
    };

    const updateStreakUI = () => {
      const thresholds = [3, 5, 10, 20, 50];
      if (thresholds.includes(streak)) {
          viewport.classList.remove("shake-screen");
          void viewport.offsetWidth;
          viewport.classList.add("shake-screen");
      }
      
      let activeColor = "#a855f7"; 

      if (streak < 3) { 
          qContainer.classList.remove("on-fire"); 
          viewport.style.setProperty("--streak-color", "transparent");
          viewport.style.setProperty("--streak-active-color", activeColor);
          return; 
      }
      
      qContainer.classList.add("on-fire");
      streakTag.textContent = `STREAK x${streak}`;

      let color = "#8b5cf6"; 
      activeColor = "#c084fc"; 

      if (streak >= 50) { color = "#ffffff"; activeColor = "#ffffff"; }
      else if (streak >= 20) { color = "#ef4444"; activeColor = "#fca5a5"; }
      else if (streak >= 10) { color = "#fbbf24"; activeColor = "#fde68a"; }
      else if (streak >= 5) { color = "#3b82f6"; activeColor = "#93c5fd"; }

      viewport.style.setProperty("--streak-color", color);
      viewport.style.setProperty("--streak-active-color", activeColor);
      streakTag.style.color = color;
    };

    const renderQuestion = () => {
      qText.style.transform = "scale(1)";
      qText.style.opacity = "1";

      const difficultyStep = Math.floor(score / 2);
      const range = 10 + (difficultyStep * 8) + (streak * 2);
      const useMult = score > 12 && Math.random() > 0.7;
      let correct, qStr;

      if (useMult) {
          const sA = Math.floor(Math.random() * 10) + 2;
          const sB = Math.floor(Math.random() * 8) + 2;
          correct = sA * sB;
          qStr = `${sA} × ${sB}`;
      } else {
          const a = Math.floor(Math.random() * range) + 2;
          const b = Math.floor(Math.random() * range) + 2;
          const op = Math.random() > 0.5 ? "+" : "-";
          correct = op === "+" ? a + b : (a > b ? a - b : b - a);
          qStr = op === "+" ? `${a} + ${b}` : (a > b ? `${a} - ${b}` : `${b} - ${a}`);
      }

      qText.innerText = qStr;
      const grid = document.getElementById("math-grid");
      grid.style.pointerEvents = "all";
      
      const answers = new Set([correct]);
      while(answers.size < 4) {
        let dev = Math.floor(Math.random() * 10) + 1;
        let wrong = correct + (Math.random() > 0.5 ? dev : -dev);
        if (wrong > 0 && wrong !== correct) answers.add(wrong);
      }

      grid.innerHTML = Array.from(answers).sort(() => Math.random() - 0.5)
        .map(ans => `<button class="math-btn">${ans}</button>`).join('');

      grid.querySelectorAll(".math-btn").forEach(btn => {
        btn.onclick = (e) => {
          grid.style.pointerEvents = "none";
          
          const clientX = e.clientX || (e.touches && e.touches[0].clientX) || window.innerWidth / 2;
          const clientY = e.clientY || (e.touches && e.touches[0].clientY) || window.innerHeight / 2;
          const tiltX = (clientX - window.innerWidth / 2) / 40;
          const tiltY = (clientY - window.innerHeight / 2) / 40;
          
          viewport.style.transform = `perspective(1000px) rotateX(${-tiltY}deg) rotateY(${tiltX}deg) scale(0.98)`;
          setTimeout(() => { viewport.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale(1)`; }, 150);

          const rect = btn.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          if (parseInt(btn.innerText) === correct) {
            btn.classList.add("correct");
            createExplosion(centerX, centerY, '#22c55e');
            
            const qRect = qText.getBoundingClientRect();
            const qX = qRect.left + qRect.width / 2;
            const qY = qRect.top + qRect.height / 2;
            
            // Взрыв вопроса теперь зависит от Стрика!
            createQuestionExplosion(qText.innerText, qX, qY, streak);
            
            qText.style.opacity = "0";
            qText.style.transform = "scale(0.1)";

            const ghost = document.createElement('div');
            ghost.className = 'ghost-number';
            ghost.innerText = btn.innerText;
            ghost.style.left = `${centerX}px`;
            ghost.style.top = `${centerY}px`;
            document.body.appendChild(ghost);
            setTimeout(() => ghost.remove(), 800);

            score++; streak++; timeLeft += 3;
            scoreDiv.innerText = score;
            animateTimerAction(true);
            if (streak > 1) {
              spawnIndicator(qContainer, `COMBO x${streak}`, "#a855f7");
            }
          } else {
            btn.classList.add("wrong");
            createExplosion(centerX, centerY, '#ef4444');
            streak = 0; timeLeft = Math.max(0, timeLeft - 4);
            animateTimerAction(false);
            Array.from(grid.children).forEach(b => {
              if(parseInt(b.innerText) === correct) b.classList.add("correct");
            });
          }
          if (streak > maxStreak) maxStreak = streak;
          updateStreakUI();
          setTimeout(() => { if (timeLeft > 0) renderQuestion(); }, 500);
        };
      });
    };

    this.timerInterval = setInterval(() => {
      timeLeft--;
      timerText.innerText = `${timeLeft}s`;

      const ratio = Math.max(0, timeLeft / initialTime);
      const offset = pathLength * (1 - ratio);
      timerPath.style.strokeDashoffset = offset;

      if (timeLeft <= 5 && timeLeft > 0) {
          timerBox.classList.add("timer-panic-mode");
      } else {
          timerBox.classList.remove("timer-panic-mode");
      }

      if (timeLeft <= 0) {
        clearInterval(this.timerInterval);
        document.getElementById("final-score").textContent = score;
        document.getElementById("final-streak").textContent = maxStreak;
        document.getElementById("math-modal").classList.add("active");
        timerBox.classList.remove("timer-panic-mode");
      }
    }, 1000);

    updateStreakUI();
    document.getElementById("math-restart").onclick = () => this.start();
    document.getElementById("math-menu").onclick = () => location.reload();
    document.getElementById("quit-game").onclick = () => location.reload();
    renderQuestion();
  }
};

registerGame("math", mathGame);