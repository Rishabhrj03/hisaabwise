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
    const goals = await db
      .collection<AnyDoc>('goals')
      .find({ user_id: session.user.id })
      .toArray();

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, targetAmount, deadline, color, currentAmount } = await req.json();
    const db = await getDb();

    const newGoal = {
      _id: crypto.randomUUID(),
      user_id: session.user.id,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount || 0),
      deadline: deadline ? new Date(deadline).toISOString() : null,
      color,
      createdAt: new Date().toISOString(),
    };

    await db.collection<AnyDoc>('goals').insertOne(newGoal);
    return NextResponse.json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, currentAmount, targetAmount } = await req.json();
    const db = await getDb();

    const updateFields: Record<string, unknown> = {};
    if (currentAmount !== undefined) updateFields.currentAmount = Number(currentAmount);
    if (targetAmount !== undefined) updateFields.targetAmount = Number(targetAmount);

    await db.collection<AnyDoc>('goals').updateOne(
      { _id: id, user_id: session.user.id },
      { $set: updateFields }
    );

    const updated = await db.collection<AnyDoc>('goals').findOne({ _id: id });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

