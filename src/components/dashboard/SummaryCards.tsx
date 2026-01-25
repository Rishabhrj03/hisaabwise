import React from 'react';
import { Card } from '@/components/ui/Card';

interface SummaryCardsProps {
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    currency?: string;
}

export function SummaryCards({ totalBalance, totalIncome, totalExpense, currency = 'USD' }: SummaryCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            marginBottom: '0'
        }}>
            {/* Total Balance - Full Width */}
            <Card variant="glass" className="summary-card" style={{ gridColumn: 'span 2' }}>
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
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--color-income))' }}>
                    {formatCurrency(totalIncome)}
                </div>
            </Card>

            {/* Expense */}
            <Card variant="default">
                <h3 style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                    Total Expense
                </h3>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--color-expense))' }}>
                    {formatCurrency(totalExpense)}
                </div>
            </Card>
        </div>
    );
}
