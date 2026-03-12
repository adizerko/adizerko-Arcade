import { startGame } from "../../core/engine.js";

export function showMenu() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="menu-wrapper">
            <div class="menu-header">
                <h1 class="menu-title">ARCADE</h1>
                <div class="menu-subtitle">Mini Games</div>
            </div>

            <div class="games-grid">
                <div class="game-card active" id="btn-reaction">
                    <div class="game-icon">⚡</div>
                    <div class="game-title">Reaction</div>
                    <div class="game-status">PLAY NOW</div>
                </div>

                <div class="game-card active" id="btn-memory">
                    <div class="game-icon">🧠</div>
                    <div class="game-title">Memory</div>
                    <div class="game-status">PLAY NOW</div>
                </div>

                <div class="game-card active" id="btn-math">
                    <div class="game-icon">🎲</div>
                    <div class="game-title">Math</div>
                    <div class="game-status">PLAY NOW</div>
                </div>

                <div class="game-card active" id="btn-flags">
                    <div class="game-icon">🌍</div>
                    <div class="game-title">Flags</div>
                    <div class="game-status">PLAY NOW</div>
                </div>
                <div class="game-card active" id="btn-colormatch">
                    <div class="game-icon">🌍</div>
                    <div class="game-title">colormatch</div>
                    <div class="game-status">PLAY NOW</div>
                </div>
            </div>
        </div>
    `;

    const reactionBtn = document.getElementById("btn-reaction");
    if (reactionBtn) {
        reactionBtn.onclick = () => startGame("reaction");
    }

    const memoryBtn = document.getElementById("btn-memory");
    if (memoryBtn) {
        memoryBtn.onclick = () => startGame("memory");
    }

    const mathBtn = document.getElementById("btn-math");
    if (mathBtn) {
        mathBtn.onclick = () => startGame("math");
    }

    const flagsBtn = document.getElementById("btn-flags");
    if (flagsBtn) {
        flagsBtn.onclick = () => startGame("flags");
    }

    const colormatchBtn = document.getElementById("btn-colormatch");
    if (colormatchBtn) {
        colormatchBtn.onclick = () => startGame("colormatch");
    }

}