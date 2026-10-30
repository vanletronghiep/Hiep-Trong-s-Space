import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hiep Trong Space',
  description: 'Personal life management workspace',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
