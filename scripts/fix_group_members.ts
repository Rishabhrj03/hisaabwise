
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Group from '../src/models/Group';
import Friend from '../src/models/Friend';
import User from '../src/models/User';

dotenv.config({ path: '.env.local' });

async function fixGroupMembers() {
    console.log("🛠️ STARTING GROUP MEMBER FIX MIGRATION");

    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        const groups = await Group.find({});

        for (const group of groups) {
            console.log(`\nProcessing Group: "${group.name}" (${group._id})`);
            let modified = false;
            const newMembers = [];

            for (const memberId of group.members) {
                // Check if this ID exists in Users
                const userExists = await User.exists({ _id: memberId });
                if (userExists) {
                    newMembers.push(memberId);
                    continue; // valid user
                }

                // If not user, check if it is a Friend
                const friend = await Friend.findById(memberId);
                if (friend) {
                    console.log(`   ⚠️ Found Member ID ${memberId} is a FRIEND.`);
                    if (friend.linked_user_id) {
                        console.log(`      ✅ Resolving to Linked User ID: ${friend.linked_user_id}`);
                        newMembers.push(friend.linked_user_id);
                        modified = true;
                    } else {
                        console.log(`      ❌ Friend has NO linked_user_id. Keeping as is (Ghost member).`);
                        newMembers.push(memberId);
                    }
                } else {
                    console.log(`   ❓ Member ID ${memberId} not found in Users OR Friends. Keeping as is.`);
                    newMembers.push(memberId);
                }
            }

            if (modified) {
                // Deduplicate in case resolution caused duplicates
                const uniqueMembers = Array.from(new Set(newMembers.map(id => id.toString())))
                    .map(id => new mongoose.Types.ObjectId(id));

                group.members = uniqueMembers;
                await group.save();
                console.log(`   💾 SAVED Group "${group.name}" with updated members.`);
            } else {
                console.log(`   Example: No changes needed.`);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

fixGroupMembers();
