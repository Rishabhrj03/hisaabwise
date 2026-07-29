/**
 * IAuthService — Adapter interface for supplemental auth operations.
 *
 * NOTE: Session management (getSession, onAuthStateChange) is now handled
 * natively by NextAuth.js hooks (useSession). This interface covers only
 * the operations NextAuth doesn't provide out of the box.
 *
 * To switch providers: implement this interface and update src/services/index.ts.
 */
export interface IAuthService {
  /**
   * Update the authenticated user's profile metadata (e.g. phone number).
   * Best-effort — implementations should not throw on non-critical failures.
   */
  updateUserMetadata(userId: string, data: Record<string, unknown>): Promise<void>;

  /**
   * Execute a named server-side action or stored procedure.
   * Used for business logic like linking a phone number to pending invitations.
   */
  callServerAction(actionName: string, params: Record<string, unknown>): Promise<void>;
}

