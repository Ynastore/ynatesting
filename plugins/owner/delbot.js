const axios = require("axios");
require("dotenv").config();

const OWNER = process.env.OWNER_NUMBER || "6283138675899@s.whatsapp.net";
const API_URL = process.env.LIC_URL_REVOKE || "http://localhost:3000/revoke";
const API_KEY = process.env.LIC_API_KEY || "YNA-API-KEY-SECRET";

let handler = async (m, { text }) => {
  if (m.sender !== OWNER) return m.reply("❌ Hanya Owner.");
  if (!text) return m.reply("Format: .delbot 628xxxx");

  const number = text.replace(/\D/g, "") + "@s.whatsapp.net";

  try {
    const { data } = await axios.post(API_URL, { number }, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      timeout: 5000
    });
    if (data.ok) return m.reply(`🗑️ Dihapus: ${data.removed}`);
    m.reply("Gagal menghapus nomor.");
  } catch (e) {
    m.reply("Error API: " + e.message);
  }
};
handler.command = /^delbot$/i;
module.exports = handler;
