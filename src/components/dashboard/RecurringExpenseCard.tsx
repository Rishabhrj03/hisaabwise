import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';


interface RecurringExpense {
    _id: string;
    name: string;
    amount: number;
    category: string;
    frequency: 'monthly' | 'yearly';
    nextDueDate: string;
    isAutoDebit: boolean;
}

import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { AlertModal } from '@/components/ui/AlertModal';

// ... (interface remains same)

export function RecurringExpenseCard() {
    const [recurrings, setRecurrings] = useState<RecurringExpense[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '' });

    // Form
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState('');
    const [frequency, setFrequency] = useState('monthly');

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/recurring')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setRecurrings(data);
            })
            .catch(err => console.error(err));
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/recurring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    amount: Number(amount),
                    nextDueDate: date,
                    frequency,
                    category: 'Bills' // Default for now
                })
            });
            if (res.ok) {
                const newRec = await res.json();
                setRecurrings(prev => [...prev, newRec].sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()));
                setShowAdd(false);
                setName(''); setAmount(''); setDate('');
            }
        } catch (err) { console.error(err); }
        finally { setIsSubmitting(false); }
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
            const res = await fetch(`/api/recurring?id=${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                setRecurrings(prev => prev.filter(r => r._id !== deleteId));
                setShowDeleteModal(false);
                setDeleteId(null);
            }
        } catch (err) { console.error(err); }
    };

    const handlePay = async (id: string) => {
        try {
            const res = await fetch('/api/recurring', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: id, action: 'pay' })
            });
            if (res.ok) {
                const updated = await res.json();
                setRecurrings(prev => prev.map(p => p._id === updated._id ? updated : p).sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime()));
                // Trigger expense refresh if context allows, or user will see it on refresh
                setAlertConfig({ isOpen: true, title: 'Success', message: 'Payment recorded as expense!' });
                // We'd ideally call a global refresh here
                window.location.reload(); // Quick fix to refresh expenses card too
            }
        } catch (err) { console.error(err); }
    };

    const getDaysLeft = (dueDate: string) => {
        const diff = new Date(dueDate).getTime() - new Date().getTime();
        return Math.ceil(diff / (1000 * 3600 * 24));
    };

    return (
        <>
            <Card
                variant="glass"
                title="Liabilities & Recurring 🗓️"
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

                {/* Liabilities Summary - Gradient Card */}
                {recurrings.length > 0 && (
                    <div style={{
                        marginBottom: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'linear-gradient(135deg, hsl(200, 20%, 30%) 0%, hsl(200, 20%, 20%) 100%)', // Slate/Gray gradient
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 4px 12px -3px rgba(0,0,0, 0.4)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Monthly To Pay</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                                ₹{recurrings.reduce((acc, r) => r.frequency === 'monthly' ? acc + r.amount : acc, 0).toLocaleString()}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Upcoming (7 days)</div>
                            <div style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.9, color: '#fca5a5' }}>
                                ₹{recurrings.filter(r => {
                                    const diff = new Date(r.nextDueDate).getTime() - new Date().getTime();
                                    const days = Math.ceil(diff / (1000 * 3600 * 24));
                                    return days >= 0 && days <= 7;
                                }).reduce((acc, r) => acc + r.amount, 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}

                {showAdd && (
                    <form onSubmit={handleAdd} style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        background: 'hsla(var(--color-surface), 0.5)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsl(var(--color-border))'
                    }}>
                        <input placeholder="Name (e.g. Health Insurance)" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--color-border))', outline: 'none' }} />
                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--color-border))', outline: 'none', minWidth: 0 }} />
                            <select value={frequency} onChange={e => setFrequency(e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--color-border))', outline: 'none' }}>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))', minWidth: '70px' }}>Next Due:</span>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--color-border))', outline: 'none' }} />
                        </div>
                        <button type="submit" disabled={isSubmitting} style={{
                            width: '100%',
                            padding: '0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            background: 'hsl(var(--color-primary))',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            opacity: isSubmitting ? 0.7 : 1,
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}>
                            {isSubmitting ? 'Adding...' : 'Add Recurring'}
                        </button>
                    </form>
                )}

                {recurrings.length === 0 ? (
                    <p style={{ color: 'hsl(var(--color-text-muted))' }}>No liabilities tracked.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {recurrings.map(rec => {
                            const daysLeft = getDaysLeft(rec.nextDueDate);
                            const isUrgent = daysLeft <= 7 && daysLeft >= 0;
                            const isOverdue = daysLeft < 0;

                            return (
                                <div key={rec._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: isUrgent ? '3px solid orange' : isOverdue ? '3px solid red' : 'none' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{rec.name}</div>
                                        <div style={{ fontSize: '0.7rem', color: isUrgent || isOverdue ? 'var(--color-expense)' : '#888' }}>
                                            {isOverdue ? `Overdue by ${Math.abs(daysLeft)} days` : `Due in ${daysLeft} days`} • {new Date(rec.nextDueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ fontWeight: 600 }}>₹{rec.amount}</div>
                                        <button
                                            onClick={() => handlePay(rec._id)}
                                            title="Mark as Paid"
                                            style={{ background: 'hsl(var(--color-primary))', border: 'none', borderRadius: '4px', color: 'white', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}
                                        >
                                            Pay
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleDelete(e, rec._id)}
                                            title="Delete"
                                            style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}
                                        >
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Recurring Expense"

                message="Are you sure you want to stop tracking this recurring expense?"
            />

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => {
                    setAlertConfig(prev => ({ ...prev, isOpen: false }));
                    // If we just paid and need reload, we could allow closing modal first?
                    // But reload happens immediately in current code. 
                }}
                title={alertConfig.title}
                message={alertConfig.message}
            />
        </>
    );
}
