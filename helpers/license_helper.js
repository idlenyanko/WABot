const fs = require("fs");
const path = require("path");

const crypto = require("crypto");

require("dotenv").config({ path: path.join(__dirname, "..", "gembok.env") });

const ALGORITHM = "aes-256-cbc";
const MASTER_KEY = process.env.MASTER_KEY;

// Fungsi cek lisensi untuk nomor tertentu
function isLicensed(userNumber) {
    try {
        if (!fs.existsSync("masterkey.enc")) {
            return { status: "notfound", message: "❌ Lisensi tidak ditemukan!" };
        }

        // Load dan decrypt masterkey
        const raw = JSON.parse(fs.readFileSync("masterkey.enc", "utf8"));
        const KEY = crypto.createHash("sha256").update(MASTER_KEY).digest();
        const iv = Buffer.from(raw.iv, "base64");
        const encrypted = raw.data;

        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
        let decrypted = decipher.update(encrypted, "base64", "utf8");
        decrypted += decipher.final("utf8");

        const data = JSON.parse(decrypted);

        // Pastikan userNumber dalam format @c.us
        if (!userNumber.includes("@c.us")) userNumber = userNumber.replace(/\D/g, "") + "@c.us";

        // Cek allowed
        if (!data.allowed.includes(userNumber)) {
            return { status: "unauthorized", message: "❌ Kamu tidak terdaftar sebagai pemegang lisensi!" };
        }

        // Cek expiry
        const meta = data.meta[userNumber.replace("@c.us", "")];
        if (!meta) return { status: "notfound", message: "❌ Lisensi tidak ditemukan untuk nomor kamu." };

        const now = Date.now();
        const remainingMs = meta.expire - now;

        if (remainingMs <= 0) {
            return { status: "expired", message: "❌ Lisensi kamu sudah expired!" };
        }

        const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

        return {
            status: "valid",
            message: `✔ Lisensi masih aktif.\nSisa waktu: ${days} hari, ${hours} jam, ${minutes} menit`,
            remainingMs
        };

    } catch (err) {
        console.error(err);
        return { status: "error", message: "❌ Gagal mengecek lisensi." };
    }
}

module.exports = { isLicensed };
