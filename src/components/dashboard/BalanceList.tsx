import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/context/ExpenseContext';
import { useFriends } from '@/context/FriendContext';

import { QRScannerModal } from '@/components/ui/QRScannerModal';

export function BalanceList() {
    const { expenses, addExpense } = useExpenses();
    const { friends, updateFriend } = useFriends();
    const [showScanner, setShowScanner] = React.useState(false);
    const [scanningFriendId, setScanningFriendId] = React.useState<string | null>(null);

    const handleSettleUp = (friendId: string, friendName: string, balance: number) => {
        const isOwed = balance > 0;
        const absAmount = Math.abs(balance);

        if (isOwed) {
            addExpense({
                description: `Settlement with ${friendName}`,
                amount: absAmount,
                type: 'expense',
                category: 'Other',
                date: new Date().toISOString(),
                splitDetails: {
                    paidBy: friendId,
                    shares: [{ userId: 'me', amount: absAmount }]
                },
                relatedTo: [friendId]
            });
        } else {
            addExpense({
                description: `Settlement with ${friendName}`,
                amount: absAmount,
                type: 'expense',
                category: 'Other',
                date: new Date().toISOString(),
                splitDetails: {
                    paidBy: 'me',
                    shares: [{ userId: friendId, amount: absAmount }]
                },
                relatedTo: [friendId]
            });
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        if (!scanningFriendId) return;

        // Parse UPI URL
        // Format: upi://pay?pa=address@upi&pn=Name...
        try {
            let upiId = '';
            if (decodedText.startsWith('upi://')) {
                const url = new URL(decodedText);
                upiId = url.searchParams.get('pa') || '';
            } else if (decodedText.includes('@')) {
                // If scanned text is just the VPA
                upiId = decodedText;
            }

            if (upiId) {
                await updateFriend(scanningFriendId, { upi_id: upiId });
                alert(`UPI ID updated successfully: ${upiId}`);
            } else {
                alert("Could not find a valid UPI ID in QR code.");
            }
        } catch (error) {
            console.error("QR Parse error", error);
            alert("Failed to parse QR code.");
        }
        setShowScanner(false);
        setScanningFriendId(null);
    };

    if (friends.length === 0) return null;

    // Calculate balances
    const balances: Record<string, number> = {};
    friends.forEach(f => {
        balances[f.id] = 0;
    });

    expenses.forEach(expense => {
        if (!expense.splitDetails) return;
        const { paidBy, shares } = expense.splitDetails;

        if (paidBy === 'me') {
            shares.forEach(share => {
                if (share.userId !== 'me') {
                    balances[share.userId] = (balances[share.userId] || 0) + share.amount;
                }
            });
        } else {
            const payerId = paidBy;
            const myShare = shares.find(s => s.userId === 'me');
            if (myShare) {
                balances[payerId] = (balances[payerId] || 0) - myShare.amount;
            }
        }
    });

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
                                <span style={{ fontWeight: 500 }}>{friend.name}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{
                                        fontWeight: 600,
                                        color: isOwed ? 'hsl(var(--color-income))' : 'hsl(var(--color-expense))'
                                    }}>
                                        {isOwed ? 'owes you' : 'you owe'} ${Math.abs(balance).toFixed(2)}
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: 'auto' }}
                                        onClick={() => handleSettleUp(friend.id, friend.name, balance)}
                                    >
                                        Settle Up
                                    </Button>
                                    {!isOwed && !friend.upi_id && (
                                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: 'auto', border: '1px dashed hsl(var(--color-primary))', color: 'hsl(var(--color-primary))' }}
                                                onClick={async () => {
                                                    const upiId = window.prompt(`Enter UPI ID for ${friend.name} (e.g. name@upi)`);
                                                    if (upiId && upiId.includes('@')) {
                                                        try {
                                                            await updateFriend(friend.id, { upi_id: upiId });
                                                        } catch (err) {
                                                            alert('Failed to update UPI ID');
                                                        }
                                                    } else if (upiId) {
                                                        alert('Invalid UPI ID format');
                                                    }
                                                }}
                                                title="Add UPI ID Manually"
                                            >
                                                + Add ID
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: 'auto', border: '1px solid hsl(var(--color-border))' }}
                                                onClick={() => {
                                                    setScanningFriendId(friend.id);
                                                    setShowScanner(true);
                                                }}
                                                title="Scan QR Code"
                                            >
                                                📷
                                            </Button>
                                        </div>
                                    )}
                                    {!isOwed && friend.upi_id && (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: 'auto', backgroundColor: 'hsl(var(--color-primary))' }}
                                            onClick={() => {
                                                const upiLink = `upi://pay?pa=${friend.upi_id}&pn=${friend.name.replace(/\s/g, '%20')}&am=${Math.abs(balance).toFixed(2)}&cu=INR&tn=Settlement`;
                                                window.location.href = upiLink;
                                            }}
                                            title={`Pay to ${friend.upi_id}`}
                                        >
                                            Pay Now  UPI
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
        </>
    );
}
