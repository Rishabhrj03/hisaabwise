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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Button variant="ghost" size="sm" onClick={onPrevMonth}>
                ←
            </Button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, minWidth: '160px', textAlign: 'center' }}>
                {formatMonth(currentDate)}
            </h2>
            <Button variant="ghost" size="sm" onClick={onNextMonth}>
                →
            </Button>
        </div>
    );
}
