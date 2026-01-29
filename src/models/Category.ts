import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
    user_id: mongoose.Types.ObjectId;
    name: string;
    color: string;
    icon?: string;
    is_default: boolean; // If true, it was a system default. 
    created_at: Date;
    updated_at: Date;
}

const CategorySchema: Schema<ICategory> = new Schema(
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
        color: {
            type: String, // Hex code like #FF5733
            required: true,
            default: '#808080'
        },
        icon: {
            type: String, // Emoji character or icon name
            required: false,
            default: '🏷️'
        },
        is_default: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

// Prevent duplicates for same user
CategorySchema.index({ user_id: 1, name: 1 }, { unique: true });

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
