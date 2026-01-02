const { antiTamperCheck } = require("./helpers/anti_tamper");
antiTamperCheck();

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");

// Mengimpor helper untuk pengecekan admin
const { isAdmin } = require("./helpers/admin_helper");

// Load lisensi
const { checkLicense, isLicensed } = require("./loader/license_loader");

// Load semua listener
const { loadListeners } = require("./loader/listener_loader");

// -------------------- INIT CLIENT --------------------
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// -------------------- AUTOLOAD LISTENERS --------------------
loadListeners(client);

// -------------------- QR CODE --------------------
client.on("qr", (qr) => qrcode.generate(qr, { small: true }));

// -------------------- READY EVENT --------------------
client.on("ready", async () => {
  console.log("Bot is ready!");

  let botNumber = client.info.wid.user;
  if (!botNumber.includes("@c.us")) botNumber += "@c.us";

  console.log("Bot number:", botNumber);

  // Cek lisensi bot
  checkLicense(botNumber);

  console.log("✔ Lisensi valid. Bot berjalan normal.");
});

// -------------------- LOAD COMMANDS --------------------
const commands = new Map();
const commandFiles = fs.readdirSync("./commands").filter((f) => f.endsWith(".js"));
for (const file of commandFiles) {
  const cmd = require(`./commands/${file}`);
  commands.set(cmd.name, cmd);
}
client.commands = commands;

// -------------------- GLOBAL COOLDOWN (OPTIONAL) --------------------
const userCooldown = new Map();
const COOLDOWN_TIME = 5 * 1000; // 5 detik
const userNotified = new Set();

// -------------------- HANDLE MESSAGE (COMMANDS ONLY) --------------------
client.on("message", async (msg) => {
  const prefix = "!"; // Prefix untuk command
  const body = msg.body;

  if (!body.startsWith(prefix)) return;
  if (msg.from.endsWith("@g.us")) return; // Untuk menghindari grup

  const userId = msg.from;
  const licensed = isLicensed(userId);

  // Cek apakah pengirim adalah admin atau pemegang lisensi
  const isAdminUser = isAdmin(userId);

  // Jika pengirim bukan admin dan tidak berlisensi, terapkan cooldown
  if (!isAdminUser && !licensed) {
    const lastUsed = userCooldown.get(userId) || 0;
    const now = Date.now();

    if (!userNotified.has(userId)) {
      await msg.reply(
        "⚠️ Kamu menggunakan versi non-lisensi dan bukan admin.\n" +
          `⏳ Command berikutnya akan dikenakan cooldown ${COOLDOWN_TIME / 1000} detik.`
      );
      userNotified.add(userId);
    }

    if (now - lastUsed < COOLDOWN_TIME) return;

    userCooldown.set(userId, now);
  }

  const args = body.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();

  // Cek apakah command ada
  if (!commands.has(cmdName)) return;

  // Periksa jika command milik admin atau publik
  const command = commands.get(cmdName);
  if (command.isAdminOnly && !isAdmin(msg.from)) {
    return msg.reply("❌ Kamu tidak terdaftar sebagai admin.");
  }

  try {
    await command.execute(msg, args, client);
  } catch (e) {
    console.error(e);
    await msg.reply("❌ Error saat menjalankan command.");
  }
});

// -------------------- INITIALIZE --------------------
client.initialize();
