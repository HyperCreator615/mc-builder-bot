const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
    host: process.env.MC_IP,
    port: parseInt(process.env.MC_PORT) || 25565,
    username: process.env.BOT_NAME || 'AI_Builder',
    version: "1.20.1", // <--- MAKE SURE THIS MATCHES YOUR ATERNOS VERSION
    auth: 'offline'    // <--- THIS IS THE FIX FOR ATERNOS
});

bot.on('login', () => {
    console.log("SUCCESS: Bot has joined the server!");
});

bot.on('error', (err) => {
    console.log("Error details:", err);
});
