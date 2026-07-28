import { Database } from '@/types/supabase';

/** Raw DB row types pulled from the generated Supabase schema. */
export type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
export type ExpenseSplitRow = Database['public']['Tables']['expense_splits']['Row'];

/** A raw expense row as returned by the DB (with nested splits). */
export type ExpenseRowWithSplits = ExpenseRow & {
  expense_splits: ExpenseSplitRow[];
};

/** Payload to insert a new expense record. */
export type CreateExpensePayload = Database['public']['Tables']['expenses']['Insert'];

/** Payload to insert a new expense split record. */
export type CreateSplitPayload = Database['public']['Tables']['expense_splits']['Insert'];

/**
 * IExpenseService — Adapter interface for all expense data operations.
 *
 * Swap the backend by implementing this interface and updating src/services/index.ts.
 */
export interface IExpenseService {
  /** Fetch all expenses (with their splits) for a given user. */
  fetchExpenses(userId: string): Promise<ExpenseRowWithSplits[]>;

  /** Insert a single expense record. Returns the new record's id. */
  createExpense(payload: CreateExpensePayload): Promise<void>;

  /** Insert one or more expense split records. */
  createSplits(splits: CreateSplitPayload[]): Promise<void>;

  /** Permanently delete an expense by id. */
  deleteExpense(id: string): Promise<void>;

  /** Update an existing expense record. */
  updateExpense(id: string, payload: Partial<CreateExpensePayload>): Promise<void>;
}
