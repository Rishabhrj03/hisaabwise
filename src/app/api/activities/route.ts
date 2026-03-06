import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Activity from '@/models/Activity';
import Group from '@/models/Group';
import { getSessionUser } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET() {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // 1. Find all Groups I am a member of
        const userIdObj = new mongoose.Types.ObjectId(session.userId);
        const myGroups = await Group.find({
            members: { $in: [session.userId, userIdObj] }
        }).select('_id');
        const myGroupIds = myGroups.map(g => g._id);

        // 2. Query activities: Performed by me OR in my groups
        const query = {
            $or: [
                { user: session.userId },
                { group_id: { $in: myGroupIds } }
            ]
        };

        const activities = await Activity.find(query)
            .sort({ created_at: -1 })
            .limit(50)
            .populate('user', 'name image');

        return NextResponse.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
