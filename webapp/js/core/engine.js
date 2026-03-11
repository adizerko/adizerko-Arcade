const games = {};

export function initEngine(){
    console.log("Game engine started");
}

export function registerGame(name, game){
    games[name] = game;
}

export function startGame(name){
    const game = games[name];
    if(game){
        game.start();
    } else {
        console.error("Game not found:", name);
    }
}