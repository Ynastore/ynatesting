const axios = require("axios");

const LICENSE_ALLOWED_URL = process.env.LICENSE_ALLOWED_URL || "http://localhost:3000/allowed";
const REFRESH_MS = Number(process.env.LICENSE_REFRESH_MS || 60 * 1000); // 1 minute

async function fetchAllowed() {
  const { data } = await axios.get(LICENSE_ALLOWED_URL, { timeout: 5000 });
  if (!data || !data.ok) throw new Error("invalid license server response");
  return data.allowed || [];
}

async function checkOnce(conn, cache) {
  const jid = conn?.user?.id;
  if (!jid) throw new Error("cannot read bot jid");
  const allowed = cache?.length ? cache : await fetchAllowed();
  if (!allowed.includes(jid)) {
    console.log(`[LICENSE] ❌ ${jid} not licensed`);
    process.exit(1);
  }
  console.log(`[LICENSE] ✅ ${jid} licensed`);
}

function setupLicenseGuards(conn) {
  let cache = [];
  conn.ev.on("connection.update", async (update) => {
    if (update.connection === "open") {
      try {
        cache = await fetchAllowed();
        await checkOnce(conn, cache);

        setInterval(async () => {
          try {
            cache = await fetchAllowed();
            if (!cache.includes(conn.user?.id)) {
              console.log("[LICENSE] ⛔ license revoked, exiting...");
              process.exit(1);
            }
          } catch (e) {
            console.log("[LICENSE] warn:", e.message);
          }
        }, REFRESH_MS);
      } catch (e) {
        console.error("[LICENSE] fatal:", e.message);
        process.exit(1);
      }
    }
  });
}

module.exports = { setupLicenseGuards };
