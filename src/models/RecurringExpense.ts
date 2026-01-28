import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRecurringExpense extends Document {
    user_id: mongoose.Types.ObjectId;
    name: string;
    amount: number;
    category: string;
    frequency: 'monthly' | 'yearly';
    nextDueDate: Date;
    isAutoDebit: boolean;
    created_at: Date;
    updated_at: Date;
}

const RecurringExpenseSchema: Schema<IRecurringExpense> = new Schema(
    {
        user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true
        },
        category: {
            type: String,
            default: 'Bills'
        },
        frequency: {
            type: String,
            enum: ['monthly', 'yearly'],
            default: 'monthly'
        },
        nextDueDate: {
            type: Date,
            required: true
        },
        isAutoDebit: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

const RecurringExpense: Model<IRecurringExpense> = mongoose.models.RecurringExpense || mongoose.model<IRecurringExpense>('RecurringExpense', RecurringExpenseSchema);

export default RecurringExpense;
