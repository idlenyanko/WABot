const { isAdmin } = require("../helpers/admin_helper");
const { 
    setGroupId,
    addWhitelist,
    addFilterWords,
    removeWhitelist,
    removeFilterWords,
    loadGroupSettings
} = require("../helpers/group_helper");

// Session sementara per admin/pemegang lisensi
const groupSessions = {}; // key: nomor admin @c.us, value: groupId

function normalizeUrl(url) {
    return url.replace(/^https?:\/\//, '')
              .replace(/^www\./, '')
              .replace(/\/$/, '')
              .toLowerCase();
}

module.exports = {
    name: "grset",
    description: "Pengaturan Group (Whitelist/filter)",
    async execute(msg, args, client) {
        const senderNumber = msg.author || msg.from;

        // Ambil chat dulu
        const chat = await msg.getChat();

        // Pastikan ini DM pribadi
        if (chat.isGroup) {
            return msg.reply("❌ Silakan gunakan command ini dari chat pribadi dengan bot, bukan di grup.");
        }

        // cek lisensi
        if (!isAdmin(msg.from)) {
            return msg.reply("❌ Kamu tidak terdaftar sebagai admin untuk mengakses command ini.");
        }

        // Jika tanpa argumen atau help, tampilkan panduan
        if (!args[0] || args[0].toLowerCase() === "help") {
            return msg.reply(`
📌 *Panduan !grset*:
1️⃣ !grset idgroup <id grup> → pilih grup yang akan dikelola
2️⃣ !grset whitelist <url1[,url2,...]> → tambah URL
3️⃣ !grset filter <kata1[,kata2,...]> → tambah kata filter
4️⃣ !grset list → lihat semua whitelist dan filter
5️⃣ !grset del whitelist|filter <value1[,value2,...]> → hapus URL/kata
6️⃣ !grset clearall [whitelist|filter] → hapus semua whitelist/filter (default: keduanya)
7️⃣ !grset exit → keluar session
`);
        }

        const subCommand = args[0].toLowerCase();

        // EXIT SESSION
        if (subCommand === "exit") {
            delete groupSessions[senderNumber];
            return msg.reply("✅ Anda keluar dari session !grset. Sub-command lain tidak bisa digunakan sampai pilih grup lagi.");
        }

        // PILIH GRUP
        if (subCommand === "idgroup") {
            if (!args[1]) return msg.reply("❌ Format: !grset idgroup <id grup>");
            const groupId = setGroupId(args[1]); // otomatis append @g.us & save
            groupSessions[senderNumber] = groupId;
            return msg.reply(`✔ Grup diset ke: ${groupId}. Sekarang bisa menggunakan sub-command whitelist/filter/list/remove.`);
        }

        // Cek session aktif
        const activeGroup = groupSessions[senderNumber];
        if (!activeGroup) {
            return msg.reply("❌ Pilih grup dulu dengan !grset idgroup <id grup> sebelum menggunakan sub-command lain.");
        }

        // LOAD SETTING
        const settings = loadGroupSettings();

        const valueString = args.slice(1).join(" ");
        const values = valueString.split(",").map(v => v.trim()).filter(v => v.length > 0);

        // ---------------- SUB-COMMANDS ----------------
        switch(subCommand) {
            case "whitelist":
                addWhitelist(values);
                return msg.reply(`✔ URL(s) ditambahkan ke whitelist: ${values.join(", ")}`);

            case "filter":
                addFilterWords(values);
                return msg.reply(`✔ Kata(s) ditambahkan ke filter: ${values.join(", ")}`);

            case "list":
                const whitelist = (settings.whitelistUrls || []).map(normalizeUrl).join(", ") || "kosong";
                const filter = (settings.filterWords || []).join(", ") || "kosong";
                return msg.reply(`📌 *Setting Grup Saat Ini:*\n• Grup ID: ${settings.groupId}\n• Whitelist URL: ${whitelist}\n• Filter Kata: ${filter}`);

            case "del":
                if (values.length === 0 || !["whitelist","filter"].includes(args[1]?.toLowerCase())) {
                    return msg.reply("❌ Format: !grset del whitelist|filter <value1[,value2,...]>");
                }
                const removeType = args[1].toLowerCase();
                const removeValues = args.slice(2).join(" ").split(",").map(v => v.trim()).filter(v => v.length>0);
                if(removeType === "whitelist") {
                    removeWhitelist(removeValues);
                    return msg.reply(`✔ URL(s) dihapus dari whitelist: ${removeValues.join(", ")}`);
                }
                if(removeType === "filter") {
                    removeFilterWords(removeValues);
                    return msg.reply(`✔ Kata(s) dihapus dari filter: ${removeValues.join(", ")}`);
                }
                break;

            case "clearall":
                // Opsi spesifik: whitelist / filter / keduanya
                if (args[1]) {
                    const type = args[1].toLowerCase();
                    if (type === "whitelist") {
                        removeWhitelist(settings.whitelistUrls || []);
                        return msg.reply("✅ Semua whitelist telah dibersihkan.");
                    }
                    if (type === "filter") {
                        removeFilterWords(settings.filterWords || []);
                        return msg.reply("✅ Semua filter kata telah dibersihkan.");
                    }
                    return msg.reply("❌ Opsi tidak dikenali. Gunakan: clearall [whitelist|filter]");
                }
                // Default: hapus keduanya
                removeWhitelist(settings.whitelistUrls || []);
                removeFilterWords(settings.filterWords || []);
                return msg.reply("✅ Semua whitelist dan filter telah dibersihkan.");

            default:
                return msg.reply("❌ Sub-command tidak dikenali. Ketik !grset help untuk panduan.");
        }
    }
};
