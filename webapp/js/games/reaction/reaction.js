import { registerGame } from "../../core/engine.js";

/* Динамическая загрузка CSS игры */
function loadGameCSS(path){
    const existing = document.getElementById("game-style");
    if(existing) existing.remove();

    const link = document.createElement("link");
    link.id = "game-style";
    link.rel = "stylesheet";
    link.href = path;
    document.head.appendChild(link);
}

const reactionGame = {
    start(){
        loadGameCSS("./js/games/reaction/reaction.css");

        const app = document.getElementById("app");

        /* Показ стартового экрана с правилами */
        function showStartScreen(){
            app.innerHTML = `
            <div class="menu-container">
                <div class="menu-title">⚡ Reaction Game</div>
                <div id="game">
                    <div id="reaction-box" class="reaction-box start-screen">
                        Click this box to start!<br>
                        When it turns green, click as fast as you can.
                    </div>
                </div>
                <button id="menu" style="margin-top:20px;">Back to Menu</button>
            </div>
            `;

            const box = document.getElementById("reaction-box");
            const menuBtn = document.getElementById("menu");

            menuBtn.onclick = ()=> location.reload(); // возврат в главное меню

            // старт игры по клику на синее поле
            box.onclick = ()=> startGame(box);
        }

        /* Основной игровой процесс */
        function startGame(box){
            box.classList.remove("start-screen");
            box.style.backgroundColor = "red";
            box.innerHTML = ""; // очищаем текст

            let startTime = null;
            let clicked = false;

            // случайная задержка для смены цвета на зеленый
            const changeTime = Math.random() * 3000 + 2000;

            const timer = setTimeout(()=>{
                box.style.backgroundColor = "green";
                startTime = Date.now();
                box.innerHTML = "CLICK!";
            }, changeTime);

            // клик по квадрату
            box.onclick = ()=>{
                if(clicked) return;
                clicked = true;

                if(startTime){ // успел на зеленый
                    const reaction = Date.now() - startTime;
                    box.innerHTML = `🎉 ${reaction} ms<br>Click box to play again!`;
                } else { // клик до зеленого
                    clearTimeout(timer);
                    box.innerHTML = `⚠ Too early!<br>Click box to try again!`;
                }

                // после завершения игры клик запускает новую попытку
                box.onclick = ()=> startGame(box);
            };
        }

        showStartScreen();
    }
};

registerGame("reaction", reactionGame);