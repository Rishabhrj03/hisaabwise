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
                <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1rem', fontWeight: 600 }}>
                        <span>Total Budget</span>
                        <span>₹{totalSpent} / ₹{totalBudget}</span>
                    </div>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{
                            width: `${totalProgress}%`,
                            height: '100%',
                            background: totalSpent > totalBudget ? 'var(--color-expense)' : 'var(--color-primary)',
                            transition: 'width 0.5s ease'
                        }} />
                    </div>
                </div>
            )}

            {showAdd && (
                <form onSubmit={handleAddBudget} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <input
                        placeholder="Category (e.g. Food)"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', width: '50%' }}
                    />
                    <input
                        placeholder="Limit"
                        type="number"
                        value={newLimit}
                        onChange={e => setNewLimit(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', width: '30%' }}
                    />
                    <button type="submit" style={{ flex: 1, borderRadius: '8px', background: 'hsl(var(--color-primary))', color: 'white', border: 'none' }}>✓</button>
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
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 500 }}>{budget.category}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>₹{spent} / </span>
                    {isEditing ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                            <input
                                type="number"
                                value={editAmount}
                                onChange={e => setEditAmount(e.target.value)}
                                style={{ width: '60px', padding: '2px', border: '1px solid #555', borderRadius: '4px' }}
                                autoFocus
                            />
                            <button onClick={handleSave} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '4px', color: 'white', fontSize: '0.7rem', padding: '2px 4px' }}>✓</button>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: 'none', color: '#999', fontSize: '0.7rem' }}>×</button>
                        </div>
                    ) : (
                        <span
                            style={{ cursor: 'pointer', borderBottom: '1px dashed hsl(var(--color-text-muted))' }}
                            onClick={() => setIsEditing(true)}
                            title="Click to edit limit"
                        >
                            ₹{budget.amount} ✏️
                        </span>
                    )}
                </span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: isOver ? 'hsl(var(--color-expense))' : percentage > 80 ? `hsl(${color} 70% 50%)` : `hsl(${color})`,
                    transition: 'width 0.5s ease'
                }} />
            </div>
        </div>
    );
}
