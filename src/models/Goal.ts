import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGoal extends Document {
    user_id: mongoose.Types.ObjectId;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: Date;
    color?: string; // For UI visualization
    created_at: Date;
    updated_at: Date;
}

const GoalSchema: Schema<IGoal> = new Schema(
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
        targetAmount: {
            type: Number,
            required: true
        },
        currentAmount: {
            type: Number,
            default: 0
        },
        deadline: {
            type: Date
        },
        color: {
            type: String,
            default: '#4F46E5' // Default indigo
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

const Goal: Model<IGoal> = mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);

export default Goal;
