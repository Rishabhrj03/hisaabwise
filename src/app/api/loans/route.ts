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
    const loans = await db
      .collection<AnyDoc>('loans')
      .find({ user_id: session.user.id })
      .toArray();

    return NextResponse.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, principalAmount, interestRate, startDate, tenureMonths, repaymentType } = await req.json();

    let emiAmount = 0;
    if (repaymentType === 'emi' && Number(interestRate) > 0 && Number(tenureMonths) > 0) {
      const r = Number(interestRate) / 12 / 100;
      const n = Number(tenureMonths);
      emiAmount = (Number(principalAmount) * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      emiAmount = Math.round(emiAmount);
    }

    const newLoan = {
      _id: crypto.randomUUID(),
      user_id: session.user.id,
      name,
      type,
      principalAmount: Number(principalAmount),
      interestRate: Number(interestRate),
      startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
      tenureMonths: Number(tenureMonths),
      repaymentType,
      emiAmount,
      paidAmount: 0,
      createdAt: new Date().toISOString(),
    };

    const db = await getDb();
    await db.collection<AnyDoc>('loans').insertOne(newLoan);
    return NextResponse.json(newLoan);
  } catch (error) {
    console.error('Error creating loan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { _id, paidAmount, action } = await req.json();
    const db = await getDb();

    if (action === 'payment') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await db.collection<AnyDoc>('loans').updateOne(
        { _id, user_id: session.user.id },
        { $inc: { paidAmount: Number(paidAmount) } } as any
      );

    }

    const updated = await db.collection<AnyDoc>('loans').findOne({ _id });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating loan:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

