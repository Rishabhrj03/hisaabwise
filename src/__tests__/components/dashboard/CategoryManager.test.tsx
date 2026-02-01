
/** @jest-environment jsdom */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CategoryManager } from '@/components/dashboard/CategoryManager';
import { useExpenses } from '@/context/ExpenseContext';

// Mock dependencies
jest.mock('@/context/ExpenseContext', () => ({
    useExpenses: jest.fn(),
}));

jest.mock('@/components/ui/Modal', () => ({
    Modal: ({ isOpen, children, title }: any) => (
        isOpen ? <div data-testid="modal">
            <h1>{title}</h1>
            {children}
        </div> : null
    )
}));

jest.mock('@/components/ui/Button', () => ({
    Button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props}>{children}</button>
}));

describe('CategoryManager', () => {
    const mockCategories = [
        { _id: 'c1', name: 'Food', color: '#FF0000', icon: 'Utensils', is_default: false },
        { _id: 'c2', name: 'Transport', color: '#00FF00', icon: 'Car', is_default: true }
    ];

    const mockAddCategory = jest.fn();
    const mockUpdateCategory = jest.fn();
    const mockDeleteCategory = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useExpenses as jest.Mock).mockReturnValue({
            categories: mockCategories,
            addCategory: mockAddCategory,
            updateCategory: mockUpdateCategory,
            deleteCategory: mockDeleteCategory
        });

        // Mock window.confirm
        window.confirm = jest.fn().mockImplementation(() => true);
    });

    it('renders category list when open', () => {
        render(<CategoryManager isOpen={true} onClose={jest.fn()} />);

        expect(screen.getByText('Manage Categories')).toBeInTheDocument();
        expect(screen.getByText('Food')).toBeInTheDocument();
        expect(screen.getByText('Transport')).toBeInTheDocument();
    });

    it('allows adding a new category', async () => {
        render(<CategoryManager isOpen={true} onClose={jest.fn()} />);

        // Click New Category
        fireEvent.click(screen.getByText('+ New Category'));

        expect(screen.getByText('New Category')).toBeInTheDocument();

        // Fill form
        const nameInput = screen.getByPlaceholderText('e.g. Shopping');
        fireEvent.change(nameInput, { target: { value: 'Shopping' } });

        // Submit (Create button)
        const createBtn = screen.getByText('Create');
        fireEvent.click(createBtn);

        await waitFor(() => {
            expect(mockAddCategory).toHaveBeenCalledWith('Shopping', expect.any(String), expect.any(String));
        });
    });

    it('allows editing an existing category', async () => {
        render(<CategoryManager isOpen={true} onClose={jest.fn()} />);

        // Click Edit for Food (first one)
        const editButtons = screen.getAllByText('✎');
        fireEvent.click(editButtons[0]);

        expect(screen.getByText('Edit Category')).toBeInTheDocument();

        // Change name
        const nameInput = screen.getByDisplayValue('Food');
        fireEvent.change(nameInput, { target: { value: 'Food & Drink' } });

        // Submit (Update button)
        const updateBtn = screen.getByText('Update');
        fireEvent.click(updateBtn);

        await waitFor(() => {
            expect(mockUpdateCategory).toHaveBeenCalledWith('c1', 'Food & Drink', '#FF0000', 'Utensils');
        });
    });

    it('allows deleting a non-default category', async () => {
        render(<CategoryManager isOpen={true} onClose={jest.fn()} />);

        // Click Delete for Food. (Transport is default, so might not have delete button if logic handles it. 
        // Mock data says c2 is is_default: true)
        // Code check: !cat.is_default && cat.name !== 'Other'
        const deleteButtons = screen.getAllByText('✕');
        expect(deleteButtons.length).toBe(1); // Only Food should have delete button

        fireEvent.click(deleteButtons[0]);

        expect(window.confirm).toHaveBeenCalled();
        expect(mockDeleteCategory).toHaveBeenCalledWith('c1');
    });
});
