import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Quiz App",
  description: "A fun quiz application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-gray-800 p-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link href="/" className="text-white text-xl font-bold">
              Quiz App
            </Link>
            <div>
              <Link href="/login" className="text-white mr-4 hover:text-gray-300">
                Login
              </Link>
              <Link href="/signup" className="text-white hover:text-gray-300">
                Sign Up
              </Link>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}