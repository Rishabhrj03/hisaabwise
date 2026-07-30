import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface Goal {
    _id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    color: string;
}

export function GoalCard() {
    const [goals, setGoals] = useState<Goal[]>([]);

    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const res = await fetch('/api/goals');
                if (res.ok) {
                    const data = await res.json();
                    setGoals(data);
                }
            } catch (err) {
                console.error("Failed to load goals", err);
            }
        };
        fetchGoals();
    }, []);

    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState('');
    const [newTarget, setNewTarget] = useState('');

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, targetAmount: Number(newTarget), color: `hsl(${Math.random() * 360}, 70%, 50%)` })
            });
            if (res.ok) {
                const newGoal = await res.json();
                setGoals(prev => [...prev, newGoal]);
                setShowAdd(false);
                setNewName('');
                setNewTarget('');
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <Card
            variant="glass"
            title="Savings Goals 🎯"
            defaultOpen={false}
            action={
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    style={{ background: 'none', border: 'none', color: 'hsl(var(--color-primary))', cursor: 'pointer', fontSize: '1.5rem' }}
                >
                    +
                </button>
            }
        >

            {showAdd && (
                <form onSubmit={handleAddGoal} style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <input
                        placeholder="Goal Name"
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', width: '50%' }}
                    />
                    <input
                        placeholder="Target Amount"
                        type="number"
                        value={newTarget}
                        onChange={e => setNewTarget(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #ccc', width: '30%' }}
                    />
                    <button type="submit" style={{ flex: 1, borderRadius: '8px', background: 'hsl(var(--color-primary))', color: 'white', border: 'none' }}>✓</button>
                </form>
            )}

            {goals.length === 0 ? (
                <p style={{ color: 'hsl(var(--color-text-muted))' }}>No active goals.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                    {goals.map(goal => (
                        <GoalItem key={goal._id} goal={goal} onUpdate={(updated) => setGoals(prev => prev.map(g => g._id === updated._id ? updated : g))} />
                    ))}
                </div>
            )}
        </Card>
    );
}

function GoalItem({ goal, onUpdate }: { goal: Goal, onUpdate: (g: Goal) => void }) {
    const [addingFunds, setAddingFunds] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState('');

    // Target Editing State
    const [isEditingTarget, setIsEditingTarget] = useState(false);
    const [editTargetAmount, setEditTargetAmount] = useState(goal.targetAmount.toString());

    const handleAddFunds = async () => {
        if (!amountToAdd) return;
        try {
            const newAmount = goal.currentAmount + Number(amountToAdd);
            const res = await fetch('/api/goals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: goal._id, currentAmount: newAmount })
            });
            if (res.ok) {
                onUpdate({ ...goal, currentAmount: newAmount });
                setAddingFunds(false);
                setAmountToAdd('');
            }
        } catch (err) { console.error(err); }
    };

    const handleUpdateTarget = async () => {
        try {
            const res = await fetch('/api/goals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: goal._id, targetAmount: Number(editTargetAmount) })
            });

            if (res.ok) {
                onUpdate({ ...goal, targetAmount: Number(editTargetAmount) });
                setIsEditingTarget(false);
            }
        } catch (err) { console.error(err); }
    };

    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

    return (
        <div style={{
            padding: '1rem',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: `1px solid ${goal.color || '#4F46E5'}40`,
            textAlign: 'center'
        }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                {goal.name}
            </div>

            <div style={{
                position: 'relative',
                width: '60px',
                height: '60px',
                margin: '0 auto 0.5rem',
                borderRadius: '50%',
                background: `conic-gradient(${goal.color || '#4F46E5'} ${progress}%, transparent 0)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    position: 'absolute',
                    width: '50px',
                    height: '50px',
                    background: 'hsl(var(--color-surface))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    color: 'hsl(var(--color-text-muted))'
                }}>
                    {Math.round(progress)}%
                </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.25rem' }}>
                <span>₹{goal.currentAmount} / </span>
                {isEditingTarget ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <input
                            type="number"
                            value={editTargetAmount}
                            onChange={e => setEditTargetAmount(e.target.value)}
                            style={{ width: '50px', padding: '1px', border: '1px solid #555', borderRadius: '4px', fontSize: '0.8rem' }}
                            autoFocus
                        />
                        <button onClick={handleUpdateTarget} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '4px', color: 'white', padding: '0 4px' }}>✓</button>
                    </div>
                ) : (
                    <span onClick={() => setIsEditingTarget(true)} style={{ cursor: 'pointer', borderBottom: '1px dashed #666' }}>
                        {goal.targetAmount} ✏️
                    </span>
                )}
            </div>

            {addingFunds ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <input
                            type="number"
                            value={amountToAdd}
                            onChange={e => setAmountToAdd(e.target.value)}
                            placeholder="+/- Amt"
                            style={{ width: '100%', padding: '2px', borderRadius: '4px', border: '1px solid #555', fontSize: '0.8rem' }}
                            autoFocus
                        />
                        <button onClick={handleAddFunds} style={{ background: 'var(--color-primary)', border: 'none', borderRadius: '4px', color: 'white' }}>✓</button>
                        <button onClick={() => setAddingFunds(false)} style={{ background: 'transparent', border: 'none', color: '#999' }}>×</button>
                    </div>
                    <span style={{ fontSize: '0.6rem', color: '#aaa' }}>Use negative (-) to withdraw</span>
                </div>
            ) : (
                <button
                    onClick={() => setAddingFunds(true)}
                    style={{
                        border: '1px solid hsl(var(--color-border))',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '44px',
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        color: 'hsl(var(--color-text-main))',
                        width: '100%'
                    }}
                >
                    + Add / Withdraw
                </button>
            )}
        </div>
    );
}
