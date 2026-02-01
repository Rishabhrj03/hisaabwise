import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useExpenses } from '@/context/ExpenseContext';

interface Budget {
    _id: string;
    category: string;
    amount: number;
    period: 'monthly' | 'yearly';
}

export function BudgetCard() {
    const { expenses } = useExpenses();
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Budgets
    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const res = await fetch('/api/budgets');
                if (res.ok) {
                    const data = await res.json();
                    setBudgets(data);
                }
            } catch (err) {
                console.error("Failed to load budgets", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBudgets();
    }, []);

    // Calculate current spending per category for CURRENT MONTH
    const currentSpending = expenses.reduce((acc, expense) => {
        const expenseDate = new Date(expense.date);
        const now = new Date();

        // Only count current month expenses for monthly budgets
        if (expense.type === 'expense' &&
            expenseDate.getMonth() === now.getMonth() &&
            expenseDate.getFullYear() === now.getFullYear()) {

            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        }
        return acc;
    }, {} as Record<string, number>);

    const [showAdd, setShowAdd] = useState(false);
    const [newCategory, setNewCategory] = useState('');
    const [newLimit, setNewLimit] = useState('');

    const handleAddBudget = async (e: React.FormEvent, catOverride?: string, limitOverride?: number) => {
        if (e) e.preventDefault();
        const catToUse = catOverride || newCategory;
        const limitToUse = limitOverride !== undefined ? limitOverride : Number(newLimit);

        try {
            const res = await fetch('/api/budgets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: catToUse, amount: limitToUse })
            });
            if (res.ok) {
                const newBudget = await res.json();
                // Update local state (if exists, replace, else add)
                setBudgets(prev => {
                    const exists = prev.findIndex(b => b.category === newBudget.category);
                    if (exists >= 0) {
                        const updated = [...prev];
                        updated[exists] = newBudget;
                        return updated;
                    }
                    return [...prev, newBudget];
                });
                setShowAdd(false);
                setNewCategory('');
                setNewLimit('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <Card variant="glass">Loading Budgets...</Card>;

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + (currentSpending[b.category] || 0), 0);
    const totalProgress = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

    return (
        <Card
            variant="glass"
            title="Monthly Budgets 📉"
            defaultOpen={true}
            action={
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    style={{ background: 'none', border: 'none', color: 'hsl(var(--color-primary))', cursor: 'pointer', fontSize: '1.5rem' }}
                >
                    +
                </button>
            }
        >

            {/* Total Summary */}
            {budgets.length > 0 && (
                <div style={{
                    marginBottom: '1rem',
                    padding: '0.75rem 1rem',
                    background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(260, 100%, 65%) 100%)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 4px 12px -3px rgba(124, 58, 237, 0.4)',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9, marginBottom: '0.1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Budget</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
                                <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{totalSpent.toLocaleString()}</span>
                                <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>/ ₹{totalBudget.toLocaleString()}</span>
                            </div>
                        </div>
                        <div style={{
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.5rem',
                            background: 'rgba(255,255,255,0.25)',
                            borderRadius: '12px',
                            fontWeight: 600,
                            backdropFilter: 'blur(4px)'
                        }}>
                            {Math.round(totalProgress)}%
                        </div>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(0,0,0,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${totalProgress}%`,
                            height: '100%',
                            background: 'white',
                            borderRadius: '3px',
                            boxShadow: '0 0 8px rgba(255,255,255,0.6)',
                            transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                        }} />
                    </div>
                </div>
            )}

            {showAdd && (
                <form onSubmit={handleAddBudget} style={{
                    marginBottom: '1rem',
                    display: 'flex',
                    flexDirection: 'column', // Stack vertically on specific constraint, or wrap
                    gap: '0.5rem',
                    background: 'hsla(var(--color-surface), 0.5)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsl(var(--color-border))'
                }}>
                    <input
                        placeholder="Category Name"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid hsl(var(--color-border))',
                            background: 'hsl(var(--color-background))',
                            color: 'hsl(var(--color-text-main))',
                            outline: 'none',
                            fontSize: '0.9rem'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                        <input
                            placeholder="Limit Amount"
                            type="number"
                            value={newLimit}
                            onChange={e => setNewLimit(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '0.6rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid hsl(var(--color-border))',
                                background: 'hsl(var(--color-background))',
                                color: 'hsl(var(--color-text-main))',
                                outline: 'none',
                                fontSize: '0.9rem',
                                minWidth: 0 // Allow shrinking
                            }}
                        />
                        <button type="submit" style={{
                            padding: '0 1rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'hsl(var(--color-primary))',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            whiteSpace: 'nowrap'
                        }}>
                            Add
                        </button>
                    </div>
                </form>
            )}

            {budgets.length === 0 ? (
                <p style={{ color: 'hsl(var(--color-text-muted))' }}>No budgets set.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {budgets.map(budget => (
                        <BudgetRow
                            key={budget._id}
                            budget={budget}
                            spent={currentSpending[budget.category] || 0}
                            onUpdate={(updated) => setBudgets(prev => prev.map(b => b.category === updated.category ? updated : b))}
                        />
                    ))}
                </div>
            )}
        </Card>
    );
}

function BudgetRow({ budget, spent, onUpdate }: { budget: Budget, spent: number, onUpdate: (b: Budget) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editAmount, setEditAmount] = useState(budget.amount.toString());

    const handleSave = async () => {
        try {
            const res = await fetch('/api/budgets', {
                method: 'POST', // POST handles upsert in our API
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: budget.category, amount: Number(editAmount) })
            });
            if (res.ok) {
                const updated = await res.json();
                onUpdate(updated);
                setIsEditing(false);
            }
        } catch (err) { console.error(err); }
    };

    const percentage = Math.min((spent / budget.amount) * 100, 100);
    const isOver = spent > budget.amount;
    const color = isOver ? 'var(--color-expense)' : percentage > 80 ? 'var(--hue-warning)' : 'var(--color-primary)';

    return (
        <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'hsl(var(--color-text-main))' }}>{budget.category}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: isOver ? 'hsl(var(--color-expense))' : 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>
                        ₹{spent.toLocaleString()} <span style={{ opacity: 0.5 }}>/</span>
                    </span>
                    {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <input
                                type="number"
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                style={{
                                    width: '80px',
                                    padding: '0.25rem 0.5rem',
                                    border: '1px solid hsl(var(--color-primary))',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    background: 'transparent',
                                    color: 'hsl(var(--color-text-main))'
                                }}
                                autoFocus
                            />
                            <button onClick={handleSave} style={{
                                background: 'hsl(var(--color-primary))',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                fontSize: '0.8rem',
                                padding: '4px 8px',
                                cursor: 'pointer'
                            }}>Save</button>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: 'none', color: 'hsl(var(--color-text-muted))', cursor: 'pointer' }}>✕</button>
                        </div>
                    ) : (
                        <span
                            style={{
                                fontWeight: 500,
                                cursor: 'pointer',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                transition: 'background 0.2s',
                                color: 'hsl(var(--color-text-main))'
                            }}
                            onClick={() => setIsEditing(true)}
                            title="Click to edit limit"
                            onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--color-surface-hover))'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                            ₹{budget.amount.toLocaleString()} ✏️
                        </span>
                    )}
                </span>
            </div>
            <div style={{ height: '8px', background: 'hsl(var(--color-surface-hover))', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: isOver
                        ? 'hsl(var(--color-expense))'
                        : percentage > 80
                            ? 'linear-gradient(90deg, hsl(var(--hue-warning)) 0%, hsl(var(--hue-warning) 70% 50%) 100%)'
                            : 'linear-gradient(90deg, hsl(var(--color-primary)) 0%, hsl(260, 100%, 70%) 100%)',
                    borderRadius: '4px',
                    boxShadow: percentage > 0 ? '0 0 10px rgba(0,0,0,0.1)' : 'none',
                    transition: 'width 0.6s ease-out'
                }} />
            </div>
        </div>
    );
}
