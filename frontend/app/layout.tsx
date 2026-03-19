import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'TradeGrid Africa - B2B Trade Platform',
  description: 'Connect manufacturers and distributors across Africa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
