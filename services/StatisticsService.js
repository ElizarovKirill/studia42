import dotenv from "dotenv";
dotenv.config();

export class StatisticsService {
	constructor(database) {
		this.statisticsCollection = database.collection(
			process.env.STATISTICS_COLLECTION
		);
	}

	async createRecord(record) {
		await this.statisticsCollection.insertOne({
			...record,
			createdAt: new Date(),
		});
	}
}
