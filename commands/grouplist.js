const { isAdmin } = require("../helpers/admin_helper");

module.exports = {
    name: "grlist",
    description: "Daftar Group",
    async execute(msg, args, client) {
        // cek lisensi pengirim
        if (!isAdmin(msg.from)) {
            return msg.reply("❌ Kamu tidak terdaftar sebagai admin untuk mengakses command ini.");
        }
        try {
            // Ambil semua chat
            const chats = await client.getChats();

            // Filter hanya grup di mana bot menjadi admin
            const groups = chats.filter(c => c.isGroup && c.participants.some(p => p.id._serialized === client.info.wid._serialized && p.isAdmin));

            if (groups.length === 0) {
                return msg.reply("❌ Bot belum menjadi admin di grup manapun.");
            }

            let text = "📌 *Daftar Grup yang bot menjadi admin:*\n";
            groups.forEach((g, idx) => {
                text += `• ${g.name} - ${g.id._serialized}\n`;
            });

            msg.reply(text);
        } catch (err) {
            console.error(err);
            msg.reply("❌ Gagal mengambil daftar grup.");
        }
    }
};
