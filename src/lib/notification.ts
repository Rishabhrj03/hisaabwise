import webpush from 'web-push';
import Subscription from '@/models/Subscription';
import Group from '@/models/Group';
import Friend from '@/models/Friend';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';

webpush.setVapidDetails(
    process.env.EMAIL_USER || '',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

export async function sendExpenseNotification(expense: any, currentUserId: string) {
    const userIdsToNotify = new Set<string>();

    try {
        // 1. If Group Expense -> Notify Group Members
        if (expense.group_id) {
            const group = await Group.findById(expense.group_id);
            if (group && group.members) {
                group.members.forEach((memberId: string) => {
                    if (memberId !== currentUserId) {
                        userIdsToNotify.add(memberId);
                    }
                });
            }
        }

        // 2. If Split/Friend Expense -> Notify Related Friends
        // Note: expense.relatedTo contains Friend IDs, not User IDs.
        // We need to find the User ID linked to that Friend ID.
        if (expense.relatedTo && expense.relatedTo.length > 0) {
            const friends = await Friend.find({ _id: { $in: expense.relatedTo } });
            friends.forEach(friend => {
                if (friend.linked_user_id) {
                    const linkedId = friend.linked_user_id.toString();
                    if (linkedId !== currentUserId) {
                        userIdsToNotify.add(linkedId);
                    }
                }
            });
        }

        // Remove current user just in case
        userIdsToNotify.delete(currentUserId);

        if (userIdsToNotify.size === 0) return;

        // 3. Find Subscriptions
        const subscriptions = await Subscription.find({ user_id: { $in: Array.from(userIdsToNotify) } });

        // 4. Send Notifications
        const payload = JSON.stringify({
            title: 'New Expense Added',
            body: `${expense.description} - ${expense.amount}`,
        });

        const promises = subscriptions.map(sub => {
            return webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: sub.keys
            }, payload).catch(err => {
                console.error('Error sending push:', err);
                // Optional: Delete invalid subscription
                if (err.statusCode === 410 || err.statusCode === 404) {
                    return Subscription.deleteOne({ _id: sub._id });
                }
            });
        });

        await Promise.all(promises);

    } catch (error) {
        console.error('Error in sendExpenseNotification:', error);
    }
}
