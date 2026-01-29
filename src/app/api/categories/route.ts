import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { getSessionUser } from '@/lib/auth';

const DEFAULT_CATEGORIES = [
    { name: 'Food', color: '#FF5733', icon: '🍔', is_default: true },         // Orange/Red
    { name: 'Transport', color: '#3498DB', icon: '🚗', is_default: true },    // Blue
    { name: 'Shopping', color: '#9B59B6', icon: '🛍️', is_default: true },     // Purple
    { name: 'Entertainment', color: '#F1C40F', icon: '🎬', is_default: true },// Yellow
    { name: 'Bills', color: '#E74C3C', icon: '🧾', is_default: true },        // Red
    { name: 'Health', color: '#2ECC71', icon: '🏥', is_default: true },       // Green
    { name: 'Salary', color: '#1ABC9C', icon: '💰', is_default: true },       // Teal
    { name: 'Other', color: '#808080', icon: '📦', is_default: true }         // Grey (Reserved)
];

export async function GET(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        let categories = await Category.find({ user_id: session.userId }).sort({ name: 1 });

        // Seed defaults if empty
        if (categories.length === 0) {
            const seedOps = DEFAULT_CATEGORIES.map(cat => ({
                user_id: session.userId,
                ...cat
            }));
            categories = await Category.create(seedOps);
        }

        return NextResponse.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, color, icon } = await req.json();
        if (!name || !color) {
            return NextResponse.json({ error: 'Name and Color are required' }, { status: 400 });
        }

        await dbConnect();

        // Check if exists
        const exists = await Category.findOne({ user_id: session.userId, name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (exists) {
            return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
        }

        const newCategory = await Category.create({
            user_id: session.userId,
            name,
            color,
            icon: icon || '🏷️',
            is_default: false
        });

        return NextResponse.json(newCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, name, color, icon } = await req.json();
        if (!id || !name || !color) {
            return NextResponse.json({ error: 'ID, Name and Color are required' }, { status: 400 });
        }

        await dbConnect();

        const category = await Category.findOne({ _id: id, user_id: session.userId });
        if (!category) {
            return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
        }

        // Prevent renaming to existing category (excluding self)
        const exists = await Category.findOne({
            user_id: session.userId,
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            _id: { $ne: id }
        });

        if (exists) {
            return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
        }

        category.name = name;
        category.color = color;
        if (icon) category.icon = icon;
        await category.save();

        return NextResponse.json(category);

    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await dbConnect();

        const category = await Category.findOne({ _id: id, user_id: session.userId });
        if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (category.name === 'Other') {
            return NextResponse.json({ error: 'Cannot delete the "Other" category' }, { status: 403 });
        }

        await Category.deleteOne({ _id: id });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
