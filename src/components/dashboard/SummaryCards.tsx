import React from 'react';
import { Card } from '@/components/ui/Card';
import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '0'
        }}>
            {/* Total Balance - Professional Wallet */}
            <div className="glass-panel" style={{
                background: 'linear-gradient(135deg, hsl(230, 20%, 15%), hsl(230, 20%, 10%))',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem', // Fixed padding
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '160px',
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 20px 40px -12px rgba(0,0,0,0.4)'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem',
                        color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 500
                    }}>
                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex' }}>
                            <Wallet size={18} color="white" />
                        </div>
                        Total Balance
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
                        {formatCurrency(totalBalance)}
                    </div>
                </div>

                {/* Subtle sheen effect */}
                <div style={{
                    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
                    background: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.08) 0%, transparent 40%)',
                    pointerEvents: 'none'
                }} />
            </div>

            {/* Income */}
            <Card variant="glass" style={{
                minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '1.5rem', // Explicit padding to match
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem', fontWeight: 500
                    }}>
                        <div style={{
                            padding: '8px', borderRadius: '10px',
                            background: 'hsla(var(--hue-success), 80%, 40%, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'hsl(var(--hue-success), 80%, 60%)'
                        }}>
                            <TrendingUp size={18} />
                        </div>
                        Total Income
                    </div>
                    <div style={{
                        padding: '4px 10px', borderRadius: '20px',
                        background: 'hsla(var(--hue-success), 80%, 40%, 0.15)',
                        color: 'hsl(var(--hue-success), 80%, 60%)', fontSize: '0.75rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <ArrowUpRight size={14} /> 2.5%
                    </div>
                </div>

                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--color-text-main))', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {formatCurrency(totalIncome)}
                </div>
            </Card>

            {/* Expense */}
            <Card variant="glass" style={{
                minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                padding: '1.5rem', // Explicit padding to match
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem', fontWeight: 500
                    }}>
                        <div style={{
                            padding: '8px', borderRadius: '10px',
                            background: 'hsla(var(--hue-danger), 80%, 50%, 0.15)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'hsl(var(--hue-danger), 90%, 70%)'
                        }}>
                            <TrendingDown size={18} />
                        </div>
                        Total Expense
                    </div>
                    <div style={{
                        padding: '4px 10px', borderRadius: '20px',
                        background: 'hsla(var(--hue-danger), 80%, 50%, 0.15)',
                        color: 'hsl(var(--hue-danger), 90%, 70%)', fontSize: '0.75rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                        <ArrowDownRight size={14} /> 4.1%
                    </div>
                </div>

                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--color-text-main))', letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {formatCurrency(totalExpense)}
                </div>
            </Card>
        </div>
    );
}
