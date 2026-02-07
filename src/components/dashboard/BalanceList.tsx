import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/context/ExpenseContext';
import { useFriends } from '@/context/FriendContext';
import { useAuth } from '@/context/AuthContext';
import { calculateBalances } from '@/utils/balanceUtils';

import { QRScannerModal } from '@/components/ui/QRScannerModal';
import { PaymentQRModal } from '@/components/ui/PaymentQRModal';
import { EditUpiModal } from '@/components/ui/EditUpiModal';
import { AlertModal } from '@/components/ui/AlertModal';
import { ArrowDownLeft, ArrowUpRight, Check, Scan, Wallet, User as UserIcon } from 'lucide-react';

export function BalanceList() {
    const { expenses, addExpense } = useExpenses();
    const { friends, updateFriend } = useFriends();
    const { user } = useAuth();

    const [showScanner, setShowScanner] = React.useState(false);
    const [scanningFriendId, setScanningFriendId] = React.useState<string | null>(null);

    // Payment Modal State
    const [showPaymentQR, setShowPaymentQR] = React.useState(false);
    const [paymentDetails, setPaymentDetails] = React.useState({ upiUrl: '', amount: '', name: '' });

    // Edit UPI Modal State
    const [editUpiState, setEditUpiState] = React.useState<{ isOpen: boolean; friendId: string; friendName: string; initialValue: string }>({
        isOpen: false,
        friendId: '',
        friendName: '',
        initialValue: ''
    });
    const [alertConfig, setAlertConfig] = React.useState({ isOpen: false, title: '', message: '' });

    const handleSettleUp = (friendId: string, friendName: string, balance: number) => {
        if (!user) return;
        const isOwed = balance > 0;
        const absAmount = Math.abs(balance);

        const settlementExpense = {
            description: `Settlement with ${friendName}`,
            amount: absAmount,
            type: 'expense' as const,
            category: 'Other',
            date: new Date().toISOString(),
            relatedTo: [friendId]
        };

        if (isOwed) {
            // They pay me
            addExpense({
                ...settlementExpense,
                splitDetails: {
                    paidBy: friendId,
                    shares: [{ userId: user.id, amount: absAmount }]
                }
            });
        } else {
            // I pay them
            addExpense({
                ...settlementExpense,
                splitDetails: {
                    paidBy: user.id,
                    shares: [{ userId: friendId, amount: absAmount }]
                }
            });
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        if (!scanningFriendId) return;

        try {
            let upiId = '';
            if (decodedText.startsWith('upi://')) {
                const url = new URL(decodedText);
                upiId = url.searchParams.get('pa') || '';
            } else if (decodedText.includes('@')) {
                upiId = decodedText;
            }

            if (upiId) {
                await updateFriend(scanningFriendId, { upi_id: upiId });
                setAlertConfig({ isOpen: true, title: 'Success', message: `UPI ID updated: ${upiId}` });
            } else {
                setAlertConfig({ isOpen: true, title: 'Error', message: "Invalid UPI QR code." });
            }
        } catch (error) {
            console.error("QR Parse error", error);
            setAlertConfig({ isOpen: true, title: 'Error', message: "Failed to parse QR code." });
        }
        setShowScanner(false);
        setScanningFriendId(null);
    };

    const openEditUpiModal = (friendId: string, name: string, currentUpi: string = '') => {
        setEditUpiState({
            isOpen: true,
            friendId,
            friendName: name,
            initialValue: currentUpi
        });
    };

    const saveUpiId = async (newUpiId: string) => {
        if (editUpiState.friendId) {
            await updateFriend(editUpiState.friendId, { upi_id: newUpiId });
        }
    };

    if (friends.length === 0 || !user) return null;

    const balances = calculateBalances(expenses, friends, user.id);

    // Group balances
    const owedToMe = friends.filter(friend => (balances[friend.id] || 0) > 0.01);
    const iOwe = friends.filter(friend => (balances[friend.id] || 0) < -0.01);

    // Calculate totals
    const totalOwedToMe = owedToMe.reduce((sum, friend) => sum + (balances[friend.id] || 0), 0);
    const totalIOwe = iOwe.reduce((sum, friend) => sum + Math.abs(balances[friend.id] || 0), 0);

    const hasBalances = owedToMe.length > 0 || iOwe.length > 0;

    const Avatar = ({ name }: { name: string }) => {
        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        return (
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--color-primary)/0.7) 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 600,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                {initials}
            </div>
        );
    };

    if (!hasBalances) {
        return (
            <Card variant="glass" style={{ marginBottom: '1.25rem', padding: '1.5rem', textAlign: 'center' }}>
                <div style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'hsl(var(--color-income)/0.1)', color: 'hsl(var(--color-income))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                }}>
                    <Check size={32} />
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>All Caught Up!</h3>
                <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>You are all settled up with your friends.</p>
            </Card>
        )
    }

    const BalanceRow = ({ friend, isOwed }: { friend: typeof friends[0], isOwed: boolean }) => {
        const balance = balances[friend.id];
        const absBalance = Math.abs(balance);

        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 0', borderBottom: '1px solid hsl(var(--color-border)/0.5)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Avatar name={friend.name} />
                    <div>
                        <span style={{ fontWeight: 600, display: 'block', fontSize: '0.95rem' }}>{friend.name}</span>
                        {friend.upi_id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'hsl(var(--color-text-muted))' }}>
                                <Wallet size={10} /> <span>{friend.upi_id}</span>
                                <button onClick={() => openEditUpiModal(friend.id, friend.name, friend.upi_id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: 'hsl(var(--color-primary))' }}>✎</button>
                            </div>
                        ) : (
                            <button onClick={() => openEditUpiModal(friend.id, friend.name)} style={{ fontSize: '0.7rem', color: 'hsl(var(--color-primary))', background: 'none', border: 'none', padding: 0, textDecoration: 'underline', cursor: 'pointer' }}>+ Add UPI</button>
                        )}
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{
                        fontWeight: 700, fontSize: '1rem',
                        color: isOwed ? 'hsl(var(--color-income))' : 'hsl(var(--color-expense))',
                        marginBottom: '0.25rem'
                    }}>
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(absBalance)}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setScanningFriendId(friend.id); setShowScanner(true); }}
                            style={{ padding: '0.25rem', height: '24px', width: '24px', borderRadius: '50%' }}
                            title="Scan QR"
                        >
                            <Scan size={14} />
                        </Button>

                        <Button
                            size="sm"
                            variant={isOwed ? "secondary" : "primary"}
                            onClick={() => {
                                if (!isOwed && friend.upi_id) {
                                    // Pay logic
                                    const upiLink = `upi://pay?pa=${friend.upi_id}&pn=${friend.name.replace(/\s/g, '%20')}&am=${absBalance.toFixed(2)}&cu=INR&tn=Settlement`;
                                    setPaymentDetails({ upiUrl: upiLink, amount: absBalance.toFixed(2), name: friend.name });
                                    setShowPaymentQR(true);
                                } else {
                                    // Settle logic
                                    handleSettleUp(friend.id, friend.name, balance);
                                }
                            }}
                            style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', height: '26px' }}
                        >
                            {!isOwed && friend.upi_id ? 'Pay' : 'Settle'}
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Card variant="glass" style={{ marginBottom: '1.25rem', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <UserIcon size={20} /> Splitwise Balances
                </h3>

                {owedToMe.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--color-income))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <ArrowDownLeft size={16} /> Owed to you
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--color-income))' }}>
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalOwedToMe)}
                            </span>
                        </div>
                        <div style={{ background: 'hsl(var(--color-surface))', borderRadius: '12px', padding: '0 1rem', border: '1px solid hsl(var(--color-border)/0.5)' }}>
                            {owedToMe.map(friend => (
                                <BalanceRow key={friend.id} friend={friend} isOwed={true} />
                            ))}
                        </div>
                    </div>
                )}

                {iOwe.length > 0 && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--color-expense))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <ArrowUpRight size={16} /> You owe
                            </span>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--color-expense))' }}>
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalIOwe)}
                            </span>
                        </div>
                        <div style={{ background: 'hsl(var(--color-surface))', borderRadius: '12px', padding: '0 1rem', border: '1px solid hsl(var(--color-border)/0.5)' }}>
                            {iOwe.map(friend => (
                                <BalanceRow key={friend.id} friend={friend} isOwed={false} />
                            ))}
                        </div>
                    </div>
                )}
            </Card>

            <QRScannerModal
                isOpen={showScanner}
                onClose={() => { setShowScanner(false); setScanningFriendId(null); }}
                onScanSuccess={handleScanSuccess}
            />

            <PaymentQRModal
                isOpen={showPaymentQR}
                onClose={() => setShowPaymentQR(false)}
                upiUrl={paymentDetails.upiUrl}
                amount={paymentDetails.amount}
                recipientName={paymentDetails.name}
            />

            <EditUpiModal
                isOpen={editUpiState.isOpen}
                onClose={() => setEditUpiState(prev => ({ ...prev, isOpen: false }))}
                onSave={saveUpiId}
                initialValue={editUpiState.initialValue}
                friendName={editUpiState.friendName}
            />

            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
            />
        </>
    );
}
