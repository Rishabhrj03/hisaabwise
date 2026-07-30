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
    const recurring = await db
      .collection<AnyDoc>('recurring_expenses')
      .find({ user_id: session.user.id })
      .sort({ nextDueDate: 1 })
      .toArray();

    return NextResponse.json(recurring);
  } catch (error) {
    console.error('Error fetching recurring expenses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, amount, category, frequency, nextDueDate, isAutoDebit } = await req.json();
    const db = await getDb();

    const newRecurring = {
      _id: crypto.randomUUID(),
      user_id: session.user.id,
      name,
      amount: Number(amount),
      category: category || 'Bills',
      frequency: frequency || 'monthly',
      nextDueDate: nextDueDate ? new Date(nextDueDate).toISOString() : new Date().toISOString(),
      isAutoDebit: isAutoDebit || false,
      createdAt: new Date().toISOString(),
    };

    await db.collection<AnyDoc>('recurring_expenses').insertOne(newRecurring);
    return NextResponse.json(newRecurring);
  } catch (error) {
    console.error('Error creating recurring expense:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { _id, action } = await req.json();
    const db = await getDb();

    const expense = await db.collection<AnyDoc>('recurring_expenses').findOne({ _id, user_id: session.user.id });
    if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (action === 'pay') {
      // 1. Record as actual expense
      const newExpense = {
        _id: crypto.randomUUID(),
        created_by: session.user.id,
        user_id: session.user.id,
        description: expense.name,
        amount: Number(expense.amount),
        category: expense.category,
        type: 'expense',
        date: new Date().toISOString(),
      };
      await db.collection<AnyDoc>('expenses').insertOne(newExpense);

      // 2. Advance due date
      const currentDue = new Date(expense.nextDueDate as string);

      if (expense.frequency === 'monthly') {
        currentDue.setMonth(currentDue.getMonth() + 1);
      } else if (expense.frequency === 'yearly') {
        currentDue.setFullYear(currentDue.getFullYear() + 1);
      }

      await db.collection<AnyDoc>('recurring_expenses').updateOne(
        { _id },
        { $set: { nextDueDate: currentDue.toISOString() } }
      );

      const updated = await db.collection<AnyDoc>('recurring_expenses').findOne({ _id });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating recurring expense:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

