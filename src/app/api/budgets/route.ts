import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getDb, AnyDoc } from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    const budgets = await db
      .collection<AnyDoc>('budgets')
      .find({ user_id: session.user.id })
      .toArray();

    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, amount, period } = await req.json();
    const db = await getDb();

    const existingBudget = await db
      .collection<AnyDoc>('budgets')
      .findOne({ user_id: session.user.id, category });

    if (existingBudget) {
      await db.collection<AnyDoc>('budgets').updateOne(
        { _id: existingBudget._id },
        { $set: { amount: Number(amount), period: period || existingBudget.period } }
      );
      return NextResponse.json({ ...existingBudget, amount: Number(amount), period: period || existingBudget.period });
    } else {
      const newBudget = {
        _id: crypto.randomUUID(),
        user_id: session.user.id,
        category,
        amount: Number(amount),
        period: period || 'monthly',
        createdAt: new Date().toISOString(),
      };
      await db.collection<AnyDoc>('budgets').insertOne(newBudget);
      return NextResponse.json(newBudget);
    }
  } catch (error) {
    console.error('Error saving budget:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

