/** @jest-environment jsdom */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GroupManager } from '@/components/dashboard/GroupManager';
import { sendGTMEvent } from '@next/third-parties/google';
import { useGroups } from '@/context/GroupContext';
import { useFriends } from '@/context/FriendContext';

jest.mock('@/context/GroupContext', () => ({
    useGroups: jest.fn()
}));
jest.mock('@/context/FriendContext', () => ({
    useFriends: jest.fn()
}));
jest.mock('@next/third-parties/google', () => ({
    sendGTMEvent: jest.fn(),
}));

describe('GroupManager', () => {
    const mockGroups = [
        { id: 'g1', name: 'Trip', members: ['f1', 'f2'] }
    ];
    const mockAddGroup = jest.fn();
    const mockFriends = [
        { id: 'f1', name: 'Alice' },
        { id: 'f2', name: 'Bob' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        (useGroups as jest.Mock).mockReturnValue({
            groups: mockGroups,
            addGroup: mockAddGroup,
            updateGroup: jest.fn(),
            deleteGroup: jest.fn()
        });
        (useFriends as jest.Mock).mockReturnValue({
            friends: mockFriends
        });
    });

    it('renders groups list', () => {
        render(<GroupManager />);
        expect(screen.getByText('Trip')).toBeInTheDocument();
        expect(screen.getByText('2 members')).toBeInTheDocument();
    });

    it('creates a group and triggers GTM event', async () => {
        render(<GroupManager />);

        // Open create form
        fireEvent.click(screen.getByText('Create Group +')); // Button text triggers toggle

        fireEvent.change(screen.getByPlaceholderText('e.g. Goa Trip'), { target: { value: 'Dinner' } });

        // Select members
        fireEvent.click(screen.getByText('Alice'));
        fireEvent.click(screen.getByText('Bob'));

        // Submit. The button in the form is a type="submit" or usually the main action button
        // We can find it by text 'Create Group' inside the form
        // Or simpler: grab the LAST 'Create Group' button which is the submit one (first is the toggle)
        const buttons = screen.getAllByText('Create Group');
        fireEvent.click(buttons[buttons.length - 1]);

        await waitFor(() => {
            expect(mockAddGroup).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Dinner',
                memberIds: expect.arrayContaining(['f1', 'f2'])
            }));
        });

        expect(sendGTMEvent).toHaveBeenCalledWith(expect.objectContaining({
            event: 'group_created'
        }));
    });

    it('copies group link to clipboard', async () => {
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn(),
            },
        });
        window.alert = jest.fn();

        render(<GroupManager />);

        fireEvent.click(screen.getByTitle('Share Link'));

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('/join/g1'));
        // alert is mocked in setup
        expect(window.alert).toHaveBeenCalled();
    });

    it('deletes a group', async () => {
        const mockDeleteGroup = jest.fn();
        (useGroups as jest.Mock).mockReturnValue({
            groups: mockGroups,
            addGroup: mockAddGroup,
            updateGroup: jest.fn(),
            deleteGroup: mockDeleteGroup
        });

        render(<GroupManager />);

        fireEvent.click(screen.getByTitle('Delete'));

        expect(mockDeleteGroup).toHaveBeenCalledWith('g1');
    });

    it('edits a group', async () => {
        const mockUpdateGroup = jest.fn();
        (useGroups as jest.Mock).mockReturnValue({
            groups: mockGroups,
            addGroup: mockAddGroup,
            updateGroup: mockUpdateGroup,
            deleteGroup: jest.fn()
        });

        render(<GroupManager />);

        fireEvent.click(screen.getByTitle('Edit'));

        const input = screen.getByPlaceholderText('e.g. Goa Trip') as HTMLInputElement;
        expect(input.value).toBe('Trip');

        fireEvent.change(input, { target: { value: 'Trip Updated' } });

        fireEvent.click(screen.getByText('Update Group'));

        await waitFor(() => {
            expect(mockUpdateGroup).toHaveBeenCalledWith('g1', expect.objectContaining({
                name: 'Trip Updated'
            }));
        });
    });
});
