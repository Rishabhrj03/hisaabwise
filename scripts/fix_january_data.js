
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('Please define the MONGODB_URI environment variable inside .env.local');
    process.exit(1);
}

// Define minimal Schema for Expense
const ExpenseSchema = new mongoose.Schema({
    description: String,
    amount: Number,
    date: Date,
    type: String,
    category: String,
    created_by: mongoose.Schema.Types.ObjectId
});

const Expense = mongoose.models.Expense || mongoose.model('Expense', ExpenseSchema);

async function fixData() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Fix Opening Balance Date
        // Find "Opening" transaction with amount 57904
        const opening = await Expense.findOne({
            description: { $regex: /Opening/i },
            amount: 57904
        });

        if (opening) {
            console.log('Found Opening transaction:', opening);
            // Set to Jan 1st 2026
            opening.date = new Date('2026-01-01T00:00:00.000Z');
            await opening.save();
            console.log('Updated Opening date to 2026-01-01');
        } else {
            console.log('Opening transaction not found.');
        }

        // 2. Fix Wrongly Categorized Credits (Expenses -> Income)
        // A. UPI-NARENDRA... 11000
        const narendra = await Expense.findOne({
            description: { $regex: /NARENDRA/i },
            amount: 11000,
            type: 'expense'
        });

        // Note: In DB, expense amount might be stored as positive number but type='expense', 
        // OR stored as negative number. The excel showed -11000. 
        // If stored as positive with type='expense', we assume amount is 11000.
        // Let's search by description roughly.

        const transactionsToFlip = [
            { desc: 'NARENDRA', amt: 11000 },
            { desc: 'SWIGGY', amt: 405 },
            { desc: 'SWIGGY', amt: 165 },
        ];

        for (const item of transactionsToFlip) {
            // Find expense with matching description and amount
            // We ignore type for search, but check if it needs fixing
            const txs = await Expense.find({
                description: { $regex: new RegExp(item.desc, 'i') },
                amount: item.amt
            });

            for (const tx of txs) {
                if (tx.type === 'expense') {
                    console.log(`Flipping ${tx.description} (Amount: ${tx.amount}) to INCOME`);
                    tx.type = 'income';
                    await tx.save();
                } else {
                    console.log(`Transaction ${tx.description} is already ${tx.type}`);
                }
            }
        }

        console.log('Data Fix Complete.');

    } catch (error) {
        console.error('Error fixing data:', error);
    } finally {
        await mongoose.disconnect();
    }
}

fixData();
