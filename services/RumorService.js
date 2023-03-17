import axios from "axios";

export class RumorService {
	static async addRumor(rumor) {
		await axios.post(
			`${process.env.API_URL}/action/insertOne`,
			{
				dataSource: process.env.DATA_SOURCE,
				database: process.env.DATABASE,
				collection: process.env.COLLECTION,
				document: rumor,
			},
			{
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Request-Headers": "*",
					"api-key": process.env.API_KEY,
				},
			}
		);
	}

	static async getRumorsDocuments(filter) {
		const { data } = await axios.post(
			`${process.env.API_URL}/action/find`,
			{
				dataSource: process.env.DATA_SOURCE,
				database: process.env.DATABASE,
				collection: process.env.COLLECTION,
				filter,
			},
			{
				headers: {
					"Content-Type": "application/json",
					"Access-Control-Request-Headers": "*",
					"api-key": process.env.API_KEY,
				},
			}
		);

		return data.documents;
	}

	static async getRumors(filter) {
		const documents = await this.getRumorsDocuments(filter);
		return documents.map((user) => user.rumor);
	}

	static async getAges(filter) {
		const documents = await this.getRumorsDocuments(filter);
		return documents.map((user) => user.age);
	}

	static async getCities(filter) {
		const documents = await this.getRumorsDocuments(filter);
		return documents.map((user) => user.city);
	}
}
