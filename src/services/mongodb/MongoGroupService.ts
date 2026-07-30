import { MongoClient, Db } from 'mongodb';
import { IGroupService, GroupRecordWithMembers, CreateGroupPayload, CreateGroupMemberPayload } from '@/services/interfaces/IGroupService';
import { AnyDoc } from '@/lib/db';

export class MongoGroupService implements IGroupService {
  constructor(private readonly clientPromise: Promise<MongoClient>) {}
  private async db(): Promise<Db> { return (await this.clientPromise).db(); }

  async fetchGroups(userId: string): Promise<GroupRecordWithMembers[]> {
    try {
      const db = await this.db();
      const groups = await db.collection<AnyDoc>('groups').aggregate([
        { $match: { created_by: userId } },
        { $lookup: { from: 'group_members', localField: '_id', foreignField: 'group_id', as: 'group_members' } },
        { $sort: { created_at: -1 } },
      ]).toArray();
      return groups.map(({ _id, group_members, ...rest }) => ({
        id: String(_id), ...rest,
        group_members: ((group_members as AnyDoc[]) ?? []).map(m => ({ member_id: String(m.member_id) })),
      })) as GroupRecordWithMembers[];
    } catch (err) {
      console.error('[MongoGroupService] fetchGroups error:', err);
      return [];
    }
  }

  async createGroup(payload: CreateGroupPayload): Promise<void> {
    const { id, ...rest } = payload;
    await (await this.db()).collection<AnyDoc>('groups').insertOne({ _id: id, ...rest });
  }

  async createGroupMembers(members: CreateGroupMemberPayload[]): Promise<void> {
    if (members.length === 0) return;
    await (await this.db()).collection<AnyDoc>('group_members').insertMany(members as unknown as AnyDoc[]);
  }

  async deleteGroup(id: string): Promise<void> {
    const db = await this.db();
    await db.collection<AnyDoc>('group_members').deleteMany({ group_id: id });
    await db.collection<AnyDoc>('groups').deleteOne({ _id: id });
  }
}
