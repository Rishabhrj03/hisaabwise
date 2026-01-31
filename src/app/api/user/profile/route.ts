import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { phone } = body;

        // Basic validation
        if (!phone || phone.length !== 10) {
            return NextResponse.json({ error: 'Invalid phone number. Must be 10 digits.' }, { status: 400 });
        }

        await dbConnect();

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            session.userId,
            { phone },
            { new: true } // Return updated doc
        );

        if (!updatedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                name: updatedUser.name,
                image: updatedUser.image,
                phone: updatedUser.phone,
                isEmailVerified: updatedUser.isEmailVerified,
                isPhoneVerified: updatedUser.isPhoneVerified
            },
            message: 'Profile updated successfully'
        });

    } catch (error) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
