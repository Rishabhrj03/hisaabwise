import React, { useState } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { useFriends } from '@/context/FriendContext';
import { useGroups } from '@/context/GroupContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Expense } from '@/types';

interface AddExpenseFormProps {
    onClose?: () => void;
    initialData?: Expense;
}

export function AddExpenseForm({ onClose, initialData }: AddExpenseFormProps) {
    const { addExpense, updateExpense } = useExpenses();
    const { friends } = useFriends();
    const { groups } = useGroups();

    // Form State
    const [description, setDescription] = useState(initialData?.description || '');
    const [amount, setAmount] = useState(initialData?.amount.toString() || '');
    const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense');
    const [category, setCategory] = useState(initialData?.category || '');
    const [selectedGroupId, setSelectedGroupId] = useState<string>(initialData?.group_id || '');

    // Splitwise Logic
    const [paidBy, setPaidBy] = useState(initialData?.splitDetails?.paidBy || 'me');
    const [splitWith, setSplitWith] = useState<string[]>(
        initialData?.splitDetails?.shares.map(s => s.userId) || ['me']
    );

    const handleGroupChange = (groupId: string) => {
        setSelectedGroupId(groupId);
        if (groupId) {
            // If group selected, auto-select all members in splitWith
            const group = groups.find(g => g.id === groupId);
            if (group) {
                // Filter splitWith to only include group members + me
                setSplitWith(['me', ...group.members]);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        const numAmount = parseFloat(amount);
        let splitDetails = undefined;
        let relatedTo = undefined;

        // Calculate Splits if friends are involved
        if (friends.length > 0 && type === 'expense' && splitWith.length > 0) {
            const totalPeople = splitWith.length;
            const shareAmount = parseFloat((numAmount / totalPeople).toFixed(2));

            const shares = splitWith.map(id => ({ userId: id, amount: shareAmount }));

            // Adjust for rounding errors on the first person
            const totalCalculated = shares.reduce((acc, curr) => acc + curr.amount, 0);
            if (totalCalculated !== numAmount) {
                shares[0].amount += parseFloat((numAmount - totalCalculated).toFixed(2));
            }

            splitDetails = {
                paidBy,
                shares
            };

            const peopleInvolved = new Set([...splitWith, paidBy]);
            peopleInvolved.delete('me');
            relatedTo = Array.from(peopleInvolved);
        }

        const expenseData = {
            description,
            amount: numAmount,
            type,
            category: category || 'General',
            date: initialData?.date || new Date().toISOString(),
            relatedTo: relatedTo,
            splitDetails: splitDetails,
            group_id: selectedGroupId || null
        };

        if (initialData) {
            updateExpense(initialData.id, expenseData);
        } else {
            addExpense(expenseData);
        }

        // Reset form
        setDescription('');
        setAmount('');
        setCategory('');
        setPaidBy('me');
        setSplitWith(['me']);
        if (onClose) onClose();
    };

    const toggleSplitWith = (friendId: string) => {
        setSplitWith(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Type Selection */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                <Button
                    type="button"
                    variant={type === 'expense' ? 'danger' : 'secondary'}
                    onClick={() => setType('expense')}
                    style={{ flex: 1 }}
                >
                    Expense
                </Button>
                <Button
                    type="button"
                    variant={type === 'income' ? 'primary' : 'secondary'}
                    onClick={() => setType('income')}
                    style={{
                        flex: 1,
                        backgroundColor: type === 'income' ? 'hsl(var(--color-income))' : undefined,
                        borderColor: type === 'income' ? 'transparent' : undefined,
                        color: type === 'income' ? '#fff' : undefined
                    }}
                >
                    Income
                </Button>
            </div>

            <Input
                label="Description"
                placeholder="e.g. Groceries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />

            <Input
                label="Amount"
                type="number"
                placeholder="0.00"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
            />

            {/* Group Selection */}
            {type === 'expense' && groups.length > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                    <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--color-text-muted))', display: 'block', marginBottom: '0.5rem' }}>
                        Group (Optional)
                    </label>
                    <select
                        value={selectedGroupId}
                        onChange={(e) => handleGroupChange(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid hsl(var(--color-border))',
                            background: 'hsl(var(--color-background))',
                            color: 'hsl(var(--color-text-main))'
                        }}
                    >
                        <option value="">No Group</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {/* Splitwise Section - Only for Expenses */}
            {type === 'expense' && friends.length > 0 && (
                <Card variant="glass" style={{ padding: '0.75rem', border: '1px solid hsl(var(--color-border))' }}>
                    <div style={{ marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--color-text-muted))', display: 'block', marginBottom: '0.5rem' }}>
                            Paid By
                        </label>
                        <select
                            value={paidBy}
                            onChange={(e) => {
                                const newPayer = e.target.value;
                                setPaidBy(newPayer);
                                // Ensure new payer is included by default if not already
                                if (!splitWith.includes(newPayer)) {
                                    setSplitWith(prev => [...prev, newPayer]);
                                }
                            }}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid hsl(var(--color-border))',
                                background: 'hsl(var(--color-background))',
                                color: 'hsl(var(--color-text-main))'
                            }}
                        >
                            <option value="me">Me</option>
                            {friends.map(f => (
                                <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--color-text-muted))', display: 'block', marginBottom: '0.5rem' }}>
                            Split With (Equally)
                        </label>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', cursor: 'pointer', color: 'hsl(var(--color-text-main))' }}>
                                <input
                                    type="checkbox"
                                    checked={splitWith.includes(paidBy)}
                                    onChange={() => toggleSplitWith(paidBy)}
                                    style={{ width: '1rem', height: '1rem' }}
                                />
                                Include {paidBy === 'me' ? 'You' : friends.find(f => f.id === paidBy)?.name} in split
                            </label>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {/* Option for Me - Show only if I am NOT the payer */}
                            {paidBy !== 'me' && (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={splitWith.includes('me') ? 'primary' : 'secondary'}
                                    onClick={() => toggleSplitWith('me')}
                                    style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        background: splitWith.includes('me') ? 'hsl(var(--color-primary))' : 'hsl(var(--color-surface))',
                                        border: splitWith.includes('me') ? 'none' : '1px solid hsl(var(--color-border))'
                                    }}
                                >
                                    You {splitWith.includes('me') ? '✓' : '+'}
                                </Button>
                            )}

                            {friends
                                .filter(f => f.id !== paidBy) // Hide payer from buttons
                                .map(f => (
                                    <Button
                                        key={f.id}
                                        type="button"
                                        size="sm"
                                        variant={splitWith.includes(f.id) ? 'primary' : 'secondary'}
                                        onClick={() => toggleSplitWith(f.id)}
                                        style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            background: splitWith.includes(f.id) ? 'hsl(var(--color-primary))' : 'hsl(var(--color-surface))',
                                            border: splitWith.includes(f.id) ? 'none' : '1px solid hsl(var(--color-border))'
                                        }}
                                    >
                                        {f.name} {splitWith.includes(f.id) ? '✓' : '+'}
                                    </Button>
                                ))}
                        </div>
                    </div>
                </Card>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                <label style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'hsl(var(--color-text-muted))'
                }}>
                    Category
                </label>
                <select
                    style={{
                        width: '100%',
                        padding: '0.875rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsl(var(--color-border))',
                        background: 'hsl(var(--color-surface))',
                        color: 'hsl(var(--color-text-main))',
                        fontSize: '1rem',
                        outline: 'none',
                        appearance: 'none',
                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4L146.2%20210.2c-5.3%205.3-13.8%205.3-19.1%200L11.5%2069.4c-5.3-5.3-5.3-13.8%200-19.1l8.5-8.5c5.3-5.3%2013.8-5.3%2019.1%200L136%20136l96-94.2c5.3-5.3%2013.8-5.3%2019.1%200l8.5%208.5c5.3%205.3%205.3%2013.8%200%2019.1z%22%2F%3E%3C%2Fsvg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 0.7rem top 50%',
                        backgroundSize: '0.65rem auto',
                    }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                >
                    <option value="" disabled>Select a category</option>
                    {type === 'expense' ? (
                        <>
                            <option value="Food">Food & Dining</option>
                            <option value="Transport">Transportation</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Bills">Bills & Utilities</option>
                            <option value="Health">Health & Fitness</option>
                            <option value="Other">Other</option>
                        </>
                    ) : (
                        <>
                            <option value="Salary">Salary</option>
                            <option value="Freelance">Freelance</option>
                            <option value="Investments">Investments</option>
                            <option value="Gift">Gift</option>
                            <option value="Other">Other</option>
                        </>
                    )}
                </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <Button type="submit" style={{ flex: 1 }}>
                    {initialData ? 'Update Transaction' : 'Add Transaction'}
                </Button>
                {onClose && (
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
