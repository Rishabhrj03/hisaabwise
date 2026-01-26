
import React, { useMemo } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Card } from '@/components/ui/Card';
import { Expense } from '@/types';
import { useFriends } from '@/context/FriendContext';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface DebtChartProps {
    expenses: Expense[];
}

export function DebtChart({ expenses }: DebtChartProps) {
    const { friends } = useFriends();

    const debtData = useMemo(() => {
        // Map: FriendId -> Balance (Positive = They owe me, Negative = I owe them)
        const balances: Record<string, number> = {};

        // Initialize 0 for all friends
        friends.forEach(f => balances[f.id] = 0);

        expenses.forEach(expense => {
            if (!expense.splitDetails) return;

            const { paidBy, shares } = expense.splitDetails;

            if (paidBy === 'me') {
                // I paid, others owe me
                shares.forEach(share => {
                    if (share.userId !== 'me') {
                        balances[share.userId] = (balances[share.userId] || 0) + share.amount;
                    }
                });
            } else {
                // Someone else paid
                // 1. I owe them my share
                const myShare = shares.find(s => s.userId === 'me');
                if (myShare) {
                    balances[paidBy] = (balances[paidBy] || 0) - myShare.amount;
                }

                // Note: We don't track what Friend A owes Friend B here, only relative to 'me'.
            }
        });

        // Filter out zero balances
        const labels: string[] = [];
        const data: number[] = [];
        const backgroundColors: string[] = [];

        Object.entries(balances).forEach(([friendId, amount]) => {
            if (Math.abs(amount) > 0.01) { // Floating point tolerance
                const friend = friends.find(f => f.id === friendId);
                labels.push(friend?.name || 'Unknown');
                data.push(amount);
                backgroundColors.push(amount > 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)');
            }
        });

        return {
            labels,
            datasets: [
                {
                    label: 'Net Balance',
                    data: data,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors.map(c => c.replace('0.6', '1')),
                    borderWidth: 1,
                },
            ],
        };
    }, [expenses, friends]);

    if (debtData.labels.length === 0) {
        return (
            <Card variant="default">
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Net Balances</h3>
                <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>
                    No outstanding debts found.
                </p>
            </Card>
        )
    }

    const options = {
        indexAxis: 'y' as const,
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Who Owes You (Green) vs You Owe (Red)',
                color: 'hsl(var(--color-text-main))'
            },
            tooltip: {
                callbacks: {
                    label: function (context: any) {
                        const val = context.raw;
                        return val > 0
                            ? `They owe you: ${val.toFixed(2)}`
                            : `You owe them: ${Math.abs(val).toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                ticks: {
                    color: 'hsl(var(--color-text-muted))',
                }
            },
            y: {
                grid: {
                    display: false
                },
                ticks: {
                    color: 'hsl(var(--color-text-main))',
                }
            }
        }
    };

    return (
        <Card variant="default">
            <Bar options={options} data={debtData} />
        </Card>
    );
}
