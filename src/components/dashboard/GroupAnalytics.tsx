import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

interface GroupAnalyticsProps {
    groupId: string;
    groupName: string;
}

interface AnalyticsData {
    totalSpent: number;
    byMember: { memberId: string; name: string; paid: number; share: number }[];
    byCategory: { category: string; amount: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function GroupAnalytics({ groupId, groupName }: GroupAnalyticsProps) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState<'members' | 'categories'>('members');

    // Default to "All Time" (empty string) or Current Month?
    // User asked for "monthly basis", so let's default to current month.
    const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
    const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Determine query param
                const query = selectedMonth ? `?month=${selectedMonth}` : '';
                const res = await fetch(`/api/groups/${groupId}/stats${query}`);
                if (!res.ok) throw new Error('Failed to fetch stats');
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
                setError('Could not load group statistics');
            } finally {
                setLoading(false);
            }
        };

        if (groupId) fetchData();
    }, [groupId, selectedMonth]);

    if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>{error}</div>;

    // Loading State with Skeleton? For now simplified text
    // if (loading) return ... (Wait, keep previous data while loading for smoother transition?)

    // Prepare chart data function safely
    const getMemberBalances = () => {
        if (!data) return [];
        return data.byMember.map(m => ({
            ...m,
            net: m.paid - m.share
        })).sort((a, b) => b.paid - a.paid);
    };

    return (
        <div className="analytics-container" style={{ position: 'relative', minHeight: '400px' }}>
            {loading && (
                <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.5)', zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Analytics</h2>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--color-text-muted))', margin: 0 }}>
                        {selectedMonth ? new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'All Time'}
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{
                            padding: '0.4rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid hsl(var(--color-border))',
                            background: 'hsl(var(--color-background))',
                            color: 'hsl(var(--color-text-main))',
                            cursor: 'pointer'
                        }}
                    />
                    <button
                        onClick={() => setSelectedMonth('')}
                        style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid hsl(var(--color-border))',
                            background: selectedMonth === '' ? 'hsl(var(--color-primary))' : 'hsl(var(--color-surface))',
                            color: selectedMonth === '' ? '#fff' : 'hsl(var(--color-text-main))',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                        }}
                        title="Show All Time"
                    >
                        All
                    </button>
                </div>
            </div>

            {!data ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            ) : (
                <>
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <p style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))', marginBottom: '0.25rem' }}>Total Spending</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0, color: 'hsl(var(--color-primary))' }}>
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(data.totalSpent)}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <button
                            onClick={() => setViewMode('members')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                border: 'none',
                                background: viewMode === 'members' ? 'hsl(var(--color-primary))' : 'hsl(var(--color-surface))',
                                color: viewMode === 'members' ? '#fff' : 'hsl(var(--color-text-main))',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            Member Split
                        </button>
                        <button
                            onClick={() => setViewMode('categories')}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                border: 'none',
                                background: viewMode === 'categories' ? 'hsl(var(--color-primary))' : 'hsl(var(--color-surface))',
                                color: viewMode === 'categories' ? '#fff' : 'hsl(var(--color-text-main))',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            Category Breakdown
                        </button>
                    </div>

                    <Card style={{ padding: '1.5rem', height: '350px', marginBottom: '1.5rem', background: 'hsl(var(--color-surface))' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            {viewMode === 'members' ? (
                                <BarChart data={getMemberBalances()} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12, fill: 'hsl(var(--color-text-muted))' }} />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        formatter={(val: any) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(val))}
                                    />
                                    <Legend />
                                    <Bar dataKey="paid" name="Paid Amount" fill="#00C49F" radius={[0, 4, 4, 0]} barSize={20} />
                                    <Bar dataKey="share" name="Fair Share" fill="#FF8042" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            ) : (
                                <PieChart>
                                    <Pie
                                        data={data.byCategory}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="amount"
                                        nameKey="category"
                                    >
                                        {data.byCategory.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val: any) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(val))} />
                                    <Legend />
                                </PieChart>
                            )}
                        </ResponsiveContainer>
                    </Card>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Details</h4>
                        {viewMode === 'members' ? (
                            data.byMember.map(m => (
                                <div key={m.memberId} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    padding: '0.75rem',
                                    background: 'hsl(var(--color-background))',
                                    borderRadius: '8px',
                                    border: '1px solid hsl(var(--color-border))'
                                }}>
                                    <div>
                                        <span style={{ fontWeight: 600 }}>{m.name}</span>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))' }}>
                                            Paid: {m.paid.toFixed(0)} | Share: {m.share.toFixed(0)}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{
                                            fontWeight: 600,
                                            color: (m.paid - m.share) >= 0 ? 'hsl(var(--color-success))' : 'hsl(var(--color-danger))'
                                        }}>
                                            {(m.paid - m.share) >= 0 ? '+' : ''}{(m.paid - m.share).toFixed(0)}
                                        </span>
                                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))' }}>
                                            {(m.paid - m.share) >= 0 ? 'Gets Back' : 'Owes'}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            data.byCategory.map((c, i) => (
                                <div key={c.category} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '0.75rem',
                                    background: 'hsl(var(--color-background))',
                                    borderRadius: '8px',
                                    borderLeft: `4px solid ${COLORS[i % COLORS.length]}`
                                }}>
                                    <span style={{ fontWeight: 500 }}>{c.category}</span>
                                    <span style={{ fontWeight: 600 }}>
                                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(c.amount)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
