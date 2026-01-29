require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const DEFAULT_ICONS = {
    'Food': '🍔',
    'Transport': '🚗',
    'Shopping': '🛍️',
    'Entertainment': '🎬',
    'Bills': '🧾',
    'Health': '🏥',
    'Salary': '💰',
    'Other': '📦',
    'Travel': '✈️',
    'Education': '🎓',
    'Groceries': '🛒',
    'Gym': '💪',
    'Rent': '🏠',
    'Utilities': '💡',
    'Wifi': '📶',
    'Phone': '📱',
    'Dining': '🍽️',
    'Investments': '📈',
    'Gift': '🎁'
};

const categorySchema = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    name: String,
    color: String,
    icon: String,
    is_default: Boolean
}, { strict: false });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

async function migrateIcons() {
    try {
        if (!process.env.MONGODB_URI) throw new Error("No MONGODB_URI");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");

        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories.`);

        let updatedCount = 0;
        for (const cat of categories) {
            // Update if icon is missing OR if it is the default tag '🏷️'
            if (!cat.icon || cat.icon === '🏷️') {
                const newIcon = DEFAULT_ICONS[cat.name] || '🏷️';
                if (newIcon !== '🏷️' && newIcon !== cat.icon) {
                    cat.icon = newIcon;
                    await cat.save();
                    console.log(`Updated '${cat.name}' to ${newIcon}`);
                    updatedCount++;
                }
            }
        }

        console.log(`Migration complete. Updated ${updatedCount} categories.`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

migrateIcons();
