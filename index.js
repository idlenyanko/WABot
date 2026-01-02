// -------------------- ANTI TAMPER --------------------
const { antiTamperCheck } = require("./helpers/anti_tamper");
antiTamperCheck();

// -------------------- LIB --------------------
const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const fs = require("fs");
const path = require("path");

// -------------------- ADMIN --------------------
const { isAdmin } = require("./helpers/admin_helper");

const adminPath = path.join(__dirname, "./data/admins.json");
const adminList = JSON.parse(fs.readFileSync(adminPath, "utf8")).admins;

console.log("👑 Admin list:");
adminList.forEach(a => console.log("-", a));

// -------------------- LICENSE --------------------
const { checkLicense, isLicensed } = require("./loader/license_loader");

// -------------------- LISTENERS --------------------
const { loadListeners } = require("./loader/listener_loader");

// -------------------- INIT CLIENT --------------------
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// -------------------- LOAD LISTENERS --------------------
loadListeners(client);

// -------------------- QR --------------------
client.on("qr", qr => qrcode.generate(qr, { small: true }));

// -------------------- READY --------------------
client.on("ready", () => {
  console.log("Bot is ready!");

  let botNumber = client.info.wid.user;
  if (!botNumber.includes("@c.us")) botNumber += "@c.us";

  checkLicense(botNumber);
  console.log("✔ Lisensi valid. Bot berjalan normal.");
});

// -------------------- LOAD COMMANDS --------------------
const commands = new Map();
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const cmd = require(`./commands/${file}`);
  commands.set(cmd.name, cmd);

  if (cmd.aliases) {
    for (const a of cmd.aliases) commands.set(a, cmd);
  }
}

client.commands = commands;

// -------------------- COOLDOWN --------------------
const userCooldown = new Map();
const COOLDOWN_TIME = 5 * 1000;

// -------------------- MESSAGE HANDLER --------------------
client.on("message", async (msg) => {
  const prefix = "!";
  if (!msg.body?.startsWith(prefix)) return;
  if (msg.from.endsWith("@g.us")) return;

  const userId = msg.from;
  const isAdminUser = isAdmin(userId);

  // ---------- COOLDOWN (NON ADMIN) ----------
  if (!isAdminUser) {
    const now = Date.now();
    const last = userCooldown.get(userId) || 0;

    if (now - last < COOLDOWN_TIME) {
      return msg.reply(`⏳ Command berikutnya cooldown ${COOLDOWN_TIME / 1000} detik.`);
    }

    userCooldown.set(userId, now);
  }

  // ---------- COMMAND ----------
  const args = msg.body.slice(prefix.length).trim().split(/ +/);
  const cmdName = args.shift().toLowerCase();

  if (!commands.has(cmdName)) return;

  const command = commands.get(cmdName);

  if (command.isAdminOnly && !isAdminUser) {
    return msg.reply("❌ Kamu tidak terdaftar sebagai admin.");
  }

  try {
    await command.execute(msg, args, client);
  } catch (err) {
    console.error(err);
    await msg.reply("❌ Error saat menjalankan command.");
  }
});

// -------------------- START --------------------
client.initialize();
