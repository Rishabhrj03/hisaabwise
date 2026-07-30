import React from 'react';
import { Button } from '@/components/ui/Button';

interface MonthSelectorProps {
    currentDate: Date;
    onPrevMonth: () => void;
    onNextMonth: () => void;
}

export function MonthSelector({ currentDate, onPrevMonth, onNextMonth }: MonthSelectorProps) {
    const formatMonth = (date: Date) => {
        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="month-selector-container">
            <Button variant="ghost" size="sm" onClick={onPrevMonth} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                ← Prev
            </Button>
            <h2 className="month-selector-title">
                {formatMonth(currentDate)}
            </h2>
            <Button variant="ghost" size="sm" onClick={onNextMonth} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}>
                Next →
            </Button>
        </div>
    );
}

