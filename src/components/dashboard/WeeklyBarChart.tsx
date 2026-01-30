"use client";

import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Expense } from '@/types';
import { Card } from '@/components/ui/Card';

interface WeeklyBarChartProps {
    expenses: Expense[];
}

export function WeeklyBarChart({ expenses }: WeeklyBarChartProps) {
    // Aggregate daily info
    // We want to show the trend for the currently filtered view (filteredExpenses passed down)
    // Let's sort them by date and aggregate

    const dailyMap = expenses.reduce((acc, curr) => {
        const dateKey = new Date(curr.date).getDate(); // Just the day number for simplicity in a month view
        if (!acc[dateKey]) {
            acc[dateKey] = { day: dateKey, income: 0, expense: 0 };
        }
        if (curr.type === 'income') acc[dateKey].income += curr.amount;
        else acc[dateKey].expense += curr.amount;
        return acc;
    }, {} as Record<number, { day: number; income: number; expense: number }>);

    // Convert to array and fill gaps? For MVP just show days with activity or sorted list
    const data = Object.values(dailyMap).sort((a, b) => a.day - b.day);

    if (data.length === 0) {
        return (
            <Card variant="glass" className="glass-panel" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'hsl(var(--color-text-muted))' }}>No activity to display</p>
            </Card>
        );
    }

    return (
        <Card variant="glass" className="glass-panel" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Daily Activity</h3>
            <div style={{ flex: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="day" stroke="hsl(var(--color-text-muted))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--color-surface-hover))' }}
                            contentStyle={{ backgroundColor: 'hsl(var(--color-surface))', borderColor: 'hsl(var(--color-border))', borderRadius: '8px' }}
                            labelStyle={{ color: 'hsl(var(--color-text-muted))' }}
                        />
                        <Bar dataKey="income" fill="hsl(var(--color-income))" radius={[4, 4, 0, 0]} stackId="a" />
                        <Bar dataKey="expense" fill="hsl(var(--color-expense))" radius={[4, 4, 0, 0]} stackId="a" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
