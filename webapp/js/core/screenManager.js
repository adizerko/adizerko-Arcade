// Управление текущим экраном
let currentScreen = null;

export function showScreen(renderFunc) {
    currentScreen = renderFunc;
    currentScreen();
}

export function refreshScreen() {
    if (currentScreen) currentScreen();
}