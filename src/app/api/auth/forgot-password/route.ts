import { NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/models/User';
import sendEmail from '@/lib/sendEmail';
import connectDB from '@/lib/db';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email } = await req.json();

        const user = await User.findOne({ email });

        if (!user) {
            // detailed error for debugging
            console.error(`Forgot Password: User with email ${email} not found.`);
            return NextResponse.json({ error: 'User with this email does not exist.' }, { status: 404 });
        }

        // Generate Token
        // 20 bytes random buffer converted to hex string
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire time (10 minutes)
        user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

        await user.save();

        // Create reset url
        // In local dev this should be localhost:3000, in prod it should be the domain
        const origin = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const resetUrl = `${origin}/reset-password?token=${resetToken}`;

        const message = `
      You have requested a password reset. Please go to this link to reset your password:
      
      ${resetUrl}

      This link is valid for 10 minutes.
      
      If you did not request this email, please ignore it.
    `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'HisaabWise Password Reset',
                message,
            });

            return NextResponse.json({ success: true, data: 'Email sent' });
        } catch (err: any) {
            console.error('Email send error:', err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();

            return NextResponse.json({ error: 'Email service failed. Check server logs.' }, { status: 500 });
        }
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
