export const getChunks = (array, n) =>
	array.reduce((memo, value, index) => {
		if (index % n === 0) {
			memo.push([]);
		}

		memo[memo.length - 1].push(value);
		return memo;
	}, []);

export const markChoice = (data, ctx) => {
	const lastMarkup = ctx.update.callback_query.message.reply_markup;

	const keyboard = lastMarkup.inline_keyboard.map((line) =>
		line.map((button) => {
			if (button.callback_data === data) {
				return { ...button, text: `<<${button.text}>>` };
			}

			return button;
		})
	);

	ctx.editMessageReplyMarkup({
		inline_keyboard: keyboard,
	});
}