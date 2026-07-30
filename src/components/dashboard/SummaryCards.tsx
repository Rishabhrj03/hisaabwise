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

    const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();

    return (
        <div className="summary-cards-container">
            {/* ── Minimalist Hero Balance Card ── */}
            <div className="stat-card gradient-balance card-hover animate-fade-in stat-card-balance" style={{ animationDelay: '0ms' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* Header Row */}
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


                    {/* Main Balance Display */}
                    <div style={{
                        fontSize: '2.4rem',
                        fontWeight: 900,
                        letterSpacing: '-0.04em',
                        lineHeight: 1.1,
                        marginBottom: '1rem',
                        color: '#ffffff',
                    }} className="animate-count-up">
                        {formatCurrency(totalBalance)}
                    </div>

                    {/* Minimal Breakdown Bar (Income | Expenses | Saved) */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        paddingTop: '0.75rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.18)',
                        flexWrap: 'wrap',
                    }}>
                        {/* Income */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <div style={{ width: '3px', height: '12px', borderRadius: '2px', background: '#34d399' }} />
                            <div>
                                <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>
                                    INCOME
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#6ee7b7' }}>
                                    +{formatCurrency(totalIncome)}
                                </div>
                            </div>
                        </div>

                        {/* Expense */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <div style={{ width: '3px', height: '12px', borderRadius: '2px', background: '#f87171' }} />
                            <div>
                                <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>
                                    EXPENSES
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fca5a5' }}>
                                    -{formatCurrency(totalExpense)}
                                </div>
                            </div>
                        </div>

                        {/* Saved */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <div style={{ width: '3px', height: '12px', borderRadius: '2px', background: '#facc15' }} />
                            <div>
                                <div style={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.05em' }}>
                                    SAVED
                                </div>
                                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fef08a' }}>
                                    {formatCurrency(savings)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Income Mini Card ── */}
            <div className="stat-card gradient-income card-hover animate-fade-in" style={{ animationDelay: '80ms' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>Total Income</div>
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
                    <div className="stat-card-sub" style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>
                        Monthly inflow
                    </div>
                </div>
            </div>

            {/* ── Expense Mini Card ── */}
            <div className="stat-card gradient-expense card-hover animate-fade-in" style={{ animationDelay: '160ms' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div className="stat-card-label" style={{ color: 'rgba(255,255,255,0.85)', margin: 0 }}>Total Expenses</div>
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
                    <div className="stat-card-sub" style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: 'rgba(255,255,255,0.8)' }}>
                        Monthly outflow
                    </div>
                </div>
            </div>
        </div>
    );
}
