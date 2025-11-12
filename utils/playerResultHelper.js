const { playersChannelId } = require("../config/channels");
const client = require("../services/discord");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
async function showPlayerStatus(message, name) {
  try {
    const playersChannel = await client.channels.fetch(playersChannelId);
    const fetchedMessages = await playersChannel.messages.fetch();

    let results = [];

    for (const msg of fetchedMessages.values()) {
      const lines = msg.content
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.includes(":"));

      const obj = {};
      for (const line of lines) {
        const [key, ...rest] = line.split(":");
        if (!key || rest.length === 0) continue;
        obj[key.trim()] = rest.join(":").trim();
      }

      // only push valid structured objects
      if (obj.Player && obj.Kills && obj.Map && obj.Type) {
        results.push(obj);
      }
    }

    // filter by player name
    if (name)
      results = results.filter(
        (match) => match.Player.toLowerCase() === name.toLowerCase()
      );

    if (results.length === 0)
      return message.channel.send(`No valid match data found for **${name}**.`);

    // summarize data
    const summary = Object.values(
      results.reduce((acc, match) => {
        const type = match.Type.trim();
        const kills = Number(match.Kills) || 0;

        if (!acc[type]) {
          acc[type] = {
            Player: name,
            Type: type,
            Maps: new Set(),
            TotalKills: 0,
            Matches: 0
          };
        }

        acc[type].Maps.add(match.Map.trim());
        acc[type].TotalKills += kills;
        acc[type].Matches++;

        return acc;
      }, {})
    ).map(entry => ({
      Player: name,
      Type: entry.Type,
      Maps: Array.from(entry.Maps),
      TotalKills: entry.TotalKills,
      Matches: entry.Matches
    }));

    // format for Discord
    const formattedText = formatSummaryForDiscord(summary);
    await message.channel.send(formattedText);

  } catch (err) {
    console.error(err);
    message.channel.send("Format is invalid or data not readable.");
  }
}

function formatSummaryForDiscord(summaryArray) {
  if (!Array.isArray(summaryArray) || summaryArray.length === 0)
    return "No summary data available.";

  let result = "__**Match Summary**__\n\n";

  for (const entry of summaryArray) {
    const avgKills = (entry.TotalKills / entry.Matches).toFixed(2);
    result += `> **Player:** ${entry.Player}\n`;
    result += `> **Type:** ${entry.Type}\n`;
    result += `> **Maps:** ${entry.Maps.join(", ")}\n`;
    result += `> **Matches played:** ${entry.Matches}\n`;
    result += `> **Average Kills:** ${avgKills}\n`;
    result += `> **Total Kills:** ${entry.TotalKills}\n`;
  }

  return result;
}


module.exports = { showPlayerStatus };
