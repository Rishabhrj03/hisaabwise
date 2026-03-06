import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivity extends Document {
    user: mongoose.Types.ObjectId; // User who performed the action
    action: 'added' | 'updated' | 'deleted';
    type: 'expense' | 'group' | 'friend';
    targetName: string; // e.g. "Lunch", "Trip to Paris"
    targetId: mongoose.Types.ObjectId;
    amount?: number;
    group_id?: mongoose.Types.ObjectId;
    created_at: Date;
}

const ActivitySchema: Schema<IActivity> = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        action: {
            type: String,
            enum: ['added', 'updated', 'deleted'],
            required: true
        },
        type: {
            type: String,
            enum: ['expense', 'group', 'friend'],
            required: true,
            default: 'expense'
        },
        targetName: {
            type: String,
            required: true
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        amount: {
            type: Number
        },
        group_id: {
            type: Schema.Types.ObjectId,
            ref: 'Group'
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: false }
    }
);

// Index for fast retrieval
ActivitySchema.index({ user: 1, created_at: -1 });
ActivitySchema.index({ group_id: 1, created_at: -1 });

const Activity: Model<IActivity> = mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
