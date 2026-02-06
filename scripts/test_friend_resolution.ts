
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from '../src/models/User';
import Group from '../src/models/Group';
import Friend from '../src/models/Friend';
import { resolveMemberIds } from '../src/lib/groupUtils';

dotenv.config({ path: '.env.local' });

async function testFriendResolution() {
    console.log("\n🧪 TESTING FRIEND ID RESOLUTION LOGIC");

    try {
        await mongoose.connect(process.env.MONGODB_URI as string);

        // 1. Create User A (Creator) & User B (Member)
        const timestamp = Date.now();
        const userA = await User.create({ name: 'Creator', email: `c_${timestamp}@test.com`, password: 'pw' });
        const userB = await User.create({ name: 'Real User', email: `r_${timestamp}@test.com`, password: 'pw' });

        // 2. Create Friend Record for User B (Linked)
        const friendRecord = await Friend.create({
            user_id: userA._id,
            name: 'Friend Representation of B',
            linked_user_id: userB._id
        });

        console.log(`   Created User A: ${userA._id}`);
        console.log(`   Created User B: ${userB._id}`);
        console.log(`   Created Friend Record: ${friendRecord._id} (Links to ${userB._id})`);

        // 3. Test Utility Directly
        console.log("\n   Testing Utility Function...");
        const inputIds = [userA._id.toString(), friendRecord._id.toString()];
        const resolved = await resolveMemberIds(inputIds);

        console.log("   Input IDs:", inputIds);
        console.log("   Resolved IDs:", resolved.map(id => id.toString()));

        const hasUserA = resolved.some(id => id.toString() === userA._id.toString());
        const hasUserB = resolved.some(id => id.toString() === userB._id.toString());
        const hasFriendId = resolved.some(id => id.toString() === friendRecord._id.toString());

        if (hasUserA && hasUserB && !hasFriendId) {
            console.log("   ✅ UTILITY SUCCESS: Resolved Friend ID to User ID correctly.");
        } else {
            console.error("   ❌ UTILITY FAILURE: Did not resolve correctly.");
            throw new Error("Utility Test Failed");
        }

    } catch (e) {
        console.error(e);
    } finally {
        // Cleanup if needed, but for now just disconnect
        await mongoose.disconnect();
    }
}

testFriendResolution();
