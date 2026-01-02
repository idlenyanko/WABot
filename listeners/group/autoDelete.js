const { loadGroupSettings } = require("../../helpers/group_helper");
const stringSimilarity = require("string-similarity");

// cache settings
let cachedSettings = null;
let lastLoadTime = 0;
const CACHE_TTL = 5000; // reload tiap 5 detik

// normalisasi URL agar perbandingan lebih konsisten
function normalizeUrl(url) {
    return url
        .replace(/\*/g, '.')             // wildcard *
        .replace(/\(dot\)/gi, '.')       // (dot)
        .replace(/\s+/g, '')             // hapus spasi
        .replace(/^https?:\/\//, '')     // hapus schema
        .replace(/^www\./, '')           // hapus www
        .replace(/\/$/, '')              // hapus trailing slash
        .toLowerCase();
}

// cek apakah URL masuk whitelist
function isUrlWhitelisted(url, whitelist) {
    const nUrl = normalizeUrl(url);

    for (const w of whitelist) {
        const nW = normalizeUrl(w);

        // wildcard subdomain: *.domain.com
        if (nW.startsWith("*.")) {
            const domain = nW.slice(2); // hapus *.
            // jika URL sama dengan domain utama atau berakhiran .domain
            if (nUrl === domain || nUrl.endsWith(`.${domain}`)) return true;
        } 
        // exact match
        else if (nUrl === nW) return true;
        // fuzzy match minimal 0.8
        else {
            const similarity = stringSimilarity.compareTwoStrings(nUrl, nW);
            if (similarity >= 0.8) return true;
        }
    }

    return false;
}

module.exports = (client) => {
    client.on("message_create", async (msg) => {
        try {
            if (msg.fromMe) return;

            const chat = await msg.getChat();
            const now = Date.now();

            // reload settings tiap CACHE_TTL
            if (!cachedSettings || now - lastLoadTime > CACHE_TTL) {
                cachedSettings = loadGroupSettings();
                lastLoadTime = now;
            }
            const settings = cachedSettings;

            // hanya grup yang dipilih
            if (!chat.isGroup) return;
            if (chat.id._serialized !== settings.groupId) return;

            const text = (msg.body || "").toLowerCase();
            const sender = msg.author || msg.from;

            console.log("-------------------------------------------------");
            console.log("Pesan masuk:", text);
            console.log("Pengirim:", sender);
            console.log("Grup:", chat.id._serialized);

            // -------- filter kata --------
            const blockedWords = settings.filterWords || [];
            for (const word of blockedWords) {
                if (text.includes(word.toLowerCase())) {
                    try {
                        await msg.delete(true);
                        console.log(`✅ Ditemukan kata terlarang "${word}"`);
                        console.log("✅ Auto-delete: pesan dihapus");
                    } catch (e) {
                        console.error(`❌ Gagal hapus pesan: "${text}" dari ${sender} - ${e.message}`);
                    }
                    return;
                }
            }

            // -------- filter URL fuzzy & whitelist wildcard --------
            const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
            const matches = text.match(urlPattern);
            if (matches && matches.length > 0) {
                const whitelist = (settings.whitelistUrls || []);

                for (let url of matches) {
                    if (!isUrlWhitelisted(url, whitelist)) {
                        try {
                            await msg.delete(true);
                            console.log(`✅ Auto-delete: pesan "${text}" mengandung URL tidak di whitelist`);
                        } catch (e) {
                            console.error(`❌ Gagal hapus pesan "${text}" dari ${sender}:`, e.message);
                        }
                        return;
                    }
                }
            }

        } catch (err) {
            console.error("❌ Error listener auto-delete fuzzy:", err.message);
        }
    });
};
