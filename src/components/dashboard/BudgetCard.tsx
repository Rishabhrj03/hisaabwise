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
    const totalProgress = totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
    const totalLeft = Math.max(0, totalBudget - totalSpent);

    return (
        <Card
            variant="glass"
            title="Monthly Budget"
            defaultOpen={true}
            action={
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    style={{
                        background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    +
                </button>
            }
        >
            {/* ── Ref. Image Style Hero Budget Container ── */}
            <div style={{
                background: 'linear-gradient(145deg, #1e1b4b, #312e81)',
                borderRadius: '16px',
                padding: '1.5rem 1.25rem',
                marginBottom: '1.5rem',
                textAlign: 'center',
                boxShadow: 'var(--shadow-brand)',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {totalProgress}%
                </div>
                <div style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: '#a5b4fc', textTransform: 'uppercase', marginTop: '0.25rem' }}>
                    USED THIS MONTH
                </div>

                {/* Glowing Progress Bar */}
                <div style={{
                    height: '8px',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '999px',
                    overflow: 'hidden',
                    margin: '1.25rem 0 1.25rem',
                    position: 'relative',
                }}>
                    <div style={{
                        width: `${totalProgress}%`,
                        height: '100%',
                        background: totalSpent > totalBudget
                            ? 'linear-gradient(90deg, #f43f5e, #be123c)'
                            : 'linear-gradient(90deg, #a3e635, #84cc16)',
                        borderRadius: '999px',
                        boxShadow: '0 0 12px rgba(163,230,53,0.6)',
                        transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                    }} />
                </div>

                {/* Breakdown Row: SPENT | BUDGET | LEFT */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255,255,255,0.12)',
                }}>
                    <div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em' }}>
                            SPENT
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fda4af', marginTop: '0.1rem' }}>
                            ₹{totalSpent}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em' }}>
                            BUDGET
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff', marginTop: '0.1rem' }}>
                            ₹{totalBudget}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em' }}>
                            LEFT
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#bef264', marginTop: '0.1rem' }}>
                            ₹{totalLeft}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Budget Form */}
            {showAdd && (
                <form onSubmit={handleAddBudget} style={{ marginBottom: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                    <input
                        placeholder="Category (e.g. Food)"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        style={{
                            padding: '0.6rem', borderRadius: '8px',
                            border: '1px solid var(--border-default)',
                            background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                            fontSize: '0.8rem', width: '50%', outline: 'none',
                        }}
                    />
                    <input
                        placeholder="Limit (₹)"
                        type="number"
                        value={newLimit}
                        onChange={e => setNewLimit(e.target.value)}
                        style={{
                            padding: '0.6rem', borderRadius: '8px',
                            border: '1px solid var(--border-default)',
                            background: 'var(--bg-elevated)', color: 'var(--text-primary)',
                            fontSize: '0.8rem', width: '30%', outline: 'none',
                        }}
                    />
                    <button
                        type="submit"
                        style={{
                            flex: 1, borderRadius: '8px',
                            background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
                            color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer',
                        }}
                    >
                        ✓
                    </button>
                </form>
            )}

            {/* Category Rows */}
            {budgets.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No budgets set yet. Click + to add your first budget limit.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Categories
                    </div>
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
                method: 'POST',
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
    const remaining = Math.max(0, budget.amount - spent);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em', fontSize: '0.78rem' }}>
                    {budget.category}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>₹{spent} /</span>
                    {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <input
                                type="number"
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                style={{
                                    width: '60px', padding: '2px 4px',
                                    border: '1px solid var(--border-accent)',
                                    borderRadius: '4px', background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)', fontSize: '0.75rem',
                                }}
                                autoFocus
                            />
                            <button onClick={handleSave} style={{ background: 'var(--brand-from)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.7rem', padding: '2px 6px', cursor: 'pointer' }}>✓</button>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer' }}>×</button>
                        </div>
                    ) : (
                        <span
                            style={{ cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)' }}
                            onClick={() => setIsEditing(true)}
                            title="Click to edit limit"
                        >
                            ₹{budget.amount} ✏️
                        </span>
                    )}
                </span>
            </div>

            {/* Neon Progress Line */}
            <div style={{ height: '6px', background: 'var(--bg-elevated)', borderRadius: '999px', overflow: 'hidden', marginBottom: '0.2rem' }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: isOver
                        ? 'linear-gradient(90deg, #f43f5e, #be123c)'
                        : 'linear-gradient(90deg, var(--brand-from), var(--brand-to))',
                    borderRadius: '999px',
                    transition: 'width 0.5s ease',
                }} />
            </div>

            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                {isOver ? (
                    <span style={{ color: 'var(--expense-color)', fontWeight: 600 }}>Over limit by ₹{spent - budget.amount}</span>
                ) : (
                    <span>₹{remaining} remaining</span>
                )}
            </div>
        </div>
    );
}
