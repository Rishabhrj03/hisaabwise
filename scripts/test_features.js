require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Define minimal schemas to avoid importing huge TS files in JS script
// This is just for quick verification
const budgetSchema = new mongoose.Schema({ user_id: mongoose.Schema.Types.ObjectId, category: String, amount: Number }, { strict: false });
const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);

const userSchema = new mongoose.Schema({ email: String, bankAccounts: Array }, { strict: false });
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function testNewFeatures() {
    try {
        if (!process.env.MONGODB_URI) throw new Error("No MONGODB_URI");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOne({});
        if (!user) {
            console.log("No user found to attach data to.");
            return;
        }
        console.log(`Using user: ${user.email} (${user._id})`);

        // Test Budget Creation
        console.log("Creating Test Budget...");
        await Budget.deleteMany({ category: 'TestCategory' }); // cleanup
        const budget = await Budget.create({
            user_id: user._id,
            category: 'TestCategory',
            amount: 5000,
            period: 'monthly'
        });
        console.log("✅ Budget Created:", budget);

        // Test Bank Account Update
        console.log("Updating User Bank Accounts...");
        user.bankAccounts.push({ name: 'Test Bank', type: 'bank', balance: 10000 });
        await user.save();
        console.log("✅ User updated with bank account");

        // Fetch back to verify
        const updatedUser = await User.findById(user._id);
        console.log("User Bank Accounts:", updatedUser.bankAccounts);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

testNewFeatures();
