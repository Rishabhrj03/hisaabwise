import { SupabaseClient } from '@supabase/supabase-js';
import {
  IGroupService,
  GroupRowWithMembers,
  CreateGroupPayload,
  CreateGroupMemberPayload,
} from '@/services/interfaces/IGroupService';

/**
 * SupabaseGroupService — Supabase adapter for IGroupService.
 *
 * All Supabase group table queries are isolated here. To switch backends,
 * create a new class implementing IGroupService and update src/services/index.ts.
 */
export class SupabaseGroupService implements IGroupService {
  constructor(private readonly client: SupabaseClient) {}

  async fetchGroups(userId: string): Promise<GroupRowWithMembers[]> {
    const { data, error } = await this.client
      .from('groups')
      .select(`*, group_members(member_id)`)
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[GroupService] fetchGroups error:', error);
      return [];
    }

    return (data ?? []) as GroupRowWithMembers[];
  }

  async createGroup(payload: CreateGroupPayload): Promise<void> {
    const { error } = await this.client.from('groups').insert(payload);
    if (error) {
      throw new Error(`[GroupService] createGroup failed: ${error.message}`);
    }
  }

  async createGroupMembers(members: CreateGroupMemberPayload[]): Promise<void> {
    if (members.length === 0) return;
    const { error } = await this.client.from('group_members').insert(members);
    if (error) {
      throw new Error(`[GroupService] createGroupMembers failed: ${error.message}`);
    }
  }

  async deleteGroup(id: string): Promise<void> {
    const { error } = await this.client.from('groups').delete().eq('id', id);
    if (error) {
      throw new Error(`[GroupService] deleteGroup failed: ${error.message}`);
    }
  }
}
