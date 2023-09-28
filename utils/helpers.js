export const getChunks = (array, n) =>
	array.reduce((memo, value, index) => {
		if (index % n === 0) {
			memo.push([]);
		}

		memo[memo.length - 1].push(value);
		return memo;
	}, []);