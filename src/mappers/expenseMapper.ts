import { Expense } from '@/types';
import {
  ExpenseRecordWithSplits,
  CreateExpensePayload,
  CreateSplitPayload,
} from '@/services/interfaces/IExpenseService';

/**
 * expenseMapper — Pure functions for translating between DB rows and domain types.
 *
 * Keeping mapping logic here (SRP) means:
 * - Contexts stay thin (state management only)
 * - This file is easily unit-tested without any React or network dependencies
 * - Changing the DB schema only requires updating this file
 */

/**
 * Maps a raw Supabase expense row (with nested splits) to the domain Expense type.
 *
 * @param row    - The raw DB record, including expense_splits.
 * @param userId - The authenticated user's ID (used to resolve 'me' vs. friend).
 */
export function mapRowToExpense(row: ExpenseRecordWithSplits, userId: string): Expense {
  const splitDetails =
    row.expense_splits.length > 0 || row.payer_id
      ? {
          paidBy: !row.payer_id || row.payer_id === userId ? 'me' : row.payer_id,
          shares: row.expense_splits.map((s) => ({
            userId: s.is_user ? 'me' : s.friend_id ?? '',
            amount: s.amount,
          })),
        }
      : undefined;

  // Collect friend IDs involved in the split (excluding the current user).
  const relatedTo = row.expense_splits
    .filter((s) => !s.is_user && s.friend_id)
    .map((s) => s.friend_id as string);

  // If someone else paid, they are also "related to" this expense.
  if (row.payer_id && row.payer_id !== userId) {
    relatedTo.push(row.payer_id);
  }

  return {
    id: row.id,
    description: row.description,
    amount: row.amount,
    date: row.date,
    type: row.type,
    category: row.category,
    group_id: row.group_id ?? undefined,
    splitDetails,
    relatedTo: Array.from(new Set(relatedTo)),
  };
}

/**
 * Maps a domain Expense input (without id) into a Supabase insert payload.
 *
 * @param data    - The expense data from the UI form.
 * @param userId  - The authenticated user's ID.
 * @param id      - A pre-generated UUID for the new record.
 */
export function mapExpenseToCreatePayload(
  data: Omit<Expense, 'id'>,
  userId: string,
  id: string
): CreateExpensePayload {
  const payerId =
    !data.splitDetails?.paidBy || data.splitDetails.paidBy === 'me'
      ? userId
      : data.splitDetails.paidBy;

  return {
    id,
    created_by: userId,
    amount: data.amount,
    description: data.description,
    category: data.category,
    type: data.type,
    date: data.date,
    payer_id: payerId,
    group_id: data.group_id ?? null,
  };
}

/**
 * Maps split shares from domain format into Supabase insert payloads.
 *
 * @param shares     - The array of split shares from the expense form.
 * @param expenseId  - The parent expense's UUID.
 */
export function mapSharesToCreatePayloads(
  shares: Expense['splitDetails'] extends undefined ? never : NonNullable<Expense['splitDetails']>['shares'],
  expenseId: string
): CreateSplitPayload[] {
  return shares.map((share) => ({
    expense_id: expenseId,
    friend_id: share.userId === 'me' ? null : share.userId,
    is_user: share.userId === 'me',
    amount: share.amount,
    percentage: null,
  }));
}
