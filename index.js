require("dotenv").config();
const { handleMessageCreate } = require("./controllers/messageCreate")
const TOKEN = process.env.APP_TOKEN;
const client = require('./services/discord.js')

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("messageCreate", handleMessageCreate);

client.login(TOKEN);

const http = require("http");
const PORT = process.env.PORT || 8080;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Bot is alive ");
  })
  .listen(PORT, () => console.log(`Server running on port ${PORT}`));
