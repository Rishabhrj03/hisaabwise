import React, { useEffect, useState } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';
import { Card } from '@/components/ui/Card';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';

interface BankAccount {
    _id: string;
    name: string;
    type: 'bank' | 'wallet' | 'card' | 'cash';
    balance: number;
    creditLimit?: number;
    billingDate?: number;
}

export function BankAccountCard() {
    const [accounts, setAccounts] = useState<BankAccount[]>([]);
    const [showAdd, setShowAdd] = useState(false);

    // Form State
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('bank');
    const [newBalance, setNewBalance] = useState('');
    const [newLimit, setNewLimit] = useState('');
    const [newBillDate, setNewBillDate] = useState('');

    // Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/accounts')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setAccounts(data);
            })
            .catch(err => console.error(err));
    }, []);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            const body: Partial<BankAccount> = {
                name: newName,
                type: newType as BankAccount['type'],
                balance: Number(newBalance)
            };
            if (newType === 'card') {
                body.creditLimit = Number(newLimit);
                body.billingDate = Number(newBillDate);
            }

            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                const newAcc = await res.json();
                setAccounts(prev => [...prev, newAcc]);

                sendGTMEvent({
                    event: 'account_created',
                    value: { type: newType }
                });

                setShowAdd(false);
                setNewName(''); setNewBalance(''); setNewLimit(''); setNewBillDate('');
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
            const res = await fetch(`/api/accounts?id=${deleteId}`, { method: 'DELETE' });
            if (res.ok) {
                setAccounts(prev => prev.filter(a => a._id !== deleteId));
                sendGTMEvent({ event: 'account_deleted' });
                setShowDeleteModal(false);
                setDeleteId(null);
            }
        } catch (err) { console.error(err); }
    };

    const assets = accounts.filter(a => a.type !== 'card');
    const cards = accounts.filter(a => a.type === 'card');

    const totalAssetValue = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = cards.reduce((sum, acc) => sum + acc.balance, 0); // For cards, balance = outstanding debt usually
    const netWorth = totalAssetValue - totalLiabilities;

    return (
        <>
            <Card
                variant="glass"
                title="Accounts & Cards 💳"
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

                {/* Net Worth Summary - Gradient Card */}
                {accounts.length > 0 && (
                    <div style={{
                        position: 'sticky',
                        top: '-0.5rem',
                        zIndex: 20,
                        marginBottom: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'var(--sticky-bank-bg)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: '0 4px 12px -3px hsla(var(--hue-primary), 80%, 50%, 0.3)',
                        color: 'var(--sticky-bank-text)',
                        backdropFilter: 'blur(var(--sticky-blur))',
                        border: '1px solid var(--sticky-bank-border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Net Worth</div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>₹{netWorth.toLocaleString()}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>Assets: ₹{totalAssetValue.toLocaleString()}</div>
                                {totalLiabilities > 0 && (
                                    <div style={{ fontSize: '0.75rem', color: '#ffcccb' }}>Debt: -₹{totalLiabilities.toLocaleString()}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {showAdd && (
                    <form onSubmit={handleAddAccount} style={{
                        marginBottom: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        background: 'hsla(var(--color-surface), 0.5)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid hsl(var(--color-border))'
                    }}>
                        <input
                            placeholder="Name (e.g. HDFC, Amex)"
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
                            <select
                                value={newType}
                                onChange={e => setNewType(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '0.6rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid hsl(var(--color-border))',
                                    background: 'hsl(var(--color-background))',
                                    color: 'hsl(var(--color-text-main))',
                                    outline: 'none',
                                    fontSize: '0.9rem'
                                }}
                            >
                                <option value="bank">Bank</option>
                                <option value="wallet">Wallet</option>
                                <option value="card">Credit Card</option>
                                <option value="cash">Cash</option>
                            </select>
                            <input
                                placeholder={newType === 'card' ? "Due Amt" : "Balance"}
                                type="number"
                                value={newBalance}
                                onChange={e => setNewBalance(e.target.value)}
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
                        </div>
                        {newType === 'card' && (
                            <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                                <input
                                    placeholder="Total Limit"
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
                                        minWidth: 0
                                    }}
                                />
                                <input
                                    placeholder="Bill Day (1-31)"
                                    type="number"
                                    value={newBillDate}
                                    onChange={e => setNewBillDate(e.target.value)}
                                    style={{
                                        width: '80px',
                                        padding: '0.6rem',
                                        borderRadius: 'var(--radius-sm)',
                                        border: '1px solid hsl(var(--color-border))',
                                        background: 'hsl(var(--color-background))',
                                        color: 'hsl(var(--color-text-main))',
                                        outline: 'none',
                                        fontSize: '0.9rem'
                                    }}
                                />
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
                            {isSubmitting ? 'Adding...' : 'Add Account'}
                        </button>
                    </form>
                )}

                {accounts.length === 0 ? (
                    <p style={{ color: 'hsl(var(--color-text-muted))' }}>No accounts linked.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Liquid Assets Section */}
                        {assets.length > 0 && (
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Liquid Assets</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {assets.map(acc => (
                                        <AccountItem
                                            key={acc._id}
                                            account={acc}
                                            onUpdate={(updated) => setAccounts(prev => prev.map(a => a._id === updated._id ? updated : a))}
                                            onDelete={(e) => handleDelete(e, acc._id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Credit Cards Section */}
                        {cards.length > 0 && (
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--color-text-muted))', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Credit Cards</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {cards.map(acc => (
                                        <AccountItem
                                            key={acc._id}
                                            account={acc}
                                            onUpdate={(updated) => setAccounts(prev => prev.map(a => a._id === updated._id ? updated : a))}
                                            onDelete={(e) => handleDelete(e, acc._id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Account"
                message="Are you sure you want to remove this account? This action cannot be undone."
            />
        </>
    );
}

function AccountItem({ account, onUpdate, onDelete }: { account: BankAccount, onUpdate: (a: BankAccount) => void, onDelete: (e: React.MouseEvent) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(account.name);
    const [editBalance, setEditBalance] = useState(account.balance.toString());
    const [editLimit, setEditLimit] = useState(account.creditLimit !== undefined ? account.creditLimit.toString() : '');
    const [editBillDate, setEditBillDate] = useState(account.billingDate !== undefined ? account.billingDate.toString() : '');

    const getIcon = (type: string) => {
        switch (type) {
            case 'wallet': return '👛';
            case 'card': return '💳';
            case 'cash': return '💵';
            default: return '🏦';
        }
    };

    const handleSave = async () => {
        try {
            const body: Partial<BankAccount> = {
                _id: account._id,
                name: editName,
                balance: Number(editBalance)
            };
            if (account.type === 'card') {
                body.creditLimit = Number(editLimit);
                body.billingDate = Number(editBillDate);
            }

            const res = await fetch('/api/accounts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{getIcon(account.type)}</span>
                    <input value={editName} onChange={e => setEditName(e.target.value)} style={{ flex: 1, padding: '2px', width: '80px' }} />
                    <input type="number" placeholder="Balance" value={editBalance} onChange={e => setEditBalance(e.target.value)} style={{ width: '80px', padding: '2px' }} />
                    <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: '#999' }}>×</button>
                </div>
                {account.type === 'card' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="number" placeholder="Limit" value={editLimit} onChange={e => setEditLimit(e.target.value)} style={{ flex: 1, padding: '2px' }} />
                        <input type="number" placeholder="Bill Day" value={editBillDate} onChange={e => setEditBillDate(e.target.value)} style={{ width: '60px', padding: '2px' }} />
                    </div>
                )}
                <button onClick={handleSave} style={{ background: 'hsl(var(--color-primary))', border: 'none', borderRadius: '4px', color: 'white', padding: '4px 8px', alignSelf: 'flex-end' }}>Save</button>
            </div>
        )
    }

    const isCard = account.type === 'card';
    const available = (account.creditLimit || 0) - account.balance;
    const utilization = account.creditLimit ? (account.balance / account.creditLimit) * 100 : 0;

    return (
        <Card
            variant="glass"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderLeft: `4px solid ${isCard ? 'hsl(var(--color-expense))' : 'hsl(var(--color-income))'}`,
                transition: 'transform 0.2s',
                cursor: 'pointer',
                marginBottom: '0.5rem'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.01)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            onClick={() => !isEditing && setIsEditing(true)}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{getIcon(account.type)}</span>
                <div>
                    <div style={{ fontWeight: 500 }}>{account.name}</div>
                    {isCard ? (
                        <div style={{ fontSize: '0.7rem', color: '#aaa' }}>
                            Limit: ₹{account.creditLimit} • Bill Day: {account.billingDate || 'N/A'}
                        </div>
                    ) : (
                        <div style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))', textTransform: 'capitalize' }}>
                            {account.type}
                        </div>
                    )}
                </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'right' }}>
                <div>
                    <div style={{ fontWeight: 600, color: isCard && account.balance > 0 ? 'var(--color-expense)' : 'inherit' }}>
                        ₹{account.balance}
                    </div>
                    {isCard && (
                        <div style={{ fontSize: '0.65rem', color: utilization > 30 ? 'orange' : 'green' }}>
                            Avail: ₹{available}
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <span onClick={(e) => { e.stopPropagation(); setIsEditing(true); }} style={{ cursor: 'pointer', fontSize: '0.9rem' }}>✏️</span>
                    <button
                        type="button"
                        onClick={onDelete}
                        style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '1rem', padding: '0' }}
                        title="Delete Account"
                    >
                        &times;
                    </button>
                </div>
            </div>
        </Card>
    );
}
