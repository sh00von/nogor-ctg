import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Chittagong Bus - Official Route Tracker',
  description: 'Official bus route tracker for Chittagong. Information and journey planning for all BRTA approved bus routes.',
  keywords: 'Chittagong, Bus, Route, Tracker, BRTA, Official, Journey Planner',
  authors: [{ name: 'Chittagong Bus Tracker' }],
  creator: 'Chittagong Bus Tracker',
  publisher: 'Chittagong Bus Tracker',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://chittagong-bus-tracker.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Chittagong Bus - Official Route Tracker',
    description: 'Official bus route tracker for Chittagong. Information and journey planning for all BRTA approved bus routes.',
    url: 'https://chittagong-bus-tracker.vercel.app',
    siteName: 'Chittagong Bus Tracker',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'Chittagong Bus Tracker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chittagong Bus - Official Route Tracker',
    description: 'Official bus route tracker for Chittagong. Information and journey planning for all BRTA approved bus routes.',
    images: ['/web-app-manifest-512x512.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Chittagong Bus',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('chittagong-bus-theme');
                  var html = document.documentElement;
                  
                  // Always set a default theme to prevent flash
                  if (!theme) {
                    theme = 'light';
                    localStorage.setItem('chittagong-bus-theme', theme);
                  }
                  
                  if (theme === 'dark') {
                    html.classList.add('dark');
                    html.style.colorScheme = 'dark';
                    html.style.backgroundColor = '#0a0a0a';
                  } else {
                    html.classList.remove('dark');
                    html.style.colorScheme = 'light';
                    html.style.backgroundColor = '#ffffff';
                  }
                } catch (e) {
                  // Fallback to light theme if localStorage fails
                  document.documentElement.classList.remove('dark');
                  document.documentElement.style.colorScheme = 'light';
                  document.documentElement.style.backgroundColor = '#ffffff';
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
