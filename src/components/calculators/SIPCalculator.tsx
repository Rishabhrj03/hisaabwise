'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './GrowwStyles.css';

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
            // Groww uses Effective Annual Rate (EAR) logic for SIPs
            // Monthly rate = (1 + annual_rate)^(1/12) - 1
            const monthlyRate = Math.pow(1 + i, 1 / 12) - 1;
            const months = years * 12;
            invested = monthly * months;

            // Future Value of Annuity Due (Investment at BO Month)
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
        { name: 'Invested', value: result.invested, color: 'var(--background-accent)' }, // Gray/Secondary
        { name: 'Returns', value: result.returns, color: 'var(--content-accent)' }, // Primary
    ];

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="groww-wrapper">
            <div className="sc54Parent">

                {/* Tabs */}
                {/* Aligning flex-end or center depending on desktop/mobile? Groww aligns left generally for title, but tabs might be below title. 
                    User screenshot shows "SIP" "Lumpsum" as text tabs.
                */}
                <div className="sc54TabsDiv">
                    <div className="tabs8Container">
                        <div
                            className={`sc54TabsText ${mode === 'sip' ? 'selected' : ''}`}
                            onClick={() => setMode('sip')}
                        >
                            SIP
                        </div>
                        <div
                            className={`sc54TabsText ${mode === 'lumpsum' ? 'selected' : ''}`}
                            onClick={() => setMode('lumpsum')}
                        >
                            Lumpsum
                        </div>
                    </div>
                </div>

                <div className="sc54PageContainer">
                    <div className="width100">
                        {/* Input 1: Investment */}
                        <div className="cis93InputDiv bodyBase">
                            <div className="valign-wrapper vspace-between">
                                <div className="valign-wrapper">
                                    {mode === 'sip' ? 'Monthly investment' : 'Total investment'}
                                </div>
                                <div className="number-input-container default">
                                    <span className="cis93Prefix">₹</span>
                                    <input
                                        className="number-input"
                                        type="number"
                                        value={mode === 'sip' ? monthly : lumpsum}
                                        onChange={(e) => mode === 'sip' ? setMonthly(Number(e.target.value)) : setLumpsum(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div className="cis93SliderWrapper">
                                <div className="cis93SliderTrack"></div>
                                {/* Active Track */}
                                <div
                                    className="cis93SliderTrack-fill"
                                    style={{ width: `${(((mode === 'sip' ? monthly : lumpsum) - (mode === 'sip' ? 500 : 5000)) / ((mode === 'sip' ? 100000 : 10000000) - (mode === 'sip' ? 500 : 5000))) * 100}%` }}
                                ></div>
                                <input
                                    type="range"
                                    className="slider-input-range"
                                    min={mode === 'sip' ? 500 : 5000}
                                    max={mode === 'sip' ? 100000 : 10000000}
                                    step={mode === 'sip' ? 500 : 5000}
                                    value={mode === 'sip' ? monthly : lumpsum}
                                    onChange={(e) => mode === 'sip' ? setMonthly(Number(e.target.value)) : setLumpsum(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Input 2: Rate */}
                        <div className="cis93InputDiv bodyBase">
                            <div className="valign-wrapper vspace-between">
                                <div className="valign-wrapper">Expected return rate (p.a)</div>
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
                                    min="1" max="30" step="0.5"
                                    value={rate}
                                    onChange={(e) => setRate(Number(e.target.value))}
                                />
                            </div>
                        </div>

                        {/* Input 3: Years */}
                        <div className="cis93InputDiv bodyBase">
                            <div className="valign-wrapper vspace-between">
                                <div className="valign-wrapper">Time period</div>
                                <div className="number-input-container default">
                                    <input
                                        className="number-input"
                                        type="number"
                                        value={years}
                                        onChange={(e) => setYears(Number(e.target.value))}
                                    />
                                    <span className="cis93Prefix" style={{ fontSize: '14px', marginLeft: '4px' }}>Yr</span>
                                </div>
                            </div>
                            <div className="cis93SliderWrapper">
                                <div className="cis93SliderTrack"></div>
                                <div
                                    className="cis93SliderTrack-fill"
                                    style={{ width: `${((years - 1) / (40 - 1)) * 100}%` }}
                                ></div>
                                <input
                                    type="range"
                                    className="slider-input-range"
                                    min="1" max="40" step="1"
                                    value={years}
                                    onChange={(e) => setYears(Number(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Output Section */}
                    {/* The HTML structure implies this is within sc54PageContainer but typically on the right side in desktop view (flex row) */}
                    <div className="width100">
                        <div className="sc54OutputContainer">
                            <div className="valign-wrapper vspace-between width100 sc54OutputText">
                                <div className="contentSecondary bodyBase">Invested amount</div>
                                <div className="bodyLargeHeavy">
                                    <span className="sc54InrSymbol">₹ {formatCurrency(result.invested)}</span>
                                </div>
                            </div>
                            <div className="valign-wrapper vspace-between width100 sc54OutputText">
                                <div className="contentSecondary bodyBase">Est. returns</div>
                                <div className="bodyLargeHeavy">
                                    <span className="sc54InrSymbol">₹ {formatCurrency(result.returns)}</span>
                                </div>
                            </div>
                            <div className="valign-wrapper vspace-between width100 sc54OutputText">
                                <div className="contentSecondary bodyBase">Total value</div>
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
                                        <span className="cdc54Chip" style={{ background: 'var(--background-accent)' }}></span>
                                        Invested amount
                                    </div>
                                    <div>
                                        <span className="cdc54Chip" style={{ background: 'var(--content-accent)' }}></span>
                                        Est. returns
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
