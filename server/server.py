from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Разрешаем доступ с веб-приложения
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # в проде лучше указать точный домен
    allow_methods=["*"],
    allow_headers=["*"]
)

# Структура рекорда
class Score(BaseModel):
    user: str
    score: int

# Топ 10 рекордов
leaderboard: List[Score] = []

@app.post("/api/save_score")
def save_score(score: Score):
    # Добавляем рекорд
    leaderboard.append(score)
    # Сортируем по score (меньше – лучше)
    leaderboard.sort(key=lambda x: x.score)
    # Сохраняем только топ 10
    if len(leaderboard) > 10:
        leaderboard[:] = leaderboard[:10]
    return {"status": "ok"}

@app.get("/api/leaderboard")
def get_leaderboard():
    return leaderboard