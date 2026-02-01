"use client";

import React, { useEffect, useState, use } from 'react';
import { SummaryCards } from '@/components/dashboard/SummaryCards';
import { TransactionList } from '@/components/dashboard/TransactionList';
import { MonthSelector } from '@/components/dashboard/MonthSelector';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { WeeklyBarChart } from '@/components/dashboard/WeeklyBarChart';
import { DebtChart } from '@/components/dashboard/DebtChart';
import { Card } from '@/components/ui/Card';
import { Expense, Category } from '@/types';

// Mock read-only handlers
const noOp = () => { };

export default function SharedDashboard({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<{ name: string } | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);

    const [currentDate, setCurrentDate] = useState(new Date());
    const [currency, setCurrency] = useState('INR');

    useEffect(() => {
        fetchData();
    }, [token]);

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/public/${token}`);
            if (!res.ok) throw new Error('Dashboard not found or private');
            const data = await res.json();
            setUserData(data.user);
            setExpenses(data.expenses);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center">Loading Shared Dashboard...</div>;
    if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;

    // Filter Logic (Same as main dashboard)
    const filteredExpenses = expenses
        .filter((expense) => {
            const expenseDate = new Date(expense.date);
            if (isNaN(expenseDate.getTime())) return true;
            return (
                expenseDate.getMonth() === currentDate.getMonth() &&
                expenseDate.getFullYear() === currentDate.getFullYear()
            );
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const income = filteredExpenses
        .filter(e => e.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);

    const expense = filteredExpenses
        .filter(e => e.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);

    const balance = income - expense;

    const handlePrevMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    return (
        <div style={{
            maxWidth: '1200px', // Wider layout for shared view
            margin: '0 auto',
            padding: '2rem 1rem',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>{userData?.name}&apos;s HisaabWise</h1>
                <span style={{
                    background: 'var(--color-primary)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    display: 'inline-block',
                    marginTop: '0.5rem'
                }}>
                    Read Only View
                </span>
            </header>

            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <MonthSelector
                        currentDate={currentDate}
                        onPrevMonth={handlePrevMonth}
                        onNextMonth={handleNextMonth}
                    />

                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text-main)'
                        }}
                    >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                    </select>
                </div>

                <SummaryCards
                    totalBalance={balance}
                    totalIncome={income}
                    totalExpense={expense}
                    currency={currency}
                />

                <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <CategoryPieChart expenses={filteredExpenses} />
                    <WeeklyBarChart expenses={filteredExpenses} />
                    <DebtChart expenses={expenses} />
                </div>

                <h2 style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Transactions</h2>
                < TransactionList
                    expenses={filteredExpenses}
                    onDelete={noOp} // Disabled
                    onEdit={noOp}   // Disabled
                    currency={currency}
                />
            </main>
            <footer style={{
                padding: '2rem 0',
                textAlign: 'center',
                color: 'hsl(var(--color-text-muted))',
                fontSize: '0.875rem'
            }}>
                <p>&copy; {new Date().getFullYear()} HisaabWise</p>
            </footer>
        </div>
    );
}
