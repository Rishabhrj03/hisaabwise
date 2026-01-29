import React from 'react';
import { useFriends } from '@/context/FriendContext';
import { useExpenses } from '@/context/ExpenseContext';
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

export function TransactionList({ expenses, onDelete, onEdit, currency = 'USD' }: TransactionListProps) {
    const { friends } = useFriends();
    const { categories } = useExpenses();
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    if (expenses.length === 0) {
        return (
            <Card variant="glass" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'hsl(var(--color-text-muted))' }}>No transactions found for this period.</p>
            </Card>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>History</h3>
            {expenses.map((expense) => (
                <Card
                    key={expense.id}
                    variant="glass"
                    style={{
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderLeft: `4px solid ${expense.type === 'income'
                            ? 'hsl(var(--color-income))'
                            : expense.type === 'transfer'
                                ? 'hsl(var(--color-text-main))'
                                : 'hsl(var(--color-expense))'
                            }`
                    }}
                >
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, marginRight: '1rem' }}>
                        <Tooltip text={expense.description} position="top">
                            <span
                                style={{
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: 'block',
                                    cursor: 'help'
                                }}
                            >
                                {expense.description}
                                {expense.splitDetails && (
                                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--color-primary))', marginLeft: '0.5rem', fontWeight: 400 }}>
                                        (Paid by {expense.splitDetails.paidBy === 'me' ? 'You' : friends.find(f => f.id === expense.splitDetails!.paidBy)?.name || 'Unknown'})
                                    </span>
                                )}
                            </span>
                        </Tooltip>
                        <span style={{ fontSize: '0.875rem', color: 'hsl(var(--color-text-muted))' }}>
                            {formatDate(expense.date)} • {categories.find(c => c.name === expense.category)?.icon || '🏷️'} {expense.category}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                        <span style={{
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                            color: expense.type === 'income'
                                ? 'hsl(var(--color-income))'
                                : expense.type === 'transfer'
                                    ? 'hsl(var(--color-text-main))' // Neutral for transfer
                                    : 'hsl(var(--color-expense))'
                        }}>
                            {expense.type === 'income' ? '+' : expense.type === 'transfer' ? '⇄ ' : '-'}{formatCurrency(expense.amount)}
                        </span>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEdit(expense)}
                                style={{ color: 'hsl(var(--color-text-muted))', padding: '0.25rem' }}
                            >
                                ✎
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDelete(expense.id)}
                                style={{ color: 'hsl(var(--color-text-muted))', padding: '0.25rem' }}
                            >
                                ✕
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
