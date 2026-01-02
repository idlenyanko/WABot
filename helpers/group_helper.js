const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/group_settings.json");

/**
 * Load group settings dari file JSON.
 * Jika file tidak ada, buat default object.
 */
function loadGroupSettings() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return {};
        }
        const raw = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(raw);
    } catch (err) {
        console.error("❌ Gagal load group settings:", err.message);
        return {};
    }
}

/**
 * Simpan group settings ke file JSON.
 */
function saveGroupSettings(settings) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(settings, null, 4), "utf8");
    } catch (err) {
        console.error("❌ Gagal simpan group settings:", err.message);
    }
}

/**
 * Set group ID
 */
function setGroupId(groupId) {
    const settings = loadGroupSettings();
    if (!groupId.endsWith("@g.us")) groupId += "@g.us";
    settings.groupId = groupId;
    saveGroupSettings(settings);
    return settings.groupId;
}

/**
 * Tambah whitelist URL
 */
function addWhitelist(urls) {
    const settings = loadGroupSettings();
    settings.whitelistUrls = settings.whitelistUrls || [];
    urls.forEach(url => {
        if (!settings.whitelistUrls.includes(url)) {
            settings.whitelistUrls.push(url);
        }
    });
    saveGroupSettings(settings);
}

/**
 * Tambah kata filter
 */
function addFilterWords(words) {
    const settings = loadGroupSettings();
    settings.filterWords = settings.filterWords || [];
    words.forEach(w => {
        if (!settings.filterWords.includes(w)) {
            settings.filterWords.push(w);
        }
    });
    saveGroupSettings(settings);
}

/**
 * Hapus whitelist URL
 */
function removeWhitelist(urls) {
    const settings = loadGroupSettings();
    settings.whitelistUrls = (settings.whitelistUrls || []).filter(u => !urls.includes(u));
    saveGroupSettings(settings);
}

/**
 * Hapus filter words
 */
function removeFilterWords(words) {
    const settings = loadGroupSettings();
    settings.filterWords = (settings.filterWords || []).filter(w => !words.includes(w));
    saveGroupSettings(settings);
}

/**
 * Set parameter anti-spam (SPAM_WINDOW, LIMIT, AUTO-KICK)
 */
function setSpamConfig({ window, limit, kick }) {
    const settings = loadGroupSettings();
    settings.spam = settings.spam || {};
    if (window !== undefined) settings.spam.window = Number(window);
    if (limit !== undefined) settings.spam.limit = Number(limit);
    if (kick !== undefined) settings.spam.kick = kick ? true : false;
    saveGroupSettings(settings);
    return settings.spam;
}

/**
 * Set pesan notifikasi ketika user di-kick karena spam
 */
function setSpamKickMessage(message) {
    const settings = loadGroupSettings();
    settings.spam = settings.spam || {};
    settings.spam.kickMessage = message;
    saveGroupSettings(settings);
    return message;
}

/**
 * Set pesan peringatan ketika user spam
 */
function setSpamWarnMessage(message) {
    const settings = loadGroupSettings();
    settings.spam = settings.spam || {};
    settings.spam.warnMessage = message;
    saveGroupSettings(settings);
    return message;
}

/**
 * Set warn & kick threshold
 */
function setSpamThresholds({ warnThreshold, kickThreshold }) {
    const settings = loadGroupSettings();
    settings.spam = settings.spam || {};
    if (warnThreshold !== undefined) settings.spam.warnThreshold = Number(warnThreshold);
    if (kickThreshold !== undefined) settings.spam.kickThreshold = Number(kickThreshold);
    saveGroupSettings(settings);
    return settings.spam;
}

module.exports = {
    loadGroupSettings,
    saveGroupSettings,
    setGroupId,
    addWhitelist,
    addFilterWords,
    removeWhitelist,
    removeFilterWords,
    setSpamConfig,
    setSpamKickMessage,
    setSpamWarnMessage,
    setSpamThresholds
};
