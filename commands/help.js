module.exports = {
  name: "help",
  description: "List semua command dengan pagination",

  async execute(msg, args, client) {
    const commands = client.commands; // pastikan ini Map
    if (!commands) return msg.reply("❌ Tidak ada command yang terdaftar.");

    const pageSize = 5;
    let page = parseInt(args[0]) || 1;

    // Bikin list unik berdasarkan nama command
    const cmdMap = new Map();
    for (const [name, cmd] of commands) {
      if (!cmdMap.has(cmd.name)) {
        cmdMap.set(cmd.name, {
          name: cmd.name,
          aliases: cmd.aliases?.join(", ") || "-",
          description: cmd.description || "-"
        });
      }
    }

    const cmdList = Array.from(cmdMap.values());
    const totalPages = Math.ceil(cmdList.length / pageSize);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = cmdList.slice(start, end);

    let text = `📌 Daftar Command (Page ${page}/${totalPages}):\n\n`;
    for (const cmd of pageItems) {
      text += `* !${cmd.name}\n  Alias: ${cmd.aliases}\n  Deskripsi: ${cmd.description}\n\n`;
    }

    text += `Gunakan !help <nomor halaman> untuk melihat halaman lain.`;

    await msg.reply(text);
  }
};
