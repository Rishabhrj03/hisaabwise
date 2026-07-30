import type { NextAuthConfig } from 'next-auth';

/**
 * auth.config.ts — Edge-compatible NextAuth configuration (no database adapter).
 *
 * This config is used exclusively by middleware.ts which runs on the Edge runtime.
 * The Edge runtime cannot import MongoDB (Node.js built-ins), so we split the config:
 *   - auth.config.ts → Edge-safe (route protection only, no DB adapter)
 *   - auth.ts → Full server config (Credentials provider + MongoDB adapter)
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = nextUrl.pathname.startsWith('/api/auth');
      const isLoginPage = nextUrl.pathname === '/login';

      if (isAuthRoute || isLoginPage) return true;

      return isLoggedIn;
    },
  },
};
