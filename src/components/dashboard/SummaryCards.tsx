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
        <div className="summary-grid">
            {/* Total Balance - Professional Wallet */}
            <div className="glass-panel summary-card-balance" style={{
                background: 'linear-gradient(135deg, hsl(230, 20%, 15%), hsl(230, 20%, 10%))',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '140px', /* Slightly reduced height */
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: '0 20px 40px -12px rgba(0,0,0,0.4)'
            }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem',
                        color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', fontWeight: 500
                    }}>
                        <div style={{ padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex' }}>
                            <Wallet size={18} color="white" />
                        </div>
                        Total Balance
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: 'white', letterSpacing: '-0.03em', lineHeight: 1 }}>
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
            <div className="summary-card-small">
                <Card variant="glass" style={{
                    height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                    minHeight: '130px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: 'hsl(var(--color-text-muted))', fontSize: '0.85rem', fontWeight: 500
                        }}>
                            <div style={{
                                padding: '6px', borderRadius: '8px',
                                background: 'hsla(var(--hue-success), 80%, 40%, 0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'hsl(var(--hue-success), 80%, 60%)'
                            }}>
                                <TrendingUp size={16} />
                            </div>
                            Income
                        </div>
                    </div>

                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'hsl(var(--color-text-main))', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {formatCurrency(totalIncome)}
                    </div>
                </Card>
            </div>

            {/* Expense */}
            <div className="summary-card-small">
                <Card variant="glass" style={{
                    height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.02))',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                    minHeight: '130px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            color: 'hsl(var(--color-text-muted))', fontSize: '0.85rem', fontWeight: 500
                        }}>
                            <div style={{
                                padding: '6px', borderRadius: '8px',
                                background: 'hsla(var(--hue-danger), 80%, 50%, 0.15)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'hsl(var(--hue-danger), 90%, 70%)'
                            }}>
                                <TrendingDown size={16} />
                            </div>
                            Expense
                        </div>
                    </div>

                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'hsl(var(--color-text-main))', letterSpacing: '-0.02em', lineHeight: 1 }}>
                        {formatCurrency(totalExpense)}
                    </div>
                </Card>
            </div>
        </div>
    );
}
