const mineflayer = require('mineflayer');
const fetch = require('node-fetch');

const bot = mineflayer.createBot({
    host: process.env.MC_IP,
    port: parseInt(process.env.MC_PORT) || 25565,
    username: process.env.BOT_NAME || 'AI_Architect',
    version: "1.21.1", 
    auth: 'offline',
    // THIS IS THE FIX: It slows down the join speed so Aternos doesn't reset the connection
    connectTimeout: 30000,
    hideErrors: false
});

console.log(`Connecting to ${process.env.MC_IP} on 1.21.1...`);

// Aternos Fix: Wait 5 seconds after joining to send the first message
bot.on('spawn', () => {
    setTimeout(() => {
        console.log("SUCCESS: Bot is in!");
        bot.chat("AI Architect has arrived. Type !build [thing]!");
    }, 5000);
});

bot.on('chat', async (username, message) => {
    if (username === bot.username) return;
    if (message.startsWith('!build')) {
        const item = message.replace('!build', '').trim();
        bot.chat(`AI Designing: ${item}...`);

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
                        content: `Give me a JSON array for a tiny ${item}. Format: [{"x":0,"y":1,"z":0,"block":"stone"}]`
                    }]
                })
            });
            const data = await response.json();
            const blocks = JSON.parse(data.choices[0].message.content.match(/\[.*\]/s)[0]);

            for (const b of blocks) {
                bot.chat(`Placing ${b.block} at ${b.x}, ${b.y}, ${b.z}`);
                await new Promise(r => setTimeout(r, 800)); 
            }
        } catch (e) { bot.chat("AI error. Check OpenRouter Key!"); }
    }
});

// Aternos Anti-Kick Loop
setInterval(() => { if (bot.entity) bot.setControlState('jump', true); setTimeout(()=>bot.setControlState('jump', false), 500); }, 15000);

bot.on('error', (err) => {
    if (err.code === 'ECONNRESET') {
        console.log("!!! ATERNOS BLOCKED US !!! - Try restarting your Aternos server now.");
    } else {
        console.log("Error:", err);
    }
});
