const { 
    loadGroupSettings, 
    saveGroupSettings, 
    setSpamKickMessage, 
    setSpamWarnMessage, 
    setSpamThresholds 
} = require("../helpers/group_helper");

const { isAdmin } = require("../helpers/admin_helper"); // Pastikan isAdmin dipanggil dari admin_helper


module.exports = {
    name: "grspam",
    description: "Pengaturan antispam group",

    async execute(msg, args, client) {
        const sender = msg.author || msg.from;
        if (!isAdmin(sender)) {
            return msg.reply("❌ Kamu tidak terdaftar sebagai admin untuk mengakses command ini.");
        }

        const settings = loadGroupSettings();
        settings.spam = settings.spam || {
            enabled: true,
            limit: 3,
            window: 5000,
            kick: false,
            warnThreshold: 3,
            kickThreshold: 5,
            warnMessage: "⚠️ Kamu terdeteksi spam!",
            kickMessage: "🚫 Pengguna dikeluarkan karena spam berulang."
        };

        const sub = (args[0] || "").toLowerCase();

        // ---------------- /spam on
        if (sub === "on") {
            settings.spam.enabled = true;
            saveGroupSettings(settings);
            return msg.reply("✔ Anti-spam diaktifkan.");
        }

        // ---------------- /spam off
        if (sub === "off") {
            settings.spam.enabled = false;
            saveGroupSettings(settings);
            return msg.reply("❌ Anti-spam dimatikan.");
        }

        // ---------------- /spam limit <n>
        if (sub === "limit") {
            const n = Number(args[1]);
            if (!n || n < 2) return msg.reply("Format: *!grspam limit 5*");
            settings.spam.limit = n;
            saveGroupSettings(settings);
            return msg.reply(`✔ SPAM_LIMIT diset ke ${n}`);
        }

        // ---------------- /spam window <n>
        if (sub === "window") {
            const n = Number(args[1]);
            if (!n || n < 1000) return msg.reply("Format: *!grspam window 3000*");
            settings.spam.window = n;
            saveGroupSettings(settings);
            return msg.reply(`✔ SPAM_WINDOW diset ke ${n} ms`);
        }

        // ---------------- /spam kick on/off
        if (sub === "kick") {
            const val = (args[1] || "").toLowerCase();
            if (!["on", "off"].includes(val)) return msg.reply("Format: *!grspam kick on | off*");
            settings.spam.kick = val === "on";
            saveGroupSettings(settings);
            return msg.reply(`✔ Auto-kick spammer: ${settings.spam.kick ? "ON" : "OFF"}`);
        }

        // ---------------- /spam warnmsg <pesan>
        if (sub === "warnmsg") {
            const text = args.slice(1).join(" ");
            if (!text) return msg.reply("Format: *!grspam warnmsg <pesan>*");
            setSpamWarnMessage(text);
            return msg.reply("✔ Pesan peringatan diperbarui.");
        }

        // ---------------- /spam kickmsg <pesan>
        if (sub === "kickmsg") {
            const text = args.slice(1).join(" ");
            if (!text) return msg.reply("Format: *!grspam kickmsg <pesan>*");
            setSpamKickMessage(text);
            return msg.reply("✔ Pesan kick diperbarui.");
        }

        // ---------------- /spam warnthreshold <n>
        if (sub === "warnthreshold") {
            const n = Number(args[1]);
            if (!n || n < 1) return msg.reply("Format: *!grspam warnthreshold 3*");
            setSpamThresholds({ warnThreshold: n });
            return msg.reply(`✔ Warn threshold diset ke ${n}`);
        }

        // ---------------- /spam kickthreshold <n>
        if (sub === "kickthreshold") {
            const n = Number(args[1]);
            if (!n || n < 1) return msg.reply("Format: *!grspam kickthreshold 5*");
            setSpamThresholds({ kickThreshold: n });
            return msg.reply(`✔ Kick threshold diset ke ${n}`);
        }

        // ---------------- tampilkan status jika tanpa argumen
        const st = settings.spam;
        return msg.reply(
`📌 *STATUS ANTI-SPAM*
Enabled: ${st.enabled}
Limit: ${st.limit} pesan
Window: ${st.window} ms
Kick: ${st.kick}
Warn Threshold: ${st.warnThreshold}
Kick Threshold: ${st.kickThreshold}
Warn Msg: ${st.warnMessage}
Kick Msg: ${st.kickMessage}

ℹ Contoh penggunaan:
- !grspam on
- !grspam limit 3
- !grspam window 5000
- !grspam kick on
- !grspam warnmsg Jangan spam!
- !grspam kickmsg User dikeluarkan karena spam.
- !grspam warnthreshold 3
- !grspam kickthreshold 5
`
        );
    }
};
