import { MongoClient, Db } from 'mongodb';
import {
  IExpenseService,
  ExpenseRecordWithSplits,
  CreateExpensePayload,
  CreateSplitPayload,
} from '@/services/interfaces/IExpenseService';
import { AnyDoc } from '@/lib/db';

/**
 * MongoExpenseService — Direct MongoDB adapter for IExpenseService.
 * Use this in server-only contexts (e.g., Server Actions, background jobs).
 * For browser contexts, use FetchExpenseService instead.
 */
export class MongoExpenseService implements IExpenseService {
  constructor(private readonly clientPromise: Promise<MongoClient>) {}

  private async db(): Promise<Db> {
    const client = await this.clientPromise;
    return client.db();
  }

  async fetchExpenses(userId: string): Promise<ExpenseRecordWithSplits[]> {
    try {
      const db = await this.db();
      const expenses = await db.collection<AnyDoc>('expenses').aggregate([
        { $match: { created_by: userId } },
        { $lookup: { from: 'expense_splits', localField: '_id', foreignField: 'expense_id', as: 'expense_splits' } },
        { $sort: { date: -1 } },
      ]).toArray();
      return expenses.map(doc => this.docToRecord(doc));
    } catch (err) {
      console.error('[MongoExpenseService] fetchExpenses error:', err);
      return [];
    }
  }

  async createExpense(payload: CreateExpensePayload): Promise<void> {
    const db = await this.db();
    const { id, ...rest } = payload;
    await db.collection<AnyDoc>('expenses').insertOne({ _id: id, ...rest });
  }

  async createSplits(splits: CreateSplitPayload[]): Promise<void> {
    if (splits.length === 0) return;
    const db = await this.db();
    await db.collection<AnyDoc>('expense_splits').insertMany(
      splits.map(s => ({ _id: crypto.randomUUID(), ...s }))
    );
  }

  async deleteExpense(id: string): Promise<void> {
    const db = await this.db();
    await db.collection<AnyDoc>('expense_splits').deleteMany({ expense_id: id });
    await db.collection<AnyDoc>('expenses').deleteOne({ _id: id });
  }

  async updateExpense(id: string, payload: Partial<CreateExpensePayload>): Promise<void> {
    const db = await this.db();
    const { id: _id, ...rest } = payload as CreateExpensePayload;
    await db.collection<AnyDoc>('expenses').updateOne({ _id: id }, { $set: rest });
  }

  private docToRecord(doc: AnyDoc): ExpenseRecordWithSplits {
    const { _id, expense_splits, ...rest } = doc;
    const splits = ((expense_splits as AnyDoc[]) ?? []).map(({ _id: sid, ...s }) => ({
      id: String(sid), ...s,
    }));
    return { id: String(_id), ...rest, expense_splits: splits } as ExpenseRecordWithSplits;
  }
}
