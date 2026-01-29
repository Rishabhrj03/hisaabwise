import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISplitShare {
    userId: string; // 'me' or friendId. Note: In MongODB we might want to store ObjectIds, but for now keeping string to match frontend types if possible, or we migrate.
    amount: number;
}

export interface IExpense extends Document {
    description: string;
    amount: number;
    date: Date;
    type: 'income' | 'expense' | 'transfer';
    category: string;
    created_by: mongoose.Types.ObjectId; // User ID
    group_id?: mongoose.Types.ObjectId;

    // Splitwise features
    // We can embed split details
    splitDetails?: {
        paidBy: string; // 'me' or friendId
        shares: ISplitShare[];
    };
    relatedTo: string[]; // IDs of friends involved
}

const ExpenseSchema: Schema<IExpense> = new Schema(
    {
        description: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            required: true
        },
        date: {
            type: Date,
            default: Date.now,
            required: true
        },
        type: {
            type: String,
            enum: ['income', 'expense', 'transfer'],
            required: true
        },
        category: {
            type: String,
            required: true
        },
        created_by: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        group_id: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
        },
        splitDetails: {
            paidBy: String,
            shares: [{
                userId: String,
                amount: Number,
                _id: false
            }]
        },
        relatedTo: [String] // Keeping as strings for now to support non-user friends if that was the case, or mixed IDs
    },
    {
        timestamps: true
    }
);

// Index for faster queries by user
ExpenseSchema.index({ created_by: 1, date: -1 });

const Expense: Model<IExpense> = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
