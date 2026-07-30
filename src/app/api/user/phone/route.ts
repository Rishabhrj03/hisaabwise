import { NextRequest, NextResponse } from 'next/server';
import { getDb, AnyDoc } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId, phone } = await req.json();
    if (!userId || !phone) return NextResponse.json({ error: 'userId and phone are required.' }, { status: 400 });

    const db = await getDb();
    await db.collection<AnyDoc>('users').updateOne({ _id: userId }, { $set: { phone } });
    await db.collection<AnyDoc>('friends').updateMany({ phone }, { $set: { linked_user_id: userId } });

    return NextResponse.json({ message: 'Phone saved successfully.' });
  } catch (err) {
    console.error('[/api/user/phone]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
