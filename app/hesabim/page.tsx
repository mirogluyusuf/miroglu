import { requireAuth } from '@/lib/auth';
import { PageShell } from '@/components/layout/page-shell';

export default async function AccountPage() {
  const user = await requireAuth();
  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold">Hesabım</h1>
      <div className="card p-4">
        <p><strong>Ad Soyad:</strong> {user.name}</p>
        <p><strong>E-posta:</strong> {user.email}</p>
      </div>
      <form action="/api/profile" method="post" className="card mt-4 space-y-3 p-4 max-w-md">
        <h2 className="font-semibold">Şifre Güncelle</h2>
        <input name="currentPassword" type="password" placeholder="Mevcut şifre" className="w-full rounded border p-2" required />
        <input name="newPassword" type="password" placeholder="Yeni şifre" className="w-full rounded border p-2" required />
        <button className="rounded bg-sky-600 px-4 py-2 text-white">Güncelle</button>
      </form>
    </PageShell>
  );
}
