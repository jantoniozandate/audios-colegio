import { MongoClient } from "mongodb";

let clientPromise;

function getMongoConfig() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri) {
    throw new Error("Missing MONGODB_URI env var.");
  }

  if (!dbName) {
    throw new Error("Missing MONGODB_DB env var.");
  }

  return { uri, dbName };
}

function createClient() {
  const { uri } = getMongoConfig();
  const client = new MongoClient(uri);
  return client.connect();
}

export async function getDb() {
  if (!clientPromise) {
    clientPromise = createClient();
  }

  const client = await clientPromise;
  const { dbName } = getMongoConfig();
  return client.db(dbName);
}
