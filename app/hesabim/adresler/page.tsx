import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';

export default async function AddressesPage() {
  const user = await requireAuth();
  const addresses = await prisma.address.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold">Adreslerim</h1>
      <form action="/api/addresses" method="post" className="card mb-4 grid gap-2 p-4 md:grid-cols-2">
        <input name="title" placeholder="Adres Başlığı" className="rounded border p-2" required />
        <input name="fullName" placeholder="Ad Soyad" className="rounded border p-2" required />
        <input name="phone" placeholder="Telefon" className="rounded border p-2" required />
        <input name="city" placeholder="İl" className="rounded border p-2" required />
        <input name="district" placeholder="İlçe" className="rounded border p-2" required />
        <input name="postalCode" placeholder="Posta Kodu" className="rounded border p-2" required />
        <input name="line1" placeholder="Açık Adres" className="rounded border p-2 md:col-span-2" required />
        <button className="rounded bg-sky-600 px-4 py-2 text-white md:col-span-2">Adres Ekle</button>
      </form>

      <div className="space-y-3">
        {addresses.map((a) => (
          <div key={a.id} className="card p-4">
            <p className="font-medium">{a.title}</p>
            <p className="text-sm">{a.fullName} - {a.phone}</p>
            <p className="text-sm text-slate-600">{a.line1}, {a.district}/{a.city}</p>
            <form action="/api/addresses" method="post" className="mt-2">
              <input type="hidden" name="id" value={a.id} />
              <input type="hidden" name="action" value="delete" />
              <button className="rounded border px-3 py-1 text-sm text-red-600">Sil</button>
            </form>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
