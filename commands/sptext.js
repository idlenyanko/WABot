const fs = require("fs");
const path = require("path");
const { isAdmin } = require("../helpers/admin_helper"); // Pastikan isAdmin dipanggil dari admin_helper

const filePath = path.join(__dirname, "../data/specialtext.json");

// Helper: load data
function loadData() {
    if (!fs.existsSync(filePath)) return [];
    try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
        return [];
    }
}

// Helper: save data
function saveData(data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

// Helper: map tipe angka ke string
function mapType(typeNum) {
    switch(typeNum) {
        case 0: return "dm";
        case 1: return "group";
        case 2: return "both";
        default: return "dm";
    }
}

module.exports = {
    name: "sptext",
    description: "Kelola Kata Kunci pada Bot",
    async execute(msg, args, client) {
        // Cek apakah pengirim adalah admin
        if (!isAdmin(msg.from)) {
            return msg.reply("❌ Kamu tidak terdaftar sebagai admin untuk mengakses command ini.");
        }

        if (!args.length) {
            return msg.reply("❌ Gunakan sub-command: list, add, del, view");
        }

        const sub = args.shift().toLowerCase();
        const data = loadData();

        switch(sub) {
            case "list":
                if (!data.length) return msg.reply("📄 Special text kosong.");
                let listText = "📄 Daftar Special Text:\n";
                data.forEach((item) => {
                    listText += `ID: ${item.id} | Keyword: ${item.keyword} | Type: ${item.type}\n`;
                });
                msg.reply(listText);
                break;

            case "add":
                if (args.length < 3) return msg.reply("❌ Usage: !sptext add <0|1|2> <keyword(s)> <text>");

                const typeNum = parseInt(args.shift());
                if (![0,1,2].includes(typeNum)) return msg.reply("❌ Type tidak valid. Gunakan 0=DM, 1=Group, 2=Both");

                // Keyword(s) bisa dipisahkan dengan koma
                let keywordsInput = args.shift();
                let text = args.join(" ");

                // Split keyword jika ada koma, hapus spasi awal/akhir
                const keywords = keywordsInput.split(",").map(k => k.trim()).filter(Boolean);

                const typeStr = mapType(typeNum);

                // Cari id terbesar saat ini untuk generate id baru
                let nextId = data.length ? Math.max(...data.map(d => d.id)) + 1 : 0;

                keywords.forEach(keyword => {
                    data.push({ id: nextId++, keyword: keyword.toLowerCase(), text, type: typeStr });
                });

                saveData(data);

                msg.reply(`✅ Special text ditambahkan. Keywords: "${keywords.join(', ')}", Type: "${typeStr}"`);
                break;

            case "del":
                if (!args.length) return msg.reply("❌ Usage: !sptext del <id>");
                const removeId = parseInt(args[0]);
                if (isNaN(removeId) || removeId < 0) return msg.reply("❌ ID tidak valid.");
                const removedIndex = data.findIndex(d => d.id === removeId);
                if (removedIndex === -1) return msg.reply("❌ ID tidak ditemukan.");
                const removedItem = data.splice(removedIndex, 1)[0];
                saveData(data);
                msg.reply(`✅ Special text dengan keyword "${removedItem.keyword}" telah dihapus.`);
                break;

            case "view":
                if (!args.length) return msg.reply("❌ Usage: !sptext view <id>");
                const viewId = parseInt(args[0]);
                const viewItem = data.find(d => d.id === viewId);
                if (!viewItem) return msg.reply("❌ ID tidak ditemukan.");
                msg.reply(`📄 Keyword: ${viewItem.keyword}\nTeks: ${viewItem.text}\nType: ${viewItem.type}`);
                break;

            default:
                msg.reply("❌ Sub-command tidak dikenal. Gunakan: list, add, del, view");
        }
    }
};
