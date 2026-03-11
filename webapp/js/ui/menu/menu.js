import { startGame } from "../../core/engine.js";

export function showMenu(){
    const app = document.getElementById("app");

    app.innerHTML = `
    <div class="menu-container">
        <div class="menu-title">🎮 Mini Games</div>
        <div class="games-grid">
            <div class="game-card" id="reaction">
                <div class="game-icon">⚡</div>
                <div class="game-title">Reaction</div>
            </div>
            <div class="game-card">
                <div class="game-icon">🧠</div>
                <div class="game-title">Memory</div>
            </div>
            <div class="game-card">
                <div class="game-icon">➕</div>
                <div class="game-title">Math</div>
            </div>
            <div class="game-card">
                <div class="game-icon">🚩</div>
                <div class="game-title">Flags</div>
            </div>
        </div>
    </div>
    `;

    document.getElementById("reaction").onclick = () => startGame("reaction");
}