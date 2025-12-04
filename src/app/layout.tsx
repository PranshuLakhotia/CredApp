'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from '@/hooks/useAuth';
import { AccessibilityProvider } from '@/contexts/AccessibilityContext';
import { AccessibilityWidget } from '@/components/accessibility/AccessibilityWidget';
import { theme } from '@/lib/theme';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Web3Provider from '@/components/providers/Web3Provider';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Credify - Digital Credential Platform</title>
        <meta name="description" content="Securely manage and verify your digital credentials with Credify" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Web3Provider>
              <AccessibilityProvider>
                <AuthProvider>
                  {children}
                </AuthProvider>
                <AccessibilityWidget />
              </AccessibilityProvider>
            </Web3Provider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
