import type { Metadata } from "next";
import "./globals.css";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { FriendProvider } from "@/context/FriendContext";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

import { GroupProvider } from "@/context/GroupContext";


/*
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
*/

export const metadata: Metadata = {
  title: "HISAABWISE",
  description: "Track Expense, Analyze Easily.",
  manifest: "/manifest.json",
  icons: {
    icon: '/logo.svg',
    shortcut: '/logo.svg',
    apple: '/icon-192.png', // iOS requires PNG
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HisaabWise",
  },
};

export const viewport = {
  themeColor: "#09090b",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>


            <FriendProvider>
              <GroupProvider>
                <ExpenseProvider>
                  {children}
                </ExpenseProvider>
              </GroupProvider>
            </FriendProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
