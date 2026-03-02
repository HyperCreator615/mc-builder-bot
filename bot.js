const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
  host: "yourserver.aternos.me",
  port: 25565,
  username: "AI_Architect",
  version: false, // auto detect
  auth: 'offline'
});

bot.on('spawn', () => {
  console.log("Bot connected!");
});

bot.on('error', console.log);
bot.on('kicked', console.log);
