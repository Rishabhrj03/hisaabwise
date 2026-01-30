import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Friend from '@/models/Friend';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

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

        const user = await User.create({
            email,
            password: hashedPassword,
            name: name || email.split('@')[0],
            phone,
        });

        // Link pending friends
        if (phone) {
            const pendingFriends = await Friend.find({ phone });
            for (const pf of pendingFriends) {
                // Link the pending friend record to this new user
                pf.linked_user_id = user._id;
                await pf.save();

                // Create reciprocal connection
                const inviter = await User.findById(pf.user_id);
                if (inviter) {
                    // Check if already exists to be safe
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
