import { startGame } from "../../core/engine.js";

export function showMenu() {
    const app = document.getElementById("app");

    app.innerHTML = `
        <div class="menu-wrapper">
            <div class="ambient-glow glow-1"></div>
            <div class="ambient-glow glow-2"></div>

            <div class="menu-header">
                <h1 class="menu-title">ARCADE</h1>
                <div class="menu-subtitle">Mini Games</div>
            </div>

            <div class="games-grid">
                <div class="game-card active pulse-on-hover" id="btn-reaction" style="--anim-order: 1">
                    <div class="game-icon-container">
                        <div class="game-icon wiggle">⚡</div>
                    </div>
                    <div class="game-title">Reaction</div>
                    <div class="game-status shine">PLAY NOW</div>
                </div>

                <div class="game-card active pulse-on-hover" id="btn-memory" style="--anim-order: 2">
                    <div class="game-icon-container">
                        <div class="game-icon float">🧠</div>
                    </div>
                    <div class="game-title">Memory</div>
                    <div class="game-status shine">PLAY NOW</div>
                </div>

                <div class="game-card active pulse-on-hover" id="btn-math" style="--anim-order: 3">
                    <div class="game-icon-container">
                        <div class="game-icon spin">🎲</div>
                    </div>
                    <div class="game-title">Math</div>
                    <div class="game-status shine">PLAY NOW</div>
                </div>

                <div class="game-card active pulse-on-hover" id="btn-flags" style="--anim-order: 4">
                    <div class="game-icon-container">
                        <div class="game-icon wave">🌍</div>
                    </div>
                    <div class="game-title">Flags</div>
                    <div class="game-status shine">PLAY NOW</div>
                </div>

                <div class="game-card active pulse-on-hover" id="btn-colormatch" style="--anim-order: 5">
                    <div class="game-icon-container">
                        <div class="game-icon rainbow">🎨</div>
                    </div>
                    <div class="game-title">Color Match</div>
                    <div class="game-status shine">PLAY NOW</div>
                </div>

                <div class="game-card active pulse-on-hover" id="btn-highlow" style="--anim-order: 6">
                    <div class="game-icon-container">
                        <div class="game-icon wave">⚖️</div>
                    </div>
                    <div class="game-title">High Low</div>
                    <div class="game-status shine">PLAY NOW</div>
                </div>
            </div>
        </div>
    `;

    // Привязка событий (остается прежней)
    const games = ["reaction", "memory", "math", "flags", "colormatch", "highlow"];
    games.forEach(game => {
        const btn = document.getElementById(`btn-${game}`);
        if (btn) btn.onclick = () => startGame(game);
    });
}