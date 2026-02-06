import React from 'react';
import { Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFriends } from '@/context/FriendContext';
import { useGroups } from '@/context/GroupContext';
import { useExpenses } from '@/context/ExpenseContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { Expense } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

interface TransactionListProps {
    expenses: Expense[];
    onDelete: (id: string) => void;
    onEdit: (expense: Expense) => void;
    currency?: string;
}

export function TransactionList({ expenses, onDelete, onEdit, currency = 'USD' }: TransactionListProps) {
    const { user: userInfo } = useAuth();
    const [deleteId, setDeleteId] = React.useState<string | null>(null);
    const { friends } = useFriends();
    const { groups } = useGroups();
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
                    onClick={() => onEdit(expense)}
                    style={{
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s, background-color 0.2s',
                        borderLeft: `4px solid ${expense.type === 'income'
                            ? 'hsl(var(--color-income))'
                            : expense.type === 'transfer'
                                ? 'hsl(var(--color-text-main))'
                                : 'hsl(var(--color-expense))'
                            }`
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.01)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
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
                                }}
                            >
                                {expense.description}
                                {expense.splitDetails && (
                                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--color-primary))', marginLeft: '0.5rem', fontWeight: 400 }}>
                                        (Paid by {(() => {
                                            const payerId = expense.splitDetails.paidBy;
                                            if (payerId === 'me' || payerId === userInfo?.id) return 'You';

                                            // 1. Try Friends
                                            const friend = friends.find(f => f.id === payerId);
                                            if (friend) return friend.name;

                                            // 2. Try Group Members
                                            if (expense.group_id) {
                                                const group = groups.find(g => g.id === expense.group_id);
                                                const member = group?.members.find((m: any) => m._id === payerId || m.id === payerId);
                                                if (member) return member.name;
                                            }

                                            return 'Unknown';
                                        })()})
                                    </span>
                                )}
                            </span>
                        </Tooltip>
                        <span style={{ fontSize: '0.875rem', color: 'hsl(var(--color-text-muted))', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', rowGap: '0.25rem' }}>
                            <span>{formatDate(expense.date)} • {categories.find(c => c.name === expense.category)?.icon || '🏷️'} {expense.category}</span>
                            {expense.group_id && (
                                <span style={{
                                    fontSize: '0.7rem',
                                    background: 'hsl(var(--color-surface))',
                                    color: 'hsl(var(--color-primary))',
                                    border: '1px solid hsl(var(--color-border))',
                                    padding: '0.1rem 0.5rem',
                                    borderRadius: '999px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    fontWeight: 500,
                                    height: '20px',
                                    whiteSpace: 'nowrap'
                                }}>
                                    <Users size={10} strokeWidth={2} />
                                    <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {groups.find(g => g.id === expense.group_id)?.name || 'Group'}
                                    </span>
                                </span>
                            )}
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(expense);
                                }}
                                style={{ color: 'hsl(var(--color-text-muted))', padding: '0.25rem' }}
                            >
                                ✎
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // onDelete(expense.id); // REMOVED: Wait for confirmation
                                    setDeleteId(expense.id);
                                }}
                                style={{ color: 'hsl(var(--color-text-muted))', padding: '0.25rem' }}
                            >
                                ✕
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => {
                    console.log("Modal closing");
                    setDeleteId(null);
                }}
                onConfirm={() => {
                    console.log("Confirm clicked, deleteId:", deleteId);
                    if (deleteId) {
                        onDelete(deleteId);
                    } else {
                        console.error("deleteId is null!");
                    }
                }}
                title="Delete Transaction?"
                message="Are you sure you want to delete this transaction? This cannot be undone."
                confirmText="Delete"
                variant="danger"
            />
        </div >
    );
}
