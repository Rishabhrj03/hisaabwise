import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb, AnyDoc } from '@/lib/db';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const db = await getDb();
  await db.collection<AnyDoc>('group_members').deleteMany({ group_id: id });
  await db.collection<AnyDoc>('groups').deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}
