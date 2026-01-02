const axios = require("axios");

module.exports = {
  name: "weather",
  aliases: ["cuaca"],
  description: "Cek cuaca teks lengkap",

  async execute(msg, args) {
    if (!args.length) return msg.reply("☁️ Pakai: !weather <kota>");

    // Bersihin input: hanya huruf, spasi, dash, max 30 karakter
    const city = args.join(" ")
      .replace(/[^a-zA-Z\s-]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 30);

    if (!city) return msg.reply("❌ Nama kota tidak valid.");

    const url = `https://wttr.in/${encodeURIComponent(city)}?format=j1`;

    try {
      const res = await axios.get(url, { timeout: 10000 }); // timeout 10 detik
      const data = res.data;

      if (!data?.current_condition || !data.current_condition[0]) {
        return msg.reply("❌ Data cuaca tidak tersedia untuk kota ini.");
      }

      const current = data.current_condition[0];
      const desc = current.weatherDesc?.[0]?.value || "-";
      const tempC = current.temp_C || "-";
      const humidity = current.humidity || "-";
      const windKph = current.windspeedKmph || "-";

      const text = `🌦️ Cuaca di ${city}
Suhu: ${tempC}°C
Kelembaban: ${humidity}%
Angin: ${windKph} km/h
Kondisi: ${desc}

*Data By: _wttr.in_*`;

      await msg.reply(text);

    } catch (err) {
      console.error(err.code || err.message || err);
      msg.reply("❌ Gagal ambil data cuaca, coba lagi nanti.");
    }
  }
};
