/**
 * IGroupService — Adapter interface for all group data operations.
 *
 * These types are deliberately database-agnostic.
 * To switch databases: implement this interface and update src/services/index.ts.
 */

export interface GroupRecord {
  id: string;
  created_by: string;
  name: string;
  created_at: string;
}

export interface GroupMemberRecord {
  group_id: string;
  member_id: string;
}

/** A group record with its nested member list (from a join/lookup query). */
export interface GroupRecordWithMembers extends GroupRecord {
  group_members: Pick<GroupMemberRecord, 'member_id'>[];
}

/** Payload to insert a new group record. */
export interface CreateGroupPayload {
  id: string;
  created_by: string;
  name: string;
  created_at: string;
}

/** Payload to insert group membership records. */
export interface CreateGroupMemberPayload {
  group_id: string;
  member_id: string;
}

export interface IGroupService {
  /** Fetch all groups (with their member lists) created by a user. */
  fetchGroups(userId: string): Promise<GroupRecordWithMembers[]>;

  /** Insert a new group record. */
  createGroup(payload: CreateGroupPayload): Promise<void>;

  /** Insert group membership records (bulk). */
  createGroupMembers(members: CreateGroupMemberPayload[]): Promise<void>;

  /** Permanently delete a group by id. */
  deleteGroup(id: string): Promise<void>;
}

