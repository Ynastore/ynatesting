require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "YNA-API-KEY-SECRET";
const DB_PATH = path.join(__dirname, "data.json");

if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({ allowed: [] }, null, 2));
}

const loadDB = () => JSON.parse(fs.readFileSync(DB_PATH));
const saveDB = (db) => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
const toJid = (number) => {
  if (!number) return null;
  return number.includes("@") ? number : number.replace(/\D/g, "") + "@s.whatsapp.net";
};

const auth = (req, res, next) => {
  const key = req.headers["authorization"];
  if (key !== `Bearer ${API_KEY}`) return res.status(401).json({ ok: false, msg: "unauthorized" });
  next();
};

app.get("/", (_, res) => res.json({ ok: true, service: "ynastore-license", time: new Date().toISOString() }));
app.get("/allowed", (_, res) => res.json({ ok: true, allowed: loadDB().allowed }));

app.post("/allow", auth, (req, res) => {
  const jid = toJid(req.body.number);
  if (!jid) return res.status(400).json({ ok: false, msg: "number required" });
  const db = loadDB();
  if (!db.allowed.includes(jid)) { db.allowed.push(jid); saveDB(db); }
  res.json({ ok: true, added: jid, count: db.allowed.length });
});

app.post("/revoke", auth, (req, res) => {
  const jid = toJid(req.body.number);
  if (!jid) return res.status(400).json({ ok: false, msg: "number required" });
  const db = loadDB();
  db.allowed = db.allowed.filter(n => n !== jid);
  saveDB(db);
  res.json({ ok: true, removed: jid });
});

app.listen(PORT, () => console.log(`[LICENSE] server running on :${PORT}`));
