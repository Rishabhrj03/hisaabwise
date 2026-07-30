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
  await db.collection<AnyDoc>('expense_splits').deleteMany({ expense_id: id });
  await db.collection<AnyDoc>('expenses').deleteOne({ _id: id });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const payload = await req.json();
  const db = await getDb();
  await db.collection<AnyDoc>('expenses').updateOne({ _id: id }, { $set: payload });
  return NextResponse.json({ ok: true });
}
