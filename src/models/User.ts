import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBankAccount {
    _id: string;
    name: string;
    type: 'bank' | 'wallet' | 'card' | 'cash';
    balance: number;
    creditLimit?: number;
    billingDate?: number;
}

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    phone?: string;
    bankAccounts: IBankAccount[];
    user_upi_id?: string;
    isPublic: boolean;
    shareToken?: string;
    created_at: Date;
    updated_at: Date;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name'],
            maxlength: [60, 'Name cannot be more than 60 characters'],
        },
        email: {
            type: String,
            required: [true, 'Please provide an email'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String, // Hashed password
            select: false, // Do not return by default
        },
        phone: {
            type: String,
            trim: true,
        },
        image: {
            type: String,
        },
        isPublic: {
            type: Boolean,
            default: false
        },
        shareToken: {
            type: String,
            unique: true,
            sparse: true, // Allow null/undefined to be non-unique
            index: true
        },
        bankAccounts: [{
            name: String, // e.g., 'HDFC', 'SBI'
            type: { type: String, enum: ['bank', 'wallet', 'card', 'cash'], default: 'bank' },
            balance: { type: Number, default: 0 },
            creditLimit: { type: Number },
            billingDate: { type: Number }, // Day of month (1-31)
            _id: { type: Schema.Types.ObjectId, auto: true } // Give each account an ID
        }],
        user_upi_id: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    }
);

// Prevent overwrite on model compile
if (process.env.NODE_ENV === 'development') {
    // In development mode, we delete the model from the cache so that it can be
    // recompiled with the new schema changes.
    delete mongoose.models.User;
}

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
