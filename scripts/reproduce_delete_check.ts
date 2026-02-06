
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Friend from '../src/models/Friend';
import Group from '../src/models/Group';
import User from '../src/models/User';

dotenv.config({ path: '.env.local' });

async function debugDelete() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("🔍 DEBUGGING DELETE CHECK");

        // 1. Find a scenario: A User who has a Friend, and that Friend is in a Group.
        // Let's iterate all friends and check.
        const friends = await Friend.find({});

        for (const f of friends) {
            // Check if this friend is in any group
            const idsToCheck = [f._id];
            if (f.linked_user_id) idsToCheck.push(f.linked_user_id);

            // Scope to groups "related" to the friend owner? 
            // The route implementation used `Group.findOne({ members: { $in: idsToCheck } })` (Global check?!)
            // Wait, if I delete a friend, and they are in a group I AM NOT IN (but they are a real user), 
            // should I be blocked?
            // If `linked_user_id` is set, they are a real user. Real users can be in many groups.
            // If I delete my "pointer" to them (Friend record), it shouldn't matter if they are in OTHER people's groups.
            // It ONLY matters if they are in groups **I** am in, or groups **I** created?
            // Or maybe the user implies "I added them to a group, now I can't delete them".

            // Let's check the EXACT logic from current route:
            const group = await Group.findOne({
                members: { $in: idsToCheck }
            });

            if (group) {
                console.log(`\nfound match! Friend: ${f.name} (${f._id})`);
                console.log(`   Linked User: ${f.linked_user_id}`);
                console.log(`   Found in Group: "${group.name}" (${group._id})`);
                console.log(`   Group Members:`, group.members);

                // Only print if this is relevant to our testing (maybe specific names?)
                // console.log("   --- THIS FRIEND SHOULD BE BLOCKED FROM DELETION ---");
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

debugDelete();
