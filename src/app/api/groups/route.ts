import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb, AnyDoc } from '@/lib/db';
import type { CreateGroupPayload, CreateGroupMemberPayload } from '@/services/interfaces/IGroupService';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDb();
  const groups = await db.collection<AnyDoc>('groups').aggregate([
    { $match: { created_by: session.user.id } },
    { $lookup: { from: 'group_members', localField: '_id', foreignField: 'group_id', as: 'group_members' } },
    { $sort: { created_at: -1 } },
  ]).toArray();
  const mapped = groups.map(({ _id, group_members, ...rest }) => ({
    id: String(_id),
    ...rest,
    group_members: (group_members as AnyDoc[]).map(m => ({ member_id: String(m.member_id) })),
  }));
  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { group, members }: { group: CreateGroupPayload; members: CreateGroupMemberPayload[] } = await req.json();
  const db = await getDb();
  if (group?.id) {
    const { id, ...rest } = group;
    await db.collection<AnyDoc>('groups').insertOne({ _id: id, ...rest });
  }
  if (members?.length > 0) {
    await db.collection<AnyDoc>('group_members').insertMany(members as unknown as AnyDoc[]);
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
