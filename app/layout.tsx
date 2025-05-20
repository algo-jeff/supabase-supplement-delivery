import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Supplement Delivery Tracker',
  description: 'A simple app to track supplement deliveries using Supabase',
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