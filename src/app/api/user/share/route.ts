import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { isPublic } = await req.json();

        const updateData: { isPublic: boolean; shareToken?: string } = { isPublic };

        // If enabling public access and no token exists, generate one
        if (isPublic) {
            const user = await User.findById(decoded.userId);
            if (user && !user.shareToken) {
                updateData.shareToken = crypto.randomBytes(12).toString('hex');
            }
        }

        const user = await User.findByIdAndUpdate(
            decoded.userId,
            updateData,
            { new: true }
        ).select('isPublic shareToken');

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            isPublic: user.isPublic,
            shareToken: user.shareToken
        });

    } catch (error) {
        console.error('Share Toggle Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get('auth-token')?.value;

        if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const user = await User.findById(decoded.userId).select('isPublic shareToken');

        if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

        return NextResponse.json({
            isPublic: user.isPublic,
            shareToken: user.shareToken
        });

    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
