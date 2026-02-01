/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FriendManager } from '@/components/dashboard/FriendManager';
import { sendGTMEvent } from '@next/third-parties/google';
import { useFriends } from '@/context/FriendContext';
import { useAuth } from '@/context/AuthContext';

// Mock Contexts
jest.mock('@/context/FriendContext', () => ({
    useFriends: jest.fn()
}));
jest.mock('@/context/AuthContext', () => ({
    useAuth: jest.fn()
}));
jest.mock('@next/third-parties/google', () => ({
    sendGTMEvent: jest.fn(),
}));

describe('FriendManager', () => {
    const mockFriends = [
        { id: 'f1', name: 'Alice', phone: '9876543210' }
    ];
    const mockAddFriend = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useFriends as jest.Mock).mockReturnValue({
            friends: mockFriends,
            addFriend: mockAddFriend,
            updateFriend: jest.fn(),
            deleteFriend: jest.fn()
        });
        (useAuth as jest.Mock).mockReturnValue({
            user: { phone: '1234567890' }
        });
    });

    it('renders friends list', () => {
        render(<FriendManager />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('9876543210')).toBeInTheDocument();
    });

    it('adds a friend and triggers GTM event', async () => {
        render(<FriendManager />);

        fireEvent.change(screen.getByPlaceholderText("Friend's Name"), { target: { value: 'Bob' } });
        fireEvent.change(screen.getByPlaceholderText("Phone (10 digits)"), { target: { value: '9988776655' } });

        fireEvent.click(screen.getByText('Add'));

        await waitFor(() => {
            expect(mockAddFriend).toHaveBeenCalledWith('Bob', '9988776655', '');
        });

        expect(sendGTMEvent).toHaveBeenCalledWith({ event: 'friend_added' });
    });

    it('invites a friend and triggers GTM event', () => {
        // Suppress jsdom navigation error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<FriendManager />);

        const inviteBtn = screen.getByText('Invite');
        fireEvent.click(inviteBtn);

        expect(sendGTMEvent).toHaveBeenCalledWith({ event: 'friend_invited' });

        consoleErrorSpy.mockRestore();
    });

    it('edits a friend', async () => {
        const mockUpdateFriend = jest.fn();
        (useFriends as jest.Mock).mockReturnValue({
            friends: mockFriends,
            addFriend: mockAddFriend,
            updateFriend: mockUpdateFriend,
            deleteFriend: jest.fn()
        });

        render(<FriendManager />);

        // Click edit on the first friend (Alice)
        fireEvent.click(screen.getByText('Edit'));

        // Check if form is populated
        const nameInput = screen.getByPlaceholderText("Friend's Name") as HTMLInputElement;
        const phoneInput = screen.getByPlaceholderText("Phone (10 digits)") as HTMLInputElement;

        expect(nameInput.value).toBe('Alice');
        expect(phoneInput.value).toBe('9876543210');

        // Change values
        fireEvent.change(nameInput, { target: { value: 'Alice Updated' } });

        // Click Update (Button text changes to 'Update Friend')
        fireEvent.click(screen.getByText('Update Friend'));

        await waitFor(() => {
            expect(mockUpdateFriend).toHaveBeenCalledWith('f1', expect.objectContaining({
                name: 'Alice Updated'
            }));
        });

        expect(sendGTMEvent).toHaveBeenCalledWith({ event: 'friend_updated' });
    });
});
