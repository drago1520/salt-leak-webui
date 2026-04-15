import type { Metadata } from 'next';
import { Geist, Geist_Mono, DM_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeToggle } from '@/components/theme-toggle';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const siteName = 'Copenhagen Atomics';
const siteTitle = 'Powered by Thorium';
const siteDescription = 'Clean, cheap, safe and abundant energy using thorium. Enough for everyone and forever';

export const metadata: Metadata = {
  metadataBase: process.env.BETTER_AUTH_URL,
  applicationName: siteName,
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: ['Copenhagen Atomics', 'thorium', 'clean energy', 'nuclear energy'],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: 'technology',
  alternates: {
    canonical: process.env.BETTER_AUTH_URL,
  },
  openGraph: {
    type: 'website',
    url: process.env.BETTER_AUTH_URL,
    siteName,
    title: siteTitle,
    description: siteDescription,
    locale: 'en_US',
    images: [
      {
        url: '/banner.jpg',
        width: 1200,
        height: 630,
        alt: `${siteName} logo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: ['/banner.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={cn('h-full', 'antialiased', geistSans.variable, geistMono.variable, 'font-sans', dmSans.variable)}
    >
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <body className="flex min-h-full flex-col">
          <TooltipProvider>{children}</TooltipProvider>
          {process.env.NODE_ENV == 'development' && <ThemeToggle />}
        </body>
      </ThemeProvider>
    </html>
  );
}
