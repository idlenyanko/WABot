const fs = require("fs");
const path = require("path");

function loadListeners(client, dir = path.join(__dirname, "../listeners")) { // Sesuaikan path relatif ke listeners
  console.log(`Membaca folder listeners di: ${dir}`);  // Debug log untuk path yang dibaca

  if (!fs.existsSync(dir)) {
    console.error(`❌ Folder ${dir} tidak ditemukan.`);
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      loadListeners(client, fullPath); // Rekursif untuk sub-folder
    } else if (file.endsWith(".js")) {
      try {
        const listener = require(fullPath);
        if (typeof listener === "function") listener(client); // Menjalankan listener
        console.log(`✔ Listener loaded: ${fullPath}`);
      } catch (err) {
        console.error(`❌ Gagal load listener ${fullPath}:`, err);
      }
    }
  }
}

module.exports = { loadListeners };
