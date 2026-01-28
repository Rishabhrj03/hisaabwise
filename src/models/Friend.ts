import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFriend extends Document {
    user_id: mongoose.Types.ObjectId; // The user who added this friend
    name: string;
    phone?: string;
    linked_user_id?: mongoose.Types.ObjectId; // If this friend is linked to a real user
    created_at: Date;
}

const FriendSchema: Schema<IFriend> = new Schema(
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
        phone: {
            type: String,
            trim: true
        },
        linked_user_id: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

// Index to quickly find a user's friends
FriendSchema.index({ user_id: 1 });

const Friend: Model<IFriend> = mongoose.models.Friend || mongoose.model<IFriend>('Friend', FriendSchema);

export default Friend;
