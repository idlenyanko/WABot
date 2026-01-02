const { isAdmin } = require("../helpers/admin_helper"); // Impor fungsi isAdmin

module.exports = {
    name: "cek",
    description: "Cek status bot & status admin (jika terdaftar sebagai admin)",
    async execute(msg, args, client) {
        const senderNumber = msg.author || msg.from;
        const adminStatus = isAdmin(senderNumber); // Cek apakah pengirim adalah admin

        let text = `🐾 Status Bot Nyanko 🐾\n`;
        text += `• Nomor kamu: ${senderNumber}\n`;
        text += `• Waktu sekarang: ${new Date().toLocaleString()}\n\n`;

        if (adminStatus) {
            text += `✔ Status: Kamu adalah admin.\n`;
        } else {
            text += `❌ Status: Kamu bukan admin.\n`;
        }

        await msg.reply(text);
    }
};
