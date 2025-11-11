const { systemInstruction } = require('../config/gemini_system_instr'); 
const { resultChannelId } = require('../config/channels');
const { fetchGeminiResponse } = require('../services/gemini')
const { checkResultFormat, showResultStatus } = require('../utils/matchResultHelper');
const client = require('../services/discord');

async function handleMessageCreate(message) {
  if (message.author.bot) return;

  const resultChannel = await client.channels.fetch(resultChannelId);
  const channel = message.channel;

  if (message.channel.id === resultChannelId)
    return checkResultFormat(message.content, message);

  switch (message.content.trim()) {
    case "show-result":
        return showResultStatus(message);

    case "show-result erangle":
        return showResultStatus(message, "erangle");
    
    case "show-result miramar":
        return showResultStatus(message, "miramar");

    case "show-result rondo":
        return showResultStatus(message, "rondo");
  }

  const mentionedAnne = message.mentions.users.has(client.user.id);
  const saidAnne = message.content.toLowerCase().includes("anne");

  if (!mentionedAnne && !saidAnne) return;

  try {
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
    await message.channel.send(
      "Something went wrong while fetching chat history."
    );
  }
}


module.exports = { handleMessageCreate };