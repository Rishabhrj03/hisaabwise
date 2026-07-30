import type { Metadata } from 'next';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/context/AuthContext';
import { FriendProvider } from '@/context/FriendContext';
import { GroupProvider } from '@/context/GroupContext';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { PhoneNumberPrompt } from '@/components/PhoneNumberPrompt';

export const metadata: Metadata = {
  title: 'SpendWise — Smart Finance Tracker',
  description: 'A premium personal finance tracking application. Manage expenses, budgets, savings goals, and investments in one beautiful dashboard.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('spendwise_theme');
                  if (t === 'light' || t === 'dark') {
                    document.documentElement.setAttribute('data-theme', t);
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {/* SessionProvider enables useSession() throughout the app */}
        <SessionProvider>
          <AuthProvider>
            <ThemeProvider>
              <PhoneNumberPrompt />
              <FriendProvider>
                <GroupProvider>
                  <ExpenseProvider>
                    {children}
                  </ExpenseProvider>
                </GroupProvider>
              </FriendProvider>
            </ThemeProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

