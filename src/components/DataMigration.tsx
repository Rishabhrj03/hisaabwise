'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { migrationService } from '@/services';
import { LegacyExpense, LegacyFriend } from '@/services/interfaces/IMigrationService';

/**
 * DataMigration — One-time migration of legacy localStorage data into the database.
 *
 * Renders nothing (null) unless a migration is actively running, in which case
 * it shows a full-screen overlay. All DB calls are delegated to migrationService.
 */
export function DataMigration() {
  const { user } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!user) return;

    const hasMigrated = localStorage.getItem('supabase_migrated');
    const localFriends = localStorage.getItem('friends');
    const localExpenses = localStorage.getItem('expenses');

    if (!hasMigrated && (localFriends || localExpenses)) {
      performMigration(user.id, localFriends, localExpenses);
    }
  }, [user]);

  const performMigration = async (
    userId: string,
    friendsJson: string | null,
    expensesJson: string | null
  ) => {
    setMigrating(true);
    setStatus('Preparing migration...');

    try {
      const friends: LegacyFriend[] = friendsJson ? JSON.parse(friendsJson) : [];
      const expenses: LegacyExpense[] = expensesJson ? JSON.parse(expensesJson) : [];

      setStatus(`Migrating ${friends.length} friends...`);
      const friendIdMap = await migrationService.migrateFriends(userId, friends);

      setStatus(`Migrating ${expenses.length} expenses...`);
      await migrationService.migrateExpenses(userId, expenses, friendIdMap);

      localStorage.setItem('supabase_migrated', 'true');
      setStatus('Migration complete!');

      setTimeout(() => {
        setMigrating(false);
        window.location.reload();
      }, 1000);
    } catch (e) {
      console.error('[DataMigration] Migration failed:', e);
      setStatus('Migration failed. Please check the console.');
      setMigrating(false);
    }
  };

  if (!migrating) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
      }}
    >
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4" />
      <h2 className="text-xl font-bold mb-2">Upgrading Database</h2>
      <p>{status}</p>
    </div>
  );
}
