"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Expense, ExpenseContextType } from '@/types';

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([]);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('expenses');
        if (saved) {
            try {
                setExpenses(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse expenses", e);
            }
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem('expenses', JSON.stringify(expenses));
    }, [expenses]);

    const addExpense = (data: Omit<Expense, 'id'>) => {
        const newExpense: Expense = {
            ...data,
            id: crypto.randomUUID(),
        };
        setExpenses((prev) => [newExpense, ...prev]);
    };

    const deleteExpense = (id: string) => {
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));
    };

    const updateExpense = (id: string, data: Omit<Expense, 'id'>) => {
        setExpenses((prev) => prev.map(exp => exp.id === id ? { ...data, id } : exp));
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
