import { registerGame } from "../../core/engine.js";

const memoryGame = {
  start() {
    const app = document.getElementById("app");

    if (!document.getElementById("memory-dynamic-style")) {
      const style = document.createElement("style");
      style.id = "memory-dynamic-style";
      style.textContent = `
        .memory-overlay {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          padding: 10px 20px 40px 20px;
          min-height: 100vh;
          background: #0f172a;
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
          box-sizing: border-box;
          overflow-y: auto;
        }

        .memory-title {
          font-size: clamp(34px, 10vw, 50px);
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #943d9e 0%, #ad80da 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.4));
          margin: 0;
          text-align: center;
        }

        .memory-subtitle {
          color: #94a3b8;
          margin-bottom: 15px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          text-align: center;
        }

        .level-menu {
          display: flex;
          flex-direction: column;
          gap: 8px; /* Уменьшили зазор между кнопками */
          width: 100%;
          max-width: 320px;
          margin-bottom: 20px;
        }

        .level-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 20px; /* Сделали боксы компактнее (было 18/24) */
          border-radius: 16px;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.3s ease;
        }

        .level-card:hover {
          background: rgba(168, 85, 247, 0.1);
          border-color: rgba(168, 85, 247, 0.4);
          transform: translateY(-2px);
        }

        .level-info h3 { margin: 0; font-size: 16px; color: #f8fafc; } /* Чуть меньше шрифт */
        .level-info span { font-size: 10px; color: #64748b; font-family: monospace; }

        .memory-grid {
          display: grid;
          gap: clamp(8px, 2vw, 12px);
          margin-bottom: 25px;
          justify-content: center;
        }

        .memory-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .memory-card.flipped {
          background: rgba(168, 85, 247, 0.15);
          border-color: rgba(168, 85, 247, 0.6);
          transform: rotateY(180deg);
        }

        @keyframes matchFlash {
          0% { transform: rotateY(180deg) scale(1); }
          50% { transform: rotateY(180deg) scale(1.05); box-shadow: 0 0 30px rgba(34, 197, 94, 0.4); border-color: #22c55e; }
          100% { transform: rotateY(180deg) scale(1); border-color: rgba(34, 197, 94, 0.5); }
        }
        .memory-card.matched {
          animation: matchFlash 0.5s ease-out forwards;
          background: rgba(34, 197, 94, 0.1) !important;
        }

        .action-btn { 
          background: rgba(255, 255, 255, 0.05); 
          border: 1px solid rgba(255, 255, 255, 0.1); 
          border-radius: 50px; 
          padding: 12px 30px; 
          color: rgba(255, 255, 255, 0.8); 
          font-size: 13px; font-weight: 700; 
          text-transform: uppercase; cursor: pointer; 
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateY(-2px);
        }

        .btn-exit-hover:hover {
          background: rgba(239, 68, 68, 0.2) !important;
          border-color: rgba(239, 68, 68, 0.5) !important;
          color: #ffffff !important;
        }

        .win-modal {
          display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%) scale(0.8);
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          padding: 35px; border-radius: 30px; text-align: center; z-index: 2000;
          width: 90%; max-width: 340px; opacity: 0;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 1px solid rgba(168, 85, 247, 0.3);
          box-shadow: 0 25px 50px rgba(0,0,0,0.6);
        }
        .win-modal.active { display: block; opacity: 1; transform: translate(-50%, -50%) scale(1); }

        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
        .stat-card { background: rgba(255, 255, 255, 0.03); border-radius: 16px; padding: 15px; border: 1px solid rgba(255, 255, 255, 0.08); }
        .stat-value { font-size: 22px; font-weight: 800; color: #f1f5f9; display: block; }
        .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; margin-top: 4px; }

        .modal-btns { display: flex; flex-direction: column; gap: 10px; }
        .btn-restart { background: rgba(168, 85, 247, 0.15) !important; border-color: #a855f7 !important; color: white !important; }
      `;
      document.head.appendChild(style);
    }

    const levels = [
      { id: 'easy', name: 'Easy', rows: 3, cols: 4 },
      { id: 'medium', name: 'Medium', rows: 4, cols: 4 },
      { id: 'hard', name: 'Hard', rows: 5, cols: 6 },
      { id: 'master', name: 'Master', rows: 6, cols: 6 }
    ];

    const symbols = ["🍎","🍌","🍇","🍉","🍓","🍒","🥝","🍍","🥭","🍑","🍐","🍋","🍊","🍈","🍏","🫐","🥥","🥑"];

    const showLevelMenu = () => {
      app.innerHTML = `
        <div class="memory-overlay">
          <h1 class="memory-title">MEMORY</h1>
          <p class="memory-subtitle">Choose Difficulty</p>
          <div class="level-menu">
            ${levels.map(l => `
              <div class="level-card" data-id="${l.id}">
                <div class="level-info">
                  <h3>${l.name}</h3>
                  <span>Grid ${l.cols}x${l.rows}</span>
                </div>
                <div style="color:#a855f7">→</div>
              </div>
            `).join('')}
          </div>
          <button id="main-back" class="action-btn btn-exit-hover" style="width: 220px;">Back to Home</button>
        </div>
      `;

      document.getElementById("main-back").onclick = () => location.reload();
      document.querySelectorAll(".level-card").forEach(card => {
        card.onclick = () => startLevel(levels.find(l => l.id === card.dataset.id));
      });
    };

    const startLevel = (level) => {
      let moves = 0;
      let startTime = Date.now();
      let flippedCards = [];
      let matchedCount = 0;
      let isLockBoard = false;

      const totalCards = level.rows * level.cols;
      const gameSymbols = symbols.slice(0, totalCards / 2);
      const cardsArray = this.shuffle([...gameSymbols, ...gameSymbols]);

      app.innerHTML = `
        <div class="memory-overlay">
          <h1 class="memory-title" style="font-size: 28px;">MEMORY</h1>
          <p class="memory-subtitle">${level.name} Mode</p>
          
          <div class="memory-grid" id="memory-grid" style="grid-template-columns: repeat(${level.cols}, 1fr);"></div>
          
          <button id="give-up" class="action-btn btn-exit-hover" style="width: 180px;">Quit Game</button>

          <div id="win-modal" class="win-modal">
            <h2 style="margin:0; font-size: 24px; color:#a855f7;">VICTORY!</h2>
            <div class="stat-grid">
              <div class="stat-card">
                <span id="win-time" class="stat-value">0s</span>
                <span class="stat-label">Time</span>
              </div>
              <div class="stat-card">
                <span id="win-moves" class="stat-value">0</span>
                <span class="stat-label">Moves</span>
              </div>
            </div>
            <div class="modal-btns">
              <button id="win-restart" class="action-btn btn-restart">Play Again</button>
              <button id="win-menu" class="action-btn btn-exit-hover">Main Menu</button>
            </div>
          </div>
        </div>
      `;

      const grid = document.getElementById("memory-grid");
      const cardSize = level.cols > 4 ? "clamp(45px, 13vw, 55px)" : "clamp(65px, 18vw, 75px)";

      cardsArray.forEach(symbol => {
        const card = document.createElement("div");
        card.className = "memory-card";
        card.style.width = cardSize;
        card.style.height = cardSize;
        card.style.fontSize = level.cols > 4 ? "20px" : "28px";
        card.dataset.symbol = symbol;

        card.onclick = () => {
          if (isLockBoard || card.classList.contains("flipped") || card.classList.contains("matched")) return;

          card.classList.add("flipped");
          card.textContent = symbol;
          flippedCards.push(card);

          if (flippedCards.length === 2) {
            moves++;
            isLockBoard = true;
            const [c1, c2] = flippedCards;

            if (c1.dataset.symbol === c2.dataset.symbol) {
              matchedCount += 2;
              setTimeout(() => {
                c1.classList.add("matched");
                c2.classList.add("matched");
                flippedCards = [];
                isLockBoard = false;
                if (matchedCount === totalCards) {
                  const elapsed = Math.floor((Date.now() - startTime) / 1000);
                  showWinModal(elapsed, moves);
                }
              }, 400);
            } else {
              setTimeout(() => {
                c1.classList.remove("flipped");
                c1.textContent = "";
                c2.classList.remove("flipped");
                c2.textContent = "";
                flippedCards = [];
                isLockBoard = false;
              }, 800);
            }
          }
        };
        grid.appendChild(card);
      });

      const showWinModal = (time, totalMoves) => {
        const modal = document.getElementById("win-modal");
        document.getElementById("win-time").textContent = `${time}s`;
        document.getElementById("win-moves").textContent = totalMoves;
        modal.classList.add("active");

        document.getElementById("win-restart").onclick = () => startLevel(level);
        document.getElementById("win-menu").onclick = showLevelMenu;
      };

      document.getElementById("give-up").onclick = showLevelMenu;
    };

    showLevelMenu();
  },

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
};

registerGame("memory", memoryGame);