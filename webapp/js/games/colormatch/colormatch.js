import { registerGame } from "../../core/engine.js";

const COLORS = [
    { name: 'RED', value: '#ff0000' },
    { name: 'BLUE', value: '#0066ff' },
    { name: 'GREEN', value: '#00ff00' },
    { name: 'YELLOW', value: '#ffff00' },
    { name: 'PURPLE', value: '#bf00ff' },
    { name: 'WHITE', value: '#ffffff' },
    { name: 'ORANGE', value: '#ff8000' },
    { name: 'CYAN', value: '#00ffff' }
];

let score = 0, timeLeft = 30, streak = 0, maxStreak = 0;
let timer = null, targetColorIdx = null;
const INITIAL_TIME = 30;

const colorMatchGame = {
    start() {
        if (timer) clearInterval(timer);
        score = 0; timeLeft = INITIAL_TIME; streak = 0; maxStreak = 0;
        this.injectStyles();
        this.renderLayout();
        this.nextRound();
        this.startTimer();
    },

    injectStyles() {
        if (document.getElementById("cm-challenge-style")) return;
        const style = document.createElement("style");
        style.id = "cm-challenge-style";
        style.textContent = `
            .cm-challenge-overlay {
                display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
                padding: 30px 20px; min-height: 100vh; background: #0f172a; color: white;
                font-family: system-ui, -apple-system, sans-serif; box-sizing: border-box; user-select: none;
                position: relative; overflow: hidden; z-index: 1000;
            }

            #cm-viewport {
                transition: transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                transform-style: preserve-3d;
                width: 100%; display: flex; flex-direction: column; align-items: center;
            }

            .timer-bar-container {
                width: 100%; max-width: 440px; height: 10px; background: rgba(0,0,0,0.4);
                border-radius: 20px; margin-bottom: 25px; overflow: hidden; position: relative;
                box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);
            }
            .timer-bar-fill {
                height: 100%; width: 100%;
                background: linear-gradient(90deg, #00c6ff, #0072ff);
                border-radius: 20px;
                transition: width 1s linear, background 0.3s, box-shadow 0.3s;
                position: relative;
            }
            
            .timer-bar-fill::after {
                content: ''; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                background: inherit; filter: blur(10px); opacity: 0.8;
                border-radius: inherit; transition: inherit;
            }

            .cm-shatter-piece {
                position: fixed; pointer-events: none; font-weight: 900;
                z-index: 1500;
                filter: drop-shadow(0 0 var(--glow, 7px) var(--piece-color)) drop-shadow(0 0 calc(var(--glow, 7px) * 2) var(--piece-color));
                font-size: calc((18px + 10 * var(--size-multi)) * var(--power-scale, 1)); 
                color: var(--piece-color);
                animation: shatterArced 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
            }
            @keyframes shatterArced {
                0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
                25% { transform: translate(calc(-50% + var(--dx) * 0.4), calc(-50% + var(--dy) * 0.4 - 50px)) scale(1.3) rotate(calc(var(--rot) * 0.25)); opacity: 1; }
                100% { transform: translate(calc(-50% + var(--dx)), 110vh) scale(0.6) rotate(var(--rot)); opacity: 0; }
            }

            .cm-ghost-number {
                position: fixed; pointer-events: none; font-weight: 900;
                font-size: 32px; color: #22c55e; z-index: 2500;
                text-shadow: 0 0 15px rgba(34, 197, 94, 0.8);
                animation: ghostFly 0.8s cubic-bezier(0.2, 0, 0.2, 1) forwards;
            }
            @keyframes ghostFly {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                100% { transform: translate(-50%, -150px) scale(2.5); opacity: 0; }
            }

            .cm-particle {
                position: fixed; pointer-events: none; border-radius: 50%; z-index: 1000;
                animation: particleFade 0.6s ease-out forwards;
            }
            @keyframes particleFade {
                0% { transform: translate(0, 0) scale(1); opacity: 1; }
                100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
            }

            .cm-palette-particle {
                position: fixed; pointer-events: none; border-radius: 4px; z-index: 1001;
                width: 12px; height: 12px; 
                animation: paletteSplash 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
            }
            @keyframes paletteSplash {
                0% { transform: translate(-50%, -50%) scale(0) rotate(0deg); opacity: 1; }
                100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1.5) rotate(var(--rot)); opacity: 0; }
            }

            .shake-screen { animation: screenShake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
            @keyframes screenShake {
                10%, 90% { transform: translate3d(-2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }

            .question-container {
                border: 3px solid rgba(255, 255, 255, 0.3);
                padding: 16px 20px; border-radius: 24px; margin-bottom: 25px;
                width: 100%; max-width: 440px; 
                text-align: center; position: relative;
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: visible;
                z-index: 5;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
            
            .cm-main-question {
                font-size: 48px; font-weight: 900; position: relative; 
                z-index: 2; transition: opacity 0.1s, transform 0.1s; 
                text-shadow: 0 4px 15px rgba(0,0,0,0.9), 0 0 5px rgba(0,0,0,1);
                text-transform: uppercase; letter-spacing: -1px;
                transform-origin: top center; cursor: pointer;
            }

            .cm-main-question.sad-fade {
                animation: sadDissolve 0.6s cubic-bezier(0.3, 0, 0.5, 1) forwards;
            }
            @keyframes sadDissolve {
                0% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
                30% { opacity: 0.8; transform: scale(0.98) translateY(5px); filter: blur(1px); }
                100% { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(8px); }
            }

            .question-container.on-fire {
                animation: qPlasmaPulse 2s infinite alternate;
                border-color: var(--streak-color);
            }
            @keyframes qPlasmaPulse {
                0% { box-shadow: 0 0 20px var(--streak-color), inset 0 0 10px var(--streak-color); }
                100% { box-shadow: 0 0 40px var(--streak-color), inset 0 0 20px var(--streak-color); }
            }

            .cm-stat-box {
                background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 12px 24px; border-radius: 16px; text-align: center; min-width: 90px;
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                position: relative; cursor: pointer;
                user-select: none;
            }

            /* Эффекты при клике на статы */
            .cm-stat-box.stat-pulse {
                animation: toxicNeonPulse 0.5s ease-out;
            }
            @keyframes toxicNeonPulse {
                0% { box-shadow: 0 0 0 0 rgba(57, 255, 20, 0.8), inset 0 0 15px rgba(57, 255, 20, 0.6); transform: scale(0.9); }
                50% { box-shadow: 0 0 25px 15px rgba(57, 255, 20, 0), inset 0 0 30px rgba(57, 255, 20, 0.9); transform: scale(1.15); }
                100% { box-shadow: 0 0 0 0 rgba(57, 255, 20, 0), inset 0 0 0 rgba(57, 255, 20, 0); transform: scale(1); }
            }

            .stat-spark {
                position: fixed; pointer-events: none; border-radius: 50%;
                background: #39ff14; box-shadow: 0 0 10px #39ff14, 0 0 20px #39ff14;
                z-index: 3000;
                animation: sparkFly 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
            }
            @keyframes sparkFly {
                0% { transform: translate(-50%, -50%) scale(1.5); opacity: 1; }
                100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0); opacity: 0; }
            }

            .cm-header-block { text-align: center; margin-top: 15px; margin-bottom: 25px; }
            .cm-title {
                font-size: clamp(34px, 9vw, 52px); font-weight: 900; letter-spacing: 2px;
                text-transform: uppercase; background: linear-gradient(135deg, #60a5fa 0%, #a855f7 100%);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                filter: drop-shadow(0 0 12px rgba(168, 85, 247, 0.4)); margin: 0;
            }
            .cm-stats-row { display: flex; gap: 20px; margin-bottom: 15px; position: relative; z-index: 10; }
            .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 4px; font-weight: 700; }
            .stat-value { font-size: 22px; font-weight: 800; color: #f1f5f9; transition: color 0.3s; }

            .streak-tag {
                position: absolute; top: 2px; right: 20px; font-size: 11px; font-weight: 900;
                color: #94a3b8; opacity: 0; transform: translateY(-10px); transition: all 0.3s ease;
                text-transform: uppercase; letter-spacing: 1px; z-index: 10;
                text-shadow: 0 2px 5px rgba(0,0,0,0.8);
            }
            .on-fire .streak-tag { opacity: 1; transform: translateY(0); color: #fff;}

            .cm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; width: 100%; max-width: 440px; margin-bottom: 25px; z-index: 5; }
            
            .cm-btn {
                border: 2px solid rgba(255, 255, 255, 0.4);
                padding: 24px; border-radius: 20px; 
                font-size: 20px; font-weight: 900; text-transform: uppercase;
                cursor: pointer; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); -webkit-tap-highlight-color: transparent;
                position: relative; overflow: hidden;
                text-shadow: 0 2px 8px rgba(0,0,0,0.9), 0 0 3px rgba(0,0,0,1);
                box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            }
            
            .cm-btn::before {
                content: ''; position: absolute; top: 0; left: -150%; width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                transition: left 0.6s ease;
            }

            /* ИЗМЕНЕНО: Эффект при наведении без смены цвета */
            @media (hover: hover) and (pointer: fine) {

                .cm-btn:hover {
                    transform: scale(1.06) translateY(-4px);
                    box-shadow: 0 12px 30px var(--btn-glow, rgba(255,255,255,0.6)), inset 0 0 15px rgba(255,255,255,0.3);
                    z-index: 10;
                    border-color: rgba(255, 255, 255, 0.9);
                }

                .cm-btn:hover::before { 
                    left: 150%; 
                }

            }
            
            .cm-btn:hover::before { left: 150%; } 
            .cm-btn:active { transform: scale(0.92) translateY(0); box-shadow: 0 2px 10px rgba(0,0,0,0.5); }

            .cm-btn.wrong { animation: btnShake 0.4s ease-in-out; border-color: #ef4444 !important; background: #ef4444 !important; color: #fff !important;}
            .cm-btn.correct { border-color: #22c55e !important; background: #22c55e !important; color: #fff !important;}

            .action-btn { 
                background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 50px; padding: 12px 28px; color: rgba(255, 255, 255, 0.7);
                font-size: 11px; font-weight: 700; text-transform: uppercase; cursor: pointer; 
                transition: all 0.4s ease; margin-top: 10px; position: relative; overflow: hidden;
                box-shadow: 0 4px 6px rgba(0,0,0,0.2);
            }
            
            .action-btn::before {
                content: ''; position: absolute; top: 0; left: -150%; width: 100%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
                transition: left 0.6s ease;
            }
            
            .action-btn:hover { 
                background: rgba(239, 68, 68, 0.15); 
                color: #ef4444; 
                border-color: rgba(239, 68, 68, 0.5); 
                backdrop-filter: blur(5px); 
                box-shadow: 0 6px 15px rgba(239, 68, 68, 0.3); 
                transform: translateY(-2px);
            }
            
            .action-btn:hover::before { left: 150%; }

            .cm-modal {
                display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%);
                background: rgba(15, 23, 42, 0.9); 
                border: 1px solid rgba(168, 85, 247, 0.4); 
                backdrop-filter: blur(15px); 
                padding: 30px 25px; border-radius: 35px; text-align: center; 
                z-index: 2000; width: 92%; max-width: 380px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(168, 85, 247, 0.2);
            }
            .cm-modal.active { display: block; animation: modalPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            
            .modal-title {
                color:#fff; font-size: 28px; font-weight:900; margin-bottom: 20px; 
                text-transform: uppercase; letter-spacing: 2px;
                background: linear-gradient(135deg, #fff 0%, #a855f7 100%);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            }

            .modal-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 25px; }
            
            .modal-stat-card {
                background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 18px; padding: 12px 8px;
            }
            
            .modal-stat-card .stat-label { font-size: 9px; color: #818cf8; margin-bottom: 4px; }
            .modal-stat-card .stat-value { font-size: 32px; font-weight: 900; color: #fff; line-height: 1; }
            
            .modal-stat-card.streak-card .stat-label { color: #f472b6; }
            .modal-stat-card.streak-card .stat-value { font-size: 26px; color: #f472b6; }

            .modal-play-again { 
                width: 100%; padding: 16px; border-radius: 18px; border: none;
                background: linear-gradient(135deg, #3b82f6 0%, #a855f7 100%);
                color: white; font-weight: 800; font-size: 16px; cursor: pointer;
                transition: 0.3s ease; position: relative; overflow: hidden;
            }
            .modal-play-again:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(168, 85, 247, 0.4); }
        `;
        document.head.appendChild(style);
    },

    renderLayout() {
        const app = document.getElementById("app");
        app.innerHTML = `
            <div id="cm-viewport" class="cm-challenge-overlay">
                <div class="cm-header-block"><h1 class="cm-title">CHALLENGE</h1></div>
                
                <div class="cm-stats-row">
                    <div id="time-box" class="cm-stat-box" onclick="colorMatchGame.triggerStatEffect(this, event)">
                        <span class="stat-label">Time</span>
                        <span id="cm-timer" class="stat-value">30s</span>
                    </div>
                    <div id="score-box" class="cm-stat-box" onclick="colorMatchGame.triggerStatEffect(this, event)">
                        <span class="stat-label">Score</span>
                        <span id="cm-score" class="stat-value">0</span>
                    </div>
                </div>

                <div class="timer-bar-container">
                    <div id="cm-timer-bar" class="timer-bar-fill"></div>
                </div>

                <div id="q-container" class="question-container">
                    <span id="streak-tag" class="streak-tag">STREAK x0</span>
                    <div class="cm-main-question" id="cm-word">---</div>
                </div>

                <div class="cm-grid" id="cm-grid"></div>
                
                <button class="action-btn" onclick="location.reload()">Back to Menu</button>
                
                <div id="cm-modal" class="cm-modal">
                    <h2 class="modal-title">GAME OVER</h2>
                    
                    <div class="modal-stats-grid">
                        <div class="modal-stat-card score-card">
                            <div class="stat-label">SCORE</div>
                            <div id="final-score" class="stat-value">0</div>
                        </div>
                        <div class="modal-stat-card streak-card">
                            <div class="stat-label">MAX STREAK</div>
                            <div id="final-streak" class="stat-value">0</div>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button id="cm-restart" class="modal-play-again">PLAY AGAIN</button>
                        <button class="action-btn" style="width: 100%; margin: 0; padding: 12px; border-radius: 12px;" onclick="location.reload()">MAIN MENU</button>
                    </div>
                </div>
            </div>
        `;
        
        const wordEl = document.getElementById("cm-word");
        wordEl.onclick = (e) => this.createPaletteSplash(e.clientX, e.clientY);

        document.getElementById("cm-restart").onclick = () => {
            document.getElementById("cm-modal").classList.remove("active");
            this.start();
        };
    },

    // ДОБАВЛЕНО: Эффект клика по статам (Time, Score)
    triggerStatEffect(el, e) {
        el.classList.remove("stat-pulse");
        void el.offsetWidth; // Триггер рефлоу для перезапуска анимации
        el.classList.add("stat-pulse");
        
        const rect = el.getBoundingClientRect();
        const x = e ? e.clientX : rect.left + rect.width / 2;
        const y = e ? e.clientY : rect.top + rect.height / 2;

        for (let i = 0; i < 10; i++) {
            const spark = document.createElement('div');
            spark.className = 'stat-spark';
            const size = Math.random() * 6 + 3;
            spark.style.width = `${size}px`; 
            spark.style.height = `${size}px`;
            spark.style.left = `${x}px`;
            spark.style.top = `${y}px`;
            
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 80 + 40;
            
            spark.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
            spark.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
            
            document.body.appendChild(spark);
            setTimeout(() => spark.remove(), 600);
        }
    },

    createPaletteSplash(x, y) {
        COLORS.forEach((color, i) => {
            for(let j = 0; j < 2; j++) {
                const p = document.createElement('div');
                p.className = 'cm-palette-particle';
                p.style.backgroundColor = color.value;
                p.style.left = `${x}px`;
                p.style.top = `${y}px`;
                
                const angle = (Math.PI * 2 / (COLORS.length * 2)) * (i * 2 + j);
                const dist = 100 + Math.random() * 50;
                
                p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
                p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
                p.style.setProperty('--rot', `${Math.random() * 360}deg`);
                
                document.body.appendChild(p);
                setTimeout(() => p.remove(), 800);
            }
        });
    },

    nextRound() {
        const wordIdx = Math.floor(Math.random() * COLORS.length);
        targetColorIdx = Math.floor(Math.random() * COLORS.length);
        
        const qContainer = document.getElementById("q-container");
        const wordEl = document.getElementById("cm-word");
        
        // ИЗМЕНЕНО: Яркий сплошной цвет для фона вопроса
        qContainer.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)].value; 

        wordEl.innerText = COLORS[wordIdx].name;
        wordEl.style.color = COLORS[targetColorIdx].value;
        
        wordEl.classList.remove("sad-fade");
        wordEl.style.opacity = "1";
        wordEl.style.transform = "scale(1) translateY(0)";
        wordEl.style.filter = "blur(0)";

        this.renderButtons();
    },

    renderButtons() {
        const grid = document.getElementById("cm-grid");
        grid.innerHTML = '';
        
        const options = new Set([targetColorIdx]);
        while(options.size < 4) options.add(Math.floor(Math.random() * COLORS.length));
        const finalOptions = Array.from(options).sort(() => Math.random() - 0.5);
        
        // ИЗМЕНЕНО: Получаем 4 уникальных ярких фона и 4 уникальных цвета для шрифтов
        const shuffledBg = [...COLORS].sort(() => Math.random() - 0.5).slice(0, 4);
        const shuffledText = [...COLORS].sort(() => Math.random() - 0.5).slice(0, 4);

        finalOptions.forEach((idx, i) => {
            const btn = document.createElement('button');
            btn.className = 'cm-btn';
            btn.innerText = COLORS[idx].name;
            btn.style.color = shuffledText[i].value; 
            btn.style.backgroundColor = shuffledBg[i].value; 
            btn.style.setProperty('--btn-glow', shuffledBg[i].value); // Передаем цвет для неона при наведении
            
            btn.onclick = (e) => this.checkAnswer(idx, e, btn);
            grid.appendChild(btn);
        });
    },

    checkAnswer(selectedIdx, e, btn) {
        const isCorrect = selectedIdx === targetColorIdx;
        const viewport = document.getElementById("cm-viewport");
        const qEl = document.getElementById("cm-word");
        const x = e.clientX, y = e.clientY;

        document.getElementById("cm-grid").style.pointerEvents = "none";

        const tiltX = (x - window.innerWidth / 2) / 60;
        const tiltY = (y - window.innerHeight / 2) / 60;
        viewport.style.transform = `perspective(1000px) rotateX(${-tiltY}deg) rotateY(${tiltX}deg) scale(0.98)`;
        setTimeout(() => { viewport.style.transform = `scale(1)`; }, 150);

        if (isCorrect) {
            streak++;
            score += 10 + (Math.floor(streak / 5) * 5);
            timeLeft = Math.min(INITIAL_TIME, timeLeft + 3);
            btn.classList.add("correct");
            this.createExplosion(x, y, '#22c55e');
            this.spawnGhost(x, y, '#22c55e', `+${10 + (Math.floor(streak / 5) * 5)}`);
            this.shatterText(qEl);
        } else {
            if (streak > maxStreak) maxStreak = streak;
            streak = 0;
            timeLeft = Math.max(0, timeLeft - 4);
            btn.classList.add("wrong");
            this.createExplosion(x, y, '#ef4444');
            viewport.classList.add("shake-screen");
            setTimeout(() => viewport.classList.remove("shake-screen"), 400);
            qEl.classList.add("sad-fade");
        }

        document.getElementById("cm-score").innerText = score;
        this.updateStreakUI();
        this.updateTimerBar();

        setTimeout(() => {
            if (document.getElementById("cm-grid")) {
                document.getElementById("cm-grid").style.pointerEvents = "all";
            }
            if (timeLeft > 0) this.nextRound();
        }, isCorrect ? 300 : 650);
    },

    shatterText(el) {
        const rect = el.getBoundingClientRect();
        const color = el.style.color;
        const power = 1 + (streak * 0.05);

        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'cm-shatter-piece';
            const pieces = [...'01'.split(''), '+', '-', '×', '÷', '?', '=', '!', '#', '%', '$'];
            p.innerText = pieces[Math.floor(Math.random() * pieces.length)];
            p.style.left = `${rect.left + rect.width / 2}px`;
            p.style.top = `${rect.top + rect.height / 2}px`;
            p.style.setProperty('--piece-color', color);
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
        el.style.opacity = "0";
        el.style.transform = "scale(0.1)";
    },

    spawnGhost(x, y, color, text) {
        const ghost = document.createElement('div');
        ghost.className = 'cm-ghost-number';
        ghost.innerText = text;
        ghost.style.color = color; ghost.style.left = `${x}px`; ghost.style.top = `${y}px`;
        document.body.appendChild(ghost);
        setTimeout(() => ghost.remove(), 800);
    },

    createExplosion(x, y, color) {
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'cm-particle';
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
    },

    updateStreakUI() {
        const qContainer = document.getElementById("q-container");
        const streakTag = document.getElementById("streak-tag");
        const viewport = document.getElementById("cm-viewport");

        if (streak >= 3) {
            qContainer.classList.add("on-fire");
            streakTag.innerText = `STREAK x${streak}`;
            let color = streak >= 10 ? '#ef4444' : (streak >= 5 ? '#fbbf24' : '#22c55e');
            viewport.style.setProperty("--streak-color", color);
        } else {
            qContainer.classList.remove("on-fire");
        }
    },

    updateTimerBar() {
        const bar = document.getElementById("cm-timer-bar");
        if (bar) {
            const percent = (timeLeft / INITIAL_TIME) * 100;
            bar.style.width = `${percent}%`;
            if (percent > 60) {
                bar.style.background = 'linear-gradient(90deg, #00c6ff, #0072ff)';
                bar.style.boxShadow = '0 0 10px rgba(0, 114, 255, 0.5)';
            } else if (percent > 30) {
                bar.style.background = 'linear-gradient(90deg, #a855f7, #ec4899)';
                bar.style.boxShadow = '0 0 15px rgba(236, 72, 153, 0.6)';
            } else {
                bar.style.background = 'linear-gradient(90deg, #f59e0b, #ff4500)';
                bar.style.boxShadow = '0 0 25px rgba(255, 69, 0, 0.9), 0 0 10px rgba(245, 158, 11, 0.7)';
            }
        }
    },

    startTimer() {
        this.updateTimerBar();
        timer = setInterval(() => {
            timeLeft--;
            const timerEl = document.getElementById("cm-timer");
            if (timerEl) timerEl.innerText = `${timeLeft}s`;
            this.updateTimerBar();
            if (timeLeft <= 0) {
                clearInterval(timer);
                if (streak > maxStreak) maxStreak = streak;
                document.getElementById("final-score").innerText = score;
                document.getElementById("final-streak").innerText = maxStreak;
                document.getElementById("cm-modal").classList.add("active");
            }
        }, 1000);
    }
};

registerGame("colormatch", colorMatchGame);