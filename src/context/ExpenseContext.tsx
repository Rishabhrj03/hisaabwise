"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Expense, ExpenseContextType } from '@/types';
import { useAuth } from '@/context/AuthContext';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    const mapToExpense = (doc: any): Expense => {
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

    useEffect(() => {
        const fetchExpenses = async () => {
            if (!user) {
                setExpenses([]);
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const res = await fetch('/api/expenses');
                if (res.ok) {
                    const data = await res.json();
                    const mapped = data.map(mapToExpense);
                    setExpenses(mapped);
                } else {
                    console.error("Failed to fetch expenses");
                }
            } catch (error) {
                console.error("Error fetching expenses:", error);
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
    }

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
