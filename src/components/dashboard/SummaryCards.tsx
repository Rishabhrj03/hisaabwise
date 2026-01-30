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
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', // Responsive grid
            gap: '1.5rem',
            marginBottom: '0'
        }}>
            {/* Total Balance - Full Width on small, 1st on large */}
            <Card variant="glass" className="summary-card" style={{
                gridColumn: '1 / -1',
                background: 'linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--color-primary-dark)))',
                color: 'white',
                border: 'none',
                boxShadow: 'var(--shadow-glow)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
            }}>
                <h3 style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>
                    Total Balance
                </h3>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                    {formatCurrency(totalBalance)}
                </div>
            </Card>

            {/* Income */}
            <Card variant="glass">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'hsla(var(--hue-success), 70%, 40%, 0.1)',
                        color: 'hsl(var(--color-income))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>↓</div>
                    <h3 style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem', fontWeight: 500 }}>
                        Income
                    </h3>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--color-income))' }}>
                    {formatCurrency(totalIncome)}
                </div>
            </Card>

            {/* Expense */}
            <Card variant="glass">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'hsla(var(--hue-danger), 85%, 60%, 0.1)',
                        color: 'hsl(var(--color-expense))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>↑</div>
                    <h3 style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem', fontWeight: 500 }}>
                        Expense
                    </h3>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'hsl(var(--color-expense))' }}>
                    {formatCurrency(totalExpense)}
                </div>
            </Card>
        </div>
    );
}
