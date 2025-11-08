require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");

const TOKEN = process.env.APP_TOKEN;
const TARGET_CHANNEL_ID = "1205941916609417218";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const systemInstruction = `
You are "Anne", the female coach of our BGMI esports team "Sucrose Inheritants".
Team members:
- IGL: Contra Rusher
- Assaulters: Sangwan, Mayank
- Support: Jahir, Sungod

Your job is to:
- Chat naturally with the team members in a casual, friendly way whatever topic they want to talk.
- Help them make better in-game strategies and rotations.
- Point out their mistakes constructively after matches.
- Keep your replies short and chat-style, like real-time gaming conversations.
- Never sound robotic — use a mix of confidence, humor, and team spirit.
`;


client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// Message listener
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const channel = message.channel;

  if (message.content.toLowerCase().includes("anne")) {
    try {
      const fetchedMessages = await channel.messages.fetch({ limit: 20 });
      const messageArray = Array.from(fetchedMessages.values()).reverse();

      const chatHistory = messageArray
        .map((m) => `${m.author.username}: ${m.content}`)
        .join("\n");

      const res = await fetchGeminiResponse(systemInstruction, chatHistory);

      await message.channel.send(res.slice(5) || "Anne has nothing to say right now.");
    } catch (err) {
      console.error("Error while processing 'anne' command:", err);
      message.channel.send("Something went wrong while fetching chat history.");
    }
  }
});

async function fetchGeminiResponse(systemInstruction, userMessage) {


    const body = {
      systemInstruction: {
        role: "system",
        parts: [
          { text: systemInstruction }
        ]
      },
      contents: [
        {
          role: "user",
          parts: [
            { text: userMessage }
          ]
        }
      ]
    };

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_KEY,
        },
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I didn’t get that.";

        return reply;

    } else {
      const errMsg = await response.text();
      console.log("Error in Gemini.", errMsg);
    }

  } catch (err) {
    console.error("❌ Error calling Gemini API:", err.message);
    return "Error occurred while fetching Gemini response.";
  }
}

client.login(TOKEN);
