
/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BudgetCard } from '@/components/dashboard/BudgetCard';
import { useExpenses } from '@/context/ExpenseContext';

// Mock the context hook
jest.mock('@/context/ExpenseContext', () => ({
    useExpenses: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('BudgetCard', () => {
    const mockExpenses = [
        { id: '1', date: new Date().toISOString(), category: 'Food', amount: 50, type: 'expense' },
        { id: '2', date: new Date().toISOString(), category: 'Transport', amount: 200, type: 'expense' }, // Over budget case
    ];

    const mockBudgets = [
        { _id: 'b1', category: 'Food', amount: 500, period: 'monthly' },
        { _id: 'b2', category: 'Transport', amount: 100, period: 'monthly' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useExpenses as jest.Mock).mockReturnValue({
            expenses: mockExpenses
        });
    });

    it('renders loading state initially', async () => {
        (global.fetch as jest.Mock).mockReturnValue(new Promise(() => { })); // pending promise
        render(<BudgetCard />);
        expect(screen.getByText(/Loading Budgets/i)).toBeInTheDocument();
    });

    it('renders budgets and calculates progress correctly', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockBudgets
        });

        render(<BudgetCard />);

        await waitFor(() => {
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });

        expect(screen.getByText('Food')).toBeInTheDocument();
        expect(screen.getByText('Transport')).toBeInTheDocument();

        // Food: 50 spent / 500 limit. 10%
        // Check for text "₹50 /"
        expect(screen.getByText((content, element) => {
            return element?.textContent === '₹50 /';
        })).toBeInTheDocument();

        // Transport: 200 spent / 100 limit. Over budget.
        expect(screen.getByText((content, element) => {
            return element?.textContent === '₹200 /';
        })).toBeInTheDocument();
    });

    it('allows adding a new budget', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockBudgets // Initial load
        });

        render(<BudgetCard />);
        await waitFor(() => expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument());

        // Click Add button (+)
        const addButton = screen.getByText('+');
        fireEvent.click(addButton);

        // Inputs should appear
        const catInput = screen.getByPlaceholderText('Category Name');
        const limitInput = screen.getByPlaceholderText('Limit Amount');
        const submitBtn = screen.getByText('Add', { selector: 'button' });

        fireEvent.change(catInput, { target: { value: 'Entertainment' } });
        fireEvent.change(limitInput, { target: { value: '1000' } });

        // Mock add response
        const newBudget = { _id: 'b3', category: 'Entertainment', amount: 1000, period: 'monthly' };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => newBudget
        });

        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/budgets', expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ category: 'Entertainment', amount: 1000 })
            }));
        });
    });
});
