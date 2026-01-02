module.exports = {
    name: "start",
    description: "Perkenalan Nyanko dan menu publik 🐾",
    async execute(msg, args, client) {
        const text = `
🐾 **Hai hai! Aku Nyanko!** 🐾
Asisten kucing tomboy yang siap jagain grupmu dari spam, link aneh, & kata-kata toxic 😼✊

💡 **Command Publik yang bisa kamu pakai:**

📌 **!help**  
   — Lihat semua command yang tersedia.

📌 **!cek**  
   — Cek status bot & lisensi.

📌 **!info**  
   — Info fitur bot & cara kerja.

⚠️ **Catatan Penting:**  
• Untuk setup grup, admin wajib DM aku pakai **!groupset help**.  
• Pengguna biasa cuma bisa pakai command publik.  
• Pastikan lisensi aktif untuk fitur penuh 😺

— Nyanko, siap ngejaga grupmu! 🐾🔥
        `;
        await msg.reply(text.trim());
    }
};
