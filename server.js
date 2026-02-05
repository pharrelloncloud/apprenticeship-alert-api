import express from "express";
import fs from "fs";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = "./roles.json";

app.get("/", (req, res) => {
  res.send("Apprenticeship Alert API is running ✅");
});


// 🔐 Discord webhook stored as ENV variable
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

/* =========================
   PUBLISH (Admin)
========================= */
app.post("/publish", async (req, res) => {
  try {
    const data = req.body;

    // Save to JSON
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    // Send to Discord
    await fetch(DISCORD_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.discordPayload)
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Publish failed" });
  }
});

/* =========================
   FETCH (Public Dashboard)
========================= */
app.get("/roles", (req, res) => {
  if (!fs.existsSync(DATA_FILE)) {
    return res.json({ roles: [] });
  }

  const file = fs.readFileSync(DATA_FILE);
  res.json(JSON.parse(file));
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
