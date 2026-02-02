import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { getSessionUser } from '@/lib/auth';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log("DELETE /api/expenses/[id] - Start");
        const session = await getSessionUser();
        if (!session) {
            console.log("No session found via getSessionUser");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log("User authorized:", session.userId);

        const { id } = await params;
        console.log("Deleting expense ID:", id);

        await dbConnect();

        // Debug: Check if expense exists first
        const existing = await Expense.findOne({ _id: id });
        if (!existing) {
            console.log("Expense not found with ID:", id);
        } else {
            console.log("Expense found. Created by:", existing.created_by);
            console.log("Session User ID:", session.userId);
        }

        const expense = await Expense.findOneAndDelete({
            _id: id,
            created_by: session.userId
        });

        if (!expense) {
            console.log("Deletion failed: Expense not found or unauthorized");
            return NextResponse.json({ error: 'Expense not found or unauthorized' }, { status: 404 });
        }

        console.log("Expense deleted successfully");
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting expense:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const data = await req.json();

        await dbConnect();
        const expense = await Expense.findOneAndUpdate(
            { _id: id, created_by: session.userId },
            data,
            { new: true, runValidators: true }
        );

        if (!expense) {
            return NextResponse.json({ error: 'Expense not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(expense);
    } catch (error) {
        console.error('Error updating expense:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
