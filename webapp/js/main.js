import { initEngine } from "./core/engine.js";
import { showMenu } from "./ui/menu/menu.js";

// ИМПОРТИРУЕМ ИГРЫ
import "./games/reaction/reaction.js";
import "./games/memory/memory.js";
import "./games/math/math.js";
import "./games/flags/flags.js";

const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

initEngine();
showMenu();  // теперь кнопки найдут зарегистрированные игры