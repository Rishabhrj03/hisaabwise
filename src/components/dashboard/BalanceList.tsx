import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useExpenses } from '@/context/ExpenseContext';
import { useFriends } from '@/context/FriendContext';

export function BalanceList() {
    const { expenses, addExpense } = useExpenses();
    const { friends } = useFriends();

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
                    // If I paid, they owe me (Positive balance for me relative to them)
                    // Wait, logic check:
                    // If I paid $100 for me and Bob. Bob owes me $50.
                    // Bob's balance in my book: +$50.
                    balances[share.userId] = (balances[share.userId] || 0) + share.amount;
                }
            });
        } else {
            const payerId = paidBy;
            const myShare = shares.find(s => s.userId === 'me');
            if (myShare) {
                // If they paid, I owe them (Negative balance for me relative to them? Or just track what they are owed?)
                // Let's stick to "Positive = They owe me", "Negative = I owe them".
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
    );
}
