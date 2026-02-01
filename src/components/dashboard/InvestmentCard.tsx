import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface Investment {
    _id: string;
    name: string;
    type: string;
    currentAmount: number;
    startDate?: string;
    autoIncreaseAmount?: number;
    autoIncreaseFrequency?: string;
}

export function InvestmentCard() {
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [showAdd, setShowAdd] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState('SIP');
    const [amount, setAmount] = useState('');
    const [sipAmount, setSipAmount] = useState('');
    const [frequency, setFrequency] = useState('monthly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/investments')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setInvestments(data);
            })
            .catch(err => console.error(err));
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        if (!name.trim()) {
            alert('Please enter an investment name.');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/investments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    type,
                    currentAmount: Number(amount),
                    autoIncreaseAmount: Number(sipAmount),
                    autoIncreaseFrequency: frequency,
                    startDate
                })
            });
            if (res.ok) {
                const newInv = await res.json();
                console.log("New investment added:", newInv); // Debug log
                setInvestments(prev => [...prev, newInv]);
                setShowAdd(false);
                // Reset form
                setName(''); setAmount(''); setSipAmount(''); setFrequency('monthly');
            } else {
                const error = await res.json();
                alert(`Failed to add: ${error.error || 'Unknown error'}`);
            }
        } catch (err) { console.error(err); }
        finally { setIsSubmitting(false); }
    };

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        e.preventDefault();
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        console.log("Attempting to delete investment ID:", deleteId);
        try {
            const res = await fetch(`/api/investments?id=${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                console.log("Delete success for ID:", deleteId);
                setInvestments(prev => prev.filter(i => i._id !== deleteId));
                setShowDeleteModal(false);
                setDeleteId(null);
            } else {
                const err = await res.json();
                console.error("Delete failed:", err);
                alert("Failed to delete. Check console for details.");
            }
        } catch (err) { console.error(err); }
    };

    const totalPortfolio = investments.reduce((sum, i) => sum + i.currentAmount, 0);

    return (
        <>
            <Card
                variant="glass"
                title="Investments 📈"
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

                {/* Total Portfolio Summary - Gradient Card */}
                {investments.length > 0 && (
                    <div style={{
                        marginBottom: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'linear-gradient(135deg, hsl(280, 80%, 60%) 0%, hsl(320, 80%, 60%) 100%)', // Purple-Pink gradient
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 4px 12px -3px rgba(192, 38, 211, 0.4)',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Portfolio</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{totalPortfolio.toLocaleString()}</div>
                        </div>
                        <div style={{ fontSize: '2rem', opacity: 0.2 }}>📈</div>
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
                        <input placeholder="Name (e.g. Nifty 50)" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--color-border))', outline: 'none' }} />

                        <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                            <select value={type} onChange={e => setType(e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--color-border))', outline: 'none' }}>
                                {['SIP', 'MutualFund', 'Stock', 'NPS', 'FD', 'Gold', 'Crypto', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <input type="number" placeholder="Current Value" value={amount} onChange={e => setAmount(e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--color-border))', outline: 'none', minWidth: 0 }} />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))', minWidth: '70px' }}>Start Date:</span>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--color-border))', outline: 'none' }} />
                        </div>

                        {(type === 'SIP' || type === 'NPS' || type === 'MutualFund') && (
                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                <input type="number" placeholder="Auto-Add" value={sipAmount} onChange={e => setSipAmount(e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--color-border))', outline: 'none', minWidth: 0 }} />
                                <select value={frequency} onChange={e => setFrequency(e.target.value)} style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-sm)', border: '1px solid hsl(var(--color-border))', outline: 'none' }}>
                                    <option value="monthly">Monthly</option>
                                    <option value="quarterly">Quarterly</option>
                                    <option value="half-yearly">Half-Yearly</option>
                                    <option value="yearly">Yearly</option>
                                    <option value="one-time">One Time</option>
                                </select>
                            </div>
                        )}
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
                            {isSubmitting ? 'Adding...' : 'Add Investment'}
                        </button>
                    </form>
                )}

                {investments.length === 0 ? (
                    <p style={{ color: 'hsl(var(--color-text-muted))' }}>No investments tracked.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {investments.map(inv => (
                            <InvestmentItem
                                key={inv._id}
                                investment={inv}
                                onUpdate={(updated) => setInvestments(prev => prev.map(p => p._id === updated._id ? updated : p))}
                                onDelete={(e) => handleDelete(e, inv._id)}
                            />
                        ))}
                    </div>
                )}
            </Card>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Investment"
                message="Are you sure you want to delete this investment? This action cannot be undone."
            />
        </>
    );
}

function InvestmentItem({ investment, onUpdate, onDelete }: { investment: Investment, onUpdate: (i: Investment) => void, onDelete: (e: React.MouseEvent) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editAmount, setEditAmount] = useState(investment.currentAmount.toString());
    const [editSipAmount, setEditSipAmount] = useState((investment.autoIncreaseAmount || 0).toString());
    const [editFreq, setEditFreq] = useState(investment.autoIncreaseFrequency || 'monthly');

    const handleSave = async () => {
        try {
            const res = await fetch('/api/investments', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    _id: investment._id,
                    name: investment.name, // Keep name same for now or add edit field
                    currentAmount: Number(editAmount),
                    startDate: investment.startDate, // Keep same
                    autoIncreaseAmount: Number(editSipAmount),
                    autoIncreaseFrequency: editFreq
                })
            });
            if (res.ok) {
                const updated = await res.json();
                onUpdate(updated);
                setIsEditing(false);
            }
        } catch (err) { console.error(err); }
    };

    if (isEditing) {
        return (
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 500 }}>{investment.name}</span>
                    <button onClick={() => setIsEditing(false)} type="button" style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem' }}>Val: ₹</label>
                    <input type="number" value={editAmount} onChange={e => setEditAmount(e.target.value)} style={{ width: '80px', padding: '2px' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem' }}>Auto: ₹</label>
                    <input type="number" value={editSipAmount} onChange={e => setEditSipAmount(e.target.value)} style={{ width: '60px', padding: '2px' }} />
                    <select value={editFreq} onChange={e => setEditFreq(e.target.value)} style={{ fontSize: '0.8rem' }}>
                        <option value="monthly">M</option>
                        <option value="quarterly">Q</option>
                        <option value="half-yearly">H</option>
                        <option value="yearly">Y</option>
                    </select>
                </div>
                <button onClick={handleSave} type="button" style={{ alignSelf: 'flex-end', padding: '0.25rem 0.5rem', background: 'hsl(var(--color-primary))', color: 'white', border: 'none', borderRadius: '4px' }}>Save</button>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <div>
                <div style={{ fontWeight: 500 }}>{investment.name} <span style={{ fontSize: '0.7rem', color: '#888' }}>({investment.type})</span></div>
                {investment.autoIncreaseAmount && investment.autoIncreaseAmount > 0 ? (
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--color-primary))' }}>
                        +₹{investment.autoIncreaseAmount} / {(investment.autoIncreaseFrequency || 'monthly').charAt(0).toUpperCase() + (investment.autoIncreaseFrequency || 'monthly').slice(1)}
                    </div>
                ) : null}
                {investment.startDate && <div style={{ fontSize: '0.7rem', color: '#666' }}>Started: {new Date(investment.startDate).toLocaleDateString()}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontWeight: 600 }}>₹{investment.currentAmount}</div>
                <span onClick={() => setIsEditing(true)} style={{ cursor: 'pointer', fontSize: '0.9rem' }}>✏️</span>
                <button
                    type="button"
                    onClick={onDelete}
                    style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}
                    title="Delete"
                >
                    &times;
                </button>
            </div>
        </div>
    );
}
