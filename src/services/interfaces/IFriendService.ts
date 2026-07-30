/**
 * IFriendService — Adapter interface for all friend data operations.
 *
 * These types are deliberately database-agnostic.
 * To switch databases: implement this interface and update src/services/index.ts.
 */

export interface FriendRecord {
  id: string;
  user_id: string;
  name: string;
  phone?: string | null;
  linked_user_id?: string | null;
  created_at?: string;
}

/** Payload to insert a new friend record. */
export interface CreateFriendPayload {
  id: string;
  user_id: string;
  name: string;
  phone?: string | null;
  created_at?: string;
}

export interface IFriendService {
  /** Fetch all friends belonging to a user. */
  fetchFriends(userId: string): Promise<FriendRecord[]>;

  /** Insert a new friend record. */
  createFriend(payload: CreateFriendPayload): Promise<void>;

  /** Permanently delete a friend by id. */
  deleteFriend(id: string): Promise<void>;
}

