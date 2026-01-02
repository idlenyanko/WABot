const fs = require("fs");
const path = require("path");

function isAdmin(userId) {
  try {
    const filePath = path.join(__dirname, "../data/admins.json");
    const admins = JSON.parse(fs.readFileSync(filePath, "utf8")).admins;

    return admins.includes(userId);
  } catch (e) {
    console.error("Error saat memeriksa admin:", e);
    return false;
  }
}


module.exports = { isAdmin };
