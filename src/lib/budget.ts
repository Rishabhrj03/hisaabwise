import mongoose from 'mongoose';
import Budget from '../models/Budget';

/**
 * Ensures that a budget entry exists for the given user and category.
 * If no budget exists, one is created with a default limit of 0.
 */
export async function ensureBudgetExists(userId: string, category: string) {
    if (!category || !userId) return;

    try {
        const existingBudget = await Budget.findOne({
            user_id: userId,
            category: category
        });

        if (!existingBudget) {
            console.log(`Auto-creating budget for category: ${category}`);
            await Budget.create({
                user_id: userId,
                category: category,
                amount: 0,
                period: 'monthly'
            });
        }
    } catch (error) {
        console.error(`Error in ensureBudgetExists for category ${category}:`, error);
        // We don't throw here to avoid breaking the main expense creation/update flow
    }
}
