import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { sendEmail } from '@/lib/sendEmail';

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        await dbConnect();

        // 1. Get User ID from Session/Token
        // Check both NextAuth session and custom token cookie for compatibility
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token');

        let userId: string | null = null;
        let userEmail: string | null = null;

        if (token) {
            try {
                const decoded = jwt.verify(token.value, process.env.JWT_SECRET || 'secret') as any;
                userId = decoded.userId;
            } catch (e) {
                return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
            }
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Find User
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.isEmailVerified) {
            return NextResponse.json({ message: 'Email already verified' }, { status: 200 });
        }

        // 3. Generate New Token (or reuse valid one)
        // Let's generate a new one to extend expiry
        const emailToken = crypto.randomBytes(20).toString('hex');
        user.emailVerificationToken = crypto.createHash('sha256').update(emailToken).digest('hex');
        user.emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        await user.save();

        // 4. Send Email
        const origin = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const verifyUrl = `${origin}/verify-email?token=${emailToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: 'HisaabWise - Verify your Email',
                text: `Please verify your email by clicking: ${verifyUrl}`,
                html: `<h1>Verify Email</h1><p>Click the link below to verify your email address:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
            });
            return NextResponse.json({ message: 'Verification email sent' });
        } catch (emailError) {
            console.error("Failed to send verification email", emailError);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

    } catch (error) {
        console.error('Resend email error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
