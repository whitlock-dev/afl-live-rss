const fs = require("fs");

const API_URL = "https://api.squiggle.com.au/?q=games;year=2026";

function safe(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function main() {
  const response = await fetch(API_URL, {
    headers: { "User-Agent": "Whitlock AFL RSS Feed" }
  });

  const data = await response.json();
  const games = data.games || [];

  const items = games.map(game => {
    const home = game.hteam || "Home";
    const away = game.ateam || "Away";
    const hscore = game.hscore ?? "-";
    const ascore = game.ascore ?? "-";
    const status = game.status || "Scheduled";
    const round = game.round || "";
    const date = game.date || "";

    const title = `${home} ${hscore} vs ${away} ${ascore}`;
    const description = `Status: ${status} | Round: ${round} | Date: ${date}`;

    return `
    <item>
      <title>${safe(title)}</title>
      <description>${safe(description)}</description>
      <link>https://www.afl.com.au/</link>
      <guid>${safe(game.id || title)}</guid>
    </item>`;
  }).join("");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>AFL Live Scores</title>
<link>https://www.afl.com.au/</link>
<description>Live AFL scores from Squiggle API</description>
${items}
</channel>
</rss>`;

  fs.writeFileSync("rss.xml", rss);
}

main();
