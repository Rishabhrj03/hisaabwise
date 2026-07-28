import type { Metadata } from 'next';
import './globals.css';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { FriendProvider } from '@/context/FriendContext';
import { AuthProvider } from '@/context/AuthContext';
import { DataMigration } from '@/components/DataMigration';
import { GroupProvider } from '@/context/GroupContext';
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
        <AuthProvider>
          <PhoneNumberPrompt />
          <DataMigration />
          <FriendProvider>
            <GroupProvider>
              <ExpenseProvider>
                {children}
              </ExpenseProvider>
            </GroupProvider>
          </FriendProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
