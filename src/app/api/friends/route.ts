import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Friend from '@/models/Friend';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';

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

        return NextResponse.json(friend);
    } catch (error) {
        console.error('Error creating friend:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
