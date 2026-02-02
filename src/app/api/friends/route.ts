import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Friend from '@/models/Friend';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';
import { sendFriendNotification } from '@/lib/notification';

export async function GET() {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const friends = await Friend.find({ user_id: session.userId }).sort({ name: 1 });

        return NextResponse.json(friends);
    } catch (error) {
        console.error('Error fetching friends:', error);
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
        const { name, phone, upi_id } = await req.json();

        let linked_user_id = undefined;
        if (phone) {
            const existingUser = await User.findOne({ phone });
            if (existingUser) {
                linked_user_id = existingUser._id;
            }
        }

        const friend = await Friend.create({
            user_id: session.userId,
            name,
            phone,
            upi_id,
            linked_user_id
        });

        // Reciprocal Logic (Issue 2 Fix)
        if (linked_user_id) {
            // Check if the other user already has this user as a friend to avoid duplicates
            // We need to know the current user's name/phone to add them as a friend to the other person.
            // Ideally URL encoded or fetched. For now, we'll try to find the current user's details.

            // Note: In a real app, we might check if connection exists.
            // Here, we just "push" the friendship to the other side if not exists.

            const currentUser = await User.findById(session.userId);
            if (currentUser) {
                const existingReverseFriend = await Friend.findOne({
                    user_id: linked_user_id,
                    linked_user_id: session.userId
                });

                if (!existingReverseFriend) {
                    await Friend.create({
                        user_id: linked_user_id,
                        name: currentUser.name || "Unknown Friend", // Fallback name
                        phone: currentUser.phone, // Assuming phone is available
                        linked_user_id: session.userId
                    });

                    // Trigger Notification
                    await sendFriendNotification(linked_user_id.toString(), currentUser.name || "A friend");
                }
            }
        }

        return NextResponse.json(friend);
    } catch (error) {
        console.error('Error creating friend:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
