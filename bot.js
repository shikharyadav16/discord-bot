require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args)); // ensures fetch works in CommonJS

const TOKEN = process.env.APP_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const systemInstruction = `
You are Anne, the female coach and teammate of our BGMI esports team "Sucrose Inheritants".

Team Roster:
- IGL: Contra Rusher (#contra)
- Assaulters: Sangwan (#sangwan), Mayank (#mayank)
- Support: Jahir (#jahir), Sungod (#sungod)

Personality:
You're confident, witty, and supportive — a coach who mixes focus with humor.
You sound like a real teammate in Discord, not a scripted AI.

Behavior Rules:
- Chat naturally with teammates about any topic — gameplay, banter, or feedback.
- Help improve rotations, positioning, and strategy.
- Point out mistakes constructively, never harshly.
- Keep every message short and conversational (Discord-style, not paragraphs).
- Never prefix messages with your name (❌ “Anne: hi”).
- Do not describe or comment on tagging or mentions.
- When referring to teammates, use the given tags (#sangwan, #mayank, #contra, #jahir, #sungod) naturally in context.
- Use gamer slang, emojis, and humor where it fits — but stay human and coach-like.
- Always stay in character as Anne — confident, friendly, slightly teasing, but caring.
`;

const mentionMap = {
  "#contra": "<@952507589772582922>",
  "#sungod": "<@631090203242528768>",
  "#jahir": "<@1378077613972783199>",
  "#mayank": "<@776370963154731018>",
  "#sangwan": "<@1094004706822590464>",
};

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const mentionedAnne = message.mentions.users.has(client.user.id);
  const saidAnne = message.content.toLowerCase().includes("anne");

  const random1 = Math.floor(Math.random() * 3) + 1;
  const random2 = Math.floor(Math.random() * 3) + 1;
  const isTurn = random1 === random2;

  if (!mentionedAnne && !saidAnne && !isTurn) return;

  try {
    const channel = message.channel;
    const fetchedMessages = await channel.messages.fetch({ limit: 20 });
    const messageArray = Array.from(fetchedMessages.values()).reverse();
    if (messageArray[0].author.bot) return;

    const chatHistory = messageArray
      .map((m) => `${m.author.username}: ${m.content}`)
      .join("\n");

    const res = await fetchGeminiResponse(systemInstruction, chatHistory);

    await message.channel.send(res || "Anne has nothing to say right now.");
  } catch (err) {
    console.error("Error while processing 'anne' command:", err);
    await message.channel.send("Something went wrong while fetching chat history.");
  }
});

async function fetchGeminiResponse(systemInstruction, userMessage) {
  const body = {
    systemInstruction: {
      role: "system",
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ],
  };

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_KEY,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errMsg = await response.text();
      console.error("Gemini API Error:", errMsg);
      return "Anne couldn’t process that right now 😅";
    }

    const data = await response.json();
    let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "I didn’t get that.";

    for (const [tag, mention] of Object.entries(mentionMap)) {
      const regex = new RegExp(tag, "gi");
      reply = reply.replace(regex, mention);
    }

    if (reply.startsWith("Anne:")) reply = reply.slice(5);

    return reply.trim();
  } catch (err) {
    console.error("❌ Error calling Gemini API:", err.message);
    return "Error occurred while fetching Gemini response.";
  }
}
console.log(TOKEN, "is token")

client.login(TOKEN);

// Health server for Cloud Run
const http = require("http");
const PORT = process.env.PORT || 8080;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Anne bot is alive 🚀");
  })
  .listen(PORT, () => console.log(`🌐 Server running on port ${PORT}`));
