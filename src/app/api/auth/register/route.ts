import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Friend from '@/models/Friend';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

import crypto from 'crypto';
import { sendEmail } from '@/lib/sendEmail';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const { email, password, name, phone } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate Verification Data
        const emailToken = crypto.randomBytes(20).toString('hex');
        const phoneCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code

        const user = await User.create({
            email,
            password: hashedPassword,
            name: name || email.split('@')[0],
            phone,
            isEmailVerified: false,
            emailVerificationToken: crypto.createHash('sha256').update(emailToken).digest('hex'),
            emailVerificationExpire: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            isPhoneVerified: false, // Default false until WhatsApp verification
            phoneVerificationCode: phoneCode,
        });

        // Link pending friends
        if (phone) {
            // ... existing logic ...
            const pendingFriends = await Friend.find({ phone });
            for (const pf of pendingFriends) {
                pf.linked_user_id = user._id;
                await pf.save();

                const inviter = await User.findById(pf.user_id);
                if (inviter) {
                    const exists = await Friend.findOne({ user_id: user._id, linked_user_id: inviter._id });
                    if (!exists) {
                        await Friend.create({
                            user_id: user._id,
                            name: inviter.name,
                            phone: inviter.phone,
                            linked_user_id: inviter._id
                        });
                    }
                }
            }
        }

        // Send Verification Email
        const origin = req.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const verifyUrl = `${origin}/verify-email?token=${emailToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Expense Tracker - Verify your Email',
                text: `Please verify your email by clicking: ${verifyUrl}`,
                html: `<h1>Welcome to Expense Tracker!</h1><p>Please verify your email by clicking the link below:</p><a href="${verifyUrl}">${verifyUrl}</a>`,
            });
        } catch (emailError) {
            console.error("Failed to send verification email", emailError);
            // We ensure user is created even if email fails, they can request resend later
        }

        const token = signToken({ userId: user._id.toString(), email: user.email });

        const cookieStore = await cookies();
        cookieStore.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return NextResponse.json({
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
                isPhoneVerified: user.isPhoneVerified
            },
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
