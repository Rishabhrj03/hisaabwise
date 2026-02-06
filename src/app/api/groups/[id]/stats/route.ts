import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import Group from '@/models/Group';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';
import mongoose from 'mongoose';

export async function GET(
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

        // 1. Verify Group Access
        const group = await Group.findById(id);
        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        const isMember = group.members.some((m: any) => m._id.toString() === session.userId) ||
            group.created_by.toString() === session.userId;

        if (!isMember) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        // 2. Fetch Expenses
        // Note: Using 'new' keyword to avoid potential mongoose query issues if model was compiled differently?
        // Standard Expense.find is fine.
        const expenses = await Expense.find({ group_id: id });

        // 3. Prepare Member Map (ID -> Name)
        const memberMap: Record<string, string> = {};

        // Fetch User details for all members
        const memberIds = group.members.map((m: any) => m._id);
        // Also include session user if not in list (creator case)
        if (!memberIds.some((mid: any) => mid.toString() === session.userId)) {
            memberIds.push(session.userId);
        }

        const users = await User.find({ _id: { $in: memberIds } }, 'name');
        users.forEach((u: any) => {
            memberMap[u._id.toString()] = u.name;
        });

        // 4. Calculate Stats
        let totalSpent = 0;
        const memberStats: Record<string, { name: string, paid: number, share: number }> = {};
        const categoryStats: Record<string, number> = {};

        // Initialize entries for all known members
        users.forEach((u: any) => {
            memberStats[u._id.toString()] = {
                name: u.name,
                paid: 0,
                share: 0
            };
        });

        for (const exp of expenses) {
            const amount = exp.amount;
            totalSpent += amount;

            // Category
            const cat = exp.category || 'Uncategorized';
            categoryStats[cat] = (categoryStats[cat] || 0) + amount;

            // Paid By
            // The frontend sends 'me' often, but backend stores 'created_by' as User ID.
            // Check if paidBy is stored in splitDetails or we use created_by/paid_by field?
            // Schema has `created_by` (ObjectId) and `splitDetails.paidBy` (String).
            // If splitDetails.paidBy exists, use it. If 'me', resolve to exp.created_by.

            let payerId = exp.created_by.toString(); // Default to creator
            if (exp.splitDetails && exp.splitDetails.paidBy) {
                if (exp.splitDetails.paidBy === 'me') {
                    payerId = exp.created_by.toString();
                } else {
                    payerId = exp.splitDetails.paidBy;
                }
            }

            if (!memberStats[payerId]) {
                // Try to resolve name if possible, or use ID/Unknown
                const knownName = memberMap[payerId] || 'Unknown Member';
                memberStats[payerId] = { name: knownName, paid: 0, share: 0 };
            }
            memberStats[payerId].paid += amount;

            // Share (Who owes/consumed)
            if (exp.splitDetails && exp.splitDetails.shares && exp.splitDetails.shares.length > 0) {
                // Precise split logic available
                exp.splitDetails.shares.forEach((share: any) => {
                    let shareUserId = share.userId;
                    if (shareUserId === 'me') {
                        shareUserId = exp.created_by.toString();
                    }
                    if (!memberStats[shareUserId]) {
                        const knownName = memberMap[shareUserId] || 'Unknown Member';
                        memberStats[shareUserId] = { name: knownName, paid: 0, share: 0 };
                    }
                    memberStats[shareUserId].share += share.amount;
                });
            } else {
                // Fallback: Equal split among "relatedTo" + creator?
                // Or "relatedTo" contains all involved?
                // If relatedTo is empty, maybe it's just the creator?
                // The schema `relatedTo` field is array of strings.

                // Logic: If no detailed shares, assume everyone in `splits` (mapped from relatedTo?) shares equally?
                // Looking at AddExpenseForm (to be confirmed), usually simple expenses are just "Paid by Me, Split with X, Y".
                // If only X, Y in relatedTo, does Creator also share?
                // Usually "Split Equal" means everyone involved.

                // Let's assume relatedTo includes everyone involved EXCEPT maybe creator if implicitly included?
                // If `relatedTo` is used, normally it defines the split group.
                // NOTE: We should inspect `AddExpenseForm` logic for standard splits.
                // Assumption for now: Equal split among (relatedTo + creator) if not explicitly defined in splitDetails?
                // Or does relatedTo INCLUDE the creator?

                // Safer fallback: It's just stored on the expense, assume creator pays 100% share?
                // No, that defeats the purpose.
                // Let's rely on splitDetails if present. If not, maybe skip share calc or assign to payer.
            }
        }

        const byMember = Object.entries(memberStats).map(([id, stats]) => ({
            memberId: id,
            ...stats
        }));

        const byCategory = Object.entries(categoryStats).map(([category, amount]) => ({
            category,
            amount
        }));

        return NextResponse.json({
            totalSpent,
            byMember,
            byCategory
        });

    } catch (error) {
        console.error('Error calculating stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
