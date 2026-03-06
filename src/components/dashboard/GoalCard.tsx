import React, { useState, useEffect } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';
import { Card } from '@/components/ui/Card';

interface Goal {
    _id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    color: string;
}

import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

// ... (interface remains same if not touched, but I need to be careful with replace_file_content context)

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleAddGoal = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return; // Prevent double submit
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, targetAmount: Number(newTarget), color: `hsl(${Math.random() * 360}, 70%, 50%)` })
            });
            if (res.ok) {
                const newGoal = await res.json();
                setGoals(prev => [...prev, newGoal]);

                sendGTMEvent({
                    event: 'goal_created',
                    value: { name: newName, target: Number(newTarget) }
                });

                setShowAdd(false);
                setNewName('');
                setNewTarget('');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            const res = await fetch(`/api/goals?id=${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                setGoals(prev => prev.filter(g => g._id !== deleteId));
                sendGTMEvent({ event: 'goal_deleted' });
                setShowDeleteModal(false);
                setDeleteId(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <>
            <Card
                variant="glass"
                title="Savings Goals 🎯"
                defaultOpen={false}
                scrollable={true}
                action={
                    <button
                        onClick={() => setShowAdd(!showAdd)}
                        style={{ background: 'none', border: 'none', color: 'hsl(var(--color-primary))', cursor: 'pointer', fontSize: '1.5rem' }}
                    >
                        +
                    </button>
                }
            >
                {/* Total Savings Summary */}
                {goals.length > 0 && (
                    <div style={{
                        position: 'sticky',
                        top: '-0.5rem',
                        zIndex: 20,
                        marginBottom: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'var(--sticky-goal-bg)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 4px 12px -3px hsla(var(--hue-success), 70%, 50%, 0.3)',
                        color: 'var(--sticky-goal-text)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backdropFilter: 'blur(var(--sticky-blur))',
                        border: '1px solid var(--sticky-goal-border)'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Saved</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                                ₹{goals.reduce((acc, g) => acc + g.currentAmount, 0).toLocaleString()}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Target</div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9 }}>
                                ₹{goals.reduce((acc, g) => acc + g.targetAmount, 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}

                {showAdd && (
                    <form onSubmit={handleAddGoal} style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        background: 'hsla(var(--color-surface), 0.5)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsl(var(--color-border))'
                    }}>
                        <input
                            placeholder="Goal Name"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
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
                                placeholder="Target Amount"
                                type="number"
                                value={newTarget}
                                onChange={e => setNewTarget(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid hsl(var(--color-border))',
                                    background: 'hsl(var(--color-background))',
                                    color: 'hsl(var(--color-text-main))',
                                    outline: 'none',
                                    fontSize: '0.9rem',
                                    minWidth: 0
                                }}
                            />
                            <button type="submit" disabled={isSubmitting} style={{
                                padding: '0 1rem',
                                borderRadius: 'var(--radius-sm)',
                                background: 'hsl(var(--color-primary))',
                                color: 'white',
                                border: 'none',
                                opacity: isSubmitting ? 0.7 : 1,
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap'
                            }}>
                                {isSubmitting ? '...' : 'Add'}
                            </button>
                        </div>
                    </form>
                )}

                {goals.length === 0 ? (
                    <p style={{ color: 'hsl(var(--color-text-muted))' }}>No active goals.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                        {goals.map(goal => (
                            <GoalItem
                                key={goal._id}
                                goal={goal}
                                onUpdate={(updated) => setGoals(prev => prev.map(g => g._id === updated._id ? updated : g))}
                                onDelete={(e) => handleDelete(e, goal._id)}
                            />
                        ))}
                    </div>
                )}
            </Card>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Goal"
                message="Are you sure you want to delete this goal? This action cannot be undone."
            />
        </>
    );
}

function GoalItem({ goal, onUpdate, onDelete }: { goal: Goal, onUpdate: (g: Goal) => void, onDelete: (e: React.MouseEvent) => void }) {
    const [addingFunds, setAddingFunds] = useState(false);
    const [amountToAdd, setAmountToAdd] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    // Target Editing State
    const [isEditingTarget, setIsEditingTarget] = useState(false);
    const [editTargetAmount, setEditTargetAmount] = useState(goal.targetAmount.toString());

    const handleAddFunds = async () => {
        if (!amountToAdd || isUpdating) return;
        setIsUpdating(true);
        try {
            const newAmount = goal.currentAmount + Number(amountToAdd);
            const res = await fetch('/api/goals', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: goal._id, currentAmount: newAmount })
            });
            if (res.ok) {
                onUpdate({ ...goal, currentAmount: newAmount });
                sendGTMEvent({
                    event: 'goal_fund_update',
                    value: { amount_added: Number(amountToAdd) }
                });
                setAddingFunds(false);
                setAmountToAdd('');
            }
        } catch (err) { console.error(err); }
        finally { setIsUpdating(false); }
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
        <Card
            variant="glass"
            style={{
                padding: '1rem',
                borderLeft: `4px solid ${goal.color || '#4F46E5'}`,
                textAlign: 'center',
                position: 'relative',
                transition: 'transform 0.2s',
                cursor: 'pointer'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            className="group"
        >
            <button
                type="button"
                onClick={onDelete}
                style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'hsla(var(--hue-danger), 70%, 50%, 0.1)',
                    border: '1px solid hsla(var(--hue-danger), 70%, 50%, 0.2)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'hsl(var(--color-expense))',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    zIndex: 10,
                    transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'hsla(var(--hue-danger), 70%, 50%, 0.2)';
                    e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'hsla(var(--hue-danger), 70%, 50%, 0.1)';
                    e.currentTarget.style.transform = 'rotate(0deg)';
                }}
                title="Delete Goal"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
                &times;
            </button>

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} onClick={e => e.stopPropagation()}>
                        <input
                            type="number"
                            value={editTargetAmount}
                            onChange={e => setEditTargetAmount(e.target.value)}
                            style={{ width: '60px', padding: '4px', border: '1px solid hsl(var(--color-border))', borderRadius: '4px', fontSize: '0.8rem', background: 'hsl(var(--color-surface))', color: 'inherit', outline: 'none' }}
                            autoFocus
                        />
                        <button
                            onClick={handleUpdateTarget}
                            style={{
                                background: 'hsl(var(--color-primary))',
                                border: 'none',
                                borderRadius: '4px',
                                color: 'white',
                                padding: '4px 8px',
                                fontSize: '0.7rem',
                                cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <span onClick={(e) => { e.stopPropagation(); setIsEditingTarget(true); }} style={{ cursor: 'pointer', borderBottom: '1px dashed #666' }}>
                        {goal.targetAmount} ✏️
                    </span>
                )}
            </div>

            {
                addingFunds ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'hsla(var(--color-surface), 0.3)', padding: '0.5rem', borderRadius: '8px', border: '1px solid hsl(var(--color-border))' }} onClick={e => e.stopPropagation()}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))', textAlign: 'left' }}>Add Funds / Withdraw</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="number"
                                value={amountToAdd}
                                onChange={e => setAmountToAdd(e.target.value)}
                                placeholder="+/- Amt"
                                style={{ flex: 1, padding: '6px', borderRadius: '4px', border: '1px solid hsl(var(--color-border))', fontSize: '0.85rem', background: 'hsl(var(--color-surface))', color: 'inherit', outline: 'none' }}
                                autoFocus
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={handleAddFunds}
                                disabled={isUpdating}
                                style={{
                                    flex: 1,
                                    background: 'hsl(var(--color-primary))',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'white',
                                    padding: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    opacity: isUpdating ? 0.7 : 1
                                }}
                            >
                                {isUpdating ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => setAddingFunds(false)}
                                style={{
                                    flex: 1,
                                    background: 'hsla(var(--color-text-muted), 0.1)',
                                    border: 'none',
                                    borderRadius: '4px',
                                    color: 'hsl(var(--color-text-muted))',
                                    padding: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                        <span style={{ fontSize: '0.6rem', color: 'hsl(var(--color-text-muted))', opacity: 0.8 }}>Use negative (-) to withdraw</span>
                    </div>
                ) : (
                    <button
                        onClick={(e) => { e.stopPropagation(); setAddingFunds(true); }}
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
                )
            }
        </Card>
    );
}
