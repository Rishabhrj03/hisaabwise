"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Expense, ExpenseContextType, Category } from '@/types';
import { useAuth } from '@/context/AuthContext';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

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

    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchExpenses = async () => {
            if (!user) {
                setExpenses([]);
                setCategories([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // Fetch Expenses
                const res = await fetch('/api/expenses');
                if (res.ok) {
                    const data = await res.json();
                    const mapped = data.map(mapToExpense);
                    setExpenses(mapped);
                } else {
                    console.error("Failed to fetch expenses");
                }

                // Fetch Categories
                const catRes = await fetch('/api/categories');
                if (catRes.ok) {
                    const catData = await catRes.json();
                    setCategories(catData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setLoading(false);
        };

        fetchExpenses();
    }, [user]);

    const addExpense = async (data: Omit<Expense, 'id'>) => {
        if (!user) return;

        try {
            const res = await fetch('/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const newDoc = await res.json();
                const newExpense = mapToExpense(newDoc);
                setExpenses((prev) => [newExpense, ...prev]);
            } else {
                console.error("Failed to add expense");
            }
        } catch (error) {
            console.error("Error adding expense:", error);
        }
    };

    const deleteExpense = async (id: string) => {
        if (!user) return;

        // Optimistic UI
        const prevExpenses = [...expenses];
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));

        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                console.error("Failed to delete expense");
                setExpenses(prevExpenses);
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
            setExpenses(prevExpenses);
        }
    };

    const updateExpense = async (id: string, data: Omit<Expense, 'id'>) => {
        try {
            const res = await fetch(`/api/expenses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (res.ok) {
                const updatedDoc = await res.json();
                const updatedExpense = mapToExpense(updatedDoc);
                setExpenses(prev => prev.map(e => e.id === id ? updatedExpense : e));
            }
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
                setCategories(prev => [...prev, newCat]);
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
                setCategories(prev => prev.map(c => c._id === id ? updatedCat : c));
                return updatedCat;
            }
        } catch (err) {
            console.error(err);
        }
    };

    const deleteCategory = async (id: string) => {
        try {
            const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c._id !== id));
            }
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
