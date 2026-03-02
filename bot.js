const mineflayer = require('mineflayer');

// Node 18+ has global fetch, no need for node-fetch
// const fetch = require('node-fetch');

const bot = mineflayer.createBot({
    host: process.env.MC_IP,
    port: parseInt(process.env.MC_PORT) || 25565,
    username: process.env.BOT_NAME || 'AI_Architect',
    version: "1.21.1",
    auth: 'offline',
    connectTimeout: 60000,
    checkTimeoutInterval: 60000
});

// Accept resource pack safely (modern event)
bot.on('resourcePack', (url, hash) => {
    bot.acceptResourcePack();
});

bot.once('spawn', () => {
    console.log("Bot online.");
    bot.chat("AI Architect ready.");
});

// Chat Command
bot.on('chat', async (username, message) => {
    if (username === bot.username) return;

    if (!message.startsWith('!build')) return;

    const item = message.replace('!build', '').trim();
    if (!item) {
        bot.chat("Tell me what to build.");
        return;
    }

    bot.chat(`Designing tiny ${item}...`);

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
                    content: `Return ONLY a JSON array like:
                    [{"x":0,"y":1,"z":0,"block":"stone"}]
                    for a tiny ${item}.`
                }]
            })
        });

        const data = await response.json();

        if (!data.choices || !data.choices[0]) {
            bot.chat("AI failed.");
            return;
        }

        const content = data.choices[0].message.content;
        const match = content.match(/\[.*\]/s);

        if (!match) {
            bot.chat("Invalid AI format.");
            return;
        }

        const blocks = JSON.parse(match[0]);

        for (const b of blocks) {
            bot.chat(`Placing ${b.block}`);

            // Real block placement logic
            const mcData = require('minecraft-data')(bot.version);
            const blockType = mcData.blocksByName[b.block];

            if (!blockType) continue;

            const refBlock = bot.blockAt(bot.entity.position.offset(0, -1, 0));
            if (!refBlock) continue;

            await bot.placeBlock(refBlock, new mineflayer.vec3(b.x, b.y, b.z));
            await new Promise(r => setTimeout(r, 500));
        }

        bot.chat("Build complete.");

    } catch (err) {
        console.log(err);
        bot.chat("AI Error. Check API key.");
    }
});

// More natural movement (less suspicious)
setInterval(() => {
    if (!bot.entity) return;

    const yaw = Math.random() * Math.PI * 2; // Radians
    const pitch = (Math.random() - 0.5) * 0.4;

    bot.look(yaw, pitch, true);

}, 25000);

bot.on('error', err => console.log("Error:", err));
bot.on('kicked', reason => console.log("Kicked:", reason));
