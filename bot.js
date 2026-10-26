
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

if (!token) {
  console.log('❌ BOT_TOKEN topilmadi. .env faylini tekshiring.');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `😂🎵 PO‘HUY MUZIK

Assalomu alaykum!

Men sizga musiqa topishga yordam beraman.

🔎 Qo‘shiq nomini yozing.
🎤 Keyinroq audio orqali ham aniqlashni ulaymiz.

Masalan: The Weeknd Blinding Lights`
  );
});


bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  const query = msg.text.trim();

  if (query.length < 2) {
    return bot.sendMessage(chatId, '🎵 Qo‘shiq nomini yozing!');
  }

  try {
    await bot.sendMessage(chatId, '🔎 Musiqa qidirilmoqda...');

    const url = new URL('https://itunes.apple.com/search');
    url.searchParams.set('term', query);
    url.searchParams.set('media', 'music');
    url.searchParams.set('entity', 'song');
    url.searchParams.set('limit', '5');
    url.searchParams.set('country', 'US');

    const response = await fetch(url);
    if (!response.ok) throw new Error('Qidiruv xatosi');

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return bot.sendMessage(
        chatId,
        '😕 Qo‘shiq topilmadi. Boshqa nom bilan qidirib ko‘ring.'
      );
    }

    

for (const song of data.results) {
  const caption =
    `🎵 ${song.trackName}\n` +
    `🎤 Ijrochi: ${song.artistName}\n` +
    `💿 Albom: ${song.collectionName || 'Noma’lum'}\n\n` +
    `🔥 Po‘huy Muzik`;

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: '▶️ Qo‘shiq sahifasi',
          url: song.trackViewUrl
        }
      ]
    ]
  };

  if (song.previewUrl) {
    try {
      const response = await fetch(song.previewUrl);
      if (!response.ok) throw new Error('Audio yuklanmadi');

      const audioBuffer = Buffer.from(
        await response.arrayBuffer()
      );

      await bot.sendAudio(chatId, audioBuffer, {
        title: song.trackName,
        performer: song.artistName,
        caption,
        reply_markup: keyboard
      });
    } catch (error) {
      await bot.sendMessage(chatId, caption, {
        reply_markup: keyboard
      });
    }
  } else {
    await bot.sendMessage(chatId, caption, {
      reply_markup: keyboard
    });
  }
}

  } catch (error) {
    console.log('Qidiruv xatosi:', error.message);
    await bot.sendMessage(
      chatId,
      '⚠️ Qidiruvda xatolik yuz berdi. Qayta urinib ko‘ring.'
    );
  }
});

bot.on('polling_error', (error) => {
  console.log('Telegram xatosi:', error.message);
});

console.log('🎵 PO‘HUY MUZIK ishga tushdi!');
