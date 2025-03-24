import type { Metadata } from "next";
import {Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/Header";
const inter = Inter({
  subsets : ["latin"]
})

export const metadata: Metadata = {
  title: "Omeenee cars",
  description: "Get Your Dream Car",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>

    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        <main className="min-h-screen ">
        <Header/>

        {children}
        </main>
        <footer className="bg-blue-50 py-12">
          <div className="container mx-auto px-4 text-center text-gray-600">
            <p>Copyright of Omeenee</p>
          </div>
        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
