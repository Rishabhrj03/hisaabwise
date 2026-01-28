import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    created_by: mongoose.Types.ObjectId;
    members: string[]; // Friend IDs or User IDs? Sticking to strings to match frontend "Friend" concept for now.
    created_at: Date;
}

const GroupSchema: Schema<IGroup> = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        created_by: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        members: [String] // Array of friend/user IDs
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);

export default Group;
