import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBudget extends Document {
    user_id: mongoose.Types.ObjectId;
    category: string;
    amount: number; // The limit
    period: 'monthly' | 'yearly';
    created_at: Date;
    updated_at: Date;
}

const BudgetSchema: Schema<IBudget> = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        category: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true
        },
        period: {
            type: String,
            enum: ['monthly', 'yearly'],
            default: 'monthly'
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

// Ensure one budget per category per user
BudgetSchema.index({ user_id: 1, category: 1 }, { unique: true });

const Budget: Model<IBudget> = mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);

export default Budget;
