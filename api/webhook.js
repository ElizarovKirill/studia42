process.env.NTBA_FIX_319 = "test";
import dotenv from "dotenv";
import telegraf from "telegraf";
import {
	getChunks
} from "../utils/helpers.js";

dotenv.config();

const {
	Telegraf,
	session,
	Scenes: { WizardScene, Stage },
	Markup,
} = telegraf;

export const bot = new Telegraf(process.env.BOT_TOKEN);

const exitKeyboard = Markup.keyboard(["/exit"]).oneTime().resize();
const startKeyboard = Markup.keyboard(["/start"]).oneTime().resize();

const BUTTONS_IN_LINE = 2;

const projectButtons = [
    {
        text: "Выбор проекта 1",
        callback_data: "flow",
    },
    {
        text: "Выбор проекта 2",
        callback_data: "flow",
    },
    {
        text: "Выбор проекта 3",
        callback_data: "flow",
    },
    {
        text: "Выбор проекта 4",
        callback_data: "flow",
    }
]

bot.command("start", async (ctx) => {
    const markup = {
		inline_keyboard: getChunks(projectButtons, BUTTONS_IN_LINE)
	};

	const welcomeMessage = `Начало диалога`;

    bot.telegram.sendMessage(ctx.chat.id, welcomeMessage, {
		reply_markup: markup,
	});
});

const flow = new WizardScene(
	"flow",
	async (ctx) => {
		ctx.scene.state.name = ctx.message.text.toLowerCase();
		await ctx.reply("Вопрос 2: ", exitKeyboard);

		return ctx.wizard.next();
	},
	async (ctx) => {
		ctx.scene.state.surname = ctx.message.text.toLowerCase();
        const {name, surname} = ctx.scene.state;

        const managerMessage = name + " " + surname;

        bot.telegram.sendMessage(697255251, managerMessage, {
            reply_markup: startKeyboard,
        });

		return ctx.scene.leave();
	},
);

flow.enter((ctx) =>
	ctx.reply("Вопрос 1: ", exitKeyboard)
);

const stage = new Stage([flow]);
stage.hears("/exit", (ctx) => {
	ctx.reply(`Начать заново?`, startKeyboard);
	ctx.scene.leave();
});

bot.use(session());
bot.use(stage.middleware());

bot.on("callback_query", async (ctx) => {
	const { data } = ctx.update.callback_query;

	if (data === "flow") {
		ctx.scene.enter("flow");
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
