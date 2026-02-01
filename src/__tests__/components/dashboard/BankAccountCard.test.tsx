/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BankAccountCard } from '@/components/dashboard/BankAccountCard';
import { sendGTMEvent } from '@next/third-parties/google';

jest.mock('@next/third-parties/google', () => ({
    sendGTMEvent: jest.fn(),
}));

global.fetch = jest.fn();

describe('BankAccountCard', () => {
    const mockAccounts = [
        { _id: 'a1', name: 'HDFC', type: 'bank', balance: 50000 }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders accounts correctly', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockAccounts
        });

        render(<BankAccountCard />);

        await waitFor(() => {
            expect(screen.getByText('HDFC')).toBeInTheDocument();
        });
        expect(screen.getByText('₹50000')).toBeInTheDocument();
        expect(screen.getByText('bank')).toBeInTheDocument();
    });

    it('adds a new card account and triggers GTM event', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockAccounts
        });

        render(<BankAccountCard />);
        await waitFor(() => screen.getByText('Accounts & Cards 💳'));

        const addButton = screen.getByText('+');
        fireEvent.click(addButton);

        // Fill Form
        fireEvent.change(screen.getByPlaceholderText('Name (e.g. HDFC, Amex)'), { target: { value: 'Amex' } });

        // Select 'Credit Card'
        const typeSelect = screen.getByRole('combobox');
        fireEvent.change(typeSelect, { target: { value: 'card' } });

        // Add details
        fireEvent.change(screen.getByPlaceholderText('Due Amt'), { target: { value: '2000' } });
        fireEvent.change(screen.getByPlaceholderText('Total Limit'), { target: { value: '100000' } });
        fireEvent.change(screen.getByPlaceholderText('Bill Day (1-31)'), { target: { value: '15' } });

        const newAccount = { _id: 'a2', name: 'Amex', type: 'card', balance: 2000, creditLimit: 100000, billingDate: 15 };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => newAccount
        });

        fireEvent.click(screen.getByText('Add Account'));

        await waitFor(() => {
            expect(screen.getByText('Amex')).toBeInTheDocument();
        });

        expect(sendGTMEvent).toHaveBeenCalledWith({
            event: 'account_created',
            value: { type: 'card' }
        });
    });

    it('deletes an account and triggers GTM event', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockAccounts
        });

        render(<BankAccountCard />);
        await waitFor(() => screen.getByText('HDFC'));

        const deleteBtn = screen.getByTitle('Delete Account');
        fireEvent.click(deleteBtn);

        expect(screen.getByText('Delete Account')).toBeInTheDocument();
        const confirmBtn = screen.getByText('Delete');

        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(screen.queryByText('HDFC')).not.toBeInTheDocument();
        });

        expect(sendGTMEvent).toHaveBeenCalledWith({ event: 'account_deleted' });
    });
});
