'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Group, GroupInput } from '@/types';
import { groupService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { GroupRowWithMembers } from '@/services/interfaces/IGroupService';

interface GroupContextType {
  groups: Group[];
  addGroup: (input: GroupInput) => Promise<string>;
  deleteGroup: (id: string) => Promise<void>;
  loading: boolean;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

/** Maps a raw DB group row (with nested members) to the domain Group type. */
function mapRowToGroup(row: GroupRowWithMembers): Group {
  return {
    id: row.id,
    name: row.name,
    created_by: row.created_by,
    created_at: row.created_at,
    members: row.group_members.map((m) => m.member_id),
  };
}

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshGroups = async () => {
    if (!user) {
      setGroups([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const rows = await groupService.fetchGroups(user.id);
    setGroups(rows.map(mapRowToGroup));
    setLoading(false);
  };

  useEffect(() => {
    refreshGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addGroup = async (input: GroupInput): Promise<string> => {
    if (!user) throw new Error('User must be logged in');

    const groupId = crypto.randomUUID();

    await groupService.createGroup({
      id: groupId,
      created_by: user.id,
      name: input.name,
      created_at: new Date().toISOString(),
    });

    if (input.memberIds.length > 0) {
      try {
        await groupService.createGroupMembers(
          input.memberIds.map((mId) => ({ group_id: groupId, member_id: mId }))
        );
      } catch (err) {
        // Roll back the group if members couldn't be added.
        await groupService.deleteGroup(groupId);
        throw err;
      }
    }

    await refreshGroups();
    return groupId;
  };

  const deleteGroup = async (id: string): Promise<void> => {
    if (!user) return;

    await groupService.deleteGroup(id);
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  return (
    <GroupContext.Provider value={{ groups, addGroup, deleteGroup, loading }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
}
