import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

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
                setInvestments(prev => [...prev, newInv]);
                setShowAdd(false);
                // Reset form
                setName(''); setAmount(''); setSipAmount(''); setFrequency('monthly');
            }
        } catch (err) { console.error(err); }
    };

    const totalPortfolio = investments.reduce((sum, i) => sum + i.currentAmount, 0);

    return (
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

            {showAdd && (
                <form onSubmit={handleAdd} style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: '8px' }}>
                    <input placeholder="Name (e.g. Nifty 50)" value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select value={type} onChange={e => setType(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                            {['SIP', 'MutualFund', 'Stock', 'NPS', 'FD', 'Gold', 'Crypto', 'Other'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input type="number" placeholder="Current Value" value={amount} onChange={e => setAmount(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888' }}>Start Date:</span>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                    </div>

                    {(type === 'SIP' || type === 'NPS' || type === 'MutualFund') && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="number" placeholder="Auto-Add Amount" value={sipAmount} onChange={e => setSipAmount(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                            <select value={frequency} onChange={e => setFrequency(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="half-yearly">Half-Yearly</option>
                                <option value="yearly">Yearly</option>
                                <option value="one-time">One Time</option>
                            </select>
                        </div>
                    )}
                    <button type="submit" style={{ padding: '0.5rem', borderRadius: '4px', background: 'hsl(var(--color-primary))', color: 'white', border: 'none', cursor: 'pointer' }}>Add Investment</button>
                </form>
            )}

            {investments.length === 0 ? (
                <p style={{ color: 'hsl(var(--color-text-muted))' }}>No investments tracked.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {investments.map(inv => (
                        <InvestmentItem key={inv._id} investment={inv} onUpdate={(updated) => setInvestments(prev => prev.map(p => p._id === updated._id ? updated : p))} />
                    ))}
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed hsl(var(--color-border))', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>Total Portfolio</span>
                        <span>₹{totalPortfolio}</span>
                    </div>
                </div>
            )}
        </Card>
    );
}

function InvestmentItem({ investment, onUpdate }: { investment: Investment, onUpdate: (i: Investment) => void }) {
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
                    <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer' }}>×</button>
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
                <button onClick={handleSave} style={{ alignSelf: 'flex-end', padding: '0.25rem 0.5rem', background: 'hsl(var(--color-primary))', color: 'white', border: 'none', borderRadius: '4px' }}>Save</button>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <div>
                <div style={{ fontWeight: 500 }}>{investment.name} <span style={{ fontSize: '0.7rem', color: '#888' }}>({investment.type})</span></div>
                {investment.autoIncreaseAmount && investment.autoIncreaseAmount > 0 ? (
                    <div style={{ fontSize: '0.7rem', color: 'hsl(var(--color-primary))' }}>
                        +₹{investment.autoIncreaseAmount} / {investment.autoIncreaseFrequency?.charAt(0).toUpperCase() + investment.autoIncreaseFrequency?.slice(1)}
                    </div>
                ) : null}
                {investment.startDate && <div style={{ fontSize: '0.7rem', color: '#666' }}>Started: {new Date(investment.startDate).toLocaleDateString()}</div>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ fontWeight: 600 }}>₹{investment.currentAmount}</div>
                <span onClick={() => setIsEditing(true)} style={{ cursor: 'pointer', fontSize: '0.9rem' }}>✏️</span>
            </div>
        </div>
    );
}
