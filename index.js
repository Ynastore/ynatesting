require("dotenv").config();
const { makeWASocket, useMultiFileAuthState } = require("@adiwajshing/baileys");
const { setupLicenseGuards } = require("./licenseGuard");

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const conn = makeWASocket({
    auth: state,
    printQRInTerminal: true
  });

  conn.ev.on("creds.update", saveCreds);

  // Pasang license guard
  setupLicenseGuards(conn);

  return conn;
}

start();
