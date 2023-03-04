process.env.NTBA_FIX_319 = "test";

const axios = require("axios");
const {
	Telegraf,
	session,
	Scenes: { WizardScene, Stage },
	Markup,
} = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

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
				await ctx.reply(`- ${rumor}`);
			});
		} else {
			await ctx.reply(`There are no rumors about ${name} ${surname}.`);
		}

		await ctx.reply(`Start again?`, startKeyboard);

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

		await ctx.reply(`Rumor about ${name} ${surname} created!`);
		await ctx.reply(`Start again?`, startKeyboard);

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
	console.log("find_rumor");
	ctx.scene.enter("findRumorFlow");
});

bot.action("add_rumor", async (ctx) => {
	console.log("add_rumor");
	ctx.scene.enter("addRumorFlow");
});

module.exports = async (request, response) => {
	try {
		const { body } = request;

		if (body.message || body.callback_query) {
			await bot.handleUpdate(body);
		}
	} catch (error) {
		console.error("Error sending message");
		console.log(error.toString());
	}

	response.send("OK");
};
