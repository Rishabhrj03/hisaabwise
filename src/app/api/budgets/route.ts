import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget from '@/models/Budget';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const budgets = await Budget.find({ user_id: session.userId });
        return NextResponse.json(budgets);
    } catch (error) {
        console.error('Error fetching budgets:', error);
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
        const { category, amount, period } = await req.json();

        // Check if budget for category exists
        const existingBudget = await Budget.findOne({ user_id: session.userId, category });

        let budget;
        if (existingBudget) {
            // Update existing
            existingBudget.amount = amount;
            existingBudget.period = period || existingBudget.period;
            budget = await existingBudget.save();
        } else {
            // Create new
            budget = await Budget.create({
                user_id: session.userId,
                category,
                amount,
                period: period || 'monthly'
            });
        }

        return NextResponse.json(budget);
    } catch (error) {
        console.error('Error saving budget:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
