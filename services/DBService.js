import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.ATLAS_URI;
const options = {
	useUnifiedTopology: true,
	useNewUrlParser: true,
};

let mongoClient = null;
let database = null;

if (!process.env.ATLAS_URI) {
	throw new Error("Please add your Mongo URI to .env.local");
}

export class DBService {
	static async connect() {
		try {
			if (mongoClient && database) {
				return { mongoClient, database };
			}

			mongoClient = await new MongoClient(uri, options).connect();
			database = mongoClient.db(process.env.DATABASE);

			return { mongoClient, database };
		} catch (e) {
			console.error(e);
		}
	}
}
