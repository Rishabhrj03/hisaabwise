'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function LoanCalculator() {
    // Standard Defaults
    const [amount, setAmount] = useState(500000);
    const [rate, setRate] = useState(9);
    const [tenure, setTenure] = useState(5);

    const result = useMemo(() => {
        const P = amount;
        const R = rate / 12 / 100;
        const N = tenure * 12;

        let emi = 0;
        if (rate === 0) {
            emi = P / N;
        } else {
            emi = (P * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1);
        }

        const totalPayable = emi * N;
        const totalInterest = totalPayable - P;

        return {
            emi: Math.round(emi),
            principal: P,
            interest: Math.round(totalInterest),
            total: Math.round(totalPayable)
        };
    }, [amount, rate, tenure]);

    const data = [
        { name: 'Principal Amount', value: result.principal, color: 'hsl(var(--color-text-muted) / 0.2)' },
        { name: 'Total Interest', value: result.interest, color: '#f97316' }, // Orange
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
                    background: 'linear-gradient(90deg, #f97316 0%, #fb923c 100%)'
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
                    border: '2px solid #f97316',
                    borderRadius: '50%',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    pointerEvents: 'none'
                }} />
            </div>
        )
    };

    return (
        <div style={{ padding: '0 0.5rem' }}>
            <div style={{ height: '30px', marginBottom: '2rem' }}></div> {/* Spacer to match SIP tabs height */}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '3rem' }}>
                {/* Inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Amount */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))' }}>Loan Amount</label>
                            <div style={{ background: 'hsl(var(--color-surface))', padding: '4px 12px', borderRadius: '6px', color: '#fb923c', fontWeight: 600, border: '1px solid hsl(var(--color-border))' }}>
                                ₹ {amount.toLocaleString()}
                            </div>
                        </div>
                        <RangeSlider
                            min={10000} max={10000000} step={10000}
                            value={amount}
                            onChange={(e: any) => setAmount(Number(e.target.value))}
                        />
                    </div>

                    {/* Rate */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))' }}>Interest Rate (p.a)</label>
                            <div style={{ background: 'hsl(var(--color-surface))', padding: '4px 12px', borderRadius: '6px', color: '#fb923c', fontWeight: 600, border: '1px solid hsl(var(--color-border))' }}>
                                {rate} %
                            </div>
                        </div>
                        <RangeSlider
                            min={1} max={30} step={0.1}
                            value={rate}
                            onChange={(e: any) => setRate(Number(e.target.value))}
                        />
                    </div>

                    {/* Tenure */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))' }}>Loan Tenure</label>
                            <div style={{ background: 'hsl(var(--color-surface))', padding: '4px 12px', borderRadius: '6px', color: '#fb923c', fontWeight: 600, border: '1px solid hsl(var(--color-border))' }}>
                                {tenure} Yr
                            </div>
                        </div>
                        <RangeSlider
                            min={1} max={30} step={1}
                            value={tenure}
                            onChange={(e: any) => setTenure(Number(e.target.value))}
                        />
                    </div>
                </div>

                {/* Output */}
                <div style={{ background: 'hsl(var(--color-surface))', borderRadius: '20px', padding: '1.5rem', border: '1px solid hsl(var(--color-border))', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                        {/* Summary Stats */}
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>Monthly EMI</span>
                                <span style={{ fontWeight: 600, color: '#fb923c' }}>₹{formatCurrency(result.emi)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>Principal Amount</span>
                                <span style={{ fontWeight: 600, color: 'hsl(var(--color-text-main))' }}>₹{formatCurrency(result.principal)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>Total Interest</span>
                                <span style={{ fontWeight: 600, color: 'hsl(var(--color-text-main))' }}>₹{formatCurrency(result.interest)}</span>
                            </div>
                            <div style={{ height: '1px', background: 'hsl(var(--color-border))', margin: '0.5rem 0' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'hsl(var(--color-text-main))', fontSize: '1rem', fontWeight: 600 }}>Total Payable</span>
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
                                <div style={{ fontSize: '0.7rem', color: 'hsl(var(--color-text-muted))' }}>Interest</div>
                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fb923c' }}>
                                    {((result.interest / result.total) * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
