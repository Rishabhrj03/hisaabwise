/**
 * IMigrationService — Adapter interface for migrating legacy localStorage data
 * into the database.
 *
 * Swap the backend by implementing this interface and updating src/services/index.ts.
 */
export interface IMigrationService {
  /**
   * Migrate legacy friend records from localStorage into the database.
   * Returns a map of old friend IDs to the newly assigned database IDs.
   */
  migrateFriends(
    userId: string,
    friends: LegacyFriend[]
  ): Promise<Map<string, string>>;

  /**
   * Migrate legacy expense records (including splits) into the database.
   * Requires the friend ID map produced by `migrateFriends` to resolve references.
   */
  migrateExpenses(
    userId: string,
    expenses: LegacyExpense[],
    friendIdMap: Map<string, string>
  ): Promise<void>;
}

/** Shape of a friend record as it was stored in localStorage (pre-Supabase). */
export interface LegacyFriend {
  id: string;
  name: string;
  phone?: string | null;
}

/** Shape of an expense record as it was stored in localStorage (pre-Supabase). */
export interface LegacyExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  splitDetails?: {
    paidBy: string;
    shares: { userId: string; amount: number }[];
  };
}
