import {
  IExpenseService,
  ExpenseRecordWithSplits,
  CreateExpensePayload,
  CreateSplitPayload,
} from '@/services/interfaces/IExpenseService';

/**
 * FetchExpenseService — Browser-safe adapter for IExpenseService.
 *
 * Delegates all data operations to our own Next.js API routes (/api/expenses).
 * MongoDB never runs in the browser — only on the server inside those routes.
 *
 * Architecture:
 *   Context → FetchExpenseService.createExpense() → POST /api/expenses → MongoDB
 */
export class FetchExpenseService implements IExpenseService {
  /** Temporarily holds splits that arrive via createSplits() for the next createExpense call. */
  private pendingSplits: CreateSplitPayload[] = [];

  async fetchExpenses(_userId: string): Promise<ExpenseRecordWithSplits[]> {
    const res = await fetch('/api/expenses', { cache: 'no-store' });
    if (!res.ok) {
      console.error('[FetchExpenseService] fetchExpenses failed:', res.status);
      return [];
    }
    return res.json();
  }

  async createExpense(payload: CreateExpensePayload): Promise<void> {
    const splits = this.pendingSplits;
    this.pendingSplits = [];

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expense: payload, splits }),
    });
    if (!res.ok) throw new Error(`[FetchExpenseService] createExpense failed: ${res.status}`);
  }

  async createSplits(splits: CreateSplitPayload[]): Promise<void> {
    // The context calls createExpense then createSplits separately.
    // We batch the splits with the expense to avoid two round-trips.
    // Store them so createExpense picks them up in the same request.
    this.pendingSplits = splits;
  }

  async deleteExpense(id: string): Promise<void> {
    const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`[FetchExpenseService] deleteExpense failed: ${res.status}`);
  }

  async updateExpense(id: string, payload: Partial<CreateExpensePayload>): Promise<void> {
    const res = await fetch(`/api/expenses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`[FetchExpenseService] updateExpense failed: ${res.status}`);
  }
}

