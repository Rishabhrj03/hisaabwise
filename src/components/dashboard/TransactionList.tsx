import React, { useState } from 'react';
import { useFriends } from '@/context/FriendContext';
import { Expense } from '@/types';
import { Button } from '@/components/ui/Button';

interface TransactionListProps {
    expenses: Expense[];
    onDelete: (id: string) => void;
    onEdit: (expense: Expense) => void;
    currency?: string;
}

const categoryIcons: Record<string, string> = {
    food: '🍔',
    grocery: '🛒',
    shopping: '🛍️',
    transport: '🚗',
    travel: '✈️',
    entertainment: '🎬',
    health: '💊',
    bills: '📄',
    rent: '🏠',
    education: '📚',
    salary: '💰',
    freelance: '💻',
    investment: '📈',
    income: '💰',
    other: '📦',
};

const categoryDisplayNames: Record<string, string> = {
    food: 'Food & Drinks',
    grocery: 'Food & Drinks',
    shopping: 'Shopping',
    transport: 'Transport',
    travel: 'Travel',
    entertainment: 'Entertainment',
    health: 'Health',
    bills: 'Bills & Utilities',
    rent: 'Rent',
    education: 'Education',
    salary: 'Income',
    freelance: 'Income',
    investment: 'Investments',
    income: 'Income',
    other: 'General',
};

function getCategoryIcon(category: string): string {
    const key = category?.toLowerCase() ?? 'other';
    return categoryIcons[key] ?? categoryIcons.other;
}

function getCategoryDisplayName(category: string): string {
    const key = category?.toLowerCase() ?? 'other';
    return categoryDisplayNames[key] ?? category;
}

function getDateHeaderLabel(dateStr: string): string {
    const target = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (target.toDateString() === today.toDateString()) {
        return `TODAY — ${target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`;
    } else if (target.toDateString() === yesterday.toDateString()) {
        return `YESTERDAY — ${target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}`;
    } else {
        return target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    }
}

function formatTime(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
        return '12:00 PM';
    }
}

