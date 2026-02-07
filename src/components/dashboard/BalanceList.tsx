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

        if (isOwed) {
            addExpense({
                description: `Settlement with ${friendName}`,
                amount: absAmount,
                type: 'expense',
                category: 'Other', // or 'Settlement'
                date: new Date().toISOString(),
                splitDetails: {
                    paidBy: friendId, // They paid
                    shares: [{ userId: user.id, amount: absAmount }] // For me
                },
                relatedTo: [friendId]
            });
        } else {
            addExpense({
                description: `Settlement with ${friendName}`,
                amount: absAmount,
                type: 'expense',
                category: 'Other', // or 'Settlement'
                date: new Date().toISOString(),
                splitDetails: {
                    paidBy: user.id, // I paid
                    shares: [{ userId: friendId, amount: absAmount }] // For them
                },
                relatedTo: [friendId]
            });
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        if (!scanningFriendId) return;

        // Parse UPI URL
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
                setAlertConfig({ isOpen: true, title: 'Success', message: `UPI ID updated successfully: ${upiId}` });
            } else {
                setAlertConfig({ isOpen: true, title: 'Error', message: "Could not find a valid UPI ID in QR code." });
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

    // Use the utility function for consistent calculation
    const balances = calculateBalances(expenses, friends, user.id);

    const hasBalances = Object.values(balances).some(amount => Math.abs(amount) > 0.01);

    if (!hasBalances) {
        return (
            <Card variant="glass" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Splitwise Balances</h3>
                <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>All settled up!</p>
            </Card>
        )
    }

    return (
        <>
            <Card variant="glass" style={{ marginBottom: '1.25rem', padding: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Splitwise Balances</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {friends.map(friend => {
                        const balance = balances[friend.id] || 0;
                        if (Math.abs(balance) < 0.01) return null;

                        const isOwed = balance > 0;

                        return (
                            <div key={friend.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontWeight: 500, display: 'block' }}>{friend.name}</span>
                                    {friend.upi_id && (
                                        <span style={{ fontSize: '0.7rem', color: 'hsl(var(--color-text-muted))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            UPI: {friend.upi_id}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                    <span style={{
                                        fontWeight: 600,
                                        color: isOwed ? 'hsl(var(--color-income))' : 'hsl(var(--color-expense))',
                                        fontSize: '0.9rem',
                                        marginRight: '0.25rem'
                                    }}>
                                        {isOwed ? 'owes you' : 'you owe'} {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Math.abs(balance))}
                                    </span>

                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        {!friend.upi_id ? (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: 'auto', border: '1px dashed hsl(var(--color-primary))', color: 'hsl(var(--color-primary))' }}
                                                onClick={() => openEditUpiModal(friend.id, friend.name, '')}
                                                title="Add UPI ID Manually"
                                            >
                                                + Add ID
                                            </Button>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                style={{ padding: '0.25rem', height: '24px', width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                onClick={() => openEditUpiModal(friend.id, friend.name, friend.upi_id)}
                                                title="Edit UPI ID"
                                            >
                                                ✎
                                            </Button>
                                        )}

                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            style={{ padding: '0.25rem', height: '24px', width: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            onClick={() => {
                                                setScanningFriendId(friend.id);
                                                setShowScanner(true);
                                            }}
                                            title="Scan QR"
                                        >
                                            📷
                                        </Button>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: 'auto' }}
                                        onClick={() => handleSettleUp(friend.id, friend.name, balance)}
                                    >
                                        Settle
                                    </Button>

                                    {!isOwed && friend.upi_id && (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: 'auto', backgroundColor: 'hsl(var(--color-primary))' }}
                                            onClick={() => {
                                                const upiLink = `upi://pay?pa=${friend.upi_id}&pn=${friend.name.replace(/\s/g, '%20')}&am=${Math.abs(balance).toFixed(2)}&cu=INR&tn=Settlement`;
                                                setPaymentDetails({
                                                    upiUrl: upiLink,
                                                    amount: Math.abs(balance).toFixed(2),
                                                    name: friend.name
                                                });
                                                setShowPaymentQR(true);
                                            }}
                                            title={`Pay to ${friend.upi_id}`}
                                        >
                                            Pay
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <QRScannerModal
                isOpen={showScanner}
                onClose={() => {
                    setShowScanner(false);
                    setScanningFriendId(null);
                }}
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
