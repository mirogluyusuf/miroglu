import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Miroğlu Market',
  description: 'Online market uygulaması'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
