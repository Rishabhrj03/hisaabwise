import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subscription from '@/models/Subscription';
import { getSessionUser } from '@/lib/auth';
import mongoose from 'mongoose';

export async function POST(req: NextRequest) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const subscription = await req.json();

        // Check if subscription already exists
        const existing = await Subscription.findOne({ endpoint: subscription.endpoint });
        if (existing) {
            // Update user_id if improved/changed? Or just return success.
            if (existing.user_id.toString() !== session.userId) {
                existing.user_id = new mongoose.Types.ObjectId(session.userId);
                await existing.save();
            }
            return NextResponse.json({ message: 'Subscription updated' });
        }

        await Subscription.create({
            user_id: new mongoose.Types.ObjectId(session.userId),
            endpoint: subscription.endpoint,
            keys: subscription.keys
        });

        return NextResponse.json({ message: 'Subscribed successfully' });
    } catch (error) {
        console.error('Error saving subscription:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
