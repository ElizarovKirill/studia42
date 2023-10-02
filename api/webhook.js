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
const MANAGER_CHAT_ID = process.env.MANAGER_CHAT_ID;
const MANAGER_ANNA_ID = process.env.MANAGER_ANNA_ID;
const MANAGER_ALEXANDRA_ID = process.env.MANAGER_ALEXANDRA_ID;

const productMap = {
    product_1: 'Мобильное приложение',
    product_2: 'Сайт',
    product_3: 'Симулятор'
}

const managerMap = {
    ptm: 12454,
}

const topicMap = {
    topic_1: 'Не работает сайт или приложение',
    topic_2: 'Возникла проблема или ошибка в приложении',
    topic_3: 'Нужен совет/консультация',
    topic_4: 'Нужна оценка/расчет',
    topic_5: 'Хочу оставить жалобу'
}

const deadlinesMap = {
    deadline_1: '1-2 дня.',
    deadline_2: 'В течение недели.',
    deadline_3: 'В течение двух недель.',
    deadline_4: 'В течение месяца.',
    deadline_5: 'От 3-4 месяцев.',
    deadline_6: 'До 6 месяцев.'
}

const browsersMap = {
    browser_yandex: 'Yandex',
    browser_safari: 'Safari',
    browser_chrome: 'Chrome',
    browser_opera: 'Opera',
    browser_yandex: 'Firefox',
    browser_edge: 'MS Edge'
}

const devicesMap = {
    device_telephone: 'Телефон',
    device_computer: 'ПК'
}

const appMap = {
    app_hxp: 'HXP',
    app_quantum: 'Квант',
    app_gpn: 'ГПН',
    app_est: 'EstRC'
}

const simulatorMap = {
    simulator_ptm: 'ПТМ',
    simulator_opp: 'ОПП',
    simulator_belaz: 'Белаз',
    simulator_strop: 'Стропальщик'
}

const errorsMap = {
    error_502: '502',
    error_404: '404',
    error_500: '500',
    error_conection: 'Подключение к сайту не защищено',
    error_access: 'Не удается получить доступ к сайту'
}

const issueLocationMap = {
    issue_location_private: 'В личном кабинете в приложении',
    issue_location_mobile: 'В самом приложении'
}

const issueLocationButtons = [
    {
        text: 'В личном кабинете в приложении',
        callback_data: 'issue_location_private',
    },
    {
        text: 'В самом приложении',
        callback_data: 'issue_location_mobile',
    }
]

const errorButtons = [
    {
        text: '502',
        callback_data: 'error_502',
    },
    {
        text: '404',
        callback_data: 'error_404',
    },
    {
        text: '500',
        callback_data: 'error_500',
    },
    {
        text: 'Подключение к сайту не защищено',
        callback_data: 'error_conection',
    },
    {
        text: 'Не удается получить доступ к сайту',
        callback_data: 'error_access',
    }
]

const simulatorButtons = [
    {
        text: 'ПТМ',
        callback_data: 'simulator_ptm',
    },
    {
        text: 'ОПП',
        callback_data: 'simulator_opp',
    },
    {
        text: 'Белаз',
        callback_data: 'simulator_belaz',
    },
    {
        text: 'Стропальщик',
        callback_data: 'simulator_strop',
    }
]

const appButtons = [
    {
        text: 'HXP',
        callback_data: 'app_hxp',
    },
    {
        text: 'Квант',
        callback_data: 'app_quantum',
    },
    {
        text: 'ГПН-ЭС',
        callback_data: 'app_gpn',
    },
    {
        text: 'EstRC',
        callback_data: 'app_est',
    }
]

const deviceButtons = [
    {
        text: 'Телефон',
        callback_data: 'device_telephone',
    },
    {
        text: 'ПК',
        callback_data: 'device_computer',
    }
]

const browserButtons = [
    {
        text: 'Yandex',
        callback_data: 'browser_yandex',
    },
    {
        text: 'Safari',
        callback_data: 'browser_safari',
    },
    {
        text: 'Chrome',
        callback_data: 'browser_chrome',
    },
    {
        text: 'Opera',
        callback_data: 'browser_opera',
    },
    {
        text: 'Firefox',
        callback_data: 'browser_firefox',
    },
    {
        text: 'MS Edge',
        callback_data: 'browser_edge',
    }
]

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
const deadlineButtons = [
    {
        text: '1-2 дня',
        callback_data: 'deadline_1'
    },
    {
        text: 'В течение недели',
        callback_data: 'deadline_2'
    },
    {
        text: 'В течение двух недель',
        callback_data: 'deadline_3'
    },
    {
        text: 'В течение месяца',
        callback_data: 'deadline_4'
    },
    {
        text: 'От 3-4 месяцев',
        callback_data: 'deadline_5'
    },
    {
        text: 'До 6 месяцев',
        callback_data: 'deadline_6'
    }
]

