import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';
import { getSessionUser } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const params = await props.params;
        const { id } = params;

        const group = await Group.findById(id);
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        if (group.members.some((m: any) => m.toString() === session.userId)) {
            return NextResponse.json({ message: 'Already a member' });
        }

        group.members.push(new mongoose.Types.ObjectId(session.userId));
        await group.save();

        return NextResponse.json({ message: 'Joined successfully', group });
    } catch (error) {
        console.error('Error joining group:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
