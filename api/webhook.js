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

const MANAGER_ID = process.env.MANAGER_ID;

const productMap = {
    product_1: 'Мобильное приложение',
    product_2: 'Сайт',
    product_3: 'Симулятор'
}

const topicMap = {
    topic_1: 'Не работает сайт или приложение',
    topic_2: 'Возникла проблема или ошибка в приложении',
    topic_3: 'Нужен совет/консультация',
    topic_4: 'Нужна оценка/расчет',
    topic_5: 'Хочу оставить жалобу'
}

const productButtons = [
    {
        text: "Мобильное приложение",
        callback_data: "product_1",
    },
    {
        text: "Сайт",
        callback_data: "product_2",
    },
    {
        text: "Симулятор",
        callback_data: "product_3",
    }
]
const topicButtons = [
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
        inline_keyboard: getChunks(topicButtons, BUTTONS_IN_LINE)
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

        await bot.telegram.sendMessage(MANAGER_ID, managerMessage, {
            reply_markup: startKeyboard,
        });

        await bot.telegram.forwardMessage(MANAGER_ID, ctx.message.chat.id, messageId);
        await ctx.reply('Мы обязательно вам поможем в максимально короткие сроки.', startKeyboard);
        return ctx.scene.leave();
    }
);
websiteTroubleScene.enter(async (ctx) => {
    await ctx.reply("Пожалуйста укажите ссылку на продукт ", exitKeyboard)
});

const mainScene = new WizardScene(
    "main",
    async (ctx) => {
        ctx.session.companyName = ctx.message.text;
        ctx.reply('Укажите по какому продукту вам нужна консультация', {
            reply_markup: {
                inline_keyboard: getChunks(productButtons, 1),
            }
        });
        ctx.scene.leave();
    }
);
mainScene.enter(async (ctx) => {
    await ctx.reply('Пожалуйста напишите от имени какой компании вы обращаетесь', exitKeyboard);
});

const topic2Scene = new WizardScene(
    "topic2",
    async (ctx) => {
        return ctx.scene.leave();
    }
);
topic2Scene.enter(async (ctx) =>{
    await ctx.reply("topic2", exitKeyboard)
});

const topic3Scene = new WizardScene(
    "topic3",
    async (ctx) => {
        return ctx.scene.leave();
    }
);
topic3Scene.enter(async (ctx) =>{
    await ctx.reply("topic3", exitKeyboard)
});

const topic4Scene = new WizardScene(
    "topic4",
    async (ctx) => {
        return ctx.scene.leave();
    }
);
topic4Scene.enter(async (ctx) =>{
    await ctx.reply("topic4", exitKeyboard)
});

const topic5Scene = new WizardScene(
    "topic5",
    async (ctx) => {
        const complaint = ctx.message.text;

        const {topic, companyName, product} = ctx.session;
        const managerMessage = `Тема: ${topicMap[topic]}\n\nКомпания: ${companyName}\n\nПлатформа: ${productMap[product]}\n\nЖалоба: ${complaint}`;

        await bot.telegram.sendMessage(MANAGER_ID, managerMessage, {
            reply_markup: startKeyboard,
        });

        await ctx.reply('Мы обязательно вам поможем в максимально короткие сроки.', startKeyboard);
        return ctx.scene.leave();
    }
);
topic5Scene.enter(async (ctx) =>{
    await ctx.reply("Давайте представим, что я ваш личный психолог. Расскажите пожалуйста суть вашей жалобы.", exitKeyboard)
});

const stage = new Stage([websiteTroubleScene, mainScene, topic2Scene, topic3Scene, topic4Scene, topic5Scene]);
stage.hears("/exit", (ctx) => {
    ctx.reply(`Начать заново?`, startKeyboard);
    ctx.scene.leave();
});

bot.use(session());
bot.use(stage.middleware());

bot.on("callback_query", async (ctx) => {
    const { data } = ctx.update.callback_query;

    if (data.includes('product')) {
        ctx.session.product = data;
        const { topic } = ctx.session;

        if (topic === 'topic_2') {
            ctx.scene.enter('topic2');
        }

        if (topic === 'topic_3') {
            ctx.scene.enter('topic3');
        }

        if (topic === 'topic_4') {
            ctx.scene.enter('topic4');
        }

        if (topic === 'topic_5') {
            ctx.scene.enter('topic5');
        }
    }

    if (data == "topic_1") {
        ctx.session.topic = data;
        ctx.scene.enter('websiteTrouble')
    }else if (data.includes('topic')) {
        ctx.session.topic = data;
        ctx.scene.enter('main');
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
