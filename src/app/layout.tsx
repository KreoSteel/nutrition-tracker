'use client'

import { Inter, Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import Header from '@/components/layout/Header';
import { Toaster } from '@/components/ui/sooner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  })

  // Add to global window for devtools
  if (typeof window !== 'undefined') {
    window.__TANSTACK_QUERY_CLIENT__ = queryClient
  }
  
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <title>NutriTrack - Nutrition Tracker</title>
        <meta name="description" content="Track your recipes, ingredients, and nutrition with NutriTrack" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <div className="mx-auto w-full max-w-[2000px] px-6 pb-20 lg:px-10 flex flex-col items-center justify-center">
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__:
      import("@tanstack/react-query").QueryClient;
  }
}