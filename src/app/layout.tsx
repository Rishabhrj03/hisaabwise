import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/context/AuthContext';
import { FriendProvider } from '@/context/FriendContext';
import { GroupProvider } from '@/context/GroupContext';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { PhoneNumberPrompt } from '@/components/PhoneNumberPrompt';

export const metadata: Metadata = {
  title: 'Expense Tracker',
  description: 'A premium expense tracking application',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {/* SessionProvider enables useSession() throughout the app */}
        <SessionProvider>
          <AuthProvider>
            <PhoneNumberPrompt />
            <FriendProvider>
              <GroupProvider>
                <ExpenseProvider>
                  {children}
                </ExpenseProvider>
              </GroupProvider>
            </FriendProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
