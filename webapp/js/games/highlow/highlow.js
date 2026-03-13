import { registerGame } from "../../core/engine.js";
import { HL_DATA } from "./data.js";

let currentCategory = 'stars';
let score = 0;
let streak = 0;
let lives = 3;
let items = [];
let canClick = true;

const highLowGame = {
    start() {
        this.showCategoryMenu();
    },

    // --- МЕНЮ ВЫБОРА КАТЕГОРИЙ ---
    showCategoryMenu() {
        const app = document.getElementById("app");
        app.innerHTML = `
            <div class="menu-wrapper" style="padding-top: 50px; display: flex; flex-direction: column; align-items: center; width: 100%;">
                <div class="menu-header">
                    <h1 class="menu-title">SELECT MODE</h1>
                    <div class="menu-subtitle">Choose your category</div>
                </div>
                <div class="games-grid">
                    <div class="game-card active pulse-on-hover" onclick="window.highLowGame.initGame('stars')" style="--anim-order: 1; border-color: #a855f7;">
                        <div class="game-icon-container"><div class="game-icon float">🌟</div></div>
                        <div class="game-title">CELEBS</div>
                        <div class="game-status" style="color: #a855f7">FOLLOWERS</div>
                    </div>
                    <div class="game-card active pulse-on-hover" onclick="window.highLowGame.initGame('global')" style="--anim-order: 2; border-color: #3b82f6;">
                        <div class="game-icon-container"><div class="game-icon wave">🌍</div></div>
                        <div class="game-title">COUNTRIES</div>
                        <div class="game-status" style="color: #3b82f6">POPULATION</div>
                    </div>
                    <div class="game-card active pulse-on-hover" onclick="window.highLowGame.initGame('movies')" style="--anim-order: 3; border-color: #39ff14;">
                        <div class="game-icon-container"><div class="game-icon wave">🎥</div></div>
                        <div class="game-title">MOVIES</div>
                        <div class="game-status" style="color: #39ff14">BOX OFFICE</div>
                    </div>
                    <div class="game-card active pulse-on-hover" onclick="window.highLowGame.initGame('brands')" style="--anim-order: 4; border-color: #00f2ff;">
                        <div class="game-icon-container"><div class="game-icon wave">💎</div></div>
                        <div class="game-title">BRANDS</div>
                        <div class="game-status" style="color: #00f2ff">MARKET CAP</div>
                    </div>
                </div>

                <button class="hl-premium-nav-btn" onclick="location.reload()" style="margin-top: 40px; --btn-accent: #ff3e3e;">
                    <span>EXIT TO HUB</span>
                </button>
            </div>
            
            <style>
                .hl-premium-nav-btn {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.6);
                    padding: 12px 35px;
                    border-radius: 50px;
                    font-weight: 900;
                    font-size: 12px;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                }
                .hl-premium-nav-btn:hover {
                    border-color: var(--btn-accent, #fff);
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.05);
                    transform: translateY(-1px);
                }
            </style>
        `;
    },

    initGame(category) {
        currentCategory = category;
        score = 0;
        streak = 0;
        lives = 3;
        this.nextRound();
    },

    nextRound() {
        canClick = true;
        const config = HL_DATA[currentCategory];
        const pool = [...config.items].sort(() => 0.5 - Math.random());
        items = [pool[0], pool[1]];
        this.render();
    },

    getStreakHTML() {
        let label = `🔥 x${streak}`;
        let extraClass = '';
        if (streak >= 15) { extraClass = 'streak-15'; label += ' GODLIKE'; }
        else if (streak >= 10) { extraClass = 'streak-10'; label += ' MEGA'; }
        else if (streak >= 5) { extraClass = 'streak-5'; label += ' HOT'; }
        else if (streak >= 3) { extraClass = 'streak-3'; }
        
        return `<div id="hl-streak-display" class="hl-stat-value hl-streak-text ${extraClass}">${label}</div>`;
    },

    render() {
        const config = HL_DATA[currentCategory];
        const app = document.getElementById("app");
        app.style.setProperty('--accent', config.color);

        const getCardHTML = (item, idx) => {
            const path = item.img ? (item.img.startsWith('/') ? item.img : '/' + item.img) : '';
            
            // Определение класса пропорций
            let aspectClass = '';
            if (currentCategory === 'global') aspectClass = 'hl-landscape';
            else if (currentCategory === 'brands') aspectClass = 'hl-square';
            
            return `
                <div class="hl-card-item ${aspectClass}" id="hl-card-${idx}" onclick="window.highLowGame.select(${idx})">
                    <div class="hl-image-container">
                        <img src="${path}" class="hl-card-img" onerror="this.src='https://via.placeholder.com/180x180/111/fff?text=? '">
                    </div>
                    <div class="hl-item-name">${item.name}</div>
                    <div id="hl-val-${idx}" class="hl-card-value">
                        ${item.value.toLocaleString()}
                    </div>
                </div>
            `;
        };

        app.innerHTML = `
            <div class="hl-game-screen">
                <div class="hl-premium-header">
                    <div class="hl-stat-block hl-interactive">
                        <div class="hl-stat-label">LIVES</div>
                        <div class="hl-stat-value hl-lives-icons">${'❤️'.repeat(lives)}${'🖤'.repeat(3 - lives)}</div>
                    </div>
                    <div class="hl-stat-block hl-score-block hl-interactive">
                        <div class="hl-stat-label">SCORE</div>
                        <div class="hl-stat-value" id="hl-score-display">${score}</div>
                    </div>
                    <div class="hl-stat-block hl-interactive">
                        <div class="hl-stat-label">STREAK</div>
                        ${this.getStreakHTML()}
                    </div>
                </div>
                
                <h2 class="hl-main-title">Who has more?</h2>
                
                <div class="hl-grid-row">
                    ${getCardHTML(items[0], 0)}
                    ${getCardHTML(items[1], 1)}
                </div>

                <button class="hl-ingame-back-btn" onclick="window.highLowGame.showCategoryMenu()">
                    BACK TO MENU
                </button>

                <style>
                    .hl-game-screen {
                        display: flex; flex-direction: column; align-items: center;
                        width: 100%; height: 100vh; padding-top: 20px;
                        background: radial-gradient(circle at center, #110718 0%, #000 100%);
                    }
                    
                    .hl-premium-header {
                        display: flex; justify-content: space-between; align-items: center;
                        width: 90%; max-width: 400px; padding: 12px 20px; margin-bottom: 25px;
                        background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 25px; backdrop-filter: blur(10px);
                        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    }
                    .hl-stat-block { display: flex; flex-direction: column; align-items: center; justify-content: center; }
                    .hl-interactive { cursor: pointer; transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
                    .hl-interactive:active { transform: scale(0.85); }
                    
                    .hl-stat-label { font-size: 10px; font-weight: 900; color: rgba(255,255,255,0.4); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
                    .hl-stat-value { font-size: 16px; font-weight: 900; color: #fff; text-shadow: 0 0 10px rgba(255,255,255,0.2); transition: all 0.3s; }
                    .hl-score-block .hl-stat-value { font-size: 26px; color: var(--accent); text-shadow: 0 0 15px var(--accent); }
                    .hl-lives-icons { font-size: 12px; letter-spacing: 3px; }
                    
                    .hl-streak-text { color: #ffa500; text-shadow: 0 0 10px #ffa500; }
                    .streak-3 { color: #ffeb3b; text-shadow: 0 0 15px #ffeb3b; transform: scale(1.05); }
                    .streak-5 { color: #39ff14; text-shadow: 0 0 20px rgba(57, 255, 20, 0.8); transform: scale(1.1); }
                    .streak-10 { 
                        color: #39ff14; 
                        text-shadow: 0 0 25px #39ff14, 0 0 10px #fff; 
                        transform: scale(1.15); 
                        animation: pulseStreak 1s infinite alternate;
                    }
                    .streak-15 {
                        background: linear-gradient(90deg, #39ff14, #00ffff, #a855f7, #ff3e3e);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                        transform: scale(1.2);
                        animation: shakeStreak 0.5s infinite;
                    }
                    
                    @keyframes pulseStreak { 0% { transform: scale(1.15); } 100% { transform: scale(1.25); } }
                    @keyframes shakeStreak { 
                        0% { transform: scale(1.2) rotate(0deg); } 
                        25% { transform: scale(1.2) rotate(-2deg); } 
                        75% { transform: scale(1.2) rotate(2deg); } 
                        100% { transform: scale(1.2) rotate(0deg); } 
                    }

                    .hl-main-title { color: #fff; font-size: 20px; margin-bottom: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }

                    .hl-grid-row { display: grid; grid-template-columns: 160px 160px; gap: 20px; justify-content: center; width: 100%; max-width: 360px; }
                    
                    .hl-card-item { display: flex; flex-direction: column; align-items: center; width: 100%; transition: 0.4s; cursor: pointer; position: relative; }
                    
                    .hl-image-container { 
                        width: 100%; height: 220px; border-radius: 20px; border: 2px solid rgba(255,255,255,0.1); 
                        overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.8); position: relative; 
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); z-index: 2;
                        background: #111;
                    }

                    /* Квадрат для Брендов */
                    .hl-card-item.hl-square .hl-image-container { height: 160px; }
                    /* Ландшафт для Стран */
                    .hl-card-item.hl-landscape .hl-image-container { height: 120px; }
                    
                    .hl-card-item:hover .hl-image-container {
                        transform: translateY(-4px) scale(1.02);
                        border-color: rgba(255,255,255,0.3);
                    }
                    .hl-card-item:active .hl-image-container { transform: scale(0.95); }
                    
                    .hl-card-img { width: 100%; height: 100%; object-fit: cover; }
                    .hl-item-name { 
                        margin-top: 15px; font-size: 13px; font-weight: 900; text-align: center; color: #fff;
                        text-transform: uppercase; line-height: 1.2; letter-spacing: 1px;
                        height: 32px; display: flex; align-items: center; justify-content: center;
                    }
                    
                    .hl-card-value { 
                        display: block; transform: translateY(5px); visibility: hidden; opacity: 0;
                        margin-top: 8px; font-weight: 900; font-size: 18px; min-height: 22px;
                        transition: opacity 0.25s ease;
                    }

                    .hl-correct { z-index: 10; }
                    .hl-correct .hl-image-container { 
                        border-color: #39ff14; transform: scale(1.08);
                        box-shadow: 0 0 40px rgba(57, 255, 20, 0.5);
                    }
                    
                    .hl-correct::before {
                        content: ''; position: absolute; top: 0; left: 0;
                        width: 100%; height: 100%; border-radius: 20px;
                        background: transparent; pointer-events: none; z-index: 1;
                        animation: toxicBlast 0.6s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
                    }

                    .hl-correct .hl-card-value {
                        display: block; color: #39ff14; text-shadow: 0 0 15px #39ff14;
                        animation: popValue 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    }

                    @keyframes toxicBlast {
                        0% { box-shadow: 0 0 0 0 rgba(57, 255, 20, 0.8); }
                        100% { box-shadow: 0 0 0 50px rgba(57, 255, 20, 0); }
                    }
                    
                    @keyframes popValue {
                        0% { opacity: 0; transform: scale(0.5) translateY(10px); }
                        100% { opacity: 1; transform: scale(1) translateY(0); }
                    }

                    .hl-wrong-out { filter: grayscale(1) brightness(0.3); opacity: 0; transform: translateY(50px) rotate(5deg); pointer-events: none; transition: 0.5s; }

                    .hl-ingame-back-btn {
                        margin-top: 20px; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(10px);
                        border: 1px solid #2a163d; color: #916da0; padding: 10px 20px;
                        border-radius: 50px; font-weight: 900; font-size: 13px; letter-spacing: 2px;
                        cursor: pointer; transition: all 0.3s;
                        text-transform: uppercase;
                    }
                    .hl-ingame-back-btn:hover { color: #a240cc; box-shadow: 0 0 15px var(--accent); transform: translateY(-2px); }
                </style>
            </div>
        `;
    },

    select(index) {
        if (!canClick) return;
        canClick = false;

        const other = index === 0 ? 1 : 0;
        const correct = items[index].value >= items[other].value;

        const otherVal = document.getElementById(`hl-val-${other}`);
        const selectedVal = document.getElementById(`hl-val-${index}`);

        otherVal.style.visibility = "visible";
        otherVal.style.opacity = "1";
        otherVal.style.color = "#fff";

        selectedVal.style.visibility = "visible";
        selectedVal.style.opacity = "1";

        const selectedCard = document.getElementById(`hl-card-${index}`);
        const otherCard = document.getElementById(`hl-card-${other}`);

        if (correct) {
            score++;
            streak++;
            document.getElementById('hl-score-display').innerText = score;
            const streakContainer = document.getElementById('hl-streak-display');
            if(streakContainer) streakContainer.outerHTML = this.getStreakHTML();

            selectedCard.classList.add('hl-correct');

            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
            }

            setTimeout(() => {
                selectedCard.classList.remove('hl-correct');
                this.nextRound();
            }, 2400);

        } else {
            streak = 0;
            lives--;

            // Грустный эффект при ошибке
            selectedCard.style.filter = "grayscale(1) brightness(0.5)";
            
            if (window.Telegram?.WebApp?.HapticFeedback) {
                window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
            }

            setTimeout(() => {
                selectedCard.classList.add('hl-wrong-out');
                otherCard.classList.add('hl-wrong-out');

                setTimeout(() => {
                    if (lives > 0) {
                        this.nextRound();
                    } else {
                        this.showStatsModal();
                    }
                }, 500);
            }, 2000);
        }
    },

    showStatsModal() {
        const modal = document.createElement('div');
        modal.id = "hl-premium-modal";
        const accentColor = getComputedStyle(document.getElementById('app')).getPropertyValue('--accent').trim() || '#39ff14';

        modal.style = `position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 10000; backdrop-filter: blur(20px);`;

        modal.innerHTML = `
            <div class="hl-slate-card">
                <div class="hl-slate-top-bar"></div>
                <div class="hl-slate-header">
                    <span class="hl-slate-label">SESSION ENDED</span>
                    <div class="hl-slate-score-wrap">
                        <span class="hl-slate-score-num">${score}</span>
                        <span class="hl-slate-score-unit">PTS</span>
                    </div>
                </div>
                <div class="hl-slate-actions">
                    <button id="modal-mode" class="hl-slate-btn main">
                        <div class="hl-btn-content">
                            <span class="hl-btn-title">PLAY AGAIN</span>
                            <span class="hl-btn-desc">Return to mode selection</span>
                        </div>
                        <div class="hl-btn-arrow">→</div>
                    </button>
                    <button id="modal-hub" class="hl-slate-btn secondary">QUIT TO HUB</button>
                </div>
            </div>
            <style>
                .hl-slate-card { position: relative; width: 88%; max-width: 320px; background: #0a0a0a; border-radius: 24px; padding: 40px 24px 32px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 40px 100px rgba(0,0,0,0.8); animation: slateSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
                .hl-slate-top-bar { position: absolute; top: 0; left: 0; right: 0; height: 4px; background: ${accentColor}; }
                @keyframes slateSlideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
                .hl-slate-header { text-align: center; margin-bottom: 40px; }
                .hl-slate-label { font-size: 10px; font-weight: 900; letter-spacing: 4px; color: rgba(255,255,255,0.3); }
                .hl-slate-score-num { font-size: 72px; font-weight: 900; color: #fff; }
                .hl-slate-score-unit { color: ${accentColor}; font-weight: 900; }
                .hl-slate-btn.main { background: #151515; border-radius: 20px; padding: 20px; display: flex; width: 100%; align-items: center; justify-content: space-between; border: 1px solid rgba(255,255,255,0.05); cursor: pointer; }
                .hl-btn-title { display: block; color: #fff; font-weight: 900; text-align: left; }
                .hl-btn-desc { font-size: 11px; color: rgba(255,255,255,0.4); }
                .hl-btn-arrow { color: ${accentColor}; font-size: 20px; }
                .hl-slate-btn.secondary { background: transparent; border: none; color: rgba(255,255,255,0.4); padding: 15px; width: 100%; font-weight: 900; cursor: pointer; }
            </style>
        `;

        document.body.appendChild(modal);
        document.getElementById('modal-mode').onclick = () => { modal.remove(); this.showCategoryMenu(); };
        document.getElementById('modal-hub').onclick = () => location.reload();
    }
};

window.highLowGame = highLowGame;
registerGame("highlow", highLowGame);