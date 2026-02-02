import webpush from 'web-push';
import Subscription from '@/models/Subscription';
import Group from '@/models/Group';
import Friend from '@/models/Friend';

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BFvluXtvKeY71SjwUk6U3CGESI04IEypMV2DRDE-1q119CR2RBtNBAugjFGo6sP5zhfNQYiAovgXumWBqunHvck';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'IfkGn5e0rr8stgOtkZgVM6iyg-75kmxekD94O-y9OH8';

webpush.setVapidDetails(
    process.env.EMAIL_USER ? `mailto:${process.env.EMAIL_USER}` : 'mailto:test@example.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

export async function sendNotificationToUser(userId: string, title: string, body: string) {
    try {
        const subscriptions = await Subscription.find({ user_id: userId });
        if (!subscriptions || subscriptions.length === 0) return;

        const payload = JSON.stringify({ title, body });

        const promises = subscriptions.map(sub => {
            return webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: sub.keys
            }, payload).catch(err => {
                console.error('Error sending push:', err);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    return Subscription.deleteOne({ _id: sub._id });
                }
            });
        });

        await Promise.all(promises);
    } catch (error) {
        console.error('Error sending notification to user:', error);
    }
}

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

        userIdsToNotify.delete(currentUserId);

        if (userIdsToNotify.size === 0) return;

        // Use the generic function for each user
        const promises = Array.from(userIdsToNotify).map(userId =>
            sendNotificationToUser(userId, 'New Expense Added', `${expense.description} - ${expense.amount}`)
        );

        await Promise.all(promises);

    } catch (error) {
        console.error('Error in sendExpenseNotification:', error);
    }
}

export async function sendFriendNotification(userId: string, addedByName: string) {
    await sendNotificationToUser(userId, 'New Friend Connection', `${addedByName} added you as a friend.`);
}

export async function sendGroupNotification(userIds: string[], groupName: string, addedByName: string) {
    const promises = userIds.map(id =>
        sendNotificationToUser(id, 'Added to Group', `${addedByName} added you to group "${groupName}".`)
    );
    await Promise.all(promises);
}
