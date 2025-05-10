import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "Josho - Your Personal Development Space",
  description: "個人開発者のためのスペース",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased min-h-screen pt-16 bg-gray-50`}>
        <Navbar />
        <main className="w-full bg-white">
          <div className="max-w-[1200px] mx-auto px-4">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
