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
    const user = await db.collection<AnyDoc>('users').findOne({ _id: session.user.id });
    return NextResponse.json(user?.bankAccounts || []);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, type, balance, creditLimit, billingDate } = await req.json();

    if (!name || isNaN(Number(balance))) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const newAccount = {
      _id: crypto.randomUUID(),
      name,
      type: type || 'bank',
      balance: Number(balance),
      creditLimit: creditLimit ? Number(creditLimit) : undefined,
      billingDate: billingDate ? Number(billingDate) : undefined,
    };

    const db = await getDb();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.collection<AnyDoc>('users').updateOne(
      { _id: session.user.id },
      { $push: { bankAccounts: newAccount } } as any
    );


    return NextResponse.json(newAccount);
  } catch (error) {
    console.error('Error adding account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { _id, name, balance, type, creditLimit, billingDate } = await req.json();
    const db = await getDb();

    const updateFields: Record<string, unknown> = {};
    if (name) updateFields['bankAccounts.$.name'] = name;
    if (balance !== undefined) updateFields['bankAccounts.$.balance'] = Number(balance);
    if (type) updateFields['bankAccounts.$.type'] = type;
    if (creditLimit !== undefined) updateFields['bankAccounts.$.creditLimit'] = Number(creditLimit);
    if (billingDate !== undefined) updateFields['bankAccounts.$.billingDate'] = Number(billingDate);

    await db.collection<AnyDoc>('users').updateOne(
      { _id: session.user.id, 'bankAccounts._id': _id },
      { $set: updateFields }
    );

    const user = await db.collection<AnyDoc>('users').findOne({ _id: session.user.id });
    const bankAccounts = (user?.bankAccounts as AnyDoc[]) || [];
    const updatedAccount = bankAccounts.find((acc: AnyDoc) => acc._id === _id);
    return NextResponse.json(updatedAccount || { _id, name, balance });

  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

