import {
  IGroupService,
  GroupRecordWithMembers,
  CreateGroupPayload,
  CreateGroupMemberPayload,
} from '@/services/interfaces/IGroupService';

/**
 * FetchGroupService — Browser-safe adapter for IGroupService.
 * Delegates all data operations to /api/groups routes.
 */
export class FetchGroupService implements IGroupService {
  async fetchGroups(_userId: string): Promise<GroupRecordWithMembers[]> {
    const res = await fetch('/api/groups', { cache: 'no-store' });
    if (!res.ok) {
      console.error('[FetchGroupService] fetchGroups failed:', res.status);
      return [];
    }
    return res.json();
  }

  async createGroup(payload: CreateGroupPayload): Promise<void> {
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group: payload, members: [] }),
    });
    if (!res.ok) throw new Error(`[FetchGroupService] createGroup failed: ${res.status}`);
  }

  async createGroupMembers(members: CreateGroupMemberPayload[]): Promise<void> {
    // Group members are sent alongside the group in createGroup.
    // If called standalone, fire a standalone members post.
    if (members.length === 0) return;
    const groupId = members[0].group_id;
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ group: { id: groupId }, members }),
    });
    if (!res.ok) throw new Error(`[FetchGroupService] createGroupMembers failed: ${res.status}`);
  }

  async deleteGroup(id: string): Promise<void> {
    const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`[FetchGroupService] deleteGroup failed: ${res.status}`);
  }
}
