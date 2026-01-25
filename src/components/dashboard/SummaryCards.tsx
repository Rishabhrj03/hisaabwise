import React from 'react';
import { Card } from '@/components/ui/Card';

interface SummaryCardsProps {
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
}

export function SummaryCards({ totalBalance, totalIncome, totalExpense }: SummaryCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount);
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
        }}>
            {/* Total Balance */}
            <Card variant="glass" className="summary-card">
                <h3 style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Total Balance
                </h3>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--color-text-main))' }}>
                    {formatCurrency(totalBalance)}
                </div>
            </Card>

            {/* Income */}
            <Card variant="default">
                <h3 style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Total Income
                </h3>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--color-income))' }}>
                    {formatCurrency(totalIncome)}
                </div>
            </Card>

            {/* Expense */}
            <Card variant="default">
                <h3 style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Total Expense
                </h3>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--color-expense))' }}>
                    {formatCurrency(totalExpense)}
                </div>
            </Card>
        </div>
    );
}
