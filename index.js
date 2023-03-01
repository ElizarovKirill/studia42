require("dotenv").config();
const express = require("express");
const path = require("path");
const { Telegraf } = require("telegraf");

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

const port = process.env.PORT || 3000;
const route = "/secret-path";

bot.command("start", (ctx) => {
	const inlineKeyboard = {
		inline_keyboard: [
			[
				{
					text: "Button 1",
					callback_data: "button1",
				},
				{
					text: "Button 2",
					callback_data: "button2",
				},
			],
		],
	};

	bot.telegram.sendMessage(ctx.chat.id, "Choose an option:", {
		reply_markup: inlineKeyboard,
	});
});

bot.action("button1", (ctx) => {
	ctx.reply("You pressed button 1");
});

bot.action("button2", (ctx) => {
	ctx.reply("You pressed button 2");
});
bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}${route}`);

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname + "/index.html"));
});

app.use(bot.webhookCallback(route));
app.use(express.static("public"));
app.use(express.json());

// bot.launch();

app.listen(port, () => console.log(`Listening on ${port}`));

module.exports = app;
