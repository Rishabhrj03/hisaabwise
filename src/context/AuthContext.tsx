'use client';

import { createContext, useContext } from 'react';
import { useSession, signOut } from 'next-auth/react';

/**
 * AuthContext — Thin wrapper around NextAuth's useSession.
 *
 * Exposes the same { user, loading } interface that all contexts and components
 * already depend on, so zero changes are needed downstream.
 *
 * user.id → the MongoDB user document _id (a UUID string)
 */

type AuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
};

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();

  const user: AuthUser | null = session?.user
    ? {
        id: (session.user as AuthUser).id,
        email: session.user.email,
        name: session.user.name,
      }
    : null;

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: status === 'loading',
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

