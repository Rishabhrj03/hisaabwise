import { MongoClient } from 'mongodb';

/**
 * mongoClient.ts — Singleton MongoDB client.
 *
 * Uses a global cached promise in development to survive Next.js hot-reloads
 * without creating new connections on every module re-evaluation.
 *
 * In production a fresh promise is created (no global caching needed).
 */

const uri = process.env.MONGODB_URI!;

if (!uri) {
  console.warn(
    '[MongoDB] MONGODB_URI is not set. Please add it to .env.local and restart the dev server.'
  );
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // In development, attach to the global object to survive HMR.
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri || 'mongodb://localhost:27017/expense-tracker');
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;
