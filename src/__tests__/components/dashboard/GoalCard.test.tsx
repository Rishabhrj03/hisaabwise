/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GoalCard } from '@/components/dashboard/GoalCard';
import { sendGTMEvent } from '@next/third-parties/google';

// Mock sendGTMEvent
jest.mock('@next/third-parties/google', () => ({
    sendGTMEvent: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('GoalCard', () => {
    const mockGoals = [
        { _id: 'g1', name: 'New Car', targetAmount: 500000, currentAmount: 100000, color: 'blue' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders goals and calculates progress', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockGoals
        });

        render(<GoalCard />);

        await waitFor(() => {
            expect(screen.getByText('New Car')).toBeInTheDocument();
        });

        // Current Amount
        expect(screen.getByText((content) => content.includes('100,000'))).toBeInTheDocument();
        // Target Amount
        expect(screen.getByText('500000 ✏️')).toBeInTheDocument();
        // Progress should be 20%
        expect(screen.getByText('20%')).toBeInTheDocument();
    });

    it('adds a new goal and triggers GTM event', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockGoals // Initial load
        });

        render(<GoalCard />);
        await waitFor(() => screen.getByText('Savings Goals 🎯'));

        // Open Add Form
        const addButton = screen.getByText('+');
        fireEvent.click(addButton);

        // Fill Form
        fireEvent.change(screen.getByPlaceholderText('Goal Name'), { target: { value: 'Vacation' } });
        fireEvent.change(screen.getByPlaceholderText('Target Amount'), { target: { value: '50000' } });

        // Mock API Response for Create
        const newGoal = { _id: 'g2', name: 'Vacation', targetAmount: 50000, currentAmount: 0, color: 'green' };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => newGoal
        });

        // Submit
        fireEvent.click(screen.getByText('Add', { selector: 'button' }));

        await waitFor(() => {
            expect(screen.getByText('Vacation')).toBeInTheDocument();
        });

        // Verify GTM Event
        expect(sendGTMEvent).toHaveBeenCalledWith({
            event: 'goal_created',
            value: { name: 'Vacation', target: 50000 }
        });
    });

    it('deletes a goal and triggers GTM event', async () => {
        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: async () => mockGoals
        });

        render(<GoalCard />);
        await waitFor(() => screen.getByText('New Car'));

        // Show delete button on hover is handled by CSS, but in test we can just click it if visible.
        // Since we can't easily simulate hover styles in jsdom to make it visible, we'll access it by title.
        const deleteBtn = screen.getByTitle('Delete Goal');
        fireEvent.click(deleteBtn);

        // Confirm Modal
        expect(screen.getByText('Delete Goal')).toBeInTheDocument(); // Title of modal
        const confirmBtn = screen.getByText('Delete'); // Button in modal

        // Mock API Response for Delete
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

        fireEvent.click(confirmBtn);

        await waitFor(() => {
            expect(screen.queryByText('New Car')).not.toBeInTheDocument();
        });

        // Verify GTM Event
        expect(sendGTMEvent).toHaveBeenCalledWith({ event: 'goal_deleted' });
    });
});
