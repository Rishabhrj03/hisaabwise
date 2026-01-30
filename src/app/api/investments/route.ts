import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Investment from '@/models/Investment';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const investments = await Investment.find({ user_id: session.userId });

        // Lazy Auto-Update Logic
        const now = new Date();
        let updated = false;

        for (const inv of investments) {
            if (inv.autoIncreaseAmount && inv.autoIncreaseAmount > 0 && inv.autoIncreaseFrequency !== 'one-time') {
                const lastUpdate = inv.lastAutoUpdate ? new Date(inv.lastAutoUpdate) : new Date(inv.startDate || inv.created_at);

                // Determine period in milliseconds
                let periodMs = 30 * 24 * 60 * 60 * 1000; // Default monthly
                switch (inv.autoIncreaseFrequency) {
                    case 'quarterly': periodMs = 90 * 24 * 60 * 60 * 1000; break;
                    case 'half-yearly': periodMs = 180 * 24 * 60 * 60 * 1000; break;
                    case 'yearly': periodMs = 365 * 24 * 60 * 60 * 1000; break;
                }

                if (now.getTime() - lastUpdate.getTime() > periodMs) {
                    const periodsPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / periodMs);

                    if (periodsPassed > 0) {
                        inv.currentAmount += (inv.autoIncreaseAmount * periodsPassed);
                        // Update lastAutoUpdate to roughly now minus remaining time, or just 'now' to be simple.
                        // Better to set it to correct intervals to avoid drift, but simplified here:
                        inv.lastAutoUpdate = new Date(lastUpdate.getTime() + (periodsPassed * periodMs));
                        await inv.save();
                        updated = true;
                    }
                }
            }
        }

        return NextResponse.json(investments);
    } catch (error) {
        console.error('Error fetching investments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { name, type, currentAmount, autoIncreaseAmount, autoIncreaseFrequency, startDate } = await req.json();

        const newInvestment = await Investment.create({
            user_id: session.userId,
            name,
            type,
            currentAmount: Number(currentAmount),
            startDate: startDate ? new Date(startDate) : new Date(),
            autoIncreaseAmount: Number(autoIncreaseAmount || 0),
            autoIncreaseFrequency: autoIncreaseFrequency || 'monthly',
            lastAutoUpdate: new Date() // Start tracking from creation
        });

        return NextResponse.json(newInvestment);
    } catch (error) {
        console.error('Error creating investment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const { _id, name, currentAmount, autoIncreaseAmount, autoIncreaseFrequency, startDate } = await req.json();

        const updatedInvestment = await Investment.findOneAndUpdate(
            { _id, user_id: session.userId },
            {
                name,
                currentAmount: Number(currentAmount),
                startDate: new Date(startDate),
                autoIncreaseAmount: Number(autoIncreaseAmount),
                autoIncreaseFrequency
            },
            { new: true }
        );

        if (!updatedInvestment) {
            return NextResponse.json({ error: 'Investment not found' }, { status: 404 });
        }

        return NextResponse.json(updatedInvestment);
    } catch (error) {
        console.error('Error updating investment:', error);
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

        const deleted = await Investment.findOneAndDelete({ _id: id, user_id: session.userId });
        if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting investment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
