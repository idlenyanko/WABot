const { loadGroupSettings } = require("../../helpers/group_helper");

module.exports = (client) => {
    const spamCache = {};

    client.on("message_create", async (msg) => {
        try {
            if (msg.fromMe) return;

            const settings = loadGroupSettings();
            if (!settings.groupId || msg.from !== settings.groupId) return;
            if (!settings.spam || !settings.spam.enabled) return;

            const userId = msg.author || msg.from;
            const now = Date.now();

            // Init cache per user
            if (!spamCache[userId]) {
                spamCache[userId] = { times: [], warned: false, isAdmin: false };
            }

            // Push timestamp
            spamCache[userId].times.push(now);

            // Hapus timestamp di luar window
            spamCache[userId].times = spamCache[userId].times.filter(
                t => now - t <= settings.spam.window
            );

            const count = spamCache[userId].times.length;

            console.log("-------------------------------------------------");
            console.log("Pesan masuk:", msg.body);
            console.log("Pengirim:", userId);
            console.log("Grup:", msg.from);
            console.log("Spam count:", count);
            console.log("Warned:", spamCache[userId].warned);

            // ---------- WARNING ----------
            if (!spamCache[userId].warned && count >= settings.spam.warnThreshold) {
                const warnMsg = settings.spam.warnMessage || "⚠️ Kamu terdeteksi spam!";
                await msg.reply(warnMsg);
                console.log(`⚠️ Warning dikirim ke ${userId}`);
                spamCache[userId].warned = true;
            }

            // ---------- KICK ----------
            if (count >= settings.spam.kickThreshold && settings.spam.kick) {
                try {
                    const chat = await client.getChatById(msg.from);
                    const participant = chat.participants.find(p => p.id._serialized === userId);
                    const isAdmin = participant && (participant.isAdmin || participant.isSuperAdmin);
                    spamCache[userId].isAdmin = isAdmin; // update cache

                    if (isAdmin) {
                        console.log(`ℹ️ Admin ${userId} mencapai kick threshold tapi tidak dikick`);
                    } else {
                        await chat.removeParticipants([userId]);
                        const kickMsg = settings.spam.kickMessage || "🚫 Kamu dikeluarkan karena spam!";
                        await msg.reply(kickMsg);
                        console.log(`🚫 User ${userId} di-kick karena spam`);
                    }

                    // Reset cache setelah kick/warning
                    spamCache[userId] = { times: [], warned: false, isAdmin };
                } catch (err) {
                    console.error("❌ Error saat kick:", err.message);
                }
            }

            // ---------- RESET SPAM CACHE OTOMATIS ----------
            setTimeout(() => {
                if (spamCache[userId]) {
                    spamCache[userId] = { times: [], warned: false, isAdmin: spamCache[userId].isAdmin };
                    console.log(`♻️ Reset spam count & warned untuk ${userId} setelah periode window`);
                }
            }, settings.spam.window + 100);

        } catch (err) {
            console.error("❌ Error anti-spam listener:", err.message);
        }
    });
};
