
import { sendExpenseNotification } from '@/lib/notification';
import webpush from 'web-push';
import Subscription from '@/models/Subscription';
import Group from '@/models/Group';
import Friend from '@/models/Friend';

// Mock dependencies
jest.mock('web-push', () => ({
    setVapidDetails: jest.fn(),
    sendNotification: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/models/Subscription');
jest.mock('@/models/Group');
jest.mock('@/models/Friend');

describe('Notification Logic', () => {
    const mockExpense = {
        description: 'Test Expense',
        amount: 100,
        group_id: 'group1',
        relatedTo: []
    };
    const currentUserId = 'user1';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('sends notification to group members excluding sender', async () => {
        // Mock Group
        (Group.findById as jest.Mock).mockResolvedValue({
            _id: 'group1',
            members: ['user1', 'user2', 'user3']
        });

        // Mock Subscriptions
        const mockSubscriptions = [
            { _id: 'sub1', user_id: 'user2', endpoint: 'url2', keys: {} },
            { _id: 'sub2', user_id: 'user3', endpoint: 'url3', keys: {} }
        ];
        (Subscription.find as jest.Mock).mockResolvedValue(mockSubscriptions);

        await sendExpenseNotification(mockExpense, currentUserId);

        // Expect Subscription check for user2 and user3
        expect(Subscription.find).toHaveBeenCalledWith({
            user_id: { $in: expect.arrayContaining(['user2', 'user3']) }
        });

        // Expect web-push to be called twice
        expect(webpush.sendNotification).toHaveBeenCalledTimes(2);
    });

    it('sends notification to linked friend', async () => {
        const friendExpense = {
            description: 'Friend Expense',
            amount: 50,
            relatedTo: ['friend1']
        };

        (Group.findById as jest.Mock).mockResolvedValue(null);

        // Mock Friend
        (Friend.find as jest.Mock).mockResolvedValue([
            { _id: 'friend1', linked_user_id: 'user2' } // user2 is the friend
        ]);

        // Mock Subscription for user2
        (Subscription.find as jest.Mock).mockResolvedValue([
            { _id: 'sub1', user_id: 'user2', endpoint: 'url2', keys: {} }
        ]);

        await sendExpenseNotification(friendExpense, currentUserId);

        expect(Subscription.find).toHaveBeenCalledWith({
            user_id: { $in: expect.arrayContaining(['user2']) }
        });

        expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
    });

    it('does not send notification if no subscriptions found', async () => {
        (Group.findById as jest.Mock).mockResolvedValue({
            _id: 'group1',
            members: ['user1', 'user2']
        });

        (Subscription.find as jest.Mock).mockResolvedValue([]);

        await sendExpenseNotification(mockExpense, currentUserId);

        expect(webpush.sendNotification).not.toHaveBeenCalled();
    });
});
