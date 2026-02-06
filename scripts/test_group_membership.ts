
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from '../src/models/User';
import Group from '../src/models/Group';

dotenv.config({ path: '.env.local' });

async function runTest() {
    console.log("🚀 Starting Group Membership Test...");
    let connection;

    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        connection = mongoose.connection;
        console.log("✅ Connected to MongoDB");

        // 1. Setup Data
        const suffix = Date.now();
        const creatorEmail = `creator_${suffix}@test.com`;
        const member1Email = `memberA_${suffix}@test.com`;
        const member2Email = `memberB_${suffix}@test.com`;

        const creator = await User.create({ name: 'Creator', email: creatorEmail, password: 'pw', isEmailVerified: true, termsAccepted: true });
        const member1 = await User.create({ name: 'Member A', email: member1Email, password: 'pw', isEmailVerified: true, termsAccepted: true });
        const member2 = await User.create({ name: 'Member B', email: member2Email, password: 'pw', isEmailVerified: true, termsAccepted: true });

        console.log("✅ Users Created");

        // 2. Create Group
        let group = await Group.create({
            name: `Test Group ${suffix}`,
            created_by: creator._id,
            members: [creator._id]
        });
        console.log(`✅ Group Created: ${group._id} with members: ${group.members}`);

        // TEST CASE 1: Add Member (Simulate PATCH /api/groups/[id])
        console.log("\n🧪 TEST 1: Adding Member A directly (PATCH)");

        // Simulation of what the frontend might be sending. 
        // If frontend sends [creatorId, member1Id], it should work.
        // If frontend sends [member1Id] only... it might overwrite.
        const newMembersList = [creator._id.toString(), member1._id.toString()];

        // Simulating the PATCH logic:
        // body.members = body.memberIds;
        // Group.findByIdAndUpdate(id, { $set: body })

        group = await Group.findByIdAndUpdate(
            group._id,
            { $set: { members: newMembersList.map(id => new mongoose.Types.ObjectId(id)) } },
            { new: true }
        ) as any;

        const hasMember1 = group.members.some((m: any) => m.toString() === member1._id.toString());
        if (hasMember1 && group.members.length === 2) {
            console.log("   ✅ Member A added successfully. Count: 2");
        } else {
            console.error(`   ❌ Failed to add Member A. Count: ${group.members.length}, Has Member A: ${hasMember1}`);
        }

        // TEST CASE 2: Join via Link (Simulate POST /api/groups/[id]/join)
        console.log("\n🧪 TEST 2: Member B joins via Link (POST /join)");

        // Logic from src/app/api/groups/[id]/join/route.ts
        // 1. Fetch group
        let groupForJoin = await Group.findById(group._id);

        // 2. Check if already member (Strict ObjectId check)
        const isMember = groupForJoin?.members.some((m: any) => m.toString() === member2._id.toString());

        if (!isMember) {
            // 3. Push new member
            groupForJoin?.members.push(member2._id);
            await groupForJoin?.save();
            console.log("   ✅ Joined successfully via code simulation");
        } else {
            console.log("   ⚠️ Member B already in group (Unexpected for new test)");
        }

        // 3. Verify Final Count
        const finalGroup = await Group.findById(group._id);
        console.log(`   Final Member Count: ${finalGroup?.members.length}`);

        const hasCreator = finalGroup?.members.some((m: any) => m.toString() === creator._id.toString());
        const hasA = finalGroup?.members.some((m: any) => m.toString() === member1._id.toString());
        const hasB = finalGroup?.members.some((m: any) => m.toString() === member2._id.toString());

        if (finalGroup?.members.length === 3 && hasCreator && hasA && hasB) {
            console.log("   ✅ SUCCESS: All users present.");
        } else {
            console.error("   ❌ FAILURE: Missing users.");
            console.log(`      Has Creator: ${hasCreator}`);
            console.log(`      Has Member A: ${hasA}`);
            console.log(`      Has Member B: ${hasB}`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

runTest();
