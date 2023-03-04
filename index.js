require("dotenv").config();
const express = require("express");
const axios = require("axios");

const {
	Telegraf,
	session,
	Scenes: { WizardScene, Stage },
	Markup,
} = require("telegraf");

const app = express();
const bot = new Telegraf(process.env.BOT_TOKEN);

const port = process.env.PORT || 3000;
// const route = "/api/webhook";

const exitKeyboard = Markup.keyboard(["exit"]).oneTime();
const startKeyboard = Markup.keyboard(["/start"]).oneTime();
const removeKeyboard = Markup.removeKeyboard();

bot.command("start", async (ctx) => {
	const inlineKeyboard = {
		inline_keyboard: [
			[
				{
					text: "Find Rumor",
					callback_data: "find_rumor",
				},
				{
					text: "Add rumor",
					callback_data: "add_rumor",
				},
			],
		],
	};

	bot.telegram.sendMessage(ctx.chat.id, "Choose an option:", {
		reply_markup: inlineKeyboard,
	});
});

const findRumorFlow = new WizardScene(
	"findRumorFlow",
	async (ctx) => {
		ctx.scene.state.name = ctx.message.text;
		await ctx.reply("Enter persons surname:", exitKeyboard);

		return ctx.wizard.next();
	},
	async (ctx) => {
		ctx.scene.state.surname = ctx.message.text;
		await ctx.reply("Enter persons age:", exitKeyboard);

		return ctx.wizard.next();
	},
	async (ctx) => {
		ctx.scene.state.age = Number(ctx.message.text);
		await ctx.reply("Enter persons city:", exitKeyboard);

		return ctx.wizard.next();
	},
	async (ctx) => {
		ctx.scene.state.city = ctx.message.text;

		const { data } = await axios.post(
			`${process.env.API_URL}/action/find`,
			{
				dataSource: "Cluster0",
				database: "Spletnik",
				collection: "Rumor",
				filter: ctx.scene.state,
			},
			{
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Request-Headers": "*",
					"api-key": process.env.API_KEY,
				},
			}
		);

		const rumors = data.documents.map((user) => user.rumor);
		const { name, surname } = ctx.scene.state;

		if (rumors.length) {
			await ctx.reply(`Rumors about ${name} ${surname}:`, removeKeyboard);

			rumors.forEach(async (rumor) => {
				await ctx.reply(`-${rumor}`);
			});
		} else {
			await ctx.reply(`There are no rumors about ${name} ${surname}.`);
		}

		ctx.reply(`Start again?`, startKeyboard);

		return ctx.scene.leave();
	}
);
findRumorFlow.enter((ctx) => ctx.reply("Enter persons name:", exitKeyboard));

const addRumorFlow = new WizardScene(
	"addRumorFlow",
	async (ctx) => {
		ctx.scene.state.name = ctx.message.text;
		await ctx.reply("Enter persons surname:", exitKeyboard);

		return ctx.wizard.next();
	},
	async (ctx) => {
		ctx.scene.state.surname = ctx.message.text;
		await ctx.reply("Enter persons age:", exitKeyboard);

		return ctx.wizard.next();
	},
	async (ctx) => {
		ctx.scene.state.age = Number(ctx.message.text);
		await ctx.reply("Enter persons city:", exitKeyboard);

		return ctx.wizard.next();
	},
	async (ctx) => {
		ctx.scene.state.city = ctx.message.text;
		await ctx.reply("Enter rumor about person:", exitKeyboard);

		return ctx.wizard.next();
	},
	async (ctx) => {
		ctx.scene.state.rumor = ctx.message.text;

		await axios.post(
			`${process.env.API_URL}/action/insertOne`,
			{
				dataSource: "Cluster0",
				database: "Spletnik",
				collection: "Rumor",
				document: ctx.scene.state,
			},
			{
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Request-Headers": "*",
					"api-key": process.env.API_KEY,
				},
			}
		);

		const { name, surname } = ctx.scene.state;

		ctx.reply(`Rumor about ${name} ${surname} created!`);
		ctx.reply(`Start again?`, startKeyboard);

		return ctx.scene.leave();
	}
);
addRumorFlow.enter((ctx) => ctx.reply("Enter persons name:", exitKeyboard));

const stage = new Stage([findRumorFlow, addRumorFlow]);
stage.hears("exit", (ctx) => {
	ctx.reply(`Start again?`, startKeyboard);
	ctx.scene.leave();
});

bot.use(session());
bot.use(stage.middleware());

bot.action("find_rumor", async (ctx) => {
	ctx.scene.enter("findRumorFlow");
});

bot.action("add_rumor", async (ctx) => {
	ctx.scene.enter("addRumorFlow");
});

app.get("/", (req, res) => {
	res.send("Ok");
});

app.get("/secret-path", (req, res) => {
	bot.handleUpdate(req.body, res);
	res.send("Ok");
});

app.use(express.static("public"));
app.use(express.json());

// bot.telegram.setWebhook(`${process.env.WEBHOOK_URL}${route}`);
// app.use(bot.webhookCallback(route));

bot.launch();

app.listen(port, () => console.log(`Listening on ${port}`));

module.exports = app;
