const fs = require("fs");
const path = require("path");

function isAdmin(userId) {
    try {
        const filePath = path.join(__dirname, "../data/admins.json");
        const adminsData = fs.readFileSync(filePath, "utf8");
        const admins = JSON.parse(adminsData).admins;

        return admins.includes(userId);
    } catch (error) {
        console.error("Error saat memeriksa admin:", error);
        return false;
    }
}

module.exports = { isAdmin };
