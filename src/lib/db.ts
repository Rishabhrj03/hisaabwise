import { MongoClient, Db, BSON } from 'mongodb';
import clientPromise from '@/lib/mongoClient';

/**
 * db.ts — Returns the MongoDB database instance.
 * Use this in API routes instead of calling clientPromise directly.
 */
export async function getDb(): Promise<Db> {
  const client: MongoClient = await clientPromise;
  return client.db();
}

/**
 * Document type where _id is a string UUID (not MongoDB ObjectId).
 * Use `db.collection<AnyDoc>(name)` to bypass TypeScript's ObjectId constraint.
 */
export type AnyDoc = { _id?: string | BSON.ObjectId } & Record<string, unknown>;
