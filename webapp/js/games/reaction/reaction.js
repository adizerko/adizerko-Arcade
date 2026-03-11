import { registerGame } from "../../core/engine.js";

const reactionGame = {
    start() {
        // Подгружаем CSS игры динамически
        if (!document.getElementById("reaction-style")) {
            const link = document.createElement("link");
            link.id = "reaction-style";
            link.rel = "stylesheet";
            link.href = "./js/games/reaction/reaction.css";
            document.head.appendChild(link);
        }

        const app = document.getElementById("app");

        function render() {
            app.innerHTML = `
                <div class="game-overlay">
                    <div id="target-area" class="target-area start-state">
                        <div class="game-text">TAP TO START</div>
                    </div>
                    <button class="back-btn" id="go-back">⬅ Exit to Menu</button>
                </div>
            `;

            const target = document.getElementById("target-area");
            const backBtn = document.getElementById("go-back");

            backBtn.onclick = () => location.reload();
            target.onclick = () => beginCycle(target);
        }

        function beginCycle(el) {
            el.className = "target-area wait-state";
            el.innerHTML = '<div class="game-text">WAIT FOR GREEN...</div>';

            let startTime = null;
            const delay = Math.random() * 3000 + 2000;

            const timer = setTimeout(() => {
                el.className = "target-area click-state";
                el.innerHTML = '<div class="game-text">HIT IT!</div>';
                startTime = Date.now();
            }, delay);

            el.onclick = () => {
                if (startTime) {
                    const diff = Date.now() - startTime;
                    el.className = "target-area start-state";
                    el.innerHTML = `<div class="game-text">${diff}ms<br><small>Tap to try again</small></div>`;
                    el.onclick = () => beginCycle(el);
                } else {
                    clearTimeout(timer);
                    el.className = "target-area start-state";
                    el.innerHTML = '<div class="game-text">TOO EARLY!<br><small>Try again</small></div>';
                    el.onclick = () => beginCycle(el);
                }
            };
        }

        render();
    }
};

registerGame("reaction", reactionGame);