export function TransactionList({ expenses, onDelete, onEdit, currency = 'USD' }: TransactionListProps) {
    const { friends } = useFriends();
    const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Filter categories list for top filter row
    const filterOptions = [
        'ALL',
        'INCOME',
        'EXPENSES',
        'FOOD',
        'GROCERY',
        'SHOPPING',
        'TRANSPORT',
        'HEALTH',
        'BILLS',
    ];

    // Filter expenses based on selected filter
    const filteredExpenses = expenses.filter((tx) => {
        if (selectedFilter === 'ALL') return true;
        if (selectedFilter === 'INCOME') return tx.type === 'income';
        if (selectedFilter === 'EXPENSES') return tx.type === 'expense';
        return tx.category?.toUpperCase() === selectedFilter;
    });

    // Group expenses by date string (YYYY-MM-DD)
    const groupedExpenses = filteredExpenses.reduce((acc, expense) => {
        const dateKey = new Date(expense.date).toISOString().split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(expense);
        return acc;
    }, {} as Record<string, Expense[]>);

    const sortedDateKeys = Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* ── Top Filter Chips Row (Ref. Mockup Style) ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '0.4rem',
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
            }}>
                {filterOptions.map((opt) => {
                    const isActive = selectedFilter === opt;
                    return (
                        <button
                            key={opt}
                            onClick={() => setSelectedFilter(opt)}
                            style={{
                                padding: '0.4rem 0.85rem',
                                borderRadius: '10px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                letterSpacing: '0.06em',
                                border: isActive ? 'none' : '1px solid var(--border-default)',
                                background: isActive ? '#a3e635' : 'var(--bg-surface)',
                                color: isActive ? '#000000' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                            }}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>

            {filteredExpenses.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem 2rem',
                    background: 'var(--bg-surface)',
                    borderRadius: 'var(--r-lg)',
                    border: '1px dashed var(--border-default)',
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🧾</div>
                    <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No transactions found</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>No items match your selected filter</p>
                </div>
            ) : (
                sortedDateKeys.map((dateKey) => {
                    const dayExpenses = groupedExpenses[dateKey];
                    const headerLabel = getDateHeaderLabel(dateKey);

                    return (
                        <div key={dateKey}>
                            {/* Day Header Label (Exact Mockup Style) */}
                            <div style={{
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                letterSpacing: '0.12em',
                                color: 'var(--text-muted)',
                                marginBottom: '0.65rem',
                                paddingLeft: '0.25rem',
                            }}>
                                {headerLabel}
                            </div>

                            {/* Transactions List */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem',
                            }}>
                                {dayExpenses.map((tx) => {
                                    const isIncome = tx.type === 'income';
                                    const icon = getCategoryIcon(tx.category);
                                    const categoryLabel = getCategoryDisplayName(tx.category);
                                    const isSplit = Boolean(tx.splitDetails && tx.splitDetails.shares && tx.splitDetails.shares.length > 0);
                                    const paidByName = tx.splitDetails?.paidBy === 'me'
                                        ? 'Paid by You'
                                        : `Paid by ${friends.find(f => f.id === tx.splitDetails!.paidBy)?.name || 'Unknown'}`;

                                    return (
                                        <div
                                            key={tx.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: '0.875rem',
                                                transition: 'background 0.15s ease',
                                            }}
                                        >
                                            {/* Left: Tile Icon */}
                                            <div style={{
                                                width: '44px',
                                                height: '44px',
                                                borderRadius: '14px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '1.2rem',
                                                flexShrink: 0,
                                            }}>
                                                {icon}
                                            </div>

                                            {/* Middle: Title (Uppercase) + Subtitle */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontWeight: 900,
                                                    fontSize: '0.9rem',
                                                    color: 'var(--text-primary)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.02em',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    marginBottom: '0.15rem',
                                                }}>
                                                    {tx.description}
                                                </div>

                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    fontSize: '0.72rem',
                                                    color: 'var(--text-muted)',
                                                    flexWrap: 'wrap',
                                                }}>
                                                    <span>{categoryLabel}</span>
                                                    {isSplit && (
                                                        <>
                                                            <span>•</span>
                                                            <span style={{
                                                                fontSize: '0.625rem',
                                                                fontWeight: 700,
                                                                color: '#a78bfa',
                                                                background: 'rgba(167, 139, 250, 0.15)',
                                                                padding: '0.05rem 0.35rem',
                                                                borderRadius: '4px',
                                                            }}>
                                                                split
                                                            </span>
                                                            <span>•</span>
                                                            <span>{paidByName}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Right: Amount + Time + Action Buttons */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                flexShrink: 0,
                                            }}>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{
                                                        fontWeight: 900,
                                                        fontSize: '1rem',
                                                        color: isIncome ? '#a3e635' : '#ffffff',
                                                        letterSpacing: '-0.02em',
                                                    }}>
                                                        {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                                                    </div>
                                                    <div style={{
                                                        fontSize: '0.65rem',
                                                        color: 'var(--text-muted)',
                                                        marginTop: '0.1rem',
                                                    }}>
                                                        {formatTime(tx.date)}
                                                    </div>
                                                </div>

                                                {/* Action buttons (Edit / Delete) */}
                                                <div style={{ display: 'flex', gap: '0.15rem' }}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEdit(tx)}
                                                        title="Edit transaction"
                                                        style={{
                                                            padding: '0.3rem',
                                                            borderRadius: '6px',
                                                            color: 'var(--text-muted)',
                                                            minWidth: 'unset',
                                                        }}
                                                    >
                                                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                                                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                        </svg>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onDelete(tx.id)}
                                                        title="Delete transaction"
                                                        style={{
                                                            padding: '0.3rem',
                                                            borderRadius: '6px',
                                                            color: 'var(--text-muted)',
                                                            minWidth: 'unset',
                                                        }}
                                                    >
                                                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                            <polyline points="3 6 5 6 21 6" />
                                                            <path d="M19 6l-1 14H6L5 6" />
                                                            <path d="M10 11v6M14 11v6" />
                                                            <path d="M9 6V4h6v2" />
                                                        </svg>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
