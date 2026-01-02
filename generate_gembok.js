const fs = require("fs");
const crypto = require("crypto");

// panjang key AES-256 = 32 byte
const KEY_LENGTH = 32;

// generate random key
const secretKey = crypto.randomBytes(KEY_LENGTH).toString("hex");

// simpan ke file gembok.env
const envContent = `MASTER_KEY=${secretKey}\n`;

fs.writeFileSync("gembok.env", envContent);

console.log("✔ File gembok.env berhasil dibuat!");
console.log(`MASTER_KEY=${secretKey}`);
