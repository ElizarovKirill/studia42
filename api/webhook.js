process.env.NTBA_FIX_319 = "test";

const { Telegraf } = require("telegraf");

module.exports = async (request, response) => {
	try {
		const bot = new Telegraf(process.env.BOT_TOKEN);
		const { body } = request;

		if (body.message) {
			const {
				chat: { id },
				text,
			} = body.message;
			const message = `✅ Thanks for your message: *"${text}"*\nHave a great day! 👋🏻`;

			await bot.telegram.sendMessage(id, message, { parse_mode: "Markdown" });
		}
	} catch (error) {
		console.error("Error sending message");
		console.log(error.toString());
	}

	response.send("OK");
};
