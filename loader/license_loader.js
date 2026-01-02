const fs = require("fs");
const path = require("path");

const crypto = require("crypto");

require("dotenv").config({ path: path.join(__dirname, "..", "gembok.env") });


const ALGORITHM = "aes-256-cbc";
const KEY = crypto.createHash("sha256").update(process.env.MASTER_KEY).digest(); // hash dulu

let licenseData = null; // cache lisensi

function decryptData(encrypted, iv) {
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encrypted, "base64", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
}

function loadLicense() {
    if (licenseData) return licenseData; // return cached

    if (!fs.existsSync("masterkey.enc")) {
        console.log("❌ Lisensi tidak ditemukan!");
        process.exit(1);
    }

    const raw = JSON.parse(fs.readFileSync("masterkey.enc", "utf8"));
    const iv = Buffer.from(raw.iv, "base64");
    const encrypted = raw.data;

    let data;
    try {
        const decrypted = decryptData(encrypted, iv);
        data = JSON.parse(decrypted);
    } catch (err) {
        console.log("❌ Lisensi rusak atau key salah.");
        process.exit(1);
    }

    licenseData = data; // cache
    return data;
}

function checkLicense(botNumber) {
    const data = loadLicense();

    if (!botNumber.includes("@c.us")) botNumber = botNumber.replace(/\D/g, "") + "@c.us";

    const meta = data.meta[botNumber.replace("@c.us", "")];
    if (!meta) {
        console.log("❌ Nomor bot tidak terdaftar di lisensi!");
        process.exit(1);
    }

    if (Date.now() > meta.expire) {
        console.log("❌ Lisensi sudah expired.");
        process.exit(1);
    }

    console.log("✔ Lisensi valid, expire pada:", new Date(meta.expire).toLocaleString());
}

// Tambahan: cek user per ID apakah terdaftar lisensi
function isLicensed(userId) {
    const data = loadLicense();
    if (!userId.includes("@c.us")) userId = userId.replace(/\D/g, "") + "@c.us";
    const meta = data.meta[userId.replace("@c.us", "")];
    if (!meta) return false;
    if (Date.now() > meta.expire) return false;
    return true;
}

module.exports = { checkLicense, isLicensed };
