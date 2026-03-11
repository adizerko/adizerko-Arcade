import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart
from aiogram.types import WebAppInfo

TOKEN = "8708320015:AAF2sSRlOK-Obpc15qqbSbROtoxiFYHL5wo"

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(CommandStart())
async def start(message: types.Message):

    keyboard = types.ReplyKeyboardMarkup(
        keyboard=[
            [
                types.KeyboardButton(
                    text="🎮 Play Mini Games",
                    web_app=WebAppInfo(url="https://animated-brioche-80ec1a.netlify.app/")
                )
            ]
        ],
        resize_keyboard=True
    )

    await message.answer(
        "Welcome to Mini Games 🎮",
        reply_markup=keyboard
    )


async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())