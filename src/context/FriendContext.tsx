'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Friend } from '@/types';
import { friendService } from '@/services';
import { useAuth } from '@/context/AuthContext';

interface FriendContextType {
  friends: Friend[];
  addFriend: (name: string, phone?: string) => Promise<string>;
  deleteFriend: (id: string) => Promise<void>;
  loading: boolean;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export function FriendProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) {
        setFriends([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const rows = await friendService.fetchFriends(user.id);
      setFriends(rows);
      setLoading(false);
    };

    fetchFriends();
  }, [user]);

  const addFriend = async (name: string, phone?: string): Promise<string> => {
    if (!user) throw new Error('User must be logged in to add friends');

    const id = crypto.randomUUID();
    const payload = {
      id,
      user_id: user.id,
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      created_at: new Date().toISOString(),
    };

    // Optimistic update.
    const optimisticFriend: Friend = { id, name: payload.name, phone: payload.phone };
    setFriends((prev) => [...prev, optimisticFriend]);

    try {
      await friendService.createFriend(payload);
    } catch (err) {
      console.error('[FriendContext] addFriend failed, reverting:', err);
      setFriends((prev) => prev.filter((f) => f.id !== id));
      throw err;
    }

    return id;
  };

  const deleteFriend = async (id: string): Promise<void> => {
    if (!user) return;

    const previousFriends = [...friends];
    setFriends((prev) => prev.filter((f) => f.id !== id));

    try {
      await friendService.deleteFriend(id);
    } catch (err) {
      console.error('[FriendContext] deleteFriend failed, reverting:', err);
      setFriends(previousFriends);
      throw err;
    }
  };

  return (
    <FriendContext.Provider value={{ friends, addFriend, deleteFriend, loading }}>
      {children}
    </FriendContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendProvider');
  }
  return context;
}
