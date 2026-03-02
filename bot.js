const mineflayer = require('mineflayer');

const bot = mineflayer.createBot({
    host: process.env.MC_IP,
    port: parseInt(process.env.MC_PORT) || 25565,
    username: process.env.BOT_NAME || 'Mega_Builder',
    version: "1.20.1", 
    auth: 'offline'
});

// THIS KEEPS THE BOT ACTIVE
console.log("Connecting to " + process.env.MC_IP);

bot.on('spawn', () => {
    console.log("ALIVE: I am in the server!");
    bot.chat("AI Builder Online. Use !build [thing] to start!");
});

bot.on('chat', async (username, message) => {
    if (username === bot.username) return;
    
    if (message.startsWith('!build')) {
        const prompt = message.replace('!build', '').trim();
        bot.chat(`Asking AI how to build a ${prompt}...`);

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.AI_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: process.env.AI_MODEL,
                    messages: [{ role: "user", content: `Minecraft Architect: Provide a simple JSON list of relative coordinates to build a ${prompt}. Example: [{"x":0,"y":1,"z":0,"block":"stone"}]` }]
                })
            });
            const data = await response.json();
            console.log("AI Response received!");
            // Build logic would go here
        } catch (err) {
            bot.chat("Brain fog... I couldn't reach the AI.");
        }
    }
});

// Prevent the script from exiting
setInterval(() => {
    if (bot.entity) console.log("Still standing...");
}, 30000); 
