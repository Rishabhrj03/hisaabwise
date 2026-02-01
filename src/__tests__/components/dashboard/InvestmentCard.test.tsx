/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InvestmentCard } from '@/components/dashboard/InvestmentCard';
import { sendGTMEvent } from '@next/third-parties/google';

jest.mock('@next/third-parties/google', () => ({
    sendGTMEvent: jest.fn(),
}));

global.fetch = jest.fn();

describe('InvestmentCard', () => {
    const mockInvestments = [
        { _id: 'i1', name: 'Nifty 50', type: 'SIP', currentAmount: 10000, autoIncreaseAmount: 5000 }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders investments correctly', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockInvestments
        });

        render(<InvestmentCard />);

        await waitFor(() => {
            expect(screen.getByText('Nifty 50')).toBeInTheDocument();
        });
        expect(screen.getByText('₹10000')).toBeInTheDocument();
        expect(screen.getByText(/SIP/)).toBeInTheDocument();
    });

    it('adds a new investment and triggers GTM event', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockInvestments
        });

        render(<InvestmentCard />);
        await waitFor(() => screen.getByText('Investments 📈'));

        const addButton = screen.getByText('+');
        fireEvent.click(addButton);

        fireEvent.change(screen.getByPlaceholderText('Name (e.g. Nifty 50)'), { target: { value: 'Gold' } });
        fireEvent.change(screen.getByPlaceholderText('Current Value'), { target: { value: '25000' } });

        // Change Type to Gold (Assuming selector order)
        const selects = screen.getAllByRole('combobox');
        fireEvent.change(selects[0], { target: { value: 'Gold' } });

        const newInv = { _id: 'i2', name: 'Gold', type: 'Gold', currentAmount: 25000 };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => newInv
        });

        fireEvent.click(screen.getByText('Add Investment'));

        await waitFor(() => {
            expect(screen.getByText('Gold')).toBeInTheDocument();
        });

        expect(sendGTMEvent).toHaveBeenCalledWith({
            event: 'investment_created',
            value: { type: 'Gold', amount: 25000 }
        });
    });

    it('deletes an investment and triggers GTM event', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockInvestments
        });

        render(<InvestmentCard />);
        await waitFor(() => screen.getByText('Nifty 50'));

        const deleteBtn = screen.getByTitle('Delete');
        fireEvent.click(deleteBtn);

        expect(screen.getByText('Delete Investment')).toBeInTheDocument();
        const confirmBtn = screen.getByText('Delete');

        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(screen.queryByText('Nifty 50')).not.toBeInTheDocument();
        });

        expect(sendGTMEvent).toHaveBeenCalledWith({ event: 'investment_deleted' });
    });
});
