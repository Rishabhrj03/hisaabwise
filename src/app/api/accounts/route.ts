import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findById(session.userId).select('bankAccounts');
        return NextResponse.json(user?.bankAccounts || []);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { name, type, balance, creditLimit, billingDate } = await req.json();

        // Validate
        if (!name || isNaN(Number(balance))) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const user = await User.findById(session.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!user.bankAccounts) user.bankAccounts = [];

        const newAccount = {
            name,
            type: type || 'bank',
            balance: Number(balance),
            creditLimit: creditLimit ? Number(creditLimit) : undefined,
            billingDate: billingDate ? Number(billingDate) : undefined,
            _id: new mongoose.Types.ObjectId().toString()
        };

        user.bankAccounts.push(newAccount as any);

        await user.save();

        // Return the newly added account (it will be the last one)
        return NextResponse.json(user.bankAccounts[user.bankAccounts.length - 1]);
    } catch (error) {
        console.error('Error adding account:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { _id, name, balance, type, creditLimit, billingDate } = await req.json();

        const user = await User.findById(session.userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const account = user.bankAccounts.find((acc: any) => acc._id.toString() === _id);
        if (!account) return NextResponse.json({ error: 'Account not found' }, { status: 404 });

        if (name) account.name = name;
        if (balance !== undefined) account.balance = Number(balance);
        if (type) account.type = type;
        if (creditLimit !== undefined) account.creditLimit = Number(creditLimit);
        if (billingDate !== undefined) account.billingDate = Number(billingDate);

        await user.save();
        return NextResponse.json(account);
    } catch (error) {
        console.error('Error updating account:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
