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

const projectMap = {
    project_1: 'Проект 1',
    project_2: 'Проект 2',
    project_3: 'Проект 3',
    project_4: 'Проект 4',
}

const topicMap = {
    topic_1: 'Тема 1',
    topic_2: 'Тема 2'
}

const projectButtons = [
    {
        text: "Выбор проекта 1",
        callback_data: "project_1",
    },
    {
        text: "Выбор проекта 2",
        callback_data: "project_2",
    },
    {
        text: "Выбор проекта 3",
        callback_data: "project_3",
    },
    {
        text: "Выбор проекта 4",
        callback_data: "project_4",
    }
]
const topics = [
    {
        text: "Тема 1",
        callback_data: "topic_1",
    },
    {
        text: "Тема 2",
        callback_data: "topic_2",
    }
]

bot.command("start", async (ctx) => {
    const currentHour = new Date().getHours();
    let welcomeMessage;

    if (currentHour > 6 && currentHour <= 12){
        welcomeMessage = 'Доброе утро. Я чатбот студии 42. Расскажите суть вашей проблемы, а мы покажем, как хорошо мы работаем.';
    } else if (currentHour > 12 && currentHour <= 18){
        welcomeMessage = 'Добрый день. Я чатбот студии 42. Расскажите суть вашей проблемы, а мы покажем, как хорошо мы работаем.';
    } else if (currentHour > 18 && currentHour <= 23) {
        welcomeMessage = 'Добрый вечер. Я чатбот студии 42. Расскажите суть вашей проблемы, а мы покажем, как хорошо мы работаем.';
    } else {
        welcomeMessage = 'Доброй ночи. ';
    }

    const markup = {
        inline_keyboard: getChunks(projectButtons, BUTTONS_IN_LINE)
    };

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
        const { name, surname } = ctx.scene.state;
        const { topic, project} = ctx.session;
        const managerMessage = `${projectMap[project]}\n ${topicMap[topic]}\n ${name} ${surname}`;

        bot.telegram.sendMessage(697255251, managerMessage, {
            reply_markup: startKeyboard,
        });

        return ctx.scene.leave();
    }
);

flow.enter((ctx) => {
    ctx.reply("Вопрос 1: ", exitKeyboard)
});

const stage = new Stage([flow]);
stage.hears("/exit", (ctx) => {
    ctx.reply(`Начать заново?`, startKeyboard);
    ctx.scene.leave();
});

bot.use(session());
bot.use(stage.middleware());

bot.on("callback_query", async (ctx) => {
    const { data } = ctx.update.callback_query;

    if (data.includes('project')) {
        ctx.session.project = data;
        ctx.reply("Выберете тему: ", {
            reply_markup: {
                inline_keyboard: getChunks(topics, BUTTONS_IN_LINE)
            }
        })
    }

    if (data.includes('topic')) {
        ctx.session.topic = data;
        ctx.scene.enter('flow');
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
