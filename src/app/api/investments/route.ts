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
    const investments = await db
      .collection<AnyDoc>('investments')
      .find({ user_id: session.user.id })
      .toArray();

    const now = new Date();

    for (const inv of investments) {
      const autoIncreaseAmount = Number(inv.autoIncreaseAmount || 0);
      if (autoIncreaseAmount > 0 && inv.autoIncreaseFrequency !== 'one-time') {
        const lastUpdate = inv.lastAutoUpdate ? new Date(inv.lastAutoUpdate as string) : new Date((inv.startDate || inv.createdAt) as string);

        let periodMs = 30 * 24 * 60 * 60 * 1000;
        switch (inv.autoIncreaseFrequency) {
          case 'quarterly': periodMs = 90 * 24 * 60 * 60 * 1000; break;
          case 'half-yearly': periodMs = 180 * 24 * 60 * 60 * 1000; break;
          case 'yearly': periodMs = 365 * 24 * 60 * 60 * 1000; break;
        }

        if (now.getTime() - lastUpdate.getTime() > periodMs) {
          const periodsPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / periodMs);

          if (periodsPassed > 0) {
            const newAmount = Number(inv.currentAmount || 0) + (autoIncreaseAmount * periodsPassed);
            const newLastAutoUpdate = new Date(lastUpdate.getTime() + (periodsPassed * periodMs)).toISOString();


            await db.collection<AnyDoc>('investments').updateOne(
              { _id: inv._id },
              { $set: { currentAmount: newAmount, lastAutoUpdate: newLastAutoUpdate } }
            );

            inv.currentAmount = newAmount;
            inv.lastAutoUpdate = newLastAutoUpdate;
          }
        }
      }
    }

    return NextResponse.json(investments);
  } catch (error) {
    console.error('Error fetching investments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, currentAmount, autoIncreaseAmount, autoIncreaseFrequency, startDate } = await req.json();
    const db = await getDb();

    const newInvestment = {
      _id: crypto.randomUUID(),
      user_id: session.user.id,
      name,
      type,
      currentAmount: Number(currentAmount),
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      autoIncreaseAmount: Number(autoIncreaseAmount || 0),
      autoIncreaseFrequency: autoIncreaseFrequency || 'monthly',
      lastAutoUpdate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    await db.collection<AnyDoc>('investments').insertOne(newInvestment);
    return NextResponse.json(newInvestment);
  } catch (error) {
    console.error('Error creating investment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { _id, name, currentAmount, autoIncreaseAmount, autoIncreaseFrequency, startDate } = await req.json();
    const db = await getDb();

    const updateFields = {
      name,
      currentAmount: Number(currentAmount),
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      autoIncreaseAmount: Number(autoIncreaseAmount),
      autoIncreaseFrequency,
    };

    await db.collection<AnyDoc>('investments').updateOne(
      { _id, user_id: session.user.id },
      { $set: updateFields }
    );

    const updated = await db.collection<AnyDoc>('investments').findOne({ _id });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating investment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

