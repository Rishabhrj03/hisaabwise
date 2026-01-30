import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import Friend from '@/models/Friend';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        // 1. Find all "Friend" identities that link to ME (the logged in user)
        const myFriendIdentities = await Friend.find({ linked_user_id: session.userId }).select('_id');
        const myFriendIds = myFriendIdentities.map(f => f._id.toString());

        // 2. Query expenses: Created by me OR where I am a "related friend"
        const expenses = await Expense.find({
            $or: [
                { created_by: session.userId },
                { relatedTo: { $in: myFriendIds } }
            ]
        }).sort({ date: -1 });

        return NextResponse.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
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
        const data = await req.json();

        // Data validation could go here

        const expense = await Expense.create({
            ...data,
            created_by: session.userId,
        });

        return NextResponse.json(expense);
    } catch (error) {
        console.error('Error creating expense:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
