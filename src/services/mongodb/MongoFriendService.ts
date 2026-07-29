import { MongoClient, Db } from 'mongodb';
import { IFriendService, FriendRecord, CreateFriendPayload } from '@/services/interfaces/IFriendService';
import { AnyDoc } from '@/lib/db';

export class MongoFriendService implements IFriendService {
  constructor(private readonly clientPromise: Promise<MongoClient>) {}
  private async db(): Promise<Db> { return (await this.clientPromise).db(); }

  async fetchFriends(userId: string): Promise<FriendRecord[]> {
    try {
      const db = await this.db();
      const docs = await db.collection<AnyDoc>('friends').find({ user_id: userId }).toArray();
      return docs.map(({ _id, ...rest }) => ({ id: String(_id), ...rest })) as FriendRecord[];
    } catch (err) {
      console.error('[MongoFriendService] fetchFriends error:', err);
      return [];
    }
  }

  async createFriend(payload: CreateFriendPayload): Promise<void> {
    const { id, ...rest } = payload;
    await (await this.db()).collection<AnyDoc>('friends').insertOne({ _id: id, ...rest });
  }

  async deleteFriend(id: string): Promise<void> {
    await (await this.db()).collection<AnyDoc>('friends').deleteOne({ _id: id });
  }
}
