import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Loan from '@/models/Loan';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const session = await getSessionUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();
        const loans = await Loan.find({ user_id: session.userId });
        return NextResponse.json(loans);
    } catch (error) {
        console.error('Error fetching loans:', error);
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
        const { name, type, principalAmount, interestRate, startDate, tenureMonths, repaymentType } = await req.json();

        let emiAmount = 0;
        if (repaymentType === 'emi' && interestRate > 0 && tenureMonths > 0) {
            const r = interestRate / 12 / 100;
            const n = tenureMonths;
            emiAmount = (principalAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            emiAmount = Math.round(emiAmount);
        }

        const newLoan = await Loan.create({
            user_id: session.userId,
            name,
            type,
            principalAmount: Number(principalAmount),
            interestRate: Number(interestRate),
            startDate: new Date(startDate),
            tenureMonths: Number(tenureMonths),
            repaymentType,
            emiAmount,
            paidAmount: 0
        });

        return NextResponse.json(newLoan);
    } catch (error) {
        console.error('Error creating loan:', error);
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
        const { _id, paidAmount, action } = await req.json();

        const loan = await Loan.findOne({ _id, user_id: session.userId });
        if (!loan) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        if (action === 'payment') {
            loan.paidAmount += Number(paidAmount);
            // Optional: Close loan if fully paid
            // if (loan.paidAmount >= loan.principalAmount) { ... }
        }

        await loan.save();
        return NextResponse.json(loan);
    } catch (error) {
        console.error('Error updating loan:', error);
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

        const deleted = await Loan.findOneAndDelete({ _id: id, user_id: session.userId });
        if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting loan:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
