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

        // Auto-Friend Logic: Connect Joiner <-> Creator
        if (group.created_by.toString() !== session.userId) {
            try {
                const Friend = (await import('@/models/Friend')).default;
                const User = (await import('@/models/User')).default;

                const creatorId = group.created_by;
                const joinerId = session.userId;

                // 1. Add Joiner as Creator's Friend
                const creatorHasJoiner = await Friend.exists({ user_id: creatorId, linked_user_id: joinerId });
                if (!creatorHasJoiner) {
                    const joinerUser = await User.findById(joinerId);
                    if (joinerUser) {
                        await Friend.create({
                            user_id: creatorId,
                            name: joinerUser.name,
                            linked_user_id: joinerId
                        });
                    }
                }

                // 2. Add Creator as Joiner's Friend
                const joinerHasCreator = await Friend.exists({ user_id: joinerId, linked_user_id: creatorId });
                if (!joinerHasCreator) {
                    const creatorUser = await User.findById(creatorId);
                    if (creatorUser) {
                        await Friend.create({
                            user_id: joinerId,
                            name: creatorUser.name,
                            linked_user_id: creatorId
                        });
                    }
                }
            } catch (err) {
                console.error("Failed to auto-add friends on join", err);
                // Don't fail the join request just because auto-friend failed
            }
        }

        return NextResponse.json({ message: 'Joined successfully', group });
    } catch (error) {
        console.error('Error joining group:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
