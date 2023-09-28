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

const BUTTONS_IN_LINE = 1;

const troubleProductMap = {
    troubleProduct_1: 'Мобильное приложение',
    troubleProduct_2: 'Сайт',
    troubleProduct_3: 'Симулятор'
}

const topicMap = {
    topic_1: 'Не работает сайт или приложение',
    topic_2: 'Возникла проблема или ошибка в приложении',
    topic_3: 'Нужен совет/консультация',
    topic_4: 'Нужна оценка/расчет',
    topic_5: 'Хочу оставить жалобу'
}

const troubleProduct = [
    {
        text: "Мобильное приложение",
        callback_data: "troubleProduct_1",
    },
    {
        text: "Сайт",
        callback_data: "troubleProduct_2",
    },
    {
        text: "Симулятор",
        callback_data: "troubleProduct_3",
    }
]
const topics = [
    {
        text: "Не работает сайт или приложение",
        callback_data: "topic_1",
    },
    {
        text: "Возникла проблема или ошибка в приложении",
        callback_data: "topic_2",
    },
    {
        text: "Нужен совет/консультация",
        callback_data: "topic_3",
    },
    {
        text: "Нужна оценка/расчет",
        callback_data: "topic_4",
    },
    {
        text: "Хочу оставить жалобу",
        callback_data: "topic_5",
    }
]

bot.command("start", async (ctx) => {
    const currentHour = new Date().getHours();
    let welcomeMessage;

    if (currentHour > 6 && currentHour <= 12){
        welcomeMessage = 'Доброе утро. Я чатбот студии 42. Расскажите суть вашей проблемы, а мы покажем, как хорошо мы работаем. Укажите с каким продуктом у вас возникла проблема:';
    } else if (currentHour > 12 && currentHour <= 18){
        welcomeMessage = 'Добрый день. Я чатбот студии 42. Расскажите суть вашей проблемы, а мы покажем, как хорошо мы работаем. Укажите с каким продуктом у вас возникла проблема:';
    } else if (currentHour > 18 && currentHour <= 23) {
        welcomeMessage = 'Добрый вечер. Я чатбот студии 42. Расскажите суть вашей проблемы, а мы покажем, как хорошо мы работаем. Укажите с каким продуктом у вас возникла проблема:';
    } else {
        welcomeMessage = 'Доброй ночи. Я чатбот студии 42. Расскажите суть вашей проблемы, а мы покажем, как хорошо мы работаем. Укажите с каким продуктом у вас возникла проблема:';
    }

    const markup = {
        inline_keyboard: getChunks(topics, BUTTONS_IN_LINE)
    };

    bot.telegram.sendMessage(ctx.chat.id, welcomeMessage, {
        reply_markup: markup,
    });
});

const websiteTroubleScene = new WizardScene(
    "websiteTrouble",
    async (ctx) => {
        ctx.scene.state.url = ctx.message.text.toLowerCase();
        await ctx.reply("Отправьте скриншот или видео проблемы", exitKeyboard);
        return ctx.wizard.next();
    },
    async (ctx) => {
        const messageId = ctx.message.message_id;

        const { url } = ctx.scene.state;
        const { topic } = ctx.session;

        const managerMessage = `${topicMap[topic]}\n ${url}`;

        await bot.telegram.sendMessage(697255251, managerMessage, {
            reply_markup: startKeyboard,
        });

        await bot.telegram.forwardMessage(697255251, ctx.message.chat.id, messageId);
        await ctx.reply('Мы обязательно вам поможем в максимально короткие сроки.', startKeyboard);
        return ctx.scene.leave();
    }
);
websiteTroubleScene.enter((ctx) => {
    ctx.reply("Пожалуйста укажите ссылку на продукт ", exitKeyboard)
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
        const { topic, troubleProduct} = ctx.session;
        const managerMessage = `${troubleProductMap[troubleProduct]}\n ${topicMap[topic]}\n ${name} ${surname}`;

        bot.telegram.sendMessage(697255251, managerMessage, {
            reply_markup: startKeyboard,
        });

        return ctx.scene.leave();
    }
);

flow.enter((ctx) => {
    ctx.reply("Пожалуйста напишите от имени какой компании вы обращаетесь ", exitKeyboard)
});

const stage = new Stage([flow, websiteTroubleScene]);
stage.hears("/exit", (ctx) => {
    ctx.reply(`Начать заново?`, startKeyboard);
    ctx.scene.leave();
});

bot.use(session());
bot.use(stage.middleware());

bot.on("callback_query", async (ctx) => {
    const { data } = ctx.update.callback_query;

    if (data.includes('troubleProduct')) {
        ctx.session.troubleProduct = data;
        ctx.reply("Выберите причину вашего обращения: ", {
            reply_markup: {
                inline_keyboard: getChunks(topics, BUTTONS_IN_LINE)
            }
        })
    }

    if (data == "topic_1") {
        ctx.session.topic = data;
        ctx.scene.enter('websiteTrouble')
    }else if (data.includes('topic')) {
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
