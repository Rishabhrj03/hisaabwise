'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Calculator, TrendingUp } from 'lucide-react';
import SIPCalculator from './SIPCalculator';
import LoanCalculator from './LoanCalculator';
import './GrowwStyles.css';

interface CalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CalculatorModal({ isOpen, onClose }: CalculatorModalProps) {
    const [activeTab, setActiveTab] = useState<'sip' | 'loan'>('sip');

    const tabs = [
        { id: 'sip', label: 'SIP', icon: TrendingUp },
        { id: 'loan', label: 'Loan', icon: Calculator },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Financial Calculators" size="lg">
            <div className="groww-wrapper flex flex-col h-full gap-4">
                {/* Tabs - Pill Style */}
                <div className="sc54TabsDiv self-center">
                    <div className="tabs8Container">
                        {tabs.map((tab) => (
                            <div
                                key={tab.id}
                                className={`sc54TabsText ${activeTab === tab.id ? 'selected' : ''}`}
                                onClick={() => setActiveTab(tab.id as any)}
                            >
                                {tab.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto min-h-[400px]">
                    {activeTab === 'sip' && (
                        <div className="animate-in fade-in zoom-in-95 duration-300 h-full">
                            <SIPCalculator />
                        </div>
                    )}
                    {activeTab === 'loan' && (
                        <div className="animate-in fade-in zoom-in-95 duration-300 h-full">
                            <LoanCalculator />
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
