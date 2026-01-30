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

// ... (interface remains same)

export function RecurringExpenseCard() {
    const [recurrings, setRecurrings] = useState<RecurringExpense[]>([]);
    const [showAdd, setShowAdd] = useState(false);

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
                alert('Payment recorded as expense!');
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

                {showAdd && (
                    <form onSubmit={handleAdd} style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
                        <input placeholder="Name (e.g. Health Insurance)" value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                            <select value={frequency} onChange={e => setFrequency(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>Next Due:</span>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" disabled={isSubmitting} style={{ padding: '0.5rem', borderRadius: '4px', background: 'hsl(var(--color-primary))', color: 'white', border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                            {isSubmitting ? 'Adding...' : 'Add'}
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
        </>
    );
}
