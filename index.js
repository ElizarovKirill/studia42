const express = require("express");
const app = express();

const path = require("path");
const port = process.env.PORT || 3000;
const webhookPath = process.env.WEBHOOK_PATH;

app.use(express.static("static"));
app.use(express.json());

require("dotenv").config();

const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
	bot.telegram.sendMessage(ctx.chat.id, "Hello there!");
});

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname + "/index.html"));
});

bot.launch();

// expressApp.use(bot.webhookCallback(webhookPath));
// bot.telegram.setWebhook();

app.listen(port, () => console.log(`Listening on ${port}`));

module.exports = app;
