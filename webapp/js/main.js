// webapp/js/main.js
import { initEngine } from "./core/engine.js";
import { showMenu } from "./ui/menu/menu.js";
import "./games/reaction/reaction.js";

// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;

// Сообщаем Telegram, что приложение готово, и расширяем его
tg.ready();
tg.expand(); 

initEngine();
showMenu();