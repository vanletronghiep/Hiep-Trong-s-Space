import type { Metadata } from 'next';
import { cormorantGaramond, inter } from '@/design/fonts';
import { AppProviders } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Hiep Trong Space',
    template: '%s — Hiep Trong Space',
  },
  description: 'A personal universe for daily tasks, learning, projects, and ambitions.',
  icons: {
    icon: '/icon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${inter.variable}`}>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
