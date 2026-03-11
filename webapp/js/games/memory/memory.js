import { registerGame } from "../../core/engine.js";

const memoryGame = {
  start() {
    if (!document.getElementById("memory-style")) {
      const link = document.createElement("link");
      link.id = "memory-style";
      link.rel = "stylesheet";
      link.href = "./js/games/memory/memory.css";
      document.head.appendChild(link);
    }

    const app = document.getElementById("app");
    let startTime = null;

    function render() {
      app.innerHTML = `
        <div class="memory-overlay">
          <h1 class="menu-title" style="margin-bottom:20px;">MEMORY</h1>
          <div class="memory-grid" id="memory-grid"></div>
          <button class="back-btn" id="go-back">Exit to Menu</button>
          <div id="win-modal" style="
            display:none;
            position:absolute;
            background:#1e293b;
            color:white;
            padding:20px;
            border-radius:20px;
            text-align:center;
            z-index:2000;
            font-family:system-ui;
            opacity:0;
            transition: all 0.3s ease-out;
            width:90%;
            max-width:400px;
            box-sizing:border-box;
          ">
            <h2>You Won!</h2>
            <p id="win-time"></p>
            <div style="margin-top:15px; display:flex; justify-content:space-between; gap:10px;">
              <button id="win-restart" style="
                flex:1;
                height:45px;
                border:none;
                border-radius:12px;
                background:#22c55e;
                color:white;
                font-weight:bold;
                cursor:pointer;
              ">Restart</button>
              <button id="win-back" style="
                flex:1;
                height:45px;
                border:none;
                border-radius:12px;
                background:#2563eb;
                color:white;
                font-weight:bold;
                cursor:pointer;
              ">Back to Menu</button>
            </div>
          </div>
        </div>
      `;

      document.getElementById("go-back").onclick = () => location.reload();
      document.getElementById("win-back").onclick = () => location.reload();
      document.getElementById("win-restart").onclick = () => {
        hideWinModal();
        startGameLogic();
      };

      startGameLogic();
    }

    function startGameLogic() {
      const grid = document.getElementById("memory-grid");
      const symbols = ["🍎","🍌","🍇","🍉","🍓","🍒","🥝","🍍"];
      const cardsArray = [...symbols, ...symbols];
      shuffle(cardsArray);

      grid.innerHTML = "";
      let flippedCards = [];
      let matched = 0;
      startTime = Date.now();

      cardsArray.forEach(symbol => {
        const card = document.createElement("div");
        card.className = "card";
        card.dataset.symbol = symbol;
        card.innerText = "";
        card.onclick = () => {
          if (card.classList.contains("flipped") || flippedCards.length === 2) return;

          card.classList.add("flipped");
          card.innerText = symbol;
          flippedCards.push(card);

          if (flippedCards.length === 2) {
            if (flippedCards[0].dataset.symbol === flippedCards[1].dataset.symbol) {
              flippedCards = [];
              matched += 2;
              if (matched === cardsArray.length) {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                showWinModal();
                document.getElementById("win-time").innerText = `Time: ${elapsed} s`;
              }
            } else {
              setTimeout(() => {
                flippedCards.forEach(c => {
                  c.classList.remove("flipped");
                  c.innerText = "";
                });
                flippedCards = [];
              }, 800);
            }
          }
        };
        grid.appendChild(card);
      });
    }

    // Модальное окно теперь позиционируем по центру grid
    function showWinModal() {
      const modal = document.getElementById("win-modal");
      const grid = document.getElementById("memory-grid");
      const rect = grid.getBoundingClientRect();
      const overlayRect = grid.parentElement.getBoundingClientRect();
      const top = rect.top - overlayRect.top + rect.height / 2; // центр сетки
      const left = rect.left - overlayRect.left + rect.width / 2; // центр сетки

      modal.style.top = `${top}px`;
      modal.style.left = `${left}px`;
      modal.style.transform = `translate(-50%, -50%) scale(0.8)`;
      modal.style.display = "block";

      setTimeout(() => {
        modal.style.opacity = "1";
        modal.style.transform = `translate(-50%, -50%) scale(1)`;
      }, 10);
    }

    function hideWinModal() {
      const modal = document.getElementById("win-modal");
      modal.style.opacity = "0";
      modal.style.transform = "translate(-50%, -50%) scale(0.8)";
      setTimeout(() => modal.style.display = "none", 300);
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    render();
  }
};

registerGame("memory", memoryGame);