bot.command("start", async (ctx) => {
    // 5 my timezone offset, can't find the way to get users timezone.
    const currentHour = new Date().getHours() + 5;
    let timeOfDay;

    const welcomeMessage = ' Я чатбот студии 42. Расскажите суть вашей проблемы, а мы покажем, как хорошо мы работаем. Укажите с каким продуктом у вас возникла проблема:';

    if (currentHour > 6 && currentHour <= 12){
        timeOfDay = 'Доброе утро.';
    } else if (currentHour > 12 && currentHour <= 18){
        timeOfDay = 'Добрый день.';
    } else if (currentHour > 18 && currentHour <= 23) {
        timeOfDay = 'Добрый вечер.';
    } else {
        timeOfDay = 'Доброй ночи.';
    }

    const markup = {
        inline_keyboard: getChunks(topicButtons, BUTTONS_IN_LINE)
    };

    bot.telegram.sendMessage(ctx.chat.id, timeOfDay + welcomeMessage, {
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

        let managerId;

        const { url } = ctx.scene.state;
        const { topic } = ctx.session;

        let managerMessage = `Тема: ${topicMap[topic]}\n\nСсылка: ${url}`;
        
        if (ctx.session.companyName) {
            managerMessage += `\n\nКомпания: ${ctx.session.companyName}`
        }

        if (ctx.session.device) {
            managerMessage += `\n\nУстройство: ${devicesMap[ctx.session.device]}`
        }

        if (ctx.session.browser) {
            managerMessage += `\n\nБраузер: ${browsersMap[ctx.session.browser]}`
        }

        if (ctx.session.error) {
            managerMessage += `\n\nОшибка: ${errorsMap[ctx.session.error]}`
        }

        if (ctx.session.root === 'topic2Site') {
            managerId = MANAGER_CHAT_ID;
        } else {
            managerId = MANAGER_ANNA_ID;
        }

        await bot.telegram.sendMessage(managerId, managerMessage, {
            reply_markup: startKeyboard,
        });

        await bot.telegram.forwardMessage(managerId, ctx.message.chat.id, messageId);
        await ctx.reply('Мы обязательно вам поможем в максимально короткие сроки.', startKeyboard);
        ctx.session = {};
        return ctx.scene.leave();
    }
);
websiteTroubleScene.enter(async (ctx) => {
    await ctx.reply("Пожалуйста укажите ссылку на продукт ", exitKeyboard)
});

const appSimulatorScene = new WizardScene(
    "appSimulator",
    async (ctx) => {
        const messageId = ctx.message?.message_id;

        let managerId;
        
        const { topic, companyName, root } = ctx.session;

        let managerMessage = `Тема: ${topicMap[topic]}\n\nКомпания: ${companyName}`;

        if (ctx.session.app) {
            managerMessage += `\n\nПриложение: ${appMap[ctx.session.app]}`
        }

        if (ctx.session.simulator) {
            managerMessage += `\n\nСимулятор: ${simulatorMap[ctx.session.simulator]}`
        }

        if (ctx.session.issue) {
            managerMessage += `\n\nМесто где ошибка: ${issueLocationMap[ctx.session.issue]}`
        }
        
        if (ctx.session.error) {
            managerMessage += `\n\nОшибка: ${errorsMap[ctx.session.error]}`
        }

        if (root === 'topic2Simulator') {
            managerId = MANAGER_ANNA_ID;
        } else {
            managerId = MANAGER_ALEXANDRA_ID;
        }

        await bot.telegram.sendMessage(managerId, managerMessage, {
            reply_markup: startKeyboard,
        });

        if (messageId) {
            await bot.telegram.forwardMessage(managerId, ctx.message.chat.id, messageId);
        }
        
        await ctx.reply('Мы обязательно вам поможем в максимально короткие сроки.', startKeyboard);
        ctx.session = {};
        ctx.scene.leave();
    }
);
appSimulatorScene.enter(async (ctx) => {
    if (!ctx.session.error) {
        await ctx.reply('Опишите вашу проблему (Укажите код ошибки, если есть). По возможности прикрепите скриншоты или видеозапись экрана.', exitKeyboard);
    }
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

const topic3Scene = new WizardScene(
    "topic3",
    async (ctx) => {
        const consultation = ctx.message.text;

        const {topic, companyName, product} = ctx.session;
        const managerMessage = `Тема: ${topicMap[topic]}\n\nКомпания: ${companyName}\n\nПлатформа: ${productMap[product]}\n\nЗапрос: ${consultation}\n\nПользователь: ${ctx.message.from.username}`;

        await bot.telegram.sendMessage(MANAGER_ANNA_ID, managerMessage, {
            reply_markup: startKeyboard,
        });

        await ctx.reply('Спасибо за обращение. Ваш запрос передан руководству, мы найдем подходящего эксперта по вашему вопросу. С вами свяжутся в течении 2-х рабочих часов. Рабочие дни пн-пт с 07:00 до 16:00 (МСК)', startKeyboard);
        ctx.session = {};
        return ctx.scene.leave();
    }
);
topic3Scene.enter(async (ctx) =>{
    await ctx.reply("Опишите подробно ваш вопрос по поводу которого вы бы хотели получить совет\\консультацию.", exitKeyboard)
});

const topic4Scene = new WizardScene(
    "topic4",
    async (ctx) => {
        ctx.session.task = ctx.message.text;

        await ctx.reply('Укажите желаемые для вас сроки выполнения:', {
            reply_markup: {
                inline_keyboard: getChunks(deadlineButtons, 1)
            }
        })
        return ctx.scene.leave();
    }
);
topic4Scene.enter(async (ctx) =>{
    await ctx.reply("Расскажите подробно о вашей задаче", exitKeyboard)
});

const topic5Scene = new WizardScene(
    "topic5",
    async (ctx) => {
        const complaint = ctx.message.text;

        const {topic, companyName, product} = ctx.session;
        const managerMessage = `Тема: ${topicMap[topic]}\n\nКомпания: ${companyName}\n\nПлатформа: ${productMap[product]}\n\nЖалоба: ${complaint}`;

        await bot.telegram.sendMessage(MANAGER_ANNA_ID, managerMessage, {
            reply_markup: startKeyboard,
        });

        await ctx.reply('Мы обязательно вам поможем в максимально короткие сроки.', startKeyboard);
        ctx.session = {};
        return ctx.scene.leave();
    }
);
topic5Scene.enter(async (ctx) =>{
    await ctx.reply("Давайте представим, что я ваш личный психолог. Расскажите пожалуйста суть вашей жалобы.", exitKeyboard)
});

const topic2SimulatorScene = new WizardScene(
    "topic2Simulator",
    async (ctx) => {
        return ctx.scene.leave();
    }
);
topic2SimulatorScene.enter(async (ctx) =>{
    await ctx.reply("topic2Simulator", exitKeyboard)
});

const topic2MobileScene = new WizardScene(
    "topic2Mobile",
    async (ctx) => {
        return ctx.scene.leave();
    }
);
topic2MobileScene.enter(async (ctx) =>{
    await ctx.reply("topic2Mobile", exitKeyboard)
});
const stage = new Stage([websiteTroubleScene, mainScene, topic2MobileScene, topic2SimulatorScene, topic3Scene, appSimulatorScene, topic4Scene, topic5Scene]);
stage.hears("/exit", async (ctx) => {
    await ctx.reply(`Начать заново?`, startKeyboard);
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
            if (data === 'product_1') {
                ctx.session.root = 'topic2Mobile';
                await ctx.reply('Укажите ваше приложение: ', {
                    reply_markup: {
                        inline_keyboard: getChunks(appButtons, 1)
                    }
                });
            }

            if (data === 'product_2') {
                ctx.session.root = 'topic2Site';
                await ctx.reply('Укажите ваш девайс: ', {
                    reply_markup: {
                        inline_keyboard: getChunks(deviceButtons, 1)
                    }
                });
            }

            if (data === 'product_3') {
                ctx.session.root = 'topic2Simulator';
                await ctx.reply('Укажите ваш симулятор: ', {
                    reply_markup: {
                        inline_keyboard: getChunks(simulatorButtons, 1)
                    }
                });
            }
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

    if (data.includes('device')) {
        ctx.session.device = data;
        await ctx.reply('Укажите ваш браузер: ', {
            reply_markup: {
                inline_keyboard: getChunks(browserButtons, 1)
            }
        })
    }

    if (data.includes('browser')) {
        ctx.session.browser = data;
        await ctx.reply('Укажиет код вашей ошибки: ', {
            reply_markup: {
                inline_keyboard: getChunks(errorButtons, 1)
            }
        })
    }

    if (data.includes('error')) {
        ctx.session.error = data;
        if (ctx.session.root === 'topic2Mobile') {
            ctx.scene.enter('appSimulator')
        } else {
            ctx.scene.enter('websiteTrouble')
        }
    }

    if (data.includes('app')) {
        ctx.session.app = data;
        await ctx.reply('Укажите где произошла ошибка', {
            reply_markup: {
                inline_keyboard: getChunks(issueLocationButtons, 1)
            }
        })
    }

    if (data.includes('issue')) {
        ctx.session.issue = data;
        
        if (data === 'issue_location_private') {
            await ctx.reply('Укажиет код вашей ошибки: ', {
                reply_markup: {
                    inline_keyboard: getChunks(errorButtons, 1)
                }
            })
        }

        if (data === 'issue_location_mobile') {
            ctx.scene.enter('appSimulator')
        }
    }

    if (data.includes('simulator')) {
        ctx.session.simulator = data;
        ctx.scene.enter('appSimulator')
    }

    if (data.includes('deadline')) {
        const {topic, companyName, product, task} = ctx.session;
        const managerMessage = `Тема: ${topicMap[topic]}\n\nКомпания: ${companyName}\n\nПлатформа: ${productMap[product]}\n\nЗадача: ${task}\n\nСроки: ${deadlinesMap[data]}`;

        await bot.telegram.sendMessage(MANAGER_ANNA_ID, managerMessage, {
            reply_markup: startKeyboard,
        });

        await ctx.reply('Спасибо за обращение. Ваш запрос передан менеджеру, с вами свяжутся в максимально короткие сроки.', startKeyboard);
        ctx.session = {};
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
