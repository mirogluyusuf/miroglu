import { PageShell } from '@/components/layout/page-shell';

export default function RegisterPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-md card p-6">
        <h1 className="mb-4 text-xl font-bold">Kayıt Ol</h1>
        <form action="/api/auth/register" method="post" className="space-y-3">
          <input name="name" required placeholder="Ad Soyad" className="w-full rounded border p-2" />
          <input name="email" type="email" required placeholder="E-posta" className="w-full rounded border p-2" />
          <input name="password" type="password" required placeholder="Şifre" className="w-full rounded border p-2" />
          <button className="w-full rounded bg-sky-600 py-2 text-white">Hesap Oluştur</button>
        </form>
      </div>
    </PageShell>
  );
}
