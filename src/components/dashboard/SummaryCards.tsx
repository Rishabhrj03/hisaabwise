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

    const savingsRate = totalIncome > 0
        ? Math.max(0, Math.min(100, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)))
        : 0;

    const netChange = totalIncome - totalExpense;
    const isPositive = netChange >= 0;

    return (
        <div className="summary-cards-container">
            {/* ── Balance Card ── */}
            <div className="stat-card gradient-balance card-hover animate-fade-in stat-card-balance" style={{ animationDelay: '0ms' }}>

                {/* Decorative orb */}
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    zIndex: 0,
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div className="stat-card-label">Total Balance</div>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '0.375rem',
                            display: 'flex',
                        }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                            </svg>
                        </div>
                    </div>
                    <div className="stat-card-value animate-count-up">
                        {formatCurrency(totalBalance)}
                    </div>
                    <div className="stat-card-sub" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.75rem' }}>
                        <span style={{
                            background: isPositive ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)',
                            color: isPositive ? '#6ee7b7' : '#fda4af',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                        }}>
                            {isPositive ? '▲' : '▼'} {formatCurrency(Math.abs(netChange))}
                        </span>
                        <span>net this month</span>
                    </div>
                </div>
            </div>

            {/* ── Income Card ── */}
            <div className="stat-card gradient-income card-hover animate-fade-in" style={{ animationDelay: '80ms' }}>
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    zIndex: 0,
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div className="stat-card-label">Total Income</div>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '0.375rem',
                            display: 'flex',
                        }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                <polyline points="17 6 23 6 23 12" />
                            </svg>
                        </div>
                    </div>
                    <div className="stat-card-value animate-count-up">
                        {formatCurrency(totalIncome)}
                    </div>
                    <div className="stat-card-sub" style={{ marginTop: '0.75rem' }}>
                        Savings rate: <strong style={{ color: 'white' }}>{savingsRate}%</strong>
                    </div>
                </div>
            </div>

            {/* ── Expense Card ── */}
            <div className="stat-card gradient-expense card-hover animate-fade-in" style={{ animationDelay: '160ms' }}>
                <div style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    zIndex: 0,
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div className="stat-card-label">Total Expenses</div>
                        <div style={{
                            background: 'rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '0.375rem',
                            display: 'flex',
                        }}>
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                                <polyline points="17 18 23 18 23 12" />
                            </svg>
                        </div>
                    </div>
                    <div className="stat-card-value animate-count-up">
                        {formatCurrency(totalExpense)}
                    </div>
                    <div className="stat-card-sub" style={{ marginTop: '0.75rem' }}>
                        {totalIncome > 0
                            ? `${Math.min(100, Math.round((totalExpense / totalIncome) * 100))}% of income`
                            : 'No income tracked'}
                    </div>
                </div>
            </div>
        </div>
    );
}
