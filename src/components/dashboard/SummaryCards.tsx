import React from 'react';

interface SummaryCardsProps {
    totalBalance: number;
    totalIncome: number;
    totalExpense: number;
    currency?: string;
}

export function SummaryCards({ totalBalance, totalIncome, totalExpense, currency = 'USD' }: SummaryCardsProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const savings = Math.max(0, totalIncome - totalExpense);
    const savingsRate = totalIncome > 0
        ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)))
        : 0;

    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

    return (
        <div className="summary-cards-container">
            {/* ── Hero Balance Card (Exact Screen 1 Mockup Style) ── */}
            <div className="stat-card gradient-balance card-hover animate-fade-in stat-card-balance" style={{
                animationDelay: '0ms',
                background: 'linear-gradient(135deg, #4338ca, #6d28d9, #7c3aed)',
                boxShadow: '0 12px 32px rgba(109, 40, 217, 0.35)',
                padding: '1.5rem',
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Top Row: Month tag */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: 600,
                            letterSpacing: '0.08em',
                            color: 'rgba(255, 255, 255, 0.7)',
                            textTransform: 'uppercase',
                        }}>
                            {currentMonth}
                        </span>
                    </div>


                    {/* Giant Main Balance Display */}
                    <div style={{
                        fontSize: '2.6rem',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        lineHeight: 1.1,
                        marginBottom: '0.25rem',
                        color: '#ffffff',
                    }} className="animate-count-up">
                        {formatCurrency(totalBalance)}
                    </div>
                </div>

            </div>

            {/* ── Income Mini Card ── */}
            <div className="stat-card gradient-income card-hover animate-fade-in" style={{ animationDelay: '80ms' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>Income</div>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '999px',
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: '#ffffff',
                        }}>
                            ↑ {savingsRate}%
                        </div>
                    </div>
                    <div className="stat-card-value animate-count-up" style={{ fontSize: '1.65rem', fontWeight: 800 }}>
                        {formatCurrency(totalIncome)}
                    </div>
                </div>
            </div>

            {/* ── Expense Mini Card ── */}
            <div className="stat-card gradient-expense card-hover animate-fade-in" style={{ animationDelay: '160ms' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>Expenses</div>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '999px',
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: '#ffffff',
                        }}>
                            {totalIncome > 0 ? `${Math.min(100, Math.round((totalExpense / totalIncome) * 100))}%` : '0%'}
                        </div>
                    </div>
                    <div className="stat-card-value animate-count-up" style={{ fontSize: '1.65rem', fontWeight: 800 }}>
                        {formatCurrency(totalExpense)}
                    </div>
                </div>
            </div>
        </div>
    );
}
