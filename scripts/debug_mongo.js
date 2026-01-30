/* eslint-disable */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

async function debugData() {
    console.log("1. Connecting to MongoDB...");
    console.log("URI:", process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':****@')); // Hide password

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected successfully.");
    } catch (e) {
        console.error("❌ Connection failed:", e.message);
        return;
    }

    try {
        // List Collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("2. Collections:", collections.map(c => c.name));

        // Check Users
        const users = await mongoose.connection.db.collection('users').find().toArray();
        console.log(`3. Found ${users.length} Users:`);
        users.forEach(u => console.log(`   - ${u.email} (${u._id})`));

        // Check Expenses
        const expenses = await mongoose.connection.db.collection('expenses').find().toArray();
        console.log(`4. Found ${expenses.length} Expenses:`);
        expenses.forEach(e => console.log(`   - ${e.description}: ${e.amount} (Date: ${e.date}, Type: ${typeof e.date})`));

        if (expenses.length > 0 && users.length > 0) {
            const expenseOwner = expenses[0].created_by.toString();
            const user = users.find(u => u._id.toString() === expenseOwner);
            if (user) {
                console.log(`   ✅ First expense is owned by found user: ${user.email}`);
            } else {
                console.log(`   ⚠️ First expense owner ID (${expenseOwner}) NOT found in users list.`);
            }
        }

    } catch (e) {
        console.error("❌ Error querying data:", e);
    } finally {
        await mongoose.disconnect();
        console.log("5. Disconnected.");
    }
}

debugData();
