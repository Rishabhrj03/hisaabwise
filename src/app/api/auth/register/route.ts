import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, AnyDoc } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

    const db = await getDb();
    const existingUser = await db.collection<AnyDoc>('users').findOne({ email: email.toLowerCase() });
    if (existingUser) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newId = crypto.randomUUID();

    await db.collection<AnyDoc>('users').insertOne({
      _id: newId,
      name: name?.trim() ?? null,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ message: 'Account created successfully.', userId: newId }, { status: 201 });
  } catch (err) {
    console.error('[/api/auth/register]', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
