const { resultChannelId } = require("../config/channels");
const client = require("../services/discord");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

async function checkResultFormat(content, message) {
  const validPattern =
    /^Timings:\s?.+\nDate:\s?.+\nSlot:\s?\d+\nPosition:\s?\d+\nKills:\s?\d+\nMap:\s?.+\nType:\s?.+$/m;
  const isValid = validPattern.test(content.trim());

  if (!isValid) return message.channel.send("Invalid Format");
}

async function showResultStatus(message, filter = false) {
  try {
    const resultChannel = await client.channels.fetch(resultChannelId);
    const fetchedMessages = await resultChannel.messages.fetch();

    let results = Array.from(fetchedMessages.values()).map((msg) => {
      const obj = Object.fromEntries(
        msg.content
          .split("\n")
          .map((line) => line.split(":").map((s) => s.trim()))
      );
      return obj;
    });

    if (filter)
      results = results.filter(
        (match) =>
          match.Map.toLowerCase() === filter.toLowerCase() ||
          match.Type.toLowerCase() === filter.toLowerCase()
      );

    const summary = Object.values(
      results.reduce((acc, match) => {
        const type = match.Type;
        const kills = Number(match.Kills);
        const pos = Number(match.Position);

        if (!acc[type]) {
          acc[type] = {
            Type: type,
            Maps: new Set(),
            TotalKills: 0,
            Top3: 0,
            Top1: 0,
          };
        }

        acc[type].Maps.add(match.Map);

        acc[type].TotalKills += kills;

        if (pos <= 3) acc[type].Top3++;
        if (pos === 1) acc[type].Top1++;

        return acc;
      }, {})
    ).map((entry) => ({
      Type: entry.Type,
      Maps: Array.from(entry.Maps),
      TotalKills: entry.TotalKills,
      Top3: entry.Top3,
      Top1: entry.Top1,
    }));

    const formattedText = formatSummaryForDiscord(summary, results.length);
    await message.channel.send(formattedText);
  } catch (err) {
    message.channel.send("Format is invalid");
  }
}

function formatSummaryForDiscord(summaryArray, len) {
  if (!Array.isArray(summaryArray) || summaryArray.length === 0)
    return "No summary data available.";

  let result = "__**Match Summary**__\n\n";

  for (const entry of summaryArray) {
    result += "> **Type:**  " + entry.Type + "\n";
    result += "> **Maps:**  " + entry.Maps.join(", ") + "\n";
    result += "> **Total Matches:**  " + len + "\n";
    result += "> **Total Kills:**  " + entry.TotalKills + "\n";
    result += "> **Top 3 Finishes:**  " + entry.Top3 + "\n";
    result += "> **Top 1 Finishes:**  " + entry.Top1 + "\n";
  }

  return result;
}

module.exports = {
  checkResultFormat,
  showResultStatus,
  formatSummaryForDiscord,
};
