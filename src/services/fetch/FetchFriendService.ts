import {
  IFriendService,
  FriendRecord,
  CreateFriendPayload,
} from '@/services/interfaces/IFriendService';

/**
 * FetchFriendService — Browser-safe adapter for IFriendService.
 * Delegates all data operations to /api/friends routes.
 */
export class FetchFriendService implements IFriendService {
  async fetchFriends(_userId: string): Promise<FriendRecord[]> {
    const res = await fetch('/api/friends', { cache: 'no-store' });
    if (!res.ok) {
      console.error('[FetchFriendService] fetchFriends failed:', res.status);
      return [];
    }
    return res.json();
  }

  async createFriend(payload: CreateFriendPayload): Promise<void> {
    const res = await fetch('/api/friends', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`[FetchFriendService] createFriend failed: ${res.status}`);
  }

  async deleteFriend(id: string): Promise<void> {
    const res = await fetch(`/api/friends/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`[FetchFriendService] deleteFriend failed: ${res.status}`);
  }
}
