
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import Friend from '../src/models/Friend';

dotenv.config({ path: '.env.local' });

async function checkFriend() {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        const targetId = '6984b541cc9ae8c38302a2d2';
        console.log(`Checking if ID ${targetId} exists in FRIENDS collection...`);

        const friend = await Friend.findById(targetId);

        if (friend) {
            console.log("✅ FOUND IN FRIENDS!");
            console.log(friend);
        } else {
            console.log("❌ NOT FOUND in Friends collection either.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
checkFriend();
