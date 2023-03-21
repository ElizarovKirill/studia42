import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const uri = process.env.ATLAS_URI;
const options = {
	useUnifiedTopology: true,
	useNewUrlParser: true,
};

export let mongoClient = null;
export let database = null;

if (!process.env.ATLAS_URI) {
	throw new Error("Please add your Mongo URI to .env.local");
}

export class DBService {
	static async connect() {
		try {
			if (mongoClient && database) {
				return { mongoClient, database };
			}
			if (process.env.NODE_ENV === "development") {
				if (!global._mongoClient) {
					mongoClient = await new MongoClient(uri, options).connect();
					global._mongoClient = mongoClient;
				} else {
					mongoClient = global._mongoClient;
				}
			} else {
				mongoClient = await new MongoClient(uri, options).connect();
			}
			database = await mongoClient.db(process.env.NEXT_ATLAS_DATABASE);
			return { mongoClient, database };
		} catch (e) {
			console.error(e);
		}
	}
}
