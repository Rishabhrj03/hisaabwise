import React, { useState } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';
import confetti from 'canvas-confetti';
import { useExpenses } from '@/context/ExpenseContext';
import { useFriends } from '@/context/FriendContext';
import { useGroups } from '@/context/GroupContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Expense } from '@/types';
import { CategoryManager } from './CategoryManager';

import { useAuth } from '@/context/AuthContext';

interface AddExpenseFormProps {
    onClose?: () => void;
    initialData?: Expense;
}

import { AlertModal } from '@/components/ui/AlertModal';

export function AddExpenseForm({ onClose, initialData }: AddExpenseFormProps) {
    const { addExpense, updateExpense, categories } = useExpenses();
    const { friends } = useFriends();
    const { groups } = useGroups();
    const { user } = useAuth(); // Get current user

    // Form State
    const [description, setDescription] = useState(initialData?.description || '');
    const [amount, setAmount] = useState(initialData?.amount.toString() || '');
    const [type, setType] = useState<'income' | 'expense' | 'transfer'>(initialData?.type || 'expense');
    const [category, setCategory] = useState(initialData?.category || '');
    const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    const [selectedGroupId, setSelectedGroupId] = useState<string>(initialData?.group_id || '');
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '' });

    // Splitwise Logic
    const [paidBy, setPaidBy] = useState(initialData?.splitDetails?.paidBy || 'me');
    const [splitWith, setSplitWith] = useState<string[]>(
        initialData?.splitDetails?.shares.map(s => s.userId) || ['me']
    );
    const [splitMethod, setSplitMethod] = useState<'equal' | 'amount' | 'percentage'>('equal');
    const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});

    // Update state when user loads to replace 'me' with actual ID
    React.useEffect(() => {
        if (user?.id) {
            setPaidBy(prev => prev === 'me' ? user.id : prev);
            setSplitWith(prev => prev.map(id => id === 'me' ? user.id : id));
        }
    }, [user]);

    const handleSplitMethodChange = (method: 'equal' | 'amount' | 'percentage') => {
        setSplitMethod(method);
        // Reset custom amounts when switching
        setCustomAmounts({});
    };

    const handleCustomAmountChange = (userId: string, value: string) => {
        setCustomAmounts(prev => ({ ...prev, [userId]: value }));
    };

    const handleGroupChange = (groupId: string) => {
        setSelectedGroupId(groupId);
        if (groupId) {
            // If group selected, auto-select all members in splitWith
            const group = groups.find(g => g.id === groupId);
            if (group) {
                // Filter splitWith to only include group members
                // Ensure unique IDs
                const uniqueMembers = Array.from(new Set([...group.members.map(m => m._id), user?.id || 'me']));
                setSplitWith(uniqueMembers);

                // Also reset paidBy if the current payer is not in the group
                if (paidBy !== (user?.id || 'me') && !group.members.some(m => m._id === paidBy)) {
                    setPaidBy(user?.id || 'me');
                }
            }
        } else {
            // If group deselected, maybe reset or keep as is? 
            // Let's keep as is or reset to just me? User choice, but simpler to keep.
        }
    };

    // Auto-detect Opening Balance date
    React.useEffect(() => {
        if (!initialData && description.toLowerCase().includes('opening')) {
            const now = new Date();
            // Set to 1st of month
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            // Format YYYY-MM-DD (local time via offset trick or string manipulation)
            const year = firstDay.getFullYear();
            const month = String(firstDay.getMonth() + 1).padStart(2, '0');
            const day = String(firstDay.getDate()).padStart(2, '0');
            setDate(`${year}-${month}-${day}`);
        }
    }, [description, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount) return;

        const numAmount = parseFloat(amount);
        let splitDetails = undefined;
        let relatedTo = undefined;

        // Calculate Splits if friends are involved
        if (friends.length > 0 && type === 'expense' && splitWith.length > 0) {
            let shares: { userId: string, amount: number }[] = [];

            if (splitMethod === 'equal') {
                const totalPeople = splitWith.length;
                const shareAmount = parseFloat((numAmount / totalPeople).toFixed(2));
                shares = splitWith.map(id => ({ userId: id, amount: shareAmount }));

                // Adjust for rounding errors on the first person
                const totalCalculated = shares.reduce((acc, curr) => acc + curr.amount, 0);
                if (totalCalculated !== numAmount) {
                    shares[0].amount += parseFloat((numAmount - totalCalculated).toFixed(2));
                }
            } else if (splitMethod === 'amount') {
                shares = splitWith.map(id => ({
                    userId: id,
                    amount: parseFloat(customAmounts[id] || '0')
                }));
                // Validation: Check sum matches total
                const totalAssigned = shares.reduce((acc, curr) => acc + curr.amount, 0);
                if (Math.abs(totalAssigned - numAmount) > 0.05) {
                    setAlertConfig({
                        isOpen: true,
                        title: 'Split Error',
                        message: `Total split amount (${totalAssigned}) must equal expense amount (${numAmount})`
                    });
                    return;
                }
            } else if (splitMethod === 'percentage') {
                let currentTotal = 0;
                shares = splitWith.map((id, index) => {
                    const pct = parseFloat(customAmounts[id] || '0');
                    let amt = parseFloat((numAmount * (pct / 100)).toFixed(2));

                    // Adjust last person to ensure total matches exactly to avoid rounding drifts
                    if (index === splitWith.length - 1) {
                        const remaining = numAmount - currentTotal;
                        if (Math.abs(remaining - amt) < 0.1) amt = remaining;
                    }

                    currentTotal += amt;
                    return { userId: id, amount: amt };
                });

                // Validation: Check percentages sum to 100
                const totalPct = splitWith.reduce((acc, id) => acc + parseFloat(customAmounts[id] || '0'), 0);
                if (Math.abs(totalPct - 100) > 0.5) {
                    setAlertConfig({
                        isOpen: true,
                        title: 'Split Error',
                        message: `Total percentages (${totalPct}%) must equal 100%`
                    });
                    return;
                }
            }

            splitDetails = {
                paidBy,
                shares
            };

            const peopleInvolved = new Set([...splitWith, paidBy]);
            peopleInvolved.delete(user?.id || 'me'); // Remove current user from relatedTo
            relatedTo = Array.from(peopleInvolved);
        }

        const expenseData = {
            description,
            amount: numAmount,
            type,
            category: category || 'General',
            date: new Date(date).toISOString(), // Use the user-selected date
            relatedTo: relatedTo,
            splitDetails: splitDetails,
            group_id: selectedGroupId || null
        };

        if (initialData?.id) {
            updateExpense(initialData.id, expenseData);
        } else {
            addExpense(expenseData);

            // Track Event
            sendGTMEvent({
                event: 'transaction_added',
                value: {
                    type,
                    amount: numAmount,
                    category: category || 'General',
                    has_splits: !!splitDetails
                }
            });

            // Trigger confetti if income is added
            if (type === 'income') {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            }
        }

        // Reset form
        setDescription('');
        setAmount('');
        setCategory('');
        setPaidBy(user?.id || 'me');
        setSplitWith([user?.id || 'me']);
        // Reset date to today
        setDate(new Date().toISOString().split('T')[0]);

        // Voice Feedback
        if ('speechSynthesis' in window) {
            const action = initialData?.id ? 'Updated' : 'Added';
            const utterance = new SpeechSynthesisUtterance(`${action} expense of ${numAmount} for ${description}`);
            window.speechSynthesis.speak(utterance);
        }

        if (onClose) onClose();
    };

    const toggleSplitWith = (friendId: string) => {
        setSplitWith(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const currentUserId = user?.id || 'me';
    const currentUserName = user?.name || 'You';

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            {/* Type Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Button
                    type="button"
                    variant={type === 'expense' ? 'danger' : 'secondary'}
                    onClick={() => {
                        setType('expense');
                        setCategory(''); // Reset category for expense
                    }}
                    style={{
                        opacity: type === 'expense' ? 1 : 0.7,
                        border: type === 'expense' ? '2px solid transparent' : '1px solid var(--color-border)'
                    }}
                >
                    Expense
                </Button>
                <Button
                    type="button"
                    variant={type === 'income' ? 'primary' : 'secondary'}
                    onClick={() => {
                        setType('income');
                        setCategory('Salary'); // Default for income
                    }}
                    style={{
                        backgroundColor: type === 'income' ? 'hsl(var(--color-income))' : undefined,
                        borderColor: type === 'income' ? 'transparent' : undefined,
                        color: type === 'income' ? '#fff' : undefined,
                        opacity: type === 'income' ? 1 : 0.7
                    }}
                >
                    Income
                </Button>
                <Button
                    type="button"
                    variant={type === 'transfer' ? 'primary' : 'secondary'}
                    onClick={() => {
                        setType('transfer');
                        setCategory('Transfer'); // Auto-set category
                    }}
                    style={{
                        backgroundColor: type === 'transfer' ? 'hsl(var(--color-text-main))' : undefined,
                        color: type === 'transfer' ? 'hsl(var(--color-background))' : undefined,
                        borderColor: type === 'transfer' ? 'transparent' : undefined,
                        opacity: type === 'transfer' ? 1 : 0.7
                    }}
                >
                    Transfer
                </Button>
            </div>

            <Input
                label="Description"
                placeholder="e.g. Groceries"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ flex: 1 }}>
                    <Input
                        label="Amount"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div style={{ flex: 1 }}>
                    <Input
                        label="Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>
            </div>

            {/* Group Selection */}
            {type === 'expense' && (
                <div style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--color-text-muted))' }}>
                            Group (Optional)
                        </label>
                        {/* Placeholder for future Group Management Modal */}
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))' }}>
                            {groups.length === 0 ? "Add groups on dashboard" : ""}
                        </span>
                    </div>
                    <select
                        value={selectedGroupId}
                        onChange={(e) => handleGroupChange(e.target.value)}
                        disabled={groups.length === 0}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid hsl(var(--color-border))',
                            background: 'hsl(var(--color-background))',
                            color: 'hsl(var(--color-text-main))',
                            opacity: groups.length === 0 ? 0.7 : 1
                        }}
                    >
                        <option value="">{groups.length === 0 ? "No groups available" : "No Group"}</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>
            )}

            {type === 'expense' && (
                <Card variant="glass" style={{ padding: '1.25rem', border: '1px solid hsl(var(--color-border))', borderRadius: 'var(--radius-lg)' }}>
                    {friends.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: 'hsl(var(--color-text-muted))' }}>
                            <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Add friends to split expenses!</p>
                            <p style={{ fontSize: '0.8rem' }}>Go to dashboard to add friends.</p>
                        </div>
                    ) : (
                        <>
                            {/* Paid By Section */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))', display: 'block', marginBottom: '0.75rem' }}>
                                    Paid By
                                </label>
                                <select
                                    value={paidBy}
                                    onChange={(e) => {
                                        const newPayer = e.target.value;
                                        setPaidBy(newPayer);
                                        if (!splitWith.includes(newPayer)) {
                                            setSplitWith(prev => [...prev, newPayer]);
                                        }
                                    }}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid hsl(var(--color-border))',
                                        background: 'hsl(var(--color-surface))',
                                        color: 'hsl(var(--color-text-main))',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        appearance: 'none',
                                        backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666666%22%20d%3D%22M287%2069.4L146.2%20210.2c-5.3%205.3-13.8%205.3-19.1%200L11.5%2069.4c-5.3-5.3-5.3-13.8%200-19.1l8.5-8.5c5.3-5.3%2013.8-5.3%2019.1%200L136%20136l96-94.2c5.3-5.3%2013.8-5.3%2019.1%200l8.5%208.5c5.3%205.3%205.3%2013.8%200%2019.1z%22%2F%3E%3C%2Fsvg%3E")`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 1rem top 50%',
                                        backgroundSize: '0.65rem auto',
                                    }}
                                >
                                    <option value={currentUserId}>{currentUserName}</option>
                                    {/* Show friends normally, OR show group members if group selected */}
                                    {selectedGroupId
                                        ? groups.find(g => g.id === selectedGroupId)?.members.map(m => (
                                            <option key={m._id} value={m._id}>{m.name}</option>
                                        ))
                                        : friends.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))
                                    }
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))', display: 'block', marginBottom: '0.75rem' }}>
                                    Split Method
                                </label>
                                <div style={{ display: 'flex', background: 'hsl(var(--color-surface))', padding: '0.25rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem', border: '1px solid hsl(var(--color-border))' }}>
                                    {(['equal', 'amount', 'percentage'] as const).map(m => (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => handleSplitMethodChange(m)}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem',
                                                borderRadius: 'var(--radius-md)',
                                                background: splitMethod === m ? 'hsl(var(--color-primary))' : 'transparent',
                                                color: splitMethod === m ? '#fff' : 'hsl(var(--color-text-muted))',
                                                border: 'none',
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                textTransform: 'capitalize',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: splitMethod === m ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                                            }}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>

                                {splitMethod === 'equal' ? (
                                    <>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem', cursor: 'pointer', color: 'hsl(var(--color-text-main))' }}>
                                                <div style={{
                                                    width: '1.25rem',
                                                    height: '1.25rem',
                                                    borderRadius: '4px',
                                                    border: '2px solid hsl(var(--color-primary))',
                                                    background: splitWith.includes(paidBy) ? 'hsl(var(--color-primary))' : 'transparent',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    transition: 'background 0.2s'
                                                }}>
                                                    {splitWith.includes(paidBy) && <span style={{ color: '#fff', fontSize: '0.75rem' }}>✓</span>}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={splitWith.includes(paidBy)}
                                                    onChange={() => toggleSplitWith(paidBy)}
                                                    style={{ display: 'none' }}
                                                />
                                                Include {paidBy === currentUserId
                                                    ? currentUserName
                                                    : (selectedGroupId
                                                        ? groups.find(g => g.id === selectedGroupId)?.members.find(m => m._id === paidBy)?.name
                                                        : friends.find(f => f.id === paidBy)?.name)} in split
                                            </label>
                                        </div>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                            {paidBy !== currentUserId && (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleSplitWith(currentUserId)}
                                                    style={{
                                                        padding: '0.5rem 1rem',
                                                        borderRadius: '999px',
                                                        fontSize: '0.875rem',
                                                        fontWeight: 500,
                                                        background: splitWith.includes(currentUserId) ? 'hsl(var(--color-primary))' : 'hsl(var(--color-surface))',
                                                        color: splitWith.includes(currentUserId) ? '#fff' : 'hsl(var(--color-text-main))',
                                                        border: splitWith.includes(currentUserId) ? '1px solid transparent' : '1px solid hsl(var(--color-border))',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    {currentUserName} {splitWith.includes(currentUserId) ? '✓' : '+'}
                                                </button>
                                            )}

                                            {/* Logic for Split With Buttons: Show friends or Group Members */}
                                            {selectedGroupId
                                                ? groups.find(g => g.id === selectedGroupId)?.members
                                                    .filter(m => m._id !== paidBy)
                                                    .map(m => (
                                                        <button
                                                            key={m._id}
                                                            type="button"
                                                            onClick={() => toggleSplitWith(m._id)}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                borderRadius: '999px',
                                                                fontSize: '0.875rem',
                                                                fontWeight: 500,
                                                                background: splitWith.includes(m._id) ? 'hsl(var(--color-primary))' : 'hsl(var(--color-surface))',
                                                                color: splitWith.includes(m._id) ? '#fff' : 'hsl(var(--color-text-main))',
                                                                border: splitWith.includes(m._id) ? '1px solid transparent' : '1px solid hsl(var(--color-border))',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            {m.name} {splitWith.includes(m._id) ? '✓' : '+'}
                                                        </button>
                                                    ))
                                                : friends
                                                    .filter(f => f.id !== paidBy)
                                                    .map(f => (
                                                        <button
                                                            key={f.id}
                                                            type="button"
                                                            onClick={() => toggleSplitWith(f.id)}
                                                            style={{
                                                                padding: '0.5rem 1rem',
                                                                borderRadius: '999px',
                                                                fontSize: '0.875rem',
                                                                fontWeight: 500,
                                                                background: splitWith.includes(f.id) ? 'hsl(var(--color-primary))' : 'hsl(var(--color-surface))',
                                                                color: splitWith.includes(f.id) ? '#fff' : 'hsl(var(--color-text-main))',
                                                                border: splitWith.includes(f.id) ? '1px solid transparent' : '1px solid hsl(var(--color-border))',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            {f.name} {splitWith.includes(f.id) ? '✓' : '+'}
                                                        </button>
                                                    ))
                                            }
                                        </div>
                                    </>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            <span>User</span>
                                            <span>{splitMethod === 'amount' ? 'Amount' : 'Percent (%)'}</span>
                                        </div>

                                        {(() => {
                                            const people = selectedGroupId
                                                ? groups.find(g => g.id === selectedGroupId)?.members.map(m => ({ id: m._id, name: m.name }))
                                                : friends.map(f => ({ id: f.id, name: f.name }));

                                            const allIds = [currentUserId, ...(people || []).map(p => p.id)];

                                            // Ensure we only showing relevant people. For manual amounts, usually we show splitWith list or all potential?
                                            // The original code mapped friends + filtered by group.
                                            // We will iterate `allIds` but realistically we should iterate `splitWith` + potential others? 
                                            // The UI shows a list of rows.

                                            return allIds.map(id => {
                                                const name = id === currentUserId
                                                    ? currentUserName
                                                    : (selectedGroupId
                                                        ? groups.find(g => g.id === selectedGroupId)?.members.find(m => m._id === id)?.name
                                                        : friends.find(f => f.id === id)?.name);

                                                // If name is undefined (e.g. user id not in group list/friends list), skip or show ID
                                                if (!name) return null;
                                                return (
                                                    <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <span style={{ fontSize: '1rem', fontWeight: 500 }}>{name}</span>
                                                        <div style={{ position: 'relative' }}>
                                                            <input
                                                                type="number"
                                                                placeholder="0"
                                                                value={customAmounts[id] || ''}
                                                                onChange={(e) => {
                                                                    handleCustomAmountChange(id, e.target.value);
                                                                    if (parseFloat(e.target.value) > 0 && !splitWith.includes(id)) {
                                                                        setSplitWith(prev => [...prev, id]);
                                                                    }
                                                                }}
                                                                style={{
                                                                    width: '120px',
                                                                    padding: '0.5rem 1rem',
                                                                    borderRadius: 'var(--radius-md)',
                                                                    background: 'hsl(var(--color-surface))',
                                                                    border: '1px solid hsl(var(--color-border))',
                                                                    color: 'hsl(var(--color-text-main))',
                                                                    fontSize: '1rem',
                                                                    textAlign: 'right',
                                                                    outline: 'none',
                                                                    transition: 'border-color 0.2s'
                                                                }}
                                                                onFocus={(e) => e.target.style.borderColor = 'hsl(var(--color-primary))'}
                                                                onBlur={(e) => e.target.style.borderColor = 'hsl(var(--color-border))'}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Card>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'hsl(var(--color-text-muted))'
                    }}>
                        Category
                    </label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowCategoryManager(true)} style={{ fontSize: '0.75rem', padding: '0 0.5rem' }}>
                        Manage +
                    </Button>
                </div>
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
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>
                                    {cat.icon || '🏷️'} {cat.name}
                                </option>
                            ))}
                        </>
                    ) : type === 'transfer' ? (
                        <>
                            <option value="Transfer">Transfer</option>
                            <option value="Credit Card Payment">Credit Card Payment</option>
                            <option value="Loan Payment">Loan Payment</option>
                            <option value="Savings">Savings</option>
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
                    {initialData?.id ? 'Update Transaction' : 'Add Transaction'}
                </Button>
                {onClose && (
                    <Button type="button" variant="ghost" onClick={onClose}>
                        Cancel
                    </Button>
                )}
            </div>


            {
                showCategoryManager && (
                    <CategoryManager isOpen={showCategoryManager} onClose={() => setShowCategoryManager(false)} />
                )
            }
            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
            />
        </form >
    );
}
