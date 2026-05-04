import { MongoClient, MongoClientOptions } from "mongodb";
import { config } from '@/config'

// Default connection configuration
const defaultConfig: MongoClientOptions = {
  connectTimeoutMS: 5000,
  serverSelectionTimeoutMS: 5000,
  maxPoolSize: 10,
  retryWrites: true,
};

const defaultUri: string = config.MONGO_URI;

const MONGO_DB_NAME = config.MONGO_DB_NAME;
const MONGO_COLLECTION_NAME = "request_payloads";

let client: MongoClient | null = null;

/**
 * Connects to a MongoDB database using the provided or default configuration.
 * @param uri - Optional override for the MongoDB connection URI.
 * @param options - Optional overrides for the default client options.
 * @returns The connected MongoClient instance.
 */
async function connect(
  uri: string = defaultUri,
  options: MongoClientOptions = {},
): Promise<MongoClient> {
  if (client) {
    console.warn("Already connected to the MongoDB database.");
    return client;
  }

  client = new MongoClient(uri, { ...defaultConfig, ...options });

  try {
    await client.connect();
    console.log("Successfully connected to MongoDB.");
    return client;
  } catch (error) {
    client = null;
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

/**
 * Disconnects from the MongoDB database.
 */
async function disconnect(): Promise<void> {
  if (!client) {
    console.warn("No active database connection to disconnect.");
    return;
  }

  try {
    await client.close();
    console.log("Successfully disconnected from the database.");
  } catch (error) {
    console.error("Failed to disconnect from the database:", error);
    throw error;
  } finally {
    client = null;
  }
}

export default { connect, disconnect, MONGO_COLLECTION_NAME, MONGO_DB_NAME };
