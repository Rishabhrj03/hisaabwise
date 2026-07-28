import { SupabaseClient } from '@supabase/supabase-js';
import {
  IMigrationService,
  LegacyFriend,
  LegacyExpense,
} from '@/services/interfaces/IMigrationService';

/**
 * SupabaseMigrationService — Supabase adapter for IMigrationService.
 *
 * Handles one-time migration of legacy localStorage data into Supabase.
 * All Supabase calls for migration are isolated here.
 */
export class SupabaseMigrationService implements IMigrationService {
  constructor(private readonly client: SupabaseClient) {}

  async migrateFriends(
    userId: string,
    friends: LegacyFriend[]
  ): Promise<Map<string, string>> {
    const friendIdMap = new Map<string, string>();

    for (const friend of friends) {
      const newId = crypto.randomUUID();
      const { error } = await this.client.from('friends').insert({
        id: newId,
        user_id: userId,
        name: friend.name,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error(`[MigrationService] Failed to migrate friend "${friend.name}":`, error);
      } else {
        friendIdMap.set(friend.id, newId);
      }
    }

    return friendIdMap;
  }

  async migrateExpenses(
    userId: string,
    expenses: LegacyExpense[],
    friendIdMap: Map<string, string>
  ): Promise<void> {
    for (const expense of expenses) {
      const newExpenseId = crypto.randomUUID();

      // Resolve the payer's ID: 'me' → current userId, otherwise map old friend ID.
      let payerId = userId;
      if (expense.splitDetails?.paidBy && expense.splitDetails.paidBy !== 'me') {
        payerId = friendIdMap.get(expense.splitDetails.paidBy) ?? userId;
      }

      const { error: expError } = await this.client.from('expenses').insert({
        id: newExpenseId,
        created_by: userId,
        amount: expense.amount,
        description: expense.description,
        category: expense.category,
        type: expense.type,
        date: expense.date,
        payer_id: payerId,
      });

      if (expError) {
        console.error('[MigrationService] Failed to migrate expense:', expError);
        continue;
      }

      // Migrate splits if present.
      if (expense.splitDetails?.shares && expense.splitDetails.shares.length > 0) {
        const splits = expense.splitDetails.shares
          .map((share) => {
            const isUser = share.userId === 'me';
            const friendId = isUser ? null : (friendIdMap.get(share.userId) ?? null);

            if (!isUser && !friendId) return null;

            return {
              expense_id: newExpenseId,
              friend_id: friendId,
              is_user: isUser,
              amount: share.amount,
            };
          })
          .filter((s): s is NonNullable<typeof s> => s !== null);

        if (splits.length > 0) {
          await this.client.from('expense_splits').insert(splits);
        }
      }
    }
  }
}
