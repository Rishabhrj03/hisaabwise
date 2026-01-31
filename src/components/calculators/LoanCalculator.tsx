'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './GrowwStyles.css';

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
        { name: 'Principal Amount', value: result.principal, color: '#eef0f3' },
        { name: 'Total Interest', value: result.interest, color: '#FF7D00' }, // Orange accent
    ];

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="groww-wrapper" style={{
            '--content-accent': '#FF7D00',
            '--background-accent-subtle': 'rgba(255, 125, 0, 0.1)'
        } as React.CSSProperties}>
            <div className="sc54Parent">

                {/* Spacing for alignment with SIP which has tabs */}
                <div style={{ height: '30px', marginBottom: '2rem' }}></div>

                <div className="sc54PageContainer">
                    <div className="width100">
                        {/* Input 1: Amount */}
                        <div className="cis93InputDiv bodyBase">
                            <div className="valign-wrapper vspace-between">
                                <div className="valign-wrapper">Loan Amount</div>
                                <div className="number-input-container default">
                                    <span className="cis93Prefix">₹</span>
                                    <input
                                        className="number-input"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="cis93SliderWrapper">
                                <div className="cis93SliderTrack"></div>
                                <div
                                    className="cis93SliderTrack-fill"
                                    style={{ width: `${((amount - 10000) / (10000000 - 10000)) * 100}%` }}
                                ></div>
                                <input
                                    type="range"
                                    className="slider-input-range"
                                    min={10000} max={10000000} step={10000}
                                    value={amount}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Input 2: Rate */}
                        <div className="cis93InputDiv bodyBase">
                            <div className="valign-wrapper vspace-between">
                                <div className="valign-wrapper">Interest Rate (p.a)</div>
                                <div className="number-input-container default">
                                    <input
                                        className="number-input"
                                        type="number"
                                        value={rate}
                                        onChange={(e) => setRate(Number(e.target.value))}
                                    />
                                    <span className="cis93Prefix" style={{ fontSize: '14px', marginLeft: '4px' }}>%</span>
                                </div>
                            </div>
                            <div className="cis93SliderWrapper">
                                <div className="cis93SliderTrack"></div>
                                <div
                                    className="cis93SliderTrack-fill"
                                    style={{ width: `${((rate - 1) / (30 - 1)) * 100}%` }}
                                ></div>
                                <input
                                    type="range"
                                    className="slider-input-range"
                                    min="1" max="30" step="0.1"
                                    value={rate}
                                    onChange={(e) => setRate(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Input 3: Tenure */}
                        <div className="cis93InputDiv bodyBase">
                            <div className="valign-wrapper vspace-between">
                                <div className="valign-wrapper">Loan Tenure</div>
                                <div className="number-input-container default">
                                    <input
                                        className="number-input"
                                        type="number"
                                        value={tenure}
                                        onChange={(e) => setTenure(Number(e.target.value))}
                                    />
                                    <span className="cis93Prefix" style={{ fontSize: '14px', marginLeft: '4px' }}>Yr</span>
                                </div>
                            </div>
                            <div className="cis93SliderWrapper">
                                <div className="cis93SliderTrack"></div>
                                <div
                                    className="cis93SliderTrack-fill"
                                    style={{ width: `${((tenure - 1) / (30 - 1)) * 100}%` }}
                                ></div>
                                <input
                                    type="range"
                                    className="slider-input-range"
                                    min="1" max="30" step="1"
                                    value={tenure}
                                    onChange={(e) => setTenure(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="width100">
                        <div className="sc54OutputContainer">
                            <div className="valign-wrapper vspace-between width100 sc54OutputText">
                                <div className="contentSecondary bodyBase">Monthly EMI</div>
                                <div className="bodyLargeHeavy">
                                    <span className="sc54InrSymbol">₹ {formatCurrency(result.emi)}</span>
                                </div>
                            </div>
                            <div className="valign-wrapper vspace-between width100 sc54OutputText">
                                <div className="contentSecondary bodyBase">Principal Amount</div>
                                <div className="bodyLargeHeavy">
                                    <span className="sc54InrSymbol">₹ {formatCurrency(result.principal)}</span>
                                </div>
                            </div>
                            <div className="valign-wrapper vspace-between width100 sc54OutputText">
                                <div className="contentSecondary bodyBase">Total Interest</div>
                                <div className="bodyLargeHeavy">
                                    <span className="sc54InrSymbol">₹ {formatCurrency(result.interest)}</span>
                                </div>
                            </div>
                            <div className="valign-wrapper vspace-between width100 sc54OutputText" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-primary)' }}>
                                <div className="contentSecondary bodyBase">Total Payable</div>
                                <div className="bodyLargeHeavy">
                                    <span className="sc54InrSymbol">₹ {formatCurrency(result.total)}</span>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="sc54PieChartContainer">
                                <div style={{ width: '220px', height: '220px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={65}
                                                outerRadius={95}
                                                paddingAngle={0}
                                                dataKey="value"
                                                stroke="none"
                                            >
                                                {data.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(val: number | undefined) => `₹${formatCurrency(val || 0)}`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="cdc54Label">
                                    <div>
                                        <span className="cdc54Chip" style={{ background: '#eef0f3' }}></span>
                                        Principal
                                    </div>
                                    <div>
                                        <span className="cdc54Chip" style={{ background: '#FF7D00' }}></span>
                                        Interest
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
