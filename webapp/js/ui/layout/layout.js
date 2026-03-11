export function renderLayout(){

const app = document.getElementById("app");

app.innerHTML = `

<div class="app">

<header class="app-header">

<div class="logo">🎮 Mini Games</div>

<div class="player">⭐ Player</div>

</header>

<main id="content"></main>

</div>

`;

}