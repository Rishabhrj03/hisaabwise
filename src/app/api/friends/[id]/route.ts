import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Friend from '@/models/Friend';
import { getSessionUser } from '@/lib/auth';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();
        const friend = await Friend.findOneAndDelete({
            _id: id,
            user_id: session.userId
        });

        if (!friend) {
            return NextResponse.json({ error: 'Friend not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting friend:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();

        await dbConnect();

        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.upi_id !== undefined) updateData.upi_id = body.upi_id;

        const friend = await Friend.findOneAndUpdate(
            { _id: id, user_id: session.userId },
            { $set: updateData },
            { new: true }
        );

        if (!friend) {
            return NextResponse.json({ error: 'Friend not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json(friend);
    } catch (error) {
        console.error('Error updating friend:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
