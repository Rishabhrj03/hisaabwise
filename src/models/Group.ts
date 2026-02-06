import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGroup extends Document {
    name: string;
    created_by: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
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
            required: true,
            index: true
        },
        members: [{
            type: Schema.Types.ObjectId,
            ref: 'User',
            index: true
        }]
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

// Prevent overwrite on model compile
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models.Group;
}

const Group: Model<IGroup> = mongoose.models.Group || mongoose.model<IGroup>('Group', GroupSchema);

export default Group;
