
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
// ESM requires explicit extensions
import dbConnect from '../src/lib/db';
import User from '../src/models/User';
import Group from '../src/models/Group';
import Expense from '../src/models/Expense';

dotenv.config({ path: '.env.local' });

async function runTest() {
    console.log("🚀 Starting Group Expense Reproduction Test...");

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

        // 2. Create Group (Creator makes it, adds Member)
        const group = await Group.create({
            name: `Test Group ${Date.now()}`,
            created_by: creator._id,
            members: [creator._id, member._id] // Both are members
        });

        console.log(`✅ Created Group: ${group.name} (${group._id})`);
        console.log(`   Members: ${JSON.stringify(group.members)}`);

        // 3. Member adds an expense to the group
        const expenseData = {
            description: 'Group Dinner',
            amount: 100,
            date: new Date(),
            type: 'expense',
            category: 'Food',
            created_by: member._id, // Created by Member
            group_id: group._id,    // Linked to Group
            splitDetails: {
                paidBy: member._id.toString(),
                shares: [
                    { userId: member._id.toString(), amount: 50 },
                    { userId: creator._id.toString(), amount: 50 }
                ]
            }
        };

        const expense = await Expense.create(expenseData);
        console.log(`✅ Expense Created by Member: ${expense._id}`);
        console.log(`   Group ID on Expense: ${expense.group_id}`);

        // 4. Creator tries to fetch expenses (Simulate GET /api/expenses logic)
        console.log("\n🔍 Simulating Query for Creator...");

        // Logic from GET /api/expenses
        const sessionUserId = creator._id.toString();

        // Step 2 from API: Find groups member is in
        const userIdObj = new mongoose.Types.ObjectId(sessionUserId);
        const myGroups = await Group.find({ members: userIdObj }).select('_id');
        const myGroupIds = myGroups.map((g: any) => g._id);

        console.log(`   Creator's Group IDs found: ${myGroupIds}`);

        const isGroupFound = myGroupIds.some((id: any) => id.toString() === group._id.toString());
        if (isGroupFound) {
            console.log("   ✅ Success: The new group was found in Creator's list.");
        } else {
            console.error("   ❌ FAILURE: The new group was NOT found in Creator's list.");
        }

        // Step 3 from API: Query expenses
        const query = {
            $or: [
                { created_by: sessionUserId },
                // { relatedTo: ... } // Skipping friend logic for this test
                { group_id: { $in: myGroupIds } }
            ]
        };

        const expensesFound = await Expense.find(query);

        const targetExpense = expensesFound.find((e: any) => e._id.toString() === expense._id.toString());

        if (targetExpense) {
            console.log("   ✅ Success: Creator CAN see the group expense!");
        } else {
            console.error("   ❌ FAILURE: Creator CANNOT see the group expense.");
            console.log("   Debug: Query used:", JSON.stringify(query));
            console.log("   Debug: Total expenses found:", expensesFound.length);
        }

    } catch (error) {
        console.error("❌ Test Failed with Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
