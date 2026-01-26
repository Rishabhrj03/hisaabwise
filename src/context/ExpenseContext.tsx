"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Expense, ExpenseContextType } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Database } from '@/types/supabase';

// Helper types for Join
type ExpenseWithSplits = Database['public']['Tables']['expenses']['Row'] & {
    expense_splits: Database['public']['Tables']['expense_splits']['Row'][];
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    const mapToExpense = (row: ExpenseWithSplits): Expense => {
        const splitDetails = row.expense_splits.length > 0 || row.payer_id ? {
            paidBy: (!row.payer_id || row.payer_id === user?.id) ? 'me' : row.payer_id,
            shares: row.expense_splits.map(s => ({
                userId: s.is_user ? 'me' : (s.friend_id || ''),
                amount: s.amount
            }))
        } : undefined;

        // relatedTo
        const relatedTo = row.expense_splits
            .filter(s => !s.is_user && s.friend_id)
            .map(s => s.friend_id as string);

        if (!row.payer_id || row.payer_id === user?.id) {
            // me is payer
        } else {
            relatedTo.push(row.payer_id); // Payer is technically "related"
        }
        const uniqueRelatedTo = Array.from(new Set(relatedTo));

        return {
            id: row.id,
            description: row.description,
            amount: row.amount,
            date: row.date,
            type: row.type,
            category: row.category,
            splitDetails,
            relatedTo: uniqueRelatedTo
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
            const { data, error } = await supabase
                .from('expenses')
                .select('*, expense_splits(*)')
                .eq('created_by', user.id)
                .order('date', { ascending: false });

            if (error) {
                console.error("Error fetching expenses:", error);
                if (Object.keys(error).length === 0) {
                    console.warn("Empty error object received. This often indicates a network issue or missing environment variables. Please restart your dev server.");
                } else if (error.code === '42P01') {
                    console.error("Table 'expenses' does not exist. Please run the SQL schema in Supabase.");
                }
            } else {
                if (data) {
                    // @ts-ignore
                    const mapped = data.map(d => mapToExpense(d as ExpenseWithSplits));
                    setExpenses(mapped);
                }
            }
            setLoading(false);
        };

        fetchExpenses();
    }, [user]);

    const addExpense = async (data: Omit<Expense, 'id'>) => {
        if (!user) return;

        const expenseId = crypto.randomUUID();

        // Prepare DB payload
        const payerId = (!data.splitDetails?.paidBy || data.splitDetails.paidBy === 'me')
            ? user.id
            : data.splitDetails.paidBy;

        const dbExpense = {
            id: expenseId,
            created_by: user.id,
            amount: data.amount,
            description: data.description,
            category: data.category,
            type: data.type,
            date: data.date,
            payer_id: payerId,
            group_id: data.group_id || null
        };

        // Prepare Splits payload
        const dbSplits = data.splitDetails?.shares.map(share => ({
            expense_id: expenseId,
            friend_id: share.userId === 'me' ? null : share.userId,
            is_user: share.userId === 'me',
            amount: share.amount
        })) || [];

        // Optimistic UI Update
        const newExpense: Expense = {
            ...data,
            id: expenseId,
            relatedTo: [], // This will be properly calculated on fetch, but for optimistic, can be empty or derived
        };
        setExpenses((prev) => [newExpense, ...prev]);

        // Insert Expense
        const { error: expError } = await supabase.from('expenses').insert(dbExpense);

        if (expError) {
            console.error("Error adding expense:", expError);
            setExpenses(prev => prev.filter(e => e.id !== expenseId));
            return;
        }

        // Insert Splits
        if (dbSplits.length > 0) {
            const { error: splitError } = await supabase.from('expense_splits').insert(dbSplits);
            if (splitError) {
                console.error("Error adding splits:", splitError);
                // Rollback expense?
                await supabase.from('expenses').delete().eq('id', expenseId);
                setExpenses(prev => prev.filter(e => e.id !== expenseId));
            }
        }
    };

    const deleteExpense = async (id: string) => {
        if (!user) return;

        // Optimistic UI
        const prevExpenses = [...expenses];
        setExpenses((prev) => prev.filter((exp) => exp.id !== id));

        const { error } = await supabase.from('expenses').delete().eq('id', id);

        if (error) {
            console.error("Failed to delete expense:", error);
            setExpenses(prevExpenses);
        }
    };

    const updateExpense = async (id: string, data: Omit<Expense, 'id'>) => {
        // Implement update similarly if needed
        // For now, let's just log implementation pending
        console.warn("updateExpense not fully implemented yet");
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
