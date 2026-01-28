import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILoan extends Document {
    user_id: mongoose.Types.ObjectId;
    name: string;
    type: 'borrowed' | 'lent';
    principalAmount: number;
    interestRate: number; // Yearly %
    startDate: Date;
    tenureMonths: number;
    repaymentType: 'emi' | 'one-time';
    paidAmount: number;
    emiAmount?: number;
    created_at: Date;
    updated_at: Date;
}

const LoanSchema: Schema<ILoan> = new Schema(
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
            enum: ['borrowed', 'lent'],
            required: true
        },
        principalAmount: {
            type: Number,
            required: true
        },
        interestRate: {
            type: Number,
            default: 0
        },
        startDate: {
            type: Date,
            default: Date.now
        },
        tenureMonths: {
            type: Number,
            default: 12
        },
        repaymentType: {
            type: String,
            enum: ['emi', 'one-time'],
            default: 'one-time'
        },
        paidAmount: {
            type: Number,
            default: 0
        },
        emiAmount: {
            type: Number
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

const Loan: Model<ILoan> = mongoose.models.Loan || mongoose.model<ILoan>('Loan', LoanSchema);

export default Loan;
