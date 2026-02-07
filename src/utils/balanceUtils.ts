
import { Expense, Friend } from '@/types';

export function calculateBalances(expenses: Expense[], friends: Friend[], currentUserId: string): Record<string, number> {
    const balances: Record<string, number> = {};
    const userIdToFriendId: Record<string, string> = {};

    // Initialize balances for all friends and build mapping
    friends.forEach(f => {
        balances[f.id] = 0;
        if (f.linked_user_id) {
            userIdToFriendId[f.linked_user_id] = f.id;
        }
    });

    // Helper to check if an ID represents the current user
    const isMe = (id: string) => id === currentUserId || id === 'me';

    // Helper to resolve a potential User ID to a Friend ID
    const resolveFriendId = (id: string): string | null => {
        if (balances.hasOwnProperty(id)) return id; // Already a Friend ID
        if (userIdToFriendId[id]) return userIdToFriendId[id]; // Mapped User ID
        return null;
    };

    expenses.forEach(expense => {
        if (!expense.splitDetails) return;
        const { paidBy, shares } = expense.splitDetails;

        if (!currentUserId) return;

        // Case 1: I paid
        if (isMe(paidBy)) {
            shares.forEach(share => {
                // If the share is for someone else (not me)
                if (!isMe(share.userId)) {
                    const friendId = resolveFriendId(share.userId);
                    if (friendId) {
                        balances[friendId] += share.amount;
                    }
                    // Note: If share.userId is not in friends list, we ignore.
                    // This is correct because we only display balances for Friends.
                }
            });
        }
        // Case 2: Someone else paid
        else {
            const payerId = paidBy;
            const friendId = resolveFriendId(payerId);

            // Check if I am involved in the split
            const myShare = shares.find(s => isMe(s.userId));

            if (myShare && friendId) {
                // I owe them (negative balance)
                balances[friendId] -= myShare.amount;
            }
        }
    });

    return balances;
}
