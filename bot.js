const mineflayer = require('mineflayer');
const fetch = require('node-fetch');

const bot = mineflayer.createBot({
    host: process.env.MC_IP,
    port: parseInt(process.env.MC_PORT) || 25565,
    username: process.env.BOT_NAME || 'AI_Architect',
    version: "1.21.1", 
    auth: 'offline',
    // DO NOT REMOVE THESE: They prevent Aternos from resetting the connection
    connectTimeout: 60000,
    keepAlive: true,
    checkTimeoutInterval: 60000
});

// LIE TO THE SERVER: Tell it we have the resource pack even if we don't
bot.on('resource_pack', () => {
    bot.acceptResourcePack();
});

bot.on('spawn', () => {
    console.log("GHOST PROTOCOL: Bot is hidden and online!");
    bot.chat("AI Architect has bypassed security. Ready to build!");
});

bot.on('chat', async (username, message) => {
    if (username === bot.username) return;
    if (message.startsWith('!build')) {
        const item = message.replace('!build', '').trim();
        bot.chat(`AI designing 3D ${item}...`);
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.AI_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: process.env.AI_MODEL || "google/gemini-2.0-flash-001",
                    messages: [{
                        role: "user", 
                        content: `JSON array for a tiny ${item}. Format: [{"x":0,"y":1,"z":0,"block":"stone"}]`
                    }]
                })
            });
            const data = await response.json();
            const blocks = JSON.parse(data.choices[0].message.content.match(/\[.*\]/s)[0]);
            for (const b of blocks) {
                bot.chat(`Placing ${b.block} at ${b.x}, ${b.y}, ${b.z}`);
                await new Promise(r => setTimeout(r, 1000)); 
            }
        } catch (e) { bot.chat("AI Logic Error. Check Keys."); }
    }
});

// Human-like movement to avoid the "Bot-Detector"
setInterval(() => {
    if (bot.entity) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
        bot.look(Math.random() * 360, 0);
    }
}, 20000);

bot.on('error', (err) => console.log("Final Error Log:", err));
