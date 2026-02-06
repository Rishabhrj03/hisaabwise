
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';
import { getSessionUser } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;

        const group = await Group.findById(id);

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        return NextResponse.json(group);
    } catch (error) {
        console.error('Error fetching group:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;
        const body = await req.json();

        // Prevent updating ID
        delete body._id;
        delete body.id;

        // Map memberIds to members if present (frontend sends memberIds, DB uses members)
        if (body.memberIds) {
            const session = await getSessionUser();
            if (session) {
                // Ensure current user is not removed during edit
                // Use Set to prevent duplicates and ensure ObjectId/String compatibility
                const updatedMembers = new Set([
                    ...body.memberIds,
                    session.userId
                ]);
                body.members = Array.from(updatedMembers).map(id => new mongoose.Types.ObjectId(id as string));
            } else {
                body.members = body.memberIds.map((id: string) => new mongoose.Types.ObjectId(id));
            }
            delete body.memberIds;
        }

        const updatedGroup = await Group.findByIdAndUpdate(
            id,
            { $set: body },
            { new: true, runValidators: true }
        );

        if (!updatedGroup) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        return NextResponse.json(updatedGroup);
    } catch (error) {
        console.error('Error updating group:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const params = await props.params;
        const { id } = params;

        const deletedGroup = await Group.findByIdAndDelete(id);

        if (!deletedGroup) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Error deleting group:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
