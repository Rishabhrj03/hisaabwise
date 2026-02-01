
/** @jest-environment jsdom */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SummaryCards } from '@/components/dashboard/SummaryCards';

describe('SummaryCards', () => {
    it('renders totals with correct formatting', () => {
        render(
            <SummaryCards
                totalBalance={5200.5}
                totalIncome={10000}
                totalExpense={4799.5}
                currency="USD"
            />
        );

        expect(screen.getByText('Total Balance')).toBeInTheDocument();
        expect(screen.getByText('Income')).toBeInTheDocument();
        expect(screen.getByText('Expense')).toBeInTheDocument();

        expect(screen.getByText('$5,200.50')).toBeInTheDocument();
        expect(screen.getByText('$10,000.00')).toBeInTheDocument();
        expect(screen.getByText('$4,799.50')).toBeInTheDocument();
    });

    it('renders INR currency correctly', () => {
        render(
            <SummaryCards
                totalBalance={5000}
                totalIncome={10000}
                totalExpense={5000}
                currency="INR"
            />
        );

        // Expect Rupee symbol
        const elements = screen.getAllByText((content, element) => {
            return content.includes('₹') && content.includes('5,000');
        });
        expect(elements.length).toBeGreaterThan(0);
    });
});
