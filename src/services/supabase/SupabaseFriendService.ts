import { SupabaseClient } from '@supabase/supabase-js';
import {
  IFriendService,
  FriendRow,
  CreateFriendPayload,
} from '@/services/interfaces/IFriendService';

/**
 * SupabaseFriendService — Supabase adapter for IFriendService.
 *
 * All Supabase friend table queries are isolated here. To switch backends,
 * create a new class implementing IFriendService and update src/services/index.ts.
 */
export class SupabaseFriendService implements IFriendService {
  constructor(private readonly client: SupabaseClient) {}

  async fetchFriends(userId: string): Promise<FriendRow[]> {
    const { data, error } = await this.client
      .from('friends')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('[FriendService] fetchFriends error:', error);
      return [];
    }

    return data ?? [];
  }

  async createFriend(payload: CreateFriendPayload): Promise<void> {
    const { error } = await this.client.from('friends').insert(payload);
    if (error) {
      throw new Error(`[FriendService] createFriend failed: ${error.message}`);
    }
  }

  async deleteFriend(id: string): Promise<void> {
    const { error } = await this.client.from('friends').delete().eq('id', id);
    if (error) {
      throw new Error(`[FriendService] deleteFriend failed: ${error.message}`);
    }
  }
}
