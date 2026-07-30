/**
 * IExpenseService — Adapter interface for all expense data operations.
 *
 * These types are deliberately database-agnostic — no Supabase, Mongo,
 * or any other SDK types appear here. This is the stable contract every
 * adapter must satisfy.
 *
 * To switch databases: implement this interface and update src/services/index.ts.
 */

export interface ExpenseRecord {
  id: string;
  created_by: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  created_at?: string;
  payer_id: string | null;
  group_id: string | null;
}

export interface ExpenseSplitRecord {
  id: string;
  expense_id: string;
  friend_id: string | null;
  is_user: boolean;
  amount: number;
  percentage?: number | null;
}

/** An expense record with its nested split records (from a join/lookup query). */
export interface ExpenseRecordWithSplits extends ExpenseRecord {
  expense_splits: ExpenseSplitRecord[];
}

/** Payload to insert a new expense record. */
export interface CreateExpensePayload {
  id: string;
  created_by: string;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: string;
  payer_id?: string | null;
  group_id?: string | null;
}

/** Payload to insert a new expense split record. */
export interface CreateSplitPayload {
  expense_id: string;
  friend_id: string | null;
  is_user: boolean;
  amount: number;
  percentage?: number | null;
}

export interface IExpenseService {
  /** Fetch all expenses (with their splits) for a given user. */
  fetchExpenses(userId: string): Promise<ExpenseRecordWithSplits[]>;

  /** Insert a single expense record. */
  createExpense(payload: CreateExpensePayload): Promise<void>;

  /** Insert one or more expense split records. */
  createSplits(splits: CreateSplitPayload[]): Promise<void>;

  /** Permanently delete an expense by id. */
  deleteExpense(id: string): Promise<void>;

  /** Update an existing expense record. */
  updateExpense(id: string, payload: Partial<CreateExpensePayload>): Promise<void>;
}
