'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function SIPCalculator() {
    const [mode, setMode] = useState<'sip' | 'lumpsum'>('sip');
    const [monthly, setMonthly] = useState(25000); // SIP Amount
    const [lumpsum, setLumpsum] = useState(100000); // Lumpsum Amount
    const [rate, setRate] = useState(12);
    const [years, setYears] = useState(10);

    const result = useMemo(() => {
        const i = rate / 100;
        let invested = 0;
        let totalValue = 0;

        if (mode === 'sip') {
            const monthlyRate = Math.pow(1 + i, 1 / 12) - 1;
            const months = years * 12;
            invested = monthly * months;
            totalValue = monthly * ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate)) / monthlyRate;
        } else {
            invested = lumpsum;
            totalValue = lumpsum * Math.pow(1 + i, years);
        }

        return {
            invested: Math.round(invested),
            returns: Math.round(totalValue - invested),
            total: Math.round(totalValue)
        };
    }, [mode, monthly, lumpsum, rate, years]);

    const data = [
        { name: 'Invested', value: result.invested, color: 'hsl(var(--color-text-muted) / 0.2)' },
        { name: 'Returns', value: result.returns, color: 'hsl(var(--color-primary))' },
    ];

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);
    };

    const RangeSlider = ({ min, max, step, value, onChange }: any) => {
        const percentage = ((value - min) / (max - min)) * 100;
        return (
            <div style={{ position: 'relative', width: '100%', height: '24px', display: 'flex', alignItems: 'center' }}>
                <div style={{
                    position: 'absolute',
                    top: '50%', transform: 'translateY(-50%)',
                    left: 0, right: 0,
                    height: '6px',
                    borderRadius: '3px',
                    background: 'hsl(var(--color-border))'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '50%', transform: 'translateY(-50%)',
                    left: 0,
                    width: `${percentage}%`,
                    height: '6px',
                    borderRadius: '3px',
                    background: 'linear-gradient(90deg, hsl(var(--color-primary)) 0%, #a78bfa 100%)'
                }} />
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={onChange}
                    style={{
                        position: 'absolute', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 10
                    }}
                />
                <div style={{
                    position: 'absolute',
                    left: `${percentage}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '20px', height: '20px',
                    background: 'hsl(var(--color-surface))',
                    border: '2px solid hsl(var(--color-primary))',
                    borderRadius: '50%',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    pointerEvents: 'none'
                }} />
            </div>
        )
    };

    return (
        <div style={{ padding: '0 0.5rem' }}>
            {/* Mode Toggle */}
            <div style={{ display: 'flex', background: 'hsl(var(--color-surface))', padding: '4px', borderRadius: '12px', marginBottom: '2rem', width: 'fit-content', border: '1px solid hsl(var(--color-border))' }}>
                <button
                    onClick={() => setMode('sip')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: '10px',
                        background: mode === 'sip' ? 'hsl(var(--color-primary))' : 'transparent',
                        color: mode === 'sip' ? 'white' : 'hsl(var(--color-text-muted))',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.3s'
                    }}
                >
                    SIP
                </button>
                <button
                    onClick={() => setMode('lumpsum')}
                    style={{
                        padding: '8px 24px',
                        borderRadius: '10px',
                        background: mode === 'lumpsum' ? 'hsl(var(--color-primary))' : 'transparent',
                        color: mode === 'lumpsum' ? 'white' : 'hsl(var(--color-text-muted))',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 600,
                        transition: 'all 0.3s'
                    }}
                >
                    Lumpsum
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
                {/* Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Amount Input */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))' }}>{mode === 'sip' ? 'Monthly Investment' : 'Total Investment'}</label>
                            <div style={{ background: 'hsl(var(--color-surface))', padding: '4px 12px', borderRadius: '6px', color: '#a78bfa', fontWeight: 600, border: '1px solid hsl(var(--color-border))' }}>
                                ₹ {mode === 'sip' ? monthly.toLocaleString() : lumpsum.toLocaleString()}
                            </div>
                        </div>
                        <RangeSlider
                            min={mode === 'sip' ? 500 : 5000}
                            max={mode === 'sip' ? 100000 : 10000000}
                            step={mode === 'sip' ? 500 : 5000}
                            value={mode === 'sip' ? monthly : lumpsum}
                            onChange={(e: any) => mode === 'sip' ? setMonthly(Number(e.target.value)) : setLumpsum(Number(e.target.value))}
                        />
                    </div>

                    {/* Rate Input */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))' }}>Expected Return (p.a)</label>
                            <div style={{ background: 'hsl(var(--color-surface))', padding: '4px 12px', borderRadius: '6px', color: '#a78bfa', fontWeight: 600, border: '1px solid hsl(var(--color-border))' }}>
                                {rate} %
                            </div>
                        </div>
                        <RangeSlider
                            min={1} max={30} step={0.5}
                            value={rate}
                            onChange={(e: any) => setRate(Number(e.target.value))}
                        />
                    </div>

                    {/* Years Input */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))' }}>Time Period</label>
                            <div style={{ background: 'hsl(var(--color-surface))', padding: '4px 12px', borderRadius: '6px', color: '#a78bfa', fontWeight: 600, border: '1px solid hsl(var(--color-border))' }}>
                                {years} Yr
                            </div>
                        </div>
                        <RangeSlider
                            min={1} max={40} step={1}
                            value={years}
                            onChange={(e: any) => setYears(Number(e.target.value))}
                        />
                    </div>
                </div>

                {/* Results & Chart */}
                <div style={{ background: 'hsl(var(--color-surface))', borderRadius: '20px', padding: '1.5rem', border: '1px solid hsl(var(--color-border))', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                        {/* Summary Stats */}
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>Invested Amount</span>
                                <span style={{ fontWeight: 600, color: 'hsl(var(--color-text-main))' }}>₹{formatCurrency(result.invested)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>Est. Returns</span>
                                <span style={{ fontWeight: 600, color: 'hsl(var(--color-primary))' }}>₹{formatCurrency(result.returns)}</span>
                            </div>
                            <div style={{ height: '1px', background: 'hsl(var(--color-border))', margin: '0.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'hsl(var(--color-text-main))', fontSize: '1rem', fontWeight: 600 }}>Total Value</span>
                                <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'hsl(var(--color-text-main))' }}>₹{formatCurrency(result.total)}</span>
                            </div>
                        </div>

                        {/* Chart */}
                        <div style={{ flex: 1, minHeight: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ background: 'hsl(var(--color-surface))', border: '1px solid hsl(var(--color-border))', borderRadius: '8px', color: 'hsl(var(--color-text-main))' }}
                                        itemStyle={{ color: 'hsl(var(--color-text-main))' }}
                                        formatter={(val: number | undefined) => `₹${formatCurrency(val || 0)}`}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--color-text-muted))' }}>Returns</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--color-primary))' }}>
                                    {((result.returns / result.total) * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
