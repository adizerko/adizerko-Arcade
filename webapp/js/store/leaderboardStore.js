export async function getLeaderboard() {
    try {
        const res = await fetch("http://localhost:8000/api/leaderboard");
        const data = await res.json();
        return data;
    } catch(err){
        console.error("Failed to fetch leaderboard:", err);
        return [];
    }
}