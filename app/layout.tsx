import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase"
import Navbar from "./components/Navbar";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "オルキャリ",
  description: "東海地方に特化した新卒就活サービス",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;

  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      user = session.user;
    }
  } catch (error) {
    console.error('RootLayout - Error getting session:', error);
  }

  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased min-h-screen pt-16 bg-gray-50`}>
        <Navbar user={user}/>
        <main className="w-full bg-white">
          <div className="max-w-[1200px] mx-auto px-4">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
