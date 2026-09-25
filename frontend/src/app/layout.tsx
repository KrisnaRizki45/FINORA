import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Finora — Premium Money Management for Couples',
  description: 'Manage your shared finances securely and beautifully with Finora.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col max-w-[100vw] overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster position="top-right" richColors />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
