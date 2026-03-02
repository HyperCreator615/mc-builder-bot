const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
    host: process.env.MC_IP,
    port: parseInt(process.env.MC_PORT) || 25565,
    username: process.env.BOT_NAME || 'Mega_Builder',
    version: "1.20.1", 
    auth: 'offline' // This tells Aternos we don't need a Microsoft login
});

bot.on('login', () => {
    console.log("CONNECTED: I am officially in the server!");
});

bot.on('spawn', () => {
    bot.chat("AI Builder is here! Tell me what to build.");
});

bot.on('error', (err) => {
    console.log("Connection Error: ", err);
});

// THIS KEEPS THE BOT FROM CLOSING
setInterval(() => {
    if (bot.entity) {
        console.log("Heartbeat: Bot is still active...");
    }
}, 20000);
