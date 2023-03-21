import dotenv from "dotenv";
dotenv.config();

export class RumorService {
	constructor(database) {
		this.rumorCollection = database.collection(process.env.COLLECTION);
	}

	async addRumor(rumor) {
		await this.rumorCollection.insertOne(rumor);
	}

	async getRumorsDocuments(filter) {
		const result = await this.rumorCollection.find(filter).toArray();
		return result;
	}

	async getRumors(filter) {
		const documents = await this.getRumorsDocuments(filter);
		return documents.map((user) => user.rumor);
	}

	async getAges(filter) {
		const documents = await this.getRumorsDocuments(filter);
		return documents.map((user) => user.age);
	}

	async getCities(filter) {
		const documents = await this.getRumorsDocuments(filter);
		return documents.map((user) => user.city);
	}
}
