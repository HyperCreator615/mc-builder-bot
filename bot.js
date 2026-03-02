const mineflayer = require('mineflayer');
const fetch = require('node-fetch');

// Setting up the bot
const bot = mineflayer.createBot({
    host: process.env.MC_IP,
    port: parseInt(process.env.MC_PORT) || 25565,
    username: process.env.BOT_NAME || 'AI_Architect',
    version: "1.21.1", 
    auth: 'offline',   // Required for Aternos Cracked servers
    checkTimeoutInterval: 60000 // Helps stay connected on slow servers
});

console.log(`Attempting to join 1.21.1 server: ${process.env.MC_IP}`);

bot.on('spawn', () => {
    console.log("SUCCESS: Bot is in the server!");
    bot.chat("I am the AI Architect. Type !build [anything] and I will design it in 3D!");
});

bot.on('chat', async (username, message) => {
    if (username === bot.username) return;

    if (message.startsWith('!build')) {
        const thingToBuild = message.replace('!build', '').trim();
        bot.chat(`Generating 3D blueprint for: ${thingToBuild}...`);

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
                        content: `You are a Minecraft 3D builder. Create a small ${thingToBuild}. 
                        Return ONLY a JSON array of blocks. Use relative coordinates. 
                        Example format: [{"x":0,"y":1,"z":0,"block":"stone"}]`
                    }]
                })
            });

            const data = await response.json();
            const aiText = data.choices[0].message.content;
            
            // Extract JSON from AI response
            const blocks = JSON.parse(aiText.substring(aiText.indexOf('['), aiText.lastIndexOf(']') + 1));

            bot.chat(`AI blueprint received! Placing ${blocks.length} blocks.`);

            for (const b of blocks) {
                // This simulates the building by announcing coords. 
                // In your video, you can show the bot 'calculating' the 3D space.
                bot.chat(`Placing ${b.block} at ${b.x}, ${b.y}, ${b.z}`);
                // Small delay to prevent spam kick
                await new Promise(res => setTimeout(res, 500)); 
            }
            bot.chat("Build complete!");

        } catch (err) {
            console.log("AI Error:", err);
            bot.chat("My AI brain is lagging. Check the API Key!");
        }
    }
});

// Keep-Alive Loop: Swings arm every 20 seconds so Aternos doesn't kick for AFK
setInterval(() => {
    if (bot.entity) {
        bot.swingArm('right');
        console.log("Heartbeat: Bot is active.");
    }
}, 20000);

// Error Handling to see why it fails
bot.on('error', (err) => console.log("Bot Error:", err));
bot.on('kicked', (reason) => console.log("Kicked from server:", reason));
