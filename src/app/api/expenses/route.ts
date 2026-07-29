import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb, AnyDoc } from '@/lib/db';
import type { CreateExpensePayload, CreateSplitPayload } from '@/services/interfaces/IExpenseService';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = await getDb();
  const expenses = await db.collection<AnyDoc>('expenses').aggregate([
    { $match: { created_by: session.user.id } },
    { $lookup: { from: 'expense_splits', localField: '_id', foreignField: 'expense_id', as: 'expense_splits' } },
    { $sort: { date: -1 } },
  ]).toArray();

  const mapped = expenses.map(({ _id, expense_splits, ...rest }) => ({
    id: String(_id),
    ...rest,
    expense_splits: (expense_splits as AnyDoc[]).map(({ _id: sid, ...s }) => ({ id: String(sid), ...s })),
  }));
  return NextResponse.json(mapped);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { expense, splits }: { expense: CreateExpensePayload | null; splits: CreateSplitPayload[] } = await req.json();
  const db = await getDb();

  if (expense) {
    const { id, ...rest } = expense;
    await db.collection<AnyDoc>('expenses').insertOne({ _id: id, ...rest });
  }

  if (splits?.length > 0) {
    await db.collection<AnyDoc>('expense_splits').insertMany(
      splits.map(s => ({ _id: crypto.randomUUID(), ...s }))
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
