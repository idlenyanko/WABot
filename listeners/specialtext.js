const fs = require("fs");
const path = require("path");

const userQueue = {};        // Queue untuk DM
const processingQueue = {};  // Status queue per user
const groupQueue = {};       // Batasi balasan keyword sama di grup

const GROUP_WINDOW = 2000;  // 2 detik window untuk grup
const DM_DELAY = 1000;      // Delay antar DM
const RETRY_DELAY = 3000;   // Delay sebelum retry jika gagal
const MAX_RETRY = 3;        // Maks percobaan

const DATA_FILE = path.join(__dirname, "../data/specialtext.json");
let data = [];

// ------------------- Load & Watch JSON -------------------
function loadData() {
    if (!fs.existsSync(DATA_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    } catch (err) {
        console.error("❌ Error load specialtext.json:", err.message);
        return [];
    }
}
data = loadData();

try {
    fs.watch(DATA_FILE, (eventType) => {
        if (eventType === "change") {
            console.log("🔄 specialtext.json berubah, reload data...");
            data = loadData();
        }
    });
} catch (err) {
    console.warn("⚠️ Gagal watch specialtext.json:", err.message);
}

// ------------------- Process DM Queue -------------------
async function processQueue(userId, client) {
    if (processingQueue[userId]) return; // Sudah berjalan
    processingQueue[userId] = true;

    while (userQueue[userId] && userQueue[userId].length > 0) {
        const item = userQueue[userId][0];
        try {
            await client.sendMessage(userId, item.text);
            console.log(`✅ DM ke ${userId} untuk keyword "${item.keyword}" berhasil`);
            userQueue[userId].shift();
            await new Promise(res => setTimeout(res, DM_DELAY));
        } catch (err) {
            item.attempt = (item.attempt || 0) + 1;
            console.error(`❌ Gagal kirim DM ke ${userId}, percobaan ${item.attempt}, error: ${err.message}`);
            if (item.attempt >= MAX_RETRY) {
                console.warn(`⚠️ Melebihi percobaan maksimal, pesan dibuang.`);
                userQueue[userId].shift();
            } else {
                await new Promise(res => setTimeout(res, RETRY_DELAY));
            }
        }
    }

    processingQueue[userId] = false;
}

// ------------------- Listener -------------------
module.exports = (client) => {
    client.on("message", async (msg) => {
        try {
            if (!msg.body) return;
            const body = msg.body.trim();

            // ----- PRIORITAS COMMAND -----
            if (body.startsWith("!")) return; // Abaikan specialtext untuk command

            const bodyLower = body.toLowerCase();
            const isGroup = msg.from.endsWith("@g.us");

            // Cari keyword yang cocok
            const matched = data.filter(item => {
                if (!item.keyword) return false;

                // keywords bisa dipisah dengan koma, tetap satu object
                const keywords = item.keyword.split(",").map(k => k.trim().toLowerCase()).filter(Boolean);
                const matchedKeyword = keywords.find(k => bodyLower.includes(k));
                if (!matchedKeyword) return false;

                if (isGroup && (item.type === "group" || item.type === "both")) return true;
                if (!isGroup && (item.type === "dm" || item.type === "both")) return true;
                return false;
            });

            if (matched.length === 0) return;

            // ---------- GROUP ----------
            if (isGroup) {
                if (!groupQueue[msg.from]) groupQueue[msg.from] = new Set();

                for (const item of matched) {
                    if (groupQueue[msg.from].has(item.id)) continue;

                    await msg.reply(item.text);
                    console.log(`✅ Group ${msg.from} dibalas keyword "${item.keyword}"`);
                    groupQueue[msg.from].add(item.id);

                    setTimeout(() => groupQueue[msg.from].delete(item.id), GROUP_WINDOW);
                }
            }

            // ---------- DM ----------
            else {
                const userId = msg.from;
                if (!userQueue[userId]) userQueue[userId] = [];

                matched.forEach(item => {
                    // push satu object, walau ada beberapa keyword
                    userQueue[userId].push({ ...item, attempt: 0 });
                });

                processQueue(userId, client);
            }

        } catch (err) {
            console.error("❌ Error specialText listener:", err.message);
        }
    });
};
