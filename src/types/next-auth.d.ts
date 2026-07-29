/**
 * NextAuth type augmentation — extends the default Session and JWT types
 * to include the user's MongoDB document ID.
 *
 * This is required so TypeScript knows session.user.id exists.
 */
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
  }
}
