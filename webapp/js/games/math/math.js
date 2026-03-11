import { registerGame } from "../../core/engine.js";

const mathGame = {
    start() {
        // Подключаем CSS игры
        if (!document.getElementById("math-style")) {
            const link = document.createElement("link");
            link.id = "math-style";
            link.rel = "stylesheet";
            link.href = "./js/games/math/math.css";
            document.head.appendChild(link);
        }

        const app = document.getElementById("app");
        let score = 0;
        let timeLeft = 30; // время игры
        let timerInterval = null;

        // Базовая разметка игры
        app.innerHTML = `
            <div class="game-overlay">
                <div class="game-header">MATH CHALLENGE</div>
                <div class="timer" id="timer">Time: ${timeLeft}s</div>
                <div class="question-text" id="question-text"></div>
                <div class="answers-grid" id="answers-grid"></div>
            </div>
        `;

        const timerDiv = document.getElementById("timer");
        const questionDiv = document.getElementById("question-text");
        const answersGrid = document.getElementById("answers-grid");

        // Таймер
        function startTimer() {
            timerInterval = setInterval(() => {
                timeLeft--;
                timerDiv.innerText = `Time: ${timeLeft}s`;
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    showResult();
                }
            }, 1000);
        }

        // Показываем результат
        function showResult() {
            app.innerHTML = `
                <div class="game-overlay">
                    <div class="result-overlay">
                        <div>Time's up!</div>
                        <div>You answered ${score} correct questions</div>
                        <button id="restart-btn">↻ Restart</button>
                        <button id="menu-btn">⬅ Back to Menu</button>
                    </div>
                </div>
            `;
            document.getElementById("restart-btn").onclick = () => mathGame.start();
            document.getElementById("menu-btn").onclick = () => location.reload();
        }

        // Генерация и отрисовка вопроса
        function renderQuestion() {
            const a = Math.floor(Math.random() * 999) + 1; // 1-999
            const b = Math.floor(Math.random() * 999) + 1;
            const op = Math.random() < 0.5 ? "+" : "-";
            let correct = op === "+" ? a + b : a - b;

            // Реалистичные неправильные варианты: ±10..±30
            const answersSet = new Set([correct]);
            while (answersSet.size < 4) {
                let offset = Math.floor(Math.random() * 21) - 10; // ±10
                let wrong = correct + offset;
                if (wrong !== correct) answersSet.add(wrong);
            }

            const answers = Array.from(answersSet).sort(() => Math.random() - 0.5);

            questionDiv.innerText = `What is ${a} ${op} ${b}?`;

            // Вставляем варианты и кнопку назад после них
            answersGrid.innerHTML = answers
                .map(ans => `<button class="answer-btn">${ans}</button>`)
                .join('') + `<button class="back-btn" id="go-back">⬅ Back to Menu</button>`;

            // Обработчик кнопки назад
            document.getElementById("go-back").onclick = () => location.reload();

            // Обработчик клика по вариантам
            document.querySelectorAll(".answer-btn").forEach(btn => {
                btn.onclick = () => {
                    if (parseInt(btn.innerText) === correct) {
                        btn.classList.add("correct");
                        score++;
                        setTimeout(renderQuestion, 300);
                    } else {
                        btn.classList.add("wrong");
                        setTimeout(renderQuestion, 300);
                    }
                };
            });
        }

        renderQuestion();
        startTimer();
    }
};

registerGame("math", mathGame);