const fs = require("fs");
const path = require("path");
const { isLicensed } = require("../helpers/license_helper"); // pastikan diimport

const SPTEXT_FILE = path.join(__dirname, "../data/specialtext.json");

module.exports = {
    name: "info",
    description: "Info bot Nyanko ala imut & ramah 🐾",
    async execute(msg, args, client) {
        try {
            // cek lisensi user, tapi info tetap bisa diakses publik
            const licensed = isLicensed(msg.from);

            // load jumlah special text
            let sptextCount = 0;
            if (fs.existsSync(SPTEXT_FILE)) {
                const raw = fs.readFileSync(SPTEXT_FILE, "utf8");
                const data = JSON.parse(raw);
                sptextCount = data.length;
            }

            const lisensiText = licensed
                ? "✔ Lisensi valid! Semua fitur aktif 😸"
                : "⚠️ Lisensi tidak aktif 😿 Beberapa fitur terbatas!";

            const replyText = `
🐾 *Hai, aku Nyanko!* 🐾

💻 *Status Lisensi:* ${lisensiText}
📂 *Jumlah Special Text:* ${sptextCount}
⏱ **Cooldown Command Non-Lisensi:* 5 detik
🎀 *[Fitur-fitur Bot Nyanko]*
  - 💬 *Special Text:* Balas otomatis keyword tertentu di DM & Grup
  - 🚫 *Anti Spam:* Deteksi spam command & kata di grup
  - 🔒 *Lisensi:* Pastikan fitur penuh berjalan untuk user berlisensi
  - 🐾 *Queue DM:* Balasan DM tertib walau banyak chat masuk
  - ⚡ *Command Handler:* Semua command diawali prefix (!) dan hanya DM


✨ Semoga hari kamu ceria! Yuk main sama Nyanko 😺
            `;

            await msg.reply(replyText.trim());
        } catch (err) {
            console.error("❌ Error command !info:", err.message);
            await msg.reply("😿 Waduh, ada error saat menampilkan info. Coba lagi nanti ya!");
        }
    }
};
