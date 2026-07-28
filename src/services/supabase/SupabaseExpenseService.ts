import { SupabaseClient } from '@supabase/supabase-js';
import {
  IExpenseService,
  ExpenseRowWithSplits,
  CreateExpensePayload,
  CreateSplitPayload,
} from '@/services/interfaces/IExpenseService';

/**
 * SupabaseExpenseService — Supabase adapter for IExpenseService.
 *
 * All Supabase expense table queries are isolated here. To switch backends,
 * create a new class implementing IExpenseService and update src/services/index.ts.
 */
export class SupabaseExpenseService implements IExpenseService {
  constructor(private readonly client: SupabaseClient) {}

  async fetchExpenses(userId: string): Promise<ExpenseRowWithSplits[]> {
    const { data, error } = await this.client
      .from('expenses')
      .select('*, expense_splits(*)')
      .eq('created_by', userId)
      .order('date', { ascending: false });

    if (error) {
      if (Object.keys(error).length === 0) {
        console.warn('[ExpenseService] Empty error object — check env vars and restart dev server.');
      } else if (error.code === '42P01') {
        console.error('[ExpenseService] Table "expenses" not found — run the SQL schema in Supabase.');
      } else {
        console.error('[ExpenseService] fetchExpenses error:', error);
      }
      return [];
    }

    return (data ?? []) as ExpenseRowWithSplits[];
  }

  async createExpense(payload: CreateExpensePayload): Promise<void> {
    const { error } = await this.client.from('expenses').insert(payload);
    if (error) {
      throw new Error(`[ExpenseService] createExpense failed: ${error.message}`);
    }
  }

  async createSplits(splits: CreateSplitPayload[]): Promise<void> {
    if (splits.length === 0) return;
    const { error } = await this.client.from('expense_splits').insert(splits);
    if (error) {
      throw new Error(`[ExpenseService] createSplits failed: ${error.message}`);
    }
  }

  async deleteExpense(id: string): Promise<void> {
    const { error } = await this.client.from('expenses').delete().eq('id', id);
    if (error) {
      throw new Error(`[ExpenseService] deleteExpense failed: ${error.message}`);
    }
  }

  async updateExpense(id: string, payload: Partial<CreateExpensePayload>): Promise<void> {
    const { error } = await this.client.from('expenses').update(payload).eq('id', id);
    if (error) {
      throw new Error(`[ExpenseService] updateExpense failed: ${error.message}`);
    }
  }
}
