import { initEngine } from "./core/engine.js";
import { showMenu } from "./ui/menu/menu.js";

/* регистрация игр */
import "./games/reaction/reaction.js";

initEngine();
showMenu();