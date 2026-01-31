import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpire: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpire = undefined;

        await user.save();

        return NextResponse.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
