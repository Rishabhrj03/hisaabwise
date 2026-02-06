import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Friend from '@/models/Friend';
import Group from '@/models/Group';
import { getSessionUser } from '@/lib/auth';
import mongoose from 'mongoose';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        // 1. Get the Friend document
        const friendToCheck = await Friend.findOne({ _id: id, user_id: session.userId });

        if (!friendToCheck) {
            return NextResponse.json({ error: 'Friend not found' }, { status: 404 });
        }

        // 2. Prepare IDs to check against Group Members
        const idsToCheck: mongoose.Types.ObjectId[] = [friendToCheck._id];

        if (friendToCheck.linked_user_id) {
            idsToCheck.push(friendToCheck.linked_user_id);
        }

        // 3. Check if ANY group contains these members
        const groupWithFriend = await Group.findOne({
            members: { $in: idsToCheck }
        });

        if (groupWithFriend) {
            return NextResponse.json({
                error: `Cannot delete ${friendToCheck.name}. They are part of the group "${groupWithFriend.name}". Please remove them from the group first.`
            }, { status: 400 });
        }

        const friend = await Friend.findOneAndDelete({
            _id: id,
            user_id: session.userId
        });

        if (!friend) {
            // Should not happen as we found it above, but safe to keep check
            return NextResponse.json({ error: 'Friend not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting friend:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        await dbConnect();

        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.upi_id !== undefined) updateData.upi_id = body.upi_id;

        const friend = await Friend.findOneAndUpdate(
            { _id: id, user_id: session.userId },
            { $set: updateData },
            { new: true }
        );

        if (!friend) {
            return NextResponse.json({ error: 'Friend not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(friend);
    } catch (error) {
        console.error('Error updating friend:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
