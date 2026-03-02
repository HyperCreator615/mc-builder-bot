const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
    host: process.env.MC_IP,
    port: parseInt(process.env.MC_PORT),
    username: process.env.BOT_NAME
});

bot.on('chat', async (username, message) => {
    if (username === bot.username) return;
    
    if (message.startsWith('!build')) {
        // Send to OpenRouter using process.env.AI_KEY and process.env.AI_MODEL
        bot.chat(`Using AI Model: ${process.env.AI_MODEL} to design ${message}...`);
        // ... build logic goes here
    }
});
