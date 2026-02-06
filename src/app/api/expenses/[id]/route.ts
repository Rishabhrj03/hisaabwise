import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import Group from '@/models/Group';
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
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        } else {
            console.log("Expense found. Created by:", existing.created_by);
            console.log("Session User ID:", session.userId);
        }

        // Check permissions: Creator OR Group Member
        const isCreator = existing.created_by.toString() === session.userId;
        let isGroupMember = false;

        if (existing.group_id) {
            // Scalable check: Let the database check membership without fetching the whole group
            // index on members field ensures this is O(1) or O(log n)
            const isMember = await Group.exists({
                _id: existing.group_id,
                members: session.userId
            });

            if (isMember) {
                isGroupMember = true;
            }
        }

        if (!isCreator && !isGroupMember) {
            console.log("Deletion failed: Unauthorized. User is neither creator nor group member.");
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const expense = await Expense.findOneAndDelete({ _id: id });

        if (!expense) {
            console.log("Deletion failed: Expense not found");
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
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
        const existing = await Expense.findById(id);
        if (!existing) {
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        }

        // Check permissions
        const isCreator = existing.created_by.toString() === session.userId;
        let isGroupMember = false;

        if (existing.group_id) {
            // Scalable check
            const isMember = await Group.exists({
                _id: existing.group_id,
                members: session.userId
            });
            if (isMember) {
                isGroupMember = true;
            }
        }

        if (!isCreator && !isGroupMember) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const expense = await Expense.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        if (!expense) {
            return NextResponse.json({ error: 'Update failed' }, { status: 500 });
        }

        return NextResponse.json(expense);
    } catch (error) {
        console.error('Error updating expense:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
