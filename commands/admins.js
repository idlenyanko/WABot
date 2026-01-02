const fs = require("fs");
const path = require("path");

const adminsFilePath = path.join(__dirname, "../data/admins.json");

// -------------------- Helper --------------------
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

module.exports = {
  name: "admins",
  aliases: ["admin"],
  description: "Mengelola daftar admin.",
  async execute(msg, args) {
    let admins = readAdmins(); // Baca daftar admin
    const senderId = msg.from;

    // Cek apakah pengirim admin
    if (!admins.includes(senderId)) {
      return msg.reply("❌ Kamu tidak terdaftar sebagai admin untuk mengubah daftar admin.");
    }

    const handleAdminAction = (action, type, number) => {
      if (!number) return msg.reply("❌ Nomor yang dimasukkan tidak valid.");

      let fullId;
      if (type === "lid") fullId = `${number}@lid`;
      else if (type === "cust") fullId = `${number}@c.us`;
      else return msg.reply("❌ Tipe harus 'lid' atau 'cust'.");

      if (action === "add") {
        if (admins.includes(fullId)) return msg.reply("❌ Admin sudah terdaftar.");
        admins.push(fullId);
        writeAdmins(admins);
        return msg.reply(`✔ ${fullId} berhasil ditambahkan sebagai admin.`);
      } else if (action === "revoke") {
        const index = admins.indexOf(fullId);
        if (index === -1) return msg.reply("❌ Admin tidak ditemukan.");
        admins.splice(index, 1);
        writeAdmins(admins);
        return msg.reply(`✔ ${fullId} berhasil dihapus dari daftar admin.`);
      }
    };

    // -------------------- Handle args --------------------
    const subCommand = args[0];
    if (subCommand === "add" && args[1] && args[2]) {
      return handleAdminAction("add", args[1].toLowerCase(), args[2]);
    } else if (subCommand === "revoke" && args[1] && args[2]) {
      return handleAdminAction("revoke", args[1].toLowerCase(), args[2]);
    } else if (subCommand === "list") {
      if (admins.length === 0) return msg.reply("❌ Belum ada admin yang terdaftar.");

      let text = "📋 *Daftar Admin Bot:*\n";
      admins.forEach((admin, idx) => {
        text += `${idx + 1}. ${admin}\n`;
      });
      return msg.reply(text);
    } else {
      return msg.reply(
        "❌ Command tidak valid. Gunakan:\n" +
        "`!admins add <lid/cust> <nomor>`\n" +
        "`!admins revoke <lid/cust> <nomor>`\n" +
        "`!admins list`"
      );
    }
  }
};
