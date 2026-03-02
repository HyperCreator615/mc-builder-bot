const mineflayer = require('mineflayer');
const fetch = require('node-fetch');

const bot = mineflayer.createBot({
    host: process.env.MC_IP,
    port: parseInt(process.env.MC_PORT) || 25565,
    username: process.env.BOT_NAME || 'AI_Architect',
    version: "1.21.1", 
    auth: 'offline',
    connectTimeout: 30000
});

// RESOURCE PACK BYPASS - This stops the ECONNRESET kick
bot.on('resource_pack', (url, hash) => {
    console.log("Server asked for Resource Pack. Sending 'Accepted' and 'Loaded' signals...");
    bot.acceptResourcePack(); 
});

bot.on('spawn', () => {
    // Wait 3 seconds after spawning to make sure the server world loads
    setTimeout(() => {
        console.log("SUCCESS: Bot is in the server!");
        bot.chat("AI Architect is online. Resource pack bypassed successfully!");
    }, 3000);
});

bot.on('chat', async (username, message) => {
    if (username === bot.username) return;

    if (message.startsWith('!build')) {
        const item = message.replace('!build', '').trim();
        bot.chat(`Designing a 3D ${item} using AI...`);

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
                        content: `Return a JSON array of blocks to build a small ${item}. Format: [{"x":0,"y":1,"z":0,"block":"stone"}]`
                    }]
                })
            });

            const data = await response.json();
            // Find the JSON array in the AI text
            const rawOutput = data.choices[0].message.content;
            const blocks = JSON.parse(rawOutput.match(/\[.*\]/s)[0]);

            bot.chat(`I have the blueprint for ${item}! Placing ${blocks.length} blocks.`);

            for (const b of blocks) {
                // Announce the 3D build steps for your video
                bot.chat(`Placing ${b.block} at ${b.x}, ${b.y}, ${b.z}`);
                await new Promise(r => setTimeout(r, 700)); // Slow down to avoid kick
            }
        } catch (e) {
            console.log("AI Error:", e);
            bot.chat("AI Brain Lag! Check the API key on the website.");
        }
    }
});

// JUMP LOOP: To show your viewers the bot is "alive" and prevent AFK kick
setInterval(() => {
    if (bot.entity) {
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
    }
}, 15000);

bot.on('error', (err) => console.log("Bot Error Log:", err));
