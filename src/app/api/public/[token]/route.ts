import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Expense from '@/models/Expense';
import Category from '@/models/Category';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        await dbConnect();
        const { token } = await params;

        // Find user by share token and ensure isPublic is true
        const user = await User.findOne({ shareToken: token, isPublic: true }).select('name _id');

        if (!user) {
            return NextResponse.json({ message: 'Dashboard not found or private' }, { status: 404 });
        }

        // Fetch data for this user
        // Note: For public view, we might want to filter out sensitive details if any
        // But for this MVP, we show standard dashboard data
        const expenses = await Expense.find({ created_by: user._id }).sort({ date: -1 });
        const categories = await Category.find({ user_id: user._id });

        return NextResponse.json({
            user: { name: user.name },
            expenses,
            categories
        });

    } catch (error) {
        console.error('Public Fetch Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
