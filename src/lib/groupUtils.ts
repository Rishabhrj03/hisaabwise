
import mongoose from 'mongoose';
import Friend from '@/models/Friend';

/**
 * Resolves a list of potential Member IDs (which might be User IDs or Friend IDs)
 * into a list of confirmed User ObjectIds.
 * 
 * If an ID corresponds to a Friend document with a linked_user_id, the linked_user_id is used.
 * Otherwise, the original ID is preserved (assuming it's a direct User ID).
 */
export async function resolveMemberIds(ids: string[]): Promise<mongoose.Types.ObjectId[]> {
    const resolvedIds = new Set<string>();

    for (const id of ids) {
        if (!id) continue;

        // If it's a valid ObjectId, check if it's a Friend
        if (mongoose.Types.ObjectId.isValid(id)) {
            try {
                // We use findById. If it fails (not a friend), it returns null.
                // Note: If ID matches a USER but not a FRIEND, findById(Friend) returns null.
                // This is safe because Friend and User are different collections.
                // EXCEPT if a Friend ID accidentally collides with a User ID (extremely unlikely with ObjectIds).
                const friend = await Friend.findById(id);
                if (friend && friend.linked_user_id) {
                    resolvedIds.add(friend.linked_user_id.toString());
                    continue;
                }
            } catch (err) {
                // Ignore errors, verify as User ID
            }
        }

        // Default: Assume it is a User ID
        resolvedIds.add(id);
    }

    return Array.from(resolvedIds).map(id => new mongoose.Types.ObjectId(id));
}
