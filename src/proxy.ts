import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

/**
 * proxy.ts — Route protection via NextAuth.js (Next.js 16+ convention).
 *
 * Uses auth.config.ts (edge-compatible — no MongoDB adapter) to protect routes.
 * Unauthenticated users are redirected to /login automatically.
 */
export default NextAuth(authConfig).auth;

export const config = {
  // Run proxy on all routes except Next.js internals and static files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
