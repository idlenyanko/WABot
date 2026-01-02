const fs = require("fs");
const path = require("path");

const adminsFilePath = path.join(__dirname, "../data/admins.json");

// Helper untuk membaca dan menulis file JSON
const readAdmins = () => {
    try {
        return JSON.parse(fs.readFileSync(adminsFilePath, "utf8")).admins;
    } catch (error) {
        throw new Error("Terjadi kesalahan saat memuat daftar admin.");
    }
};

const writeAdmins = (admins) => {
    try {
        fs.writeFileSync(adminsFilePath, JSON.stringify({ admins }, null, 2));
    } catch (error) {
        throw new Error("Terjadi kesalahan saat menyimpan daftar admin.");
    }
};

// Helper untuk membersihkan input nomor
const sanitizeInput = (input) => input.replace(/\D/g, ""); // Menghapus semua non-digit, hanya menyisakan angka

module.exports = {
    name: "admins",
    description: "Mengelola daftar admin.",
    async execute(msg, args) {
        let admins = readAdmins(); // Baca daftar admin

        // Cek apakah pengirim pesan adalah admin yang terdaftar
        if (!admins.includes(msg.from)) {
            return msg.reply("❌ Kamu tidak terdaftar sebagai admin untuk mengubah daftar admin.");
        }

        const handleAdminAction = (action, number) => {
            let sanitizedNumber = sanitizeInput(number);

            if (!sanitizedNumber) {
                return msg.reply("❌ Nomor yang dimasukkan tidak valid. Harap hanya masukkan angka.");
            }

            if (!sanitizedNumber.includes("@c.us")) {
                sanitizedNumber += "@c.us";
            }

            if (action === "add") {
                if (admins.includes(sanitizedNumber)) {
                    return msg.reply("❌ Admin sudah terdaftar.");
                }
                admins.push(sanitizedNumber);
                writeAdmins(admins);
                return msg.reply(`✔ ${sanitizedNumber} berhasil ditambahkan sebagai admin.`);
            } else if (action === "revoke") {
                const index = admins.indexOf(sanitizedNumber);
                if (index === -1) {
                    return msg.reply("❌ Admin tidak ditemukan.");
                }
                admins.splice(index, 1);
                writeAdmins(admins);
                return msg.reply(`✔ ${sanitizedNumber} berhasil dihapus dari daftar admin.`);
            }
        };

        // Cek argumen
        if (args[0] === "add" && args[1]) {
            return handleAdminAction("add", args[1]);
        } else if (args[0] === "revoke" && args[1]) {
            return handleAdminAction("revoke", args[1]);
        } else if (args[0] === "list") {
            if (admins.length === 0) {
                return msg.reply("❌ Belum ada admin yang terdaftar.");
            }

            let text = "📋 *Daftar Admin Bot:*\n";
            admins.forEach((admin, idx) => {
                text += `${idx + 1}. ${admin}\n`;
            });

            return msg.reply(text);
        } else {
            return msg.reply("❌ Command tidak valid. Gunakan `!admins add <nomor>`, `!admins revoke <nomor>`, atau `!admins list`.");
        }
    }
};
