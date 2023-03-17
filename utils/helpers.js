import {
	RUMOR_BUTTON_KEY,
	RUMOR_BUTTONS_IN_LINE,
	AGE_BUTTON_KEY,
	CITY_BUTTON_KEY,
} from "./constants.js";

export const parseButtonKey = (key) => {
	const splittedData = key.split("_");
	return splittedData[splittedData.length - 1];
};

export const getChunks = (array, n) =>
	array.reduce((memo, value, index) => {
		if (index % n === 0) {
			memo.push([]);
		}

		memo[memo.length - 1].push(value);
		return memo;
	}, []);

export const getRumorsKeyboard = (rumors, currentIndex) => {
	if (rumors.length <= 1) {
		return {};
	}

	const buttons = rumors.map((rumor, index) => {
		if (index === currentIndex) {
			return {
				text: `-${index + 1}-`,
				callback_data: `${RUMOR_BUTTON_KEY}_${index}`,
			};
		}

		return {
			text: index + 1,
			callback_data: `${RUMOR_BUTTON_KEY}_${index}`,
		};
	});

	return {
		inline_keyboard: getChunks(buttons, RUMOR_BUTTONS_IN_LINE),
	};
};

const getColumnKeyboard = (array, key) => {
	const buttons = array.map((element) => {
		return [
			{
				text: element,
				callback_data: `${key}_${element}`,
			},
		];
	});

	return {
		inline_keyboard: buttons,
	};
};

export const getAgeKeyboard = (ages) =>
	getColumnKeyboard([...new Set(ages)], AGE_BUTTON_KEY);

export const getCityKeyboard = (cities) =>
	getColumnKeyboard([...new Set(cities)], CITY_BUTTON_KEY);
