
/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AddExpenseForm } from '@/components/dashboard/AddExpenseForm';
import { useExpenses } from '@/context/ExpenseContext';
import { useFriends } from '@/context/FriendContext';
import { useGroups } from '@/context/GroupContext';
import confetti from 'canvas-confetti';

// Mock dependencies
jest.mock('@/context/ExpenseContext', () => ({
    useExpenses: jest.fn(),
}));
jest.mock('@/context/FriendContext', () => ({
    useFriends: jest.fn(),
}));
jest.mock('@/context/GroupContext', () => ({
    useGroups: jest.fn(),
}));
jest.mock('canvas-confetti', () => jest.fn());

// Mock Child Components
jest.mock('@/components/dashboard/CategoryManager', () => ({
    CategoryManager: () => <div data-testid="category-manager" />
}));

describe('AddExpenseForm', () => {
    const mockAddExpense = jest.fn();
    const mockUpdateExpense = jest.fn();
    const mockCategories = [{ _id: 'cat1', name: 'Food', icon: '🍔' }];

    const mockFriends = [
        { id: 'f1', name: 'Rahul' },
        { id: 'f2', name: 'Vijay' }
    ];

    const mockGroups = [
        { id: 'g1', name: 'Trip', members: ['f1', 'f2'] }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useExpenses as jest.Mock).mockReturnValue({
            addExpense: mockAddExpense,
            updateExpense: mockUpdateExpense,
            categories: mockCategories
        });
        (useFriends as jest.Mock).mockReturnValue({ friends: mockFriends });
        (useGroups as jest.Mock).mockReturnValue({ groups: mockGroups });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders form elements correctly', () => {
        render(<AddExpenseForm />);
        expect(screen.getByPlaceholderText('e.g. Groceries')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();
        expect(screen.getByText('Expense')).toBeInTheDocument();
    });

    it('submits a simple expense', async () => {
        render(<AddExpenseForm />);

        fireEvent.change(screen.getByPlaceholderText('e.g. Groceries'), { target: { value: 'Lunch' } });
        fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '100' } });

        // Find combobox for category. Since there are multiple select/comboboxes (groups, paid by, category), 
        // we should rely on the label 'Category' associated or placeholder.
        // The category select in code has label "Category".
        // It has required attribute.
        // Let's use getAllByRole('combobox') and pick the right one, or test id which I don't have.
        // The category select specifically has options like categories.

        const selects = screen.getAllByRole('combobox');
        // Usually Category is the one with categories.
        const catSelect = selects.find(s => s.innerHTML.includes('Food'));
        if (catSelect) {
            fireEvent.change(catSelect, { target: { value: 'Food' } });
        }

        fireEvent.click(screen.getByText('Add Transaction'));

        await waitFor(() => {
            expect(mockAddExpense).toHaveBeenCalledWith(expect.objectContaining({
                description: 'Lunch',
                amount: 100,
                type: 'expense',
                category: 'Food'
            }));
        });
    });

    it('triggers confetti on income submission', async () => {
        render(<AddExpenseForm />);

        fireEvent.click(screen.getByText('Income'));

        fireEvent.change(screen.getByPlaceholderText('e.g. Groceries'), { target: { value: 'Salary' } });
        fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '5000' } });

        fireEvent.click(screen.getByText('Add Transaction'));

        await waitFor(() => {
            expect(mockAddExpense).toHaveBeenCalledWith(expect.objectContaining({
                type: 'income',
                amount: 5000
            }));
            expect(confetti).toHaveBeenCalled();
        });
    });
});
