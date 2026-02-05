import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Group from '@/models/Group';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';
import { sendGroupNotification } from '@/lib/notification';

export async function GET() {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        await dbConnect();
        // Visibility Logic (Issue 4 Fix): Show groups created by user OR where user is a member
        const groups = await Group.find({
            $or: [
                { created_by: session.userId },
                { members: session.userId }
            ]
        }).sort({ created_at: -1 });

        return NextResponse.json(groups);
    } catch (error) {
        console.error('Error fetching groups:', error);
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
        const { name, memberIds } = await req.json();

        const group = await Group.create({
            name,
            members: memberIds ? Array.from(new Set([...memberIds, session.userId])) : [session.userId],
            created_by: session.userId,
        });

        // Trigger Notification
        if (memberIds && memberIds.length > 0) {
            const creator = await User.findById(session.userId);
            await sendGroupNotification(
                memberIds,
                name,
                creator ? creator.name || "A user" : "A user"
            );
        }

        return NextResponse.json(group);
    } catch (error) {
        console.error('Error creating group:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
