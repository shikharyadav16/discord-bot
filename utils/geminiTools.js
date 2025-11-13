const { resultChannelId } = require("../config/channels");
const client = require("../services/discord");

async function fetchPreviousMatchesForGemini() {
    const resultChannel = await client.channels.fetch(resultChannelId);
    const fetchedMessages = await resultChannel.messages.fetch();
    return fetchedMessages;
}

module.exports = { fetchPreviousMatchesForGemini }