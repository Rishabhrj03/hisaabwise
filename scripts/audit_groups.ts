
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import User from '../src/models/User';
import Group from '../src/models/Group';

dotenv.config({ path: '.env.local' });

async function audit() {
    console.log("🔍 STARTING DATABASE AUDIT");

    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("✅ Connected to MongoDB");

        // 1. Dump All Users
        const users = await User.find({});
        console.log(`\n📋 FOUND ${users.length} USERS:`);
        users.forEach(u => {
            console.log(`   - ${u.name} (${u.email}) -> ID: ${u._id} (Type: ${typeof u._id})`);
        });

        // 2. Dump All Groups
        const groups = await Group.find({});
        console.log(`\n📋 FOUND ${groups.length} GROUPS:`);

        for (const g of groups) {
            console.log(`\n   Group: "${g.name}" (${g._id})`);
            console.log(`   Created By: ${g.created_by} (Type: ${typeof g.created_by})`);
            console.log(`   Raw Members Array:`, g.members);

            // Check each member
            console.log(`   Checking Members:`);
            for (const mId of g.members) {
                const idString = mId.toString();
                const userExists = users.find(u => u._id.toString() === idString);

                const isObjectId = mId instanceof mongoose.Types.ObjectId;

                console.log(`      - MemberID: ${idString}`);
                console.log(`        Type Is ObjectId? ${isObjectId}`);
                console.log(`        Matches a User? ${userExists ? "✅ Yes: " + userExists.name : "❌ NO MATCH IN USERS COLLECTION"}`);
            }

            // Simulate Visibility Query for each user
            console.log(`   Visibility Check:`);
            for (const u of users) {
                // Determine if this user SHOULD see this group
                // Logic: Created by user OR Member of group

                const userIdStr = u._id.toString();
                const isCreator = g.created_by.toString() === userIdStr;
                const isMember = g.members.some((m: any) => m.toString() === userIdStr);

                if (isCreator || isMember) {
                    console.log(`      User ${u.name} (${userIdStr}) SHOULD see this group.`);

                    // Run Actual Query
                    const qObj = new mongoose.Types.ObjectId(userIdStr);
                    const found = await Group.find({
                        $or: [
                            { created_by: qObj },
                            { members: qObj }
                        ],
                        _id: g._id
                    });

                    if (found.length > 0) {
                        console.log(`          ✅ API Query SUCCEEDS for ${u.name}`);
                    } else {
                        console.log(`          ❌ API Query FAILS for ${u.name} (Why??)`);

                        // Debug Failure
                        const matchCreator = await Group.find({ created_by: qObj, _id: g._id });
                        const matchMember = await Group.find({ members: qObj, _id: g._id });
                        console.log(`             - Match Creator Part: ${matchCreator.length > 0}`);
                        console.log(`             - Match Member Part: ${matchMember.length > 0}`);
                    }

                }
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

audit();
