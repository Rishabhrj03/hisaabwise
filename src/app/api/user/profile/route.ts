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
        const { name, phone, user_upi_id } = body;

        // Basic validation
        if (!phone || phone.length !== 10) {
            return NextResponse.json({ error: 'Invalid phone number. Must be 10 digits.' }, { status: 400 });
        }

        await dbConnect();

        // Update user
        const updateData: any = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (user_upi_id !== undefined) updateData.user_upi_id = user_upi_id;

        const updatedUser = await User.findByIdAndUpdate(
            session.userId,
            updateData,
            { new: true, runValidators: true }
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
                user_upi_id: updatedUser.user_upi_id,
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
