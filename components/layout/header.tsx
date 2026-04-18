import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b bg-white">
      <div className="container-page flex items-center justify-between py-4">
        <Link href="/" className="text-xl font-bold text-sky-700">Miroğlu Market</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/urunler">Ürünler</Link>
          {user && <Link href="/favoriler">Favoriler</Link>}
          {user && <Link href="/sepet">Sepet</Link>}
          {user && <Link href="/hesabim/siparisler">Hesabım</Link>}
          {user?.role === 'ADMIN' && <Link href="/admin">Admin</Link>}
          {!user ? (
            <>
              <Link href="/giris">Giriş</Link>
              <Link href="/kayit">Kayıt Ol</Link>
            </>
          ) : (
            <form action="/api/auth/logout" method="post">
              <button className="rounded-lg border px-3 py-1">Çıkış</button>
            </form>
          )}
        </nav>
      </div>
    </header>
  );
}
