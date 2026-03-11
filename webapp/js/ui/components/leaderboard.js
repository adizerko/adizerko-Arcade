import { getLeaderboard } from "../../store/leaderboardStore.js";

export async function showLeaderboard(containerId="content") {
    const container = document.getElementById(containerId);
    const leaderboard = await getLeaderboard();

    let html = `<h2>Leaderboard</h2>
        <table style="width:100%; text-align:center; border-collapse: collapse;">
            <tr><th>Rank</th><th>Player</th><th>Score (ms)</th></tr>`;

    leaderboard.forEach((rec, i) => {
        html += `<tr>
            <td>${i+1}</td>
            <td>${rec.user}</td>
            <td>${rec.score}</td>
        </tr>`;
    });

    html += `</table>
        <button id="backToMenu">Back to Menu</button>`;

    container.innerHTML = html;
    document.getElementById("backToMenu").onclick = () => location.reload();
}