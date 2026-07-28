import { Session, User, AuthChangeEvent } from '@supabase/supabase-js';

/**
 * IAuthService — Adapter interface for all authentication operations.
 *
 * Swap the database/auth provider by creating a new class that implements
 * this interface and updating src/services/index.ts. No other file changes needed.
 */
export interface IAuthService {
  /** Get the current active session (one-shot). */
  getSession(): Promise<Session | null>;

  /**
   * Subscribe to auth state changes.
   * Returns an unsubscribe function to clean up the listener.
   */
  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): () => void;

  /** Update the authenticated user's metadata (e.g. phone). */
  updateUserMetadata(data: Record<string, unknown>): Promise<void>;

  /**
   * Call a named database remote procedure (RPC).
   * Used for server-side business logic like phone-number user mapping.
   */
  callRpc(fnName: string, params: Record<string, unknown>): Promise<void>;

  /** Sign out the current user. */
  signOut(): Promise<void>;
}
