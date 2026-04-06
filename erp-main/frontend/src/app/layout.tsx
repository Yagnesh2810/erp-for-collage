"use client";

import React from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from 'next-themes';
import { AuthProvider } from '@/contexts/AuthContext';
import { RealTimeProvider } from '@/context/RealTimeContext';
import { Toaster } from '@/components/ui/toaster';
import { ThemeEnforcer } from '@/components/theme-enforcer';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <title>ERP - Enterprise Resource Planning System</title>
        <meta name="description" content="Comprehensive ERP system for managing employees, projects, inventory, customers, and suppliers with real-time updates." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.className} bg-background text-foreground`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
          storageKey="theme"
        >
          <ThemeEnforcer />
          <AuthProvider>
            <RealTimeProvider>
              <div suppressHydrationWarning>
                {children}
              </div>
              <Toaster />
            </RealTimeProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}