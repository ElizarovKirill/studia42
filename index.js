const express = require("express");
const expressApp = express();

const path = require("path");
const port = process.env.PORT || 3000;
const webhookPath = process.env.WEBHOOK_PATH;

expressApp.use(express.static("static"));
expressApp.use(express.json());

require("dotenv").config();

const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
	bot.telegram.sendMessage(ctx.chat.id, "Hello there!");
});

expressApp.get("/", (req, res) => {
	res.sendFile(path.join(__dirname + "/index.html"));
});

bot.launch();

// expressApp.use(bot.webhookCallback(webhookPath));
// bot.telegram.setWebhook();

expressApp.listen(port, () => console.log(`Listening on ${port}`));
