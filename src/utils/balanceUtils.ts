
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

export interface Debt {
    from: string; // User ID who owes
    to: string;   // User ID who is owed
    amount: number;
}

/**
 * Calculates net debts between all members in a group.
 * Returns a list of simplified debts (A owes B X amount).
 */
export function calculateGroupDebts(expenses: Expense[], currentUserId: string): Debt[] {
    const debts: Record<string, Record<string, number>> = {};

    // Helper to Initialize 
    const ensureRecord = (id1: string, id2: string) => {
        if (!debts[id1]) debts[id1] = {};
        if (!debts[id1][id2]) debts[id1][id2] = 0;
        if (debts[id2] === undefined) debts[id2] = {}; // Ensure id2 exists
        if (!debts[id2][id1]) debts[id2][id1] = 0;
    };

    // Helper to handle 'me' vs real ID
    const normalizeId = (id: string) => id === 'me' ? currentUserId : id;

    expenses.forEach(expense => {
        if (!expense.splitDetails) return;
        const { paidBy, shares } = expense.splitDetails;

        const payerId = normalizeId(paidBy);

        shares.forEach(share => {
            const debtorId = normalizeId(share.userId);

            // You don't owe yourself
            if (payerId !== debtorId) {
                ensureRecord(debtorId, payerId);
                debts[debtorId][payerId] += share.amount;
            }
        });
    });

    // Simplify Debts (Netting)
    const simplifiedDebts: Debt[] = [];
    // We need to track pairs we've already processed to avoid duplicates (A-B and B-A)
    const processedPairs = new Set<string>();

    Object.keys(debts).forEach(id1 => {
        const targets = debts[id1];
        if (!targets) return;

        Object.keys(targets).forEach(id2 => {
            // Avoid processing same pair twice (id1-id2 and id2-id1)
            const pairKey = [id1, id2].sort().join('-');
            if (processedPairs.has(pairKey)) return;
            processedPairs.add(pairKey);

            const amount1to2 = debts[id1][id2] || 0;
            const amount2to1 = debts[id2]?.[id1] || 0;

            const net = amount1to2 - amount2to1;

            if (net > 0.01) {
                simplifiedDebts.push({ from: id1, to: id2, amount: net });
            } else if (net < -0.01) {
                // Net is negative, meaning 2 owes 1 more than 1 owes 2
                // So 2 pays 1 the difference
                simplifiedDebts.push({ from: id2, to: id1, amount: Math.abs(net) });
            }
        });
    });

    return simplifiedDebts;
}
