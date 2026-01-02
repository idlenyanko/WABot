module.exports = {
    name: "help",
    description: "List semua command",

    async execute(msg, args, client) {
        // cek lisensi pengirim
        
        const commands = client.commands; // pastikan ini Map
        if (!commands) return msg.reply("❌ Tidak ada command yang terdaftar.");

        let text = "📌 *Daftar Command:*\n";
        for (const [name, cmd] of commands) {
            text += `• !${name} - ${cmd.description || "Tidak ada deskripsi"}\n`;
        }

        msg.reply(text);
    }
};
