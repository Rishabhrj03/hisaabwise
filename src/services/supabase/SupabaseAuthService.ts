import { SupabaseClient, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { IAuthService } from '@/services/interfaces/IAuthService';

/**
 * SupabaseAuthService — Supabase adapter for IAuthService.
 *
 * All Supabase Auth SDK calls are isolated here. To switch auth providers,
 * create a new class implementing IAuthService and update src/services/index.ts.
 */
export class SupabaseAuthService implements IAuthService {
  constructor(private readonly client: SupabaseClient) {}

  async getSession(): Promise<Session | null> {
    const { data, error } = await this.client.auth.getSession();
    if (error) {
      console.error('[AuthService] getSession error:', error);
      return null;
    }
    return data.session;
  }

  onAuthStateChange(
    callback: (event: AuthChangeEvent, session: Session | null) => void
  ): () => void {
    const { data: { subscription } } = this.client.auth.onAuthStateChange(callback);
    return () => subscription.unsubscribe();
  }

  async updateUserMetadata(data: Record<string, unknown>): Promise<void> {
    const { error } = await this.client.auth.updateUser({ data });
    if (error) {
      console.warn('[AuthService] updateUserMetadata warning (non-fatal):', error);
    }
  }

  async callRpc(fnName: string, params: Record<string, unknown>): Promise<void> {
    const { error } = await this.client.rpc(fnName, params);
    if (error) {
      throw new Error(`[AuthService] RPC '${fnName}' failed: ${error.message}`);
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.client.auth.signOut();
    if (error) {
      console.error('[AuthService] signOut error:', error);
    }
  }
}
