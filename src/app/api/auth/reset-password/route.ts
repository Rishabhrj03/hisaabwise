import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import connectDB from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request) {
    try {
        await connectDB();
        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        // Set new password
        // The pre-save hook in User model (if it exists) usually handles hashing.
        // However, if we are doing manual update or checking standard Mongoose logic:
        // We should manually hash here to be safe unless we are sure about the pre-save hook behavior with direct modifications.
        // Looking at typical implementations, direct assignment might bypass pre 'save' if not carefully done, 
        // BUT calling user.save() WILL trigger pre('save') hooks.
        // Let's assume there might NOT be a pre-save hook for password in the current User.ts we viewed earlier (it was just schema definition).
        // Let's manually hash it to be sure, or check if we installed bcryptjs. Yes we did.

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return NextResponse.json({ success: true, data: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
