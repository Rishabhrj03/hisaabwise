import { Database } from '@/types/supabase';

/** Raw DB row type for a friend record. */
export type FriendRow = Database['public']['Tables']['friends']['Row'];

/** Payload to insert a new friend record. */
export type CreateFriendPayload = Database['public']['Tables']['friends']['Insert'];

/**
 * IFriendService — Adapter interface for all friend data operations.
 *
 * Swap the backend by implementing this interface and updating src/services/index.ts.
 */
export interface IFriendService {
  /** Fetch all friends belonging to a user. */
  fetchFriends(userId: string): Promise<FriendRow[]>;

  /** Insert a new friend record. */
  createFriend(payload: CreateFriendPayload): Promise<void>;

  /** Permanently delete a friend by id. */
  deleteFriend(id: string): Promise<void>;
}
