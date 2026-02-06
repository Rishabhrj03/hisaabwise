
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from '../src/models/User';
import Group from '../src/models/Group';
import Expense from '../src/models/Expense';

dotenv.config({ path: '.env.local' });

async function runTest() {
    console.log("🚀 Starting Comprehensive E2E Test...");

    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("✅ Connected to MongoDB");

        // 1. Setup Users
        const creatorEmail = `creator_${Date.now()}@test.com`;
        const memberEmail = `member_${Date.now()}@test.com`;

        const creator = await User.create({
            name: 'Creator User',
            email: creatorEmail,
            password: 'password123',
            isEmailVerified: true,
            termsAccepted: true
        });

        const member = await User.create({
            name: 'Member User',
            email: memberEmail,
            password: 'password123',
            isEmailVerified: true,
            termsAccepted: true
        });

        console.log(`✅ Created Users: Creator (${creator._id}), Member (${member._id})`);

        // 2. Create Group (Simulating API POST - passing STRINGS)
        // The API receives strings from JSON body.
        const groupData = {
            name: `E2E Group ${Date.now()}`,
            created_by: creator._id.toString(), // String
            members: [creator._id.toString(), member._id.toString()] // Strings
        };

        const group = await Group.create(groupData);
        console.log(`✅ Created Group: ${group.name} (${group._id})`);

        // Verify Storage Type
        const storedGroup = await Group.findById(group._id);
        const memberType = typeof storedGroup?.members[0];
        console.log(`   Stored Member Type: ${memberType} (Should be object)`);
        console.log(`   Detailed Member[0]:`, storedGroup?.members[0]);
        console.log(`   Is ObjectId instance? ${storedGroup?.members[0] instanceof mongoose.Types.ObjectId}`);

        if (!(storedGroup?.members[0] instanceof mongoose.Types.ObjectId)) {
            console.error('❌ CRITICAL: Group members NOT stored as ObjectIds!');
            // This would explain why stringent queries fail.
        }

        // 3. Member adds an expense (Simulating API POST)
        const expenseData = {
            description: 'E2E Dinner',
            amount: 100,
            date: new Date(),
            type: 'expense',
            category: 'Food',
            created_by: member._id.toString(),
            group_id: group._id.toString(), // String from frontend
            splitDetails: {
                paidBy: member._id.toString(),
                shares: [
                    { userId: member._id.toString(), amount: 50 },
                    { userId: creator._id.toString(), amount: 50 }
                ]
            }
        };

        const expense = await Expense.create(expenseData);
        console.log(`✅ Expense Created: ${expense._id}`);

        // Verify Expense Storage
        const storedExpense = await Expense.findById(expense._id);
        console.log(`   Stored GroupID Type: ${typeof storedExpense?.group_id}`);
        console.log(`   Is ObjectId? ${storedExpense?.group_id instanceof mongoose.Types.ObjectId}`);

        // 4. Simulate GET /api/expenses logic (The Strict Version)
        console.log("\n🔍 Simulating Strict GET /api/expenses...");

        const sessionUserId = creator._id.toString();
        const userIdObj = new mongoose.Types.ObjectId(sessionUserId);

        // Step 2: Find Groups
        const myGroups = await Group.find({ members: userIdObj }).select('_id');
        console.log(`   Groups found via ObjectId query: ${myGroups.length}`);

        if (myGroups.length === 0) {
            console.error("   ❌ Failed to find group using ObjectId query!");

            // Debug: Try string query
            const stringGroups = await Group.find({ members: sessionUserId }).select('_id');
            console.log(`   (Debug) Groups found via String query: ${stringGroups.length}`);
        }

        const myGroupIds = myGroups.map((g: any) => g._id);

        // Step 3: Query Expenses
        const query = {
            $or: [
                { created_by: sessionUserId },
                { group_id: { $in: myGroupIds } }
            ]
        };

        const expensesFound = await Expense.find(query);
        const found = expensesFound.some((e: any) => e._id.toString() === expense._id.toString());

        if (found) {
            console.log("   ✅ E2E SUCCESS: Expense found with strict types!");
        } else {
            console.error("   ❌ E2E FAILURE: Expense NOT found.");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
    } finally {
        // Cleanup? 
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
}

runTest();
