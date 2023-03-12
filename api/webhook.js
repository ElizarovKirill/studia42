process.env.NTBA_FIX_319 = "test";
import dotenv from "dotenv";

import axios from "axios";
import telegraf from "telegraf";
dotenv.config();
const {
	Telegraf,
	session,
	Scenes: { WizardScene, Stage },
	Markup,
} = telegraf;

export const bot = new Telegraf(process.env.BOT_TOKEN);

const exitKeyboard = Markup.keyboard(["exit"]).oneTime();
const startKeyboard = Markup.keyboard(["/start"]).oneTime();
const removeKeyboard = Markup.removeKeyboard();

const RUMORS_IN_MESSAGE = 3;
const RUMOR_BUTTONS_IN_LINE = 3;

const getChunks = (array, n) =>
	array.reduce(
		(memo, value, index) => {
			if (index % n === 0 && index !== 0) memo.push([]);

			memo[memo.length - 1].push(value);
			return memo;
		},
		[[]]
	);

const getRumorsKeyboard = (rumors, currentIndex) => {
	if (rumors.length <= 1) {
		return {};
	}

	const buttons = rumors.map((rumor, index) => {
		if (index === currentIndex) {
			return {
				text: `-${index + 1}-`,
				callback_data: `rumor_button_${index}`,
			};
		}

		return {
			text: index + 1,
			callback_data: `rumor_button_${index}`,
		};
	});

	return {
		inline_keyboard: getChunks(buttons, RUMOR_BUTTONS_IN_LINE),
	};
};

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
				dataSource: process.env.DATA_SOURCE,
				database: process.env.DATABASE,
				collection: process.env.COLLECTION,
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

		const rumorsText = data.documents.map((user) => user.rumor);
		const { name, surname } = ctx.scene.state;

		if (rumorsText.length) {
			const rumors = getChunks(rumorsText, RUMORS_IN_MESSAGE).map((chunk) =>
				chunk
					.map((rumor) => `Многие говорят: ${name} ${surname} ${rumor}`)
					.join("\n\n")
			);

			await ctx
				.reply(rumors[0], { reply_markup: getRumorsKeyboard(rumors, 0) })
				.then((message) => {
					ctx.session.rumors = rumors;
					ctx.session.messageId = message.message_id;
				});
		} else {
			await ctx.reply(
				`There are no rumors about ${name} ${surname}.`,
				startKeyboard
			);
		}

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
				dataSource: process.env.DATA_SOURCE,
				database: process.env.DATABASE,
				collection: process.env.COLLECTION,
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

		await ctx.reply(`Rumor about ${name} ${surname} created!`, startKeyboard);

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

bot.on("callback_query", (ctx) => {
	const { data } = ctx.update.callback_query;

	if (data === "find_rumor") {
		ctx.scene.enter("findRumorFlow");
	}

	if (data === "add_rumor") {
		ctx.scene.enter("addRumorFlow");
	}

	if (data.includes("rumor_button")) {
		const { rumors, messageId } = ctx.session;

		const splittedData = data.split("_");
		const currentIndex = Number(splittedData[splittedData.length - 1]);

		ctx.editMessageText(rumors[currentIndex], {
			message_id: messageId,
			reply_markup: getRumorsKeyboard(rumors, currentIndex),
		});
	}
});

bot.catch((err, ctx) => console.log(err));

export default async (request, response) => {
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
