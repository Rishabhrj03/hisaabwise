import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb, AnyDoc } from '@/lib/db';
import type { CreateFriendPayload } from '@/services/interfaces/IFriendService';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDb();
  const docs = await db.collection<AnyDoc>('friends').find({ user_id: session.user.id }).toArray();
  const mapped = docs.map(({ _id, ...rest }) => ({ id: String(_id), ...rest }));
  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload: CreateFriendPayload = await req.json();
  const { id, ...rest } = payload;
  const db = await getDb();
  await db.collection<AnyDoc>('friends').insertOne({ _id: id, ...rest });
  return NextResponse.json({ ok: true }, { status: 201 });
}
