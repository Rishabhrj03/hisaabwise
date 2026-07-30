import React from 'react';
import { useFriends } from '@/context/FriendContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { Expense } from '@/types';
import { Card } from '@/components/ui/Card';
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
    salary: '💼',
    freelance: '💻',
    investment: '📈',
    income: '💰',
    other: '📦',
};

const categoryColors: Record<string, string> = {
    food: '#f59e0b',
    grocery: '#10b981',
    shopping: '#8b5cf6',
    transport: '#3b82f6',
    travel: '#06b6d4',
    entertainment: '#ec4899',
    health: '#ef4444',
    bills: '#f97316',
    rent: '#84cc16',
    education: '#6366f1',
    salary: '#10b981',
    freelance: '#14b8a6',
    investment: '#a78bfa',
    income: '#22d3ee',
    other: '#94a3b8',
};

function getCategoryIcon(category: string): string {
    const key = category?.toLowerCase() ?? 'other';
    return categoryIcons[key] ?? categoryIcons.other;
}

function getCategoryColor(category: string): string {
    const key = category?.toLowerCase() ?? 'other';
    return categoryColors[key] ?? categoryColors.other;
}

export function TransactionList({ expenses, onDelete, onEdit, currency = 'USD' }: TransactionListProps) {
    const { friends } = useFriends();

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (expenses.length === 0) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--r-lg)',
                border: '1px dashed var(--border-default)',
            }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🧾</div>
                <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No transactions found</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Add your first transaction for this period</p>
            </div>
        );
    }

    return (
        <Card variant="default" style={{ padding: 0, overflow: 'hidden' }}>
            {expenses.map((tx, idx) => {
                const isIncome = tx.type === 'income';
                const icon = getCategoryIcon(tx.category);
                const color = isIncome ? '#10b981' : getCategoryColor(tx.category);

                return (
                    <div
                        key={tx.id}
                        className="tx-row"
                        style={{
                            borderBottom: idx < expenses.length - 1
                                ? '1px solid var(--border-subtle)'
                                : 'none',
                        }}
                    >
                        {/* Category Icon */}
                        <div
                            className="tx-icon"
                            style={{
                                background: `${color}22`,
                                border: `1px solid ${color}44`,
                            }}
                        >
                            {icon}
                        </div>

                        {/* Description + Meta */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Tooltip text={tx.description} position="top">
                                <div style={{
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: 'var(--text-primary)',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    cursor: 'help',
                                }}>
                                    {tx.description}
                                    {tx.splitDetails && (
                                        <span style={{
                                            fontSize: '0.7rem',
                                            color: 'var(--brand-from)',
                                            marginLeft: '0.5rem',
                                            fontWeight: 400,
                                            background: 'rgba(99,102,241,0.12)',
                                            padding: '0.1rem 0.4rem',
                                            borderRadius: '999px',
                                        }}>
                                            split
                                        </span>
                                    )}
                                    {tx.splitDetails && (
                                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.4rem' }}>
                                            Paid by {tx.splitDetails.paidBy === 'me' ? 'You' : friends.find(f => f.id === tx.splitDetails!.paidBy)?.name || 'Unknown'}
                                        </span>
                                    )}
                                </div>
                            </Tooltip>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    {formatDate(tx.date)}
                                </span>
                                <span style={{
                                    display: 'inline-flex',
                                    padding: '0.1rem 0.5rem',
                                    borderRadius: '999px',
                                    fontSize: '0.65rem',
                                    fontWeight: 600,
                                    letterSpacing: '0.03em',
                                    background: `${color}18`,
                                    color: color,
                                }}>
                                    {tx.category}
                                </span>
                            </div>
                        </div>

                        {/* Amount + Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                            <span style={{
                                fontWeight: 700,
                                fontSize: '0.925rem',
                                color: isIncome ? 'var(--income-color)' : 'var(--expense-color)',
                                fontVariantNumeric: 'tabular-nums',
                            }}>
                                {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>

                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(tx)}
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
        </Card>
    );
}
