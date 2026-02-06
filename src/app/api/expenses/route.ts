import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import Friend from '@/models/Friend';
import Group from '@/models/Group';
import { getSessionUser } from '@/lib/auth';
import { sendExpenseNotification } from '@/lib/notification';
import mongoose from 'mongoose';

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

        // 2. Find all Groups I am a member of (to show group expenses added by others)
        // Handle mixed data: Query for BOTH String ID and ObjectId
        const userIdObj = new mongoose.Types.ObjectId(session.userId);
        const myGroups = await Group.find({
            members: { $in: [session.userId, userIdObj] }
        }).select('_id');
        const myGroupIds = myGroups.map(g => g._id);

        console.log("Groups found for user:", myGroupIds.length, myGroupIds);

        // 3. Query expenses: Created by me OR where I am a "related friend" OR in my groups
        const query = {
            $or: [
                { created_by: session.userId },
                { relatedTo: { $in: myFriendIds } },
                { group_id: { $in: myGroupIds } }
            ]
        };
        const expenses = await Expense.find(query).sort({ date: -1 });
        console.log("Expenses query:", JSON.stringify(query));
        console.log("Expenses found:", expenses.length);

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

        // Trigger Notification Background Task (fire and forget to not block response)
        sendExpenseNotification(expense, session.userId).catch(console.error);

        return NextResponse.json(expense);
    } catch (error) {
        console.error('Error creating expense:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
