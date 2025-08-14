import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/chakra-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { HeaderWrapper } from "@/components/HeaderWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TTI Survey Platform",
  description: "Text-to-Survey Platform - Create surveys from text files",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <AuthProvider>
          <Providers>
            <HeaderWrapper />
            {children}
          </Providers>
        </AuthProvider>
      </body>
    </html>
  );
}
