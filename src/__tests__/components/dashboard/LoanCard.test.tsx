/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoanCard } from '@/components/dashboard/LoanCard';
import { sendGTMEvent } from '@next/third-parties/google';

jest.mock('@next/third-parties/google', () => ({
    sendGTMEvent: jest.fn(),
}));

global.fetch = jest.fn();

describe('LoanCard', () => {
    const mockLoans = [
        {
            _id: 'l1',
            name: 'Home Loan',
            type: 'borrowed',
            principalAmount: 500000,
            paidAmount: 10000,
            interestRate: 8,
            tenureMonths: 60,
            repaymentType: 'emi',
            emiAmount: 10000
        }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders loans correctly', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockLoans
        });

        render(<LoanCard />);

        await waitFor(() => {
            expect(screen.getByText('Home Loan')).toBeInTheDocument();
        });
        expect(screen.getByText('₹500000')).toBeInTheDocument();
    });

    it('adds a new loan and triggers GTM event', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockLoans
        });

        render(<LoanCard />);
        await waitFor(() => screen.getByText('Loans & Udhar 🤝'));

        const addButton = screen.getByText('+');
        fireEvent.click(addButton);

        fireEvent.change(screen.getByPlaceholderText('Name (e.g. Home Loan)'), { target: { value: 'Friend' } });
        fireEvent.change(screen.getByPlaceholderText('Principal Amount'), { target: { value: '5000' } });
        fireEvent.change(screen.getByPlaceholderText('Int %'), { target: { value: '0' } });
        fireEvent.change(screen.getByPlaceholderText('Tenure (Months)'), { target: { value: '1' } });

        const newLoan = {
            _id: 'l2',
            name: 'Friend',
            type: 'borrowed',
            principalAmount: 5000,
            paidAmount: 0
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => newLoan
        });

        fireEvent.click(screen.getByText('Add Loan'));

        await waitFor(() => {
            expect(screen.getByText('Friend')).toBeInTheDocument();
        });

        expect(sendGTMEvent).toHaveBeenCalledWith({
            event: 'loan_created',
            value: { type: 'borrowed', amount: 5000 }
        });
    });

    it('records a payment and triggers GTM event', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockLoans
        });

        render(<LoanCard />);
        await waitFor(() => screen.getByText('Home Loan'));

        const recordPayBtn = screen.getByText('+ Record Payment');
        fireEvent.click(recordPayBtn);

        const input = screen.getByPlaceholderText('Amount');
        fireEvent.change(input, { target: { value: '5000' } });

        const confirmBtn = screen.getByText('Confirm');

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ ...mockLoans[0], paidAmount: 15000 })
        });

        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(sendGTMEvent).toHaveBeenCalledWith({
                event: 'loan_repayment',
                value: { amount: 5000 }
            });
        });
    });
});
