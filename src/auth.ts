import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongoClient';
import bcrypt from 'bcryptjs';
import { authConfig } from '@/auth.config';
import { getDb, AnyDoc } from '@/lib/db';

/**
 * auth.ts — NextAuth.js v5 full server configuration.
 *
 * Extends auth.config.ts (edge-safe) with the MongoDB adapter and Credentials provider.
 * This file MUST NOT be imported from middleware (not Edge-compatible).
 *
 * To add OAuth providers (Google, GitHub, etc.), add them to the providers array.
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),

  // JWT strategy is required when using CredentialsProvider.
  session: { strategy: 'jwt' },

  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const db = await getDb();
        const user = await db
          .collection<AnyDoc>('users')
          .findOne({ email: (credentials.email as string).toLowerCase() });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        );

        if (!passwordMatch) return null;

        return {
          id: String(user._id),
          email: user.email as string,
          name: (user.name as string) ?? null,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
});

