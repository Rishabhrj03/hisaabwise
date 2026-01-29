import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';

interface Loan {
    _id: string;
    name: string;
    type: 'borrowed' | 'lent';
    principalAmount: number;
    interestRate: number;
    tenureMonths: number;
    repaymentType: 'emi' | 'one-time';
    paidAmount: number;
    emiAmount?: number;
    startDate: string;
}

import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

// ... (interface remains same)

export function LoanCard() {
    const [loans, setLoans] = useState<Loan[]>([]);
    const [showAdd, setShowAdd] = useState(false);

    // Form
    const [name, setName] = useState('');
    const [type, setType] = useState('borrowed');
    const [amount, setAmount] = useState('');
    const [interest, setInterest] = useState('');
    const [tenure, setTenure] = useState('');
    const [repayment, setRepayment] = useState('one-time');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetch('/api/loans')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setLoans(data);
            })
            .catch(err => console.error(err));
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/loans', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    type,
                    principalAmount: Number(amount),
                    interestRate: Number(interest),
                    tenureMonths: Number(tenure),
                    repaymentType: repayment,
                    startDate
                })
            });
            if (res.ok) {
                const newLoan = await res.json();
                setLoans(prev => [...prev, newLoan]);
                setShowAdd(false);
                // Reset
                setName(''); setAmount(''); setInterest(''); setTenure('');
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
            const res = await fetch(`/api/loans?id=${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                setLoans(prev => prev.filter(l => l._id !== deleteId));
                setShowDeleteModal(false);
                setDeleteId(null);
            }
        } catch (err) { console.error(err); }
    };

    return (
        <>
            <Card
                variant="glass"
                title="Loans & Udhar 🤝"
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
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', flex: 1 }}>
                                <option value="borrowed">I Borrowed (Loan)</option>
                                <option value="lent">I Lent (Udhar Given)</option>
                            </select>
                            <input placeholder="Name (e.g. Home Loan)" value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', flex: 2, border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="number" placeholder="Principal Amount" value={amount} onChange={e => setAmount(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', flex: 1, border: '1px solid #ccc' }} />
                            <input type="number" placeholder="Interest % (Yr)" value={interest} onChange={e => setInterest(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', flex: 1, border: '1px solid #ccc' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="number" placeholder="Tenure (Months)" value={tenure} onChange={e => setTenure(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', flex: 1, border: '1px solid #ccc' }} />
                            <select value={repayment} onChange={e => setRepayment(e.target.value)} style={{ padding: '0.5rem', borderRadius: '4px', flex: 1 }}>
                                <option value="one-time">One Time</option>
                                <option value="emi">EMI</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888' }}>Start Date:</span>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }} />
                        </div>
                        <button type="submit" disabled={isSubmitting} style={{ padding: '0.5rem', borderRadius: '4px', background: 'hsl(var(--color-primary))', color: 'white', border: 'none', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}>
                            {isSubmitting ? 'Adding...' : 'Add Loan'}
                        </button>
                    </form>
                )}

                {loans.length === 0 ? (
                    <p style={{ color: 'hsl(var(--color-text-muted))' }}>No active loans.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {loans.map(loan => (
                            <LoanItem
                                key={loan._id}
                                loan={loan}
                                onUpdate={(updated) => setLoans(prev => prev.map(l => l._id === updated._id ? updated : l))}
                                onDelete={(e) => handleDelete(e, loan._id)}
                            />
                        ))}
                    </div>
                )}
            </Card>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Loan"
                message="Are you sure you want to delete this loan record? This action cannot be undone."
            />
        </>
    );
}

function LoanItem({ loan, onUpdate, onDelete }: { loan: Loan, onUpdate: (l: Loan) => void, onDelete: (e: React.MouseEvent) => void }) {
    const [paying, setPaying] = useState(false);
    const [payAmount, setPayAmount] = useState('');

    const handlePay = async () => {
        try {
            const res = await fetch('/api/loans', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: loan._id, action: 'payment', paidAmount: Number(payAmount) })
            });
            if (res.ok) {
                const updated = await res.json();
                onUpdate(updated);
                setPaying(false);
                setPayAmount('');
            }
        } catch (err) { console.error(err); }
    };

    const totalAmount = loan.principalAmount; // Simply principal for now, realistically interest adds up
    // For EMI, total payout is roughly EMI * Tenure
    const estimatedTotal = loan.repaymentType === 'emi' && loan.emiAmount
        ? loan.emiAmount * loan.tenureMonths
        : loan.principalAmount + (loan.principalAmount * loan.interestRate * (loan.tenureMonths / 12) / 100);

    const progress = Math.min((loan.paidAmount / estimatedTotal) * 100, 100);

    return (
        <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', borderLeft: loan.type === 'borrowed' ? '3px solid var(--color-expense)' : '3px solid var(--color-income)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <div style={{ fontWeight: 600 }}>{loan.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#aaa' }}>
                        {loan.type === 'borrowed' ? 'Borrowed' : 'Lent'} • {loan.interestRate}% Int • {loan.tenureMonths}m
                    </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={onDelete}
                        title="Delete Loan"
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff4d4d',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            lineHeight: '1',
                            padding: '0 0 4px 0',
                            opacity: 0.6
                        }}
                    >
                        &times;
                    </button>
                    <div style={{ fontWeight: 700 }}>₹{loan.principalAmount}</div>
                    {loan.repaymentType === 'emi' && <div style={{ fontSize: '0.7rem', color: 'orange' }}>EMI: ₹{loan.emiAmount}/mo</div>}
                </div>
            </div>

            <div style={{ marginTop: '0.5rem', background: 'rgba(255,255,255,0.1)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: loan.type === 'borrowed' ? 'var(--color-expense)' : 'var(--color-income)', transition: 'width 0.5s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '2px', color: '#888' }}>
                <span>Paid: ₹{loan.paidAmount}</span>
                <span>Est Total: ₹{Math.round(estimatedTotal)}</span>
            </div>

            <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                {paying ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="number" placeholder="Amount" value={payAmount} onChange={e => setPayAmount(e.target.value)} style={{ width: '80px', padding: '2px 4px', borderRadius: '4px' }} />
                        <button onClick={handlePay} style={{ background: 'var(--color-primary)', border: 'none', color: 'white', borderRadius: '4px', padding: '2px 8px' }}>Confirm</button>
                        <button onClick={() => setPaying(false)} style={{ background: 'none', border: 'none', color: '#aaa' }}>x</button>
                    </div>
                ) : (
                    <button onClick={() => setPaying(true)} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'inherit', cursor: 'pointer' }}>
                        + Record Payment
                    </button>
                )}
            </div>
        </div>
    );
}
