import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import RecurringExpense from '@/models/RecurringExpense';
import Expense from '@/models/Expense';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const recurring = await RecurringExpense.find({ user_id: session.userId }).sort({ nextDueDate: 1 });
        return NextResponse.json(recurring);
    } catch (error) {
        console.error('Error fetching recurring expenses:', error);
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
        const { name, amount, category, frequency, nextDueDate, isAutoDebit } = await req.json();

        const newRecurring = await RecurringExpense.create({
            user_id: session.userId,
            name,
            amount: Number(amount),
            category: category || 'Bills',
            frequency: frequency || 'monthly',
            nextDueDate: new Date(nextDueDate),
            isAutoDebit: isAutoDebit || false
        });

        return NextResponse.json(newRecurring);
    } catch (error) {
        console.error('Error creating recurring expense:', error);
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
        const { _id, action } = await req.json();

        const expense = await RecurringExpense.findOne({ _id, user_id: session.userId });
        if (!expense) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (action === 'pay') {
            // 1. Record as actual expense
            await Expense.create({
                created_by: session.userId,
                description: expense.name,
                amount: expense.amount,
                category: expense.category,
                type: 'expense',
                date: new Date()
            });

            // 2. Advance due date
            const currentDue = new Date(expense.nextDueDate);
            if (expense.frequency === 'monthly') {
                currentDue.setMonth(currentDue.getMonth() + 1);
            } else if (expense.frequency === 'yearly') {
                currentDue.setFullYear(currentDue.getFullYear() + 1);
            }
            expense.nextDueDate = currentDue;

            await expense.save();
            return NextResponse.json(expense);
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Error updating recurring expense:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
