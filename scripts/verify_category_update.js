/* eslint-disable */
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    name: String,
    color: String,
    icon: String,
    is_default: Boolean
}, { strict: false });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const userSchema = new mongoose.Schema({ email: String }, { strict: false });
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function verifyCategoryUpdate() {
    try {
        if (!process.env.MONGODB_URI) throw new Error("No MONGODB_URI");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOne({});
        if (!user) {
            console.log("No user found.");
            return;
        }

        // 1. Create
        const testName = 'UpdateTest_' + Date.now();
        const initialIcon = '🚀';
        const initialColor = '#FF0000';

        console.log(`Creating category '${testName}'...`);
        const newCat = await Category.create({
            user_id: user._id,
            name: testName,
            color: initialColor,
            icon: initialIcon,
            is_default: false
        });
        console.log("Created:", newCat._id);

        // 2. Mock Update (simulating API logic)
        const updatedIcon = '✅';
        const updatedColor = '#00FF00';

        console.log(`Updating category to icon ${updatedIcon} and color ${updatedColor}...`);

        // Simulating the Mongoose logic used in API
        const categoryToUpdate = await Category.findOne({ _id: newCat._id, user_id: user._id });
        if (categoryToUpdate) {
            categoryToUpdate.color = updatedColor;
            categoryToUpdate.icon = updatedIcon;
            await categoryToUpdate.save();
            console.log("Update save complete.");
        } else {
            console.error("Category NOT found for update simulation.");
        }

        // 3. Verify
        const fetched = await Category.findById(newCat._id);
        console.log("Fetched after update:", fetched);

        if (fetched.icon === updatedIcon && fetched.color === updatedColor) {
            console.log("✅ SUCCESS: Icon and Color updated correctly.");
        } else {
            console.error("❌ FAILURE: Update mismatch.");
            console.log("Expected:", { icon: updatedIcon, color: updatedColor });
            console.log("Got:", { icon: fetched.icon, color: fetched.color });
        }

        // Cleanup
        await Category.deleteOne({ _id: newCat._id });
        console.log("Cleanup done.");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyCategoryUpdate();
