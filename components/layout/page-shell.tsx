import { ReactNode } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export async function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="container-page py-6">{children}</main>
      <Footer />
    </>
  );
}
