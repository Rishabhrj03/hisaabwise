"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Expense, ExpenseContextType, Category } from '@/types';
import { useAuth } from '@/context/AuthContext';

import useSWR from 'swr';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    const mapToExpense = (doc: { _id?: string; id?: string; description: string; amount: number; date: string; type: 'income' | 'expense' | 'transfer'; category: string; splitDetails?: { paidBy: string; shares: Array<{ userId: string; amount: number }> }; relatedTo?: string[]; group_id?: string | null }): Expense => {
        return {
            id: String(doc._id || doc.id),
            description: doc.description,
            amount: doc.amount,
            date: doc.date,
            type: doc.type,
            category: doc.category,
            splitDetails: doc.splitDetails,
            relatedTo: doc.relatedTo || [],
            group_id: doc.group_id
        };
    };

    // SWR Hooks
    const { data: rawExpenses, mutate: mutateExpenses, isLoading: expensesLoading } = useSWR(
        user ? '/api/expenses' : null,
        fetcher,
        { refreshInterval: 10000, revalidateOnFocus: true }
    );

    const { data: rawCategories, mutate: mutateCategories, isLoading: categoriesLoading } = useSWR(
        user ? '/api/categories' : null,
        fetcher,
        { refreshInterval: 10000, revalidateOnFocus: true }
    );

    // Derived State
    const expenses: Expense[] = React.useMemo(() => {
        if (!rawExpenses) return [];
        return Array.isArray(rawExpenses) ? rawExpenses.map(mapToExpense) : [];
    }, [rawExpenses]);

    const categories: Category[] = React.useMemo(() => {
        if (!rawCategories) return [];
        return Array.isArray(rawCategories) ? rawCategories : [];
    }, [rawCategories]);

    const loading = expensesLoading || categoriesLoading;

    const addExpense = async (data: Omit<Expense, 'id'>) => {
        if (!user) return;
        try {
            await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            mutateExpenses(); // Trigger revalidation
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    };

    const deleteExpense = async (id: string) => {
        if (!user) return;
        // Optimistic update could be done here with mutate, but keeping simple for now
        try {
            await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
            mutateExpenses();
        } catch (error) {
            console.error("Error deleting expense:", error);
        }
    };

    const updateExpense = async (id: string, data: Omit<Expense, 'id'>) => {
        try {
            await fetch(`/api/expenses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            mutateExpenses();
        } catch (error) {
            console.error("Error updating expense", error);
        }
    };

    const addCategory = async (name: string, color: string, icon?: string) => {
        try {
            const res = await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color, icon })
            });
            if (res.ok) {
                const newCat = await res.json();
                mutateCategories();
                return newCat;
            }
        } catch (err) {
            console.error(err);
        }
    };

    const updateCategory = async (id: string, name: string, color: string, icon?: string) => {
        try {
            const res = await fetch('/api/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name, color, icon })
            });
            if (res.ok) {
                const updatedCat = await res.json();
                mutateCategories();
                return updatedCat;
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
            if (res.ok) mutateCategories();
        } catch (err) {
            console.error(err);
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
            value={{
                expenses,
                addExpense,
                deleteExpense,
                updateExpense,
                totalBalance,
                totalIncome,
                totalExpense,
                categories,
                addCategory,
                updateCategory,
                deleteCategory,
                loading
            }}
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
