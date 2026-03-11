import { registerGame } from "../../core/engine.js";
import { flagsConfig } from "./flagsConfig.js";

const flagsGame = {
  start() {
    const app = document.getElementById("app");
    const TIME_LIMIT = 5;

    if (!document.getElementById("flags-dynamic-style")) {
      const style = document.createElement("style");
      style.id = "flags-dynamic-style";
      style.textContent = `
        @keyframes heartBeat { 0% { transform: scale(1); } 50% { transform: scale(1.4); color: #ef4444; } 100% { transform: scale(1); } }
        .hearts-damaged { animation: heartBeat 0.6s ease-out; }
        @keyframes idlePulse { 0% { transform: scale(1); opacity: 0.9; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 0.9; } }
        .heart-unit { display: inline-block; cursor: pointer; transition: transform 0.2s; animation: idlePulse 3s infinite ease-in-out; filter: drop-shadow(0 0 2px rgba(239, 68, 68, 0.3)); }
        .heart-unit:hover { transform: scale(1.2) rotate(5deg); }
        
        /* ОБЩИЙ СТИЛЬ КНОПОК ВЫХОДА И ДЕЙСТВИЙ */
        .exit-btn-modern, .result-action-btn { 
          background: rgba(255, 255, 255, 0.05) !important; 
          backdrop-filter: blur(8px); 
          border: 1px solid rgba(255, 255, 255, 0.1) !important; 
          border-radius: 50px !important; 
          padding: 10px 24px !important; 
          color: rgba(255, 255, 255, 0.7) !important; 
          font-size: 13px !important; 
          font-weight: 600 !important; 
          letter-spacing: 0.5px; 
          text-transform: uppercase; 
          cursor: pointer; 
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          gap: 8px; 
        }
        
        .exit-btn-modern:hover, .result-action-btn:hover { 
          background: rgba(239, 68, 68, 0.15) !important; 
          border-color: rgba(239, 68, 68, 0.4) !important; 
          color: #fca5a5 !important; 
          transform: translateY(-2px); 
          box-shadow: 0 5px 15px rgba(239, 68, 68, 0.2); 
        }

        .result-action-btn#result-restart {
          background: rgba(34, 197, 94, 0.1) !important;
          color: #86efac !important;
          border-color: rgba(34, 197, 94, 0.2) !important;
        }
        .result-action-btn#result-restart:hover {
          background: rgba(34, 197, 94, 0.2) !important;
          border-color: rgba(34, 197, 94, 0.5) !important;
          box-shadow: 0 5px 15px rgba(34, 197, 94, 0.2);
        }
        
        .heart-particle { position: absolute; pointer-events: none; font-size: 14px; z-index: 1000; animation: particleFly 0.8s ease-out forwards; }
        @keyframes particleFly { 0% { transform: translate(0, 0) scale(1); opacity: 1; } 100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; } }
        @keyframes shake { 10%, 90% { transform: translate3d(-2px, 0, 0); } 20%, 80% { transform: translate3d(3px, 0, 0); } 30%, 50%, 70% { transform: translate3d(-5px, 0, 0); } 40%, 60% { transform: translate3d(5px, 0, 0); } }
        .shake-effect { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
        
        .game-option-btn { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important; cursor: pointer; }
        .game-option-btn:hover:not(:disabled) { background: rgba(51, 65, 85, 0.9) !important; transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3); border-color: rgba(255, 255, 255, 0.3) !important; }

        @keyframes pulseCorrect { 0% { box-shadow: 0 0 0px 0px rgba(34, 197, 94, 0.7); } 100% { box-shadow: 0 0 20px 15px rgba(34, 197, 94, 0); } }
        .correct-pulse { animation: pulseCorrect 0.6s ease-out; }
        .stat-card { background: rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 12px; border: 1px solid rgba(255, 255, 255, 0.1); }
        .stat-value { font-size: 22px; font-weight: bold; color: #f1f5f9; display: block; }
        .stat-label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        
        .timer-container { width: 220px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-bottom: 15px; overflow: hidden; }
        #timer-bar { width: 100%; height: 100%; background: white; transition: width 0.1s linear; }
        #timer-bar.warning { background: #ef4444; }

        .region-menu { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 320px; margin-top: 20px; }
        .region-btn { 
          padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); 
          border-radius: 16px; color: white; cursor: pointer; transition: all 0.3s; font-weight: 600;
          text-align: left; display: flex; justify-content: space-between; align-items: center;
        }
        .region-btn:hover { background: rgba(255,255,255,0.1); transform: translateY(-2px); border-color: rgba(255,255,255,0.3); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
        .region-btn span { opacity: 0.5; font-size: 12px; background: rgba(255,255,255,0.1); padding: 2px 8px; border-radius: 10px; }
      `;
      document.head.appendChild(style);
    }

    let lives = 3;
    let score = 0;
    let streak = 0;
    let bestStreak = 0;
    let totalAnswered = 0;
    let answered = false;
    let currentFlag = null;
    let timerInterval = null;
    let timeLeft = TIME_LIMIT;
    let currentPool = []; 
    let availableFlags = [];

    // --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
    function spawnHeartParticles(e) {
      const rect = e.target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      for (let i = 0; i < 6; i++) {
        const p = document.createElement('div');
        p.className = 'heart-particle'; p.innerText = '❤️';
        p.style.left = centerX + 'px'; p.style.top = centerY + 'px';
        const dx = (Math.random() - 0.5) * 100 + 'px';
        const dy = (Math.random() - 0.5) * 100 - 50 + 'px';
        p.style.setProperty('--dx', dx); p.style.setProperty('--dy', dy);
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 800);
      }
    }

    function triggerScreenShake() {
      const overlay = app.querySelector('.flags-overlay');
      if (overlay) {
        overlay.classList.add('shake-effect');
        setTimeout(() => overlay.classList.remove('shake-effect'), 500);
      }
    }

    function stopTimer() { if (timerInterval) clearInterval(timerInterval); }

    function startTimer() {
      stopTimer();
      timeLeft = TIME_LIMIT;
      const timerBar = document.getElementById("timer-bar");
      if (!timerBar) return;
      timerBar.style.width = '100%';
      timerBar.classList.remove('warning');
      timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        const percentage = (timeLeft / TIME_LIMIT) * 100;
        timerBar.style.width = percentage + '%';
        if (timeLeft <= 2) timerBar.classList.add('warning');
        if (timeLeft <= 0) { stopTimer(); handleTimeout(); }
      }, 100);
    }

    function handleTimeout() {
      if (answered) return;
      answered = true;
      totalAnswered++; lives--; streak = 0;
      triggerScreenShake();
      const optionsContainer = app.querySelector(".flags-options-grid");
      if (optionsContainer) {
        optionsContainer.querySelectorAll("button").forEach(b => {
          b.disabled = true;
          if (b.innerText === currentFlag.name) b.style.background = "#22c55e";
        });
      }
      updateHeartsUI();
      setTimeout(renderQuestion, 1200);
    }

    function updateHeartsUI() {
      const heartsCont = document.getElementById("hearts-container");
      if (!heartsCont) return;
      heartsCont.innerHTML = '';
      for (let i = 0; i < lives; i++) {
        const span = document.createElement('span');
        span.className = 'heart-unit'; span.innerText = '❤️';
        span.onclick = (e) => spawnHeartParticles(e);
        heartsCont.appendChild(span);
      }
      heartsCont.classList.add("hearts-damaged");
      setTimeout(() => heartsCont.classList.remove("hearts-damaged"), 600);
    }

    // --- ВЫБОР РЕГИОНА (ВЫРАВНИВАНИЕ СВЕРХУ) ---
    function renderRegionMenu() {
      stopTimer();
      lives = 3; score = 0; streak = 0; bestStreak = 0; totalAnswered = 0;
      
      app.innerHTML = `
        <div class="flags-overlay" style="display:flex; flex-direction:column; align-items:center; justify-content:flex-start; padding:40px 20px; color: white; font-family: sans-serif; height: 100%; box-sizing: border-box;">
          <h1 style="margin-bottom:5px; letter-spacing: 2px; font-weight: 800; text-align:center; text-transform: uppercase;">Select Region</h1>
          <p style="color: #94a3b8; margin-bottom: 20px; font-size: 14px;">Choose your challenge level</p>
          
          <div class="region-menu">
            <button class="region-btn" data-region="All">🌍 All Flags <span>${flagsConfig.length}</span></button>
            <button class="region-btn" data-region="Europe">🇪🇺 Europe <span>${flagsConfig.filter(f => f.region === 'Europe').length}</span></button>
            <button class="region-btn" data-region="Asia-Oceania">🌏 Asia & Oceania <span>${flagsConfig.filter(f => f.region === 'Asia-Oceania').length}</span></button>
            <button class="region-btn" data-region="Americas">🌎 Americas <span>${flagsConfig.filter(f => f.region === 'Americas').length}</span></button>
            <button class="region-btn" data-region="Africa">🌍 Africa <span>${flagsConfig.filter(f => f.region === 'Africa').length}</span></button>
          </div>

          <button id="main-exit" class="exit-btn-modern" style="margin-top: 40px; width: 200px;">
            <span>←</span> Back to Core
          </button>
        </div>
      `;

      app.querySelectorAll('.region-btn').forEach(btn => {
        btn.onclick = () => {
          const region = btn.dataset.region;
          currentPool = region === "All" ? [...flagsConfig] : flagsConfig.filter(f => f.region === region);
          availableFlags = [...currentPool];
          renderQuestion();
        };
      });

      document.getElementById("main-exit").onclick = () => location.reload();
    }

    function renderQuestion() {
      answered = false;
      stopTimer();

      if (lives <= 0 || availableFlags.length === 0) {
        showResult();
        return;
      }

      const randomIndex = Math.floor(Math.random() * availableFlags.length);
      currentFlag = availableFlags.splice(randomIndex, 1)[0];
      
      const options = [currentFlag];
      while (options.length < 4 && options.length < currentPool.length) {
        const opt = currentPool[Math.floor(Math.random() * currentPool.length)];
        if (!options.includes(opt)) options.push(opt);
      }
      
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      app.innerHTML = `
        <div class="flags-overlay" style="display:flex; flex-direction:column; align-items:center; padding:20px; box-sizing:border-box; color: white; font-family: sans-serif; position: relative; width: 100%; height: 100%;">
          <h1 class="menu-title" style="margin-bottom:10px; letter-spacing: 2px; font-weight: 800; text-align:center;">FLAG GUESS</h1>
          <div style="height: 35px; margin-bottom: 5px;">
            ${streak >= 2 ? `<div class="streak-badge" style="background: linear-gradient(45deg, #f59e0b, #ef4444); padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: bold; box-shadow: 0 4px 10px rgba(245, 158, 11, 0.3);">🔥 ${streak} STREAK</div>` : ''}
          </div>
          <div class="timer-container"><div id="timer-bar"></div></div>
          <div style="margin-bottom: 20px;">
            <img src="${currentFlag.image}" alt="Flag" style="width:220px; height:130px; object-fit:cover; border-radius:12px; box-shadow: 0 8px 25px rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.1);">
          </div>
          <div class="flags-options-grid" style="display:grid; grid-template-columns:repeat(2, 1fr); gap:16px; width:100%; max-width:400px; margin-bottom:25px;"></div>
          <div id="hearts-container" style="margin-bottom:30px; font-size: 28px; letter-spacing: 8px;"></div>
          
          <button id="go-back" class="exit-btn-modern"><span>←</span> Exit to Regions</button>
          
          <div id="result-modal" style="display:none; position:absolute; top:48%; left:50%; transform:translate(-50%, -50%) scale(0.8); background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color:white; padding:30px; border-radius:24px; text-align:center; z-index:2000; width:85%; max-width:380px; opacity:0; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); box-shadow: 0 20px 40px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1);">
            <h2 style="margin-top:0; font-size: 24px;">Session Complete!</h2>
            <div id="stats-content"></div>
            <div style="margin-top:30px; display:flex; flex-direction: column; gap:12px;">
              <button id="result-restart" class="result-action-btn">Play Again</button>
              <button id="result-back" class="result-action-btn">Back to Menu</button>
            </div>
          </div>
        </div>
      `;

      updateHeartsUI();
      startTimer();
      const optionsContainer = app.querySelector(".flags-options-grid");

      options.forEach(option => {
        const btn = document.createElement("button");
        btn.className = "game-card game-option-btn";
        btn.innerText = option.name;
        btn.style.cssText = `height:60px; border-radius:12px; font-weight:bold; font-size:15px; background: rgba(30,41,59,0.7); color:white; border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(10px);`;
        optionsContainer.appendChild(btn);

        btn.onclick = () => {
          if (answered) return;
          answered = true; stopTimer(); totalAnswered++;
          optionsContainer.querySelectorAll("button").forEach(b => b.disabled = true);

          if (option === currentFlag) {
            btn.style.background = "#22c55e";
            btn.classList.add("correct-pulse");
            score++; streak++;
            if (streak > bestStreak) bestStreak = streak;
          } else {
            btn.style.background = "#dc2626";
            triggerScreenShake(); lives--; streak = 0; updateHeartsUI();
            optionsContainer.querySelectorAll("button").forEach(b => {
              if (b.innerText === currentFlag.name) b.style.background = "#22c55e";
            });
          }
          setTimeout(renderQuestion, 1200);
        };
      });

      document.getElementById("go-back").onclick = renderRegionMenu;
    }

    function showResult() {
      stopTimer();
      const modal = document.getElementById("result-modal");
      const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;
      
      document.getElementById("stats-content").innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="stat-card"><span class="stat-label">Score</span><span class="stat-value">${score}</span></div>
            <div class="stat-card"><span class="stat-label">Accuracy</span><span class="stat-value">${accuracy}%</span></div>
        </div>
        <div class="stat-card" style="margin-top: 10px; background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.2);">
            <span class="stat-label" style="color: #f59e0b;">Best Streak</span><span class="stat-value" style="color: #f59e0b;">🔥 ${bestStreak}</span>
        </div>
        ${availableFlags.length === 0 && lives > 0 ? `<p style="color:#22c55e; margin-top:15px; font-weight:bold;">🏆 Region Cleared!</p>` : ''}
      `;
      
      modal.style.display = "block";
      setTimeout(() => { modal.style.opacity = "1"; modal.style.transform = "translate(-50%, -50%) scale(1)"; }, 10);
      
      document.getElementById("result-restart").onclick = () => {
        lives = 3; score = 0; streak = 0; bestStreak = 0; totalAnswered = 0;
        availableFlags = [...currentPool];
        modal.style.opacity = "0";
        setTimeout(() => { modal.style.display = "none"; renderQuestion(); }, 300);
      };
      
      document.getElementById("result-back").onclick = () => {
        modal.style.opacity = "0";
        setTimeout(renderRegionMenu, 300);
      };
    }

    renderRegionMenu();
  }
};

registerGame("flags", flagsGame);