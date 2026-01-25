"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Expense } from '@/types';
import { Card } from '@/components/ui/Card';

interface CategoryPieChartProps {
    expenses: Expense[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

export function CategoryPieChart({ expenses }: CategoryPieChartProps) {
    // Aggregate expenses by category
    const dataMap = expenses
        .filter(e => e.type === 'expense')
        .reduce((acc, curr) => {
            const cat = curr.category || 'Other';
            acc[cat] = (acc[cat] || 0) + curr.amount;
            return acc;
        }, {} as Record<string, number>);

    const data = Object.entries(dataMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    if (data.length === 0) {
        return (
            <Card variant="glass" className="glass-panel" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: 'hsl(var(--color-text-muted))' }}>No expense data to display</p>
            </Card>
        );
    }

    return (
        <Card variant="glass" className="glass-panel" style={{ height: '300px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 600 }}>Expense by Category</h3>
            <div style={{ flex: 1, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any) => `₹${Number(value).toFixed(2)}`}
                            contentStyle={{ backgroundColor: 'hsl(var(--color-surface))', borderColor: 'hsl(var(--color-border))', borderRadius: '8px' }}
                            itemStyle={{ color: 'hsl(var(--color-text-main))' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '0.8rem' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
