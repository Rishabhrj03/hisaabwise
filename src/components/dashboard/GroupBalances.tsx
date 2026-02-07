
import React from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { useGroups } from '@/context/GroupContext';
import { useAuth } from '@/context/AuthContext';
import { calculateGroupDebts, Debt } from '@/utils/balanceUtils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ArrowRight } from 'lucide-react';

interface GroupBalancesProps {
    groupId: string;
}

export function GroupBalances({ groupId }: GroupBalancesProps) {
    const { expenses, addExpense } = useExpenses();
    const { groups } = useGroups();
    const { user } = useAuth();

    const [settleDebt, setSettleDebt] = React.useState<Debt | null>(null);

    const group = groups.find(g => g.id === groupId);
    if (!group || !user) return null;

    // Filter expenses ensuring safely typed
    const groupExpenses = expenses.filter(e => e.relatedTo && e.relatedTo.includes(groupId));

    // Calculate debts
    const debts = calculateGroupDebts(groupExpenses, user.id);

    // Helpers to get names
    const getMemberName = (id: string) => {
        if (id === user.id) return 'You';
        const member = group.members.find(m => m._id === id || (m as any).id === id); // Handle both formats
        return member ? member.name : 'Unknown';
    };

    const handleSettle = () => {
        if (!settleDebt) return;

        // Determine Payer and Payee
        // Debt: from -> to
        const { from, to, amount } = settleDebt;

        // We can only automate settlement if "I" am involved, 
        // OR if the user is an Admin (but for now let's say anyone can record it?)
        // Recording a settlement is just adding an expense where Payer pays Payee.

        addExpense({
            description: `Settlement: ${getMemberName(from)} -> ${getMemberName(to)}`,
            amount: amount,
            type: 'expense',
            category: 'Settlement',
            date: new Date().toISOString(),
            relatedTo: [groupId], // Important: Linked to Group
            splitDetails: {
                paidBy: from,
                shares: [{ userId: to, amount: amount }]
            }
        });

        setSettleDebt(null);
    };

    if (debts.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--color-text-muted))' }}>
                <p>No outstanding debts in this group.</p>
                <p style={{ fontSize: '0.8rem' }}>Everyone is settled up!</p>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Group Debts</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {debts.map((debt, idx) => {
                    const isMePayer = debt.from === user.id;
                    const isMePayee = debt.to === user.id;
                    const isInvolved = isMePayer || isMePayee;

                    return (
                        <div key={idx} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '1rem', background: 'hsl(var(--color-surface))',
                            borderRadius: '12px', border: '1px solid hsl(var(--color-border))'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                                <div style={{ fontWeight: 500, color: isMePayer ? 'hsl(var(--color-expense))' : 'inherit' }}>
                                    {getMemberName(debt.from)}
                                </div>
                                <div style={{ color: 'hsl(var(--color-text-muted))' }}><ArrowRight size={16} /></div>
                                <div style={{ fontWeight: 500, color: isMePayee ? 'hsl(var(--color-income))' : 'inherit' }}>
                                    {getMemberName(debt.to)}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontWeight: 700, fontSize: '1rem' }}>
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(debt.amount)}
                                </span>
                                {isInvolved && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => setSettleDebt(debt)}
                                    >
                                        Settle
                                    </Button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <ConfirmModal
                isOpen={!!settleDebt}
                onClose={() => setSettleDebt(null)}
                onConfirm={handleSettle}
                title="Settle Debt"
                message={settleDebt ? `Record settlement of ₹${settleDebt.amount} from ${getMemberName(settleDebt.from)} to ${getMemberName(settleDebt.to)}?` : ''}
                confirmText="Record Settlement"
            />
        </div>
    );
}
