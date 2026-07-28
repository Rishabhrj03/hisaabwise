'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Expense, ExpenseContextType } from '@/types';
import { expenseService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { mapRowToExpense, mapExpenseToCreatePayload, mapSharesToCreatePayloads } from '@/mappers/expenseMapper';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Load expenses whenever the logged-in user changes.
  useEffect(() => {
    const fetchExpenses = async () => {
      if (!user) {
        setExpenses([]);
        return;
      }

      const rows = await expenseService.fetchExpenses(user.id);
      setExpenses(rows.map((row) => mapRowToExpense(row, user.id)));
    };

    fetchExpenses();
  }, [user]);

  const addExpense = async (data: Omit<Expense, 'id'>): Promise<void> => {
    if (!user) return;

    const expenseId = crypto.randomUUID();
    const dbExpense = mapExpenseToCreatePayload(data, user.id, expenseId);
    const dbSplits = data.splitDetails?.shares
      ? mapSharesToCreatePayloads(data.splitDetails.shares, expenseId)
      : [];

    // Optimistic UI update — show the new item immediately.
    const optimisticExpense: Expense = { ...data, id: expenseId, relatedTo: [] };
    setExpenses((prev) => [optimisticExpense, ...prev]);

    try {
      await expenseService.createExpense(dbExpense);

      if (dbSplits.length > 0) {
        await expenseService.createSplits(dbSplits);
      }
    } catch (err) {
      console.error('[ExpenseContext] addExpense failed, reverting:', err);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    if (!user) return;

    const prevExpenses = [...expenses];
    setExpenses((prev) => prev.filter((e) => e.id !== id));

    try {
      await expenseService.deleteExpense(id);
    } catch (err) {
      console.error('[ExpenseContext] deleteExpense failed, reverting:', err);
      setExpenses(prevExpenses);
    }
  };

  const updateExpense = async (id: string, data: Omit<Expense, 'id'>): Promise<void> => {
    if (!user) return;

    const prevExpenses = [...expenses];
    // Optimistic update in local state.
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...data, id } : e)));

    try {
      const payload = mapExpenseToCreatePayload(data, user.id, id);
      await expenseService.updateExpense(id, payload);
    } catch (err) {
      console.error('[ExpenseContext] updateExpense failed, reverting:', err);
      setExpenses(prevExpenses);
    }
  };

  const totalIncome = expenses
    .filter((e) => e.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = expenses
    .filter((e) => e.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  return (
    <ExpenseContext.Provider
      value={{ expenses, addExpense, deleteExpense, updateExpense, totalBalance, totalIncome, totalExpense }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
}
