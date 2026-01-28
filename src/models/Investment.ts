import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvestment extends Document {
    user_id: mongoose.Types.ObjectId;
    name: string;
    type: 'SIP' | 'MutualFund' | 'Stock' | 'NPS' | 'FD' | 'Gold' | 'Crypto' | 'Other';
    currentAmount: number;
    startDate: Date;
    autoIncreaseAmount?: number;
    autoIncreaseFrequency?: 'monthly' | 'quarterly' | 'half-yearly' | 'yearly' | 'one-time';
    lastAutoUpdate?: Date;
    created_at: Date;
    updated_at: Date;
}

const InvestmentSchema: Schema<IInvestment> = new Schema(
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
        type: {
            type: String,
            enum: ['SIP', 'MutualFund', 'Stock', 'NPS', 'FD', 'Gold', 'Crypto', 'Other'],
            default: 'Other'
        },
        currentAmount: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        autoIncreaseAmount: {
            type: Number,
            default: 0
        },
        autoIncreaseFrequency: {
            type: String,
            enum: ['monthly', 'quarterly', 'half-yearly', 'yearly', 'one-time'],
            default: 'monthly'
        },
        lastAutoUpdate: {
            type: Date
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

const Investment: Model<IInvestment> = mongoose.models.Investment || mongoose.model<IInvestment>('Investment', InvestmentSchema);

export default Investment;
