require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    name: String,
    color: String,
    icon: String, // verification target
    is_default: Boolean
}, { strict: false });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const userSchema = new mongoose.Schema({ email: String }, { strict: false });
const User = mongoose.models.User || mongoose.model('User', userSchema);

async function verifyCategoryIcons() {
    try {
        if (!process.env.MONGODB_URI) throw new Error("No MONGODB_URI");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOne({});
        if (!user) {
            console.log("No user found.");
            return;
        }

        const testName = 'IconTestCategory_' + Date.now();
        const testIcon = '🚀';

        console.log(`Creating category '${testName}' with icon ${testIcon}`);
        const newCat = await Category.create({
            user_id: user._id,
            name: testName,
            color: '#FF0000',
            icon: testIcon,
            is_default: false
        });

        console.log("Saved Category:", newCat);

        // Fetch back
        const fetched = await Category.findById(newCat._id);
        if (fetched.icon === testIcon) {
            console.log("✅ SUCCESS: Icon was saved and retrieved correctly.");
        } else {
            console.error("❌ FAILURE: Icon mismatch. Got:", fetched.icon);
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

verifyCategoryIcons();
