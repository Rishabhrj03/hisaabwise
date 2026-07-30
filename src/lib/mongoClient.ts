import { MongoClient } from 'mongodb';

/**
 * mongoClient.ts — Singleton MongoDB client.
 *
 * Uses a global cached promise in development to survive Next.js hot-reloads
 * without creating new connections on every module re-evaluation.
 *
 * Safely handles missing MONGODB_URI during build evaluation.
 */

const FALLBACK_URI = 'mongodb://127.0.0.1:27017/expense-tracker';
const uri = process.env.MONGODB_URI || FALLBACK_URI;

if (!process.env.MONGODB_URI) {
  console.warn(
    '[MongoDB] MONGODB_URI is not set. Using fallback URI for evaluation. Please add MONGODB_URI to .env.local'
  );
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, attach to the global object to survive HMR.
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect().catch((err) => {
    console.error('[MongoDB] Connection error:', err.message);
    return client;
  });
}

export default clientPromise;
