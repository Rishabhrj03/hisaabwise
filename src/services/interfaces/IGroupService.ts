import { Database } from '@/types/supabase';

/** Raw DB row type for a group record. */
export type GroupRow = Database['public']['Tables']['groups']['Row'];

/** Raw DB row type for a group_members record. */
export type GroupMemberRow = Database['public']['Tables']['group_members']['Row'];

/** A raw group row with its nested member list (from a join query). */
export type GroupRowWithMembers = GroupRow & {
  group_members: Pick<GroupMemberRow, 'member_id'>[];
};

/** Payload to insert a new group record. */
export type CreateGroupPayload = Database['public']['Tables']['groups']['Insert'];

/** Payload to insert group membership records. */
export type CreateGroupMemberPayload = Database['public']['Tables']['group_members']['Insert'];

/**
 * IGroupService — Adapter interface for all group data operations.
 *
 * Swap the backend by implementing this interface and updating src/services/index.ts.
 */
export interface IGroupService {
  /** Fetch all groups (with their member lists) created by a user. */
  fetchGroups(userId: string): Promise<GroupRowWithMembers[]>;

  /** Insert a new group record. */
  createGroup(payload: CreateGroupPayload): Promise<void>;

  /** Insert group membership records (bulk). */
  createGroupMembers(members: CreateGroupMemberPayload[]): Promise<void>;

  /** Permanently delete a group by id. */
  deleteGroup(id: string): Promise<void>;
}
