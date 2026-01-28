import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Friend from '@/models/Friend';
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
        const data = await req.json();

        const friend = await Friend.create({
            ...data,
            user_id: session.userId,
        });

        return NextResponse.json(friend);
    } catch (error) {
        console.error('Error creating friend:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
