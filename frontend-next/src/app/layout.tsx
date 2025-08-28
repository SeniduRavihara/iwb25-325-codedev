import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Orbitron } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-jetbrains-mono"
});
const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: "--font-orbitron"
});

export const metadata: Metadata = {
  title: "HackathonPlus - Code Your Future",
  description: "Master algorithmic thinking, compete with top developers, and build the coding career of your dreams.",
  generator: "HackathonPlus",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    apple: '/favicon.svg',
  },
  openGraph: {
    title: "HackathonPlus - Code Your Future",
    description: "Master algorithmic thinking, compete with top developers, and build the coding career of your dreams.",
    type: "website",
    url: "https://hackathonplus.com",
    siteName: "HackathonPlus",
  },
  twitter: {
    card: "summary_large_image",
    title: "HackathonPlus - Code Your Future",
    description: "Master algorithmic thinking, compete with top developers, and build the coding career of your dreams.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.className} ${jetbrainsMono.variable} ${orbitron.variable}`} suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
  --font-jetbrains-mono: ${jetbrainsMono.variable};
  --font-orbitron: ${orbitron.variable};
}
        `}</style>
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <DataProvider>{children}</DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
