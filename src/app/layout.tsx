import type { Metadata } from "next";
import "./globals.css";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { FriendProvider } from "@/context/FriendContext";
import { AuthProvider } from "@/context/AuthContext";
import { DataMigration } from "@/components/DataMigration";

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
  title: "Expense Tracker",
  description: "A premium expense tracking application",
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
          <DataMigration />
          <FriendProvider>
            <ExpenseProvider>
              {children}
            </ExpenseProvider>
          </FriendProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
