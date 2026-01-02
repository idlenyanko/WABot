const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const CHECK_INTERVAL = 10000; // cek tiap 10 detik

// Fungsi untuk mendapatkan hash dari file
async function getFileHash(file) {
    try {
        const data = await fs.promises.readFile(file);
        return crypto.createHash("sha256").update(data).digest("hex");
    } catch (err) {
        console.error(`❌ Error membaca file ${file}:`, err);
        return null;
    }
}

async function antiTamperCheck() {
    try {
        // --- FILE UTAMA ---
        const mainFile = process.argv[1];
        const mainHash = await getFileHash(mainFile);

        if (mainHash) {
            setInterval(async () => {
                const currentHash = await getFileHash(mainFile);
                if (currentHash !== mainHash) {
                    console.log("\n❌ TAMPER DETECTED: File utama diubah!");
                    process.exit(1);
                }
            }, CHECK_INTERVAL);
        }

        // --- FILE LISENSI --- (Disesuaikan dengan path ke folder helpers)
        const licenseFile = path.resolve(__dirname, "..", "helpers", "license_helper.js");
        const licHash = await getFileHash(licenseFile);

        if (licHash) {
            setInterval(async () => {
                const currentLicHash = await getFileHash(licenseFile);
                if (currentLicHash !== licHash) {
                    console.log("\n❌ LICENSE TAMPER DETECTED!");
                    console.log("license_helper.js telah diubah!");
                    process.exit(1);
                }
            }, CHECK_INTERVAL);
        }

        // --- CEGAH PATCHING RUNTIME ---
        const licMod = require("../helpers/license_helper");  // Disesuaikan dengan folder helpers
        const orig = licMod.isLicensed.toString();

        setInterval(() => {
            const now = require("../helpers/license_helper").isLicensed.toString();
            if (orig !== now) {
                console.log("\n❌ RUNTIME PATCHING DETECTED!");
                process.exit(1);
            }
        }, CHECK_INTERVAL);

    } catch (err) {
        console.error("Anti-tamper error:", err);
    }
}

module.exports = { antiTamperCheck };
