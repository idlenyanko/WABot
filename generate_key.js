// encrypt_master.js
require('dotenv').config({ path: './gembok.env' }); // Load MASTER_KEY dari gembok.env
const crypto = require("crypto");
const fs = require("fs");

// Ambil key dari env
const SECRET_KEY = process.env.MASTER_KEY;
if (!SECRET_KEY) {
    console.error("❌ MASTER_KEY tidak ditemukan di gembok.env!");
    process.exit(1);
}

// Algoritma enkripsi
const ALGORITHM = "aes-256-cbc";
const KEY = crypto.createHash("sha256").update(SECRET_KEY).digest(); // AES-256 key

// Input dari terminal → node encrypt_master.js 6285xxxx 10 62812xxx 30
const args = process.argv.slice(2);

if (args.length === 0 || args.length % 2 !== 0) {
    console.log("Format: node generate_key.js <nomor> <hari> <nomor2> <hari2> ...");
    process.exit();
}

let licenseData = {
    allowed: [],      // nomor yang boleh dipakai
    meta: {}          // detail expire dan salt
};

for (let i = 0; i < args.length; i += 2) {
    let number = args[i];
    let days = parseInt(args[i + 1]);

    let id = number.replace(/\D/g, "") + "@c.us"; // format WA ID
    let now = Date.now();
    let expire = now + days * 86400000; // konversi hari → ms

    // generate unique salt untuk tiap user
    let salt = crypto.randomBytes(16).toString("hex");

    licenseData.allowed.push(id);
    licenseData.meta[number] = {
        expire: expire,
        created: now,
        salt: salt
    };
}

// convert JSON ke string
let jsonString = JSON.stringify(licenseData);

// generate iv random
const iv = crypto.randomBytes(16);

// AES encrypt
const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
let encrypted = cipher.update(jsonString, "utf8", "base64");
encrypted += cipher.final("base64");

// simpan sebagai file terenkripsi
let output = {
    iv: iv.toString("base64"),
    data: encrypted
};

fs.writeFileSync("./masterkey.enc", JSON.stringify(output, null, 4));

console.log("✔ masterkey.enc berhasil dibuat!");
