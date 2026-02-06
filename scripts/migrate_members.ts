
import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import dbConnect from '../src/lib/db';
import Group from '../src/models/Group';

dotenv.config({ path: '.env.local' });

async function migrate() {
    console.log("🚀 Starting Aggressive Migration: Converting String Members to ObjectIds...");

    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("✅ Connected to MongoDB");

        const groups = await Group.find({});
        console.log(`Found ${groups.length} groups to check.`);

        let updatedCount = 0;

        for (const group of groups) {
            // Force strict ObjectId conversion
            const oldMembers = [...group.members];

            group.members = group.members.map((m: any) => new mongoose.Types.ObjectId(m.toString()));

            if (group.created_by) {
                group.created_by = new mongoose.Types.ObjectId(group.created_by.toString());
            }

            // Explicitly tell Mongoose these fields changed
            group.markModified('members');
            group.markModified('created_by');

            await group.save();
            console.log(`   ✅ Enforced ObjectId for Group: ${group.name}`);
            updatedCount++;
        }

        console.log(`\n🎉 Migration Complete! Updated ${updatedCount} groups.`);

    } catch (error) {
        console.error("❌ Migration Failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

migrate();
