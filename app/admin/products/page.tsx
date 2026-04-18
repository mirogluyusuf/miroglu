import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { formatTry } from '@/lib/utils';

export default async function AdminProductsPage() {
  await requireAdmin();
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } }),
    prisma.category.findMany({ where: { isActive: true } })
  ]);

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold">Ürün Yönetimi</h1>
      <form action="/api/admin/products" method="post" className="card mb-6 grid gap-2 p-4 md:grid-cols-3">
        <input name="name" placeholder="Ürün adı" className="rounded border p-2" required />
        <select name="categoryId" className="rounded border p-2" required>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input name="imageUrl" defaultValue="/images/product.svg" className="rounded border p-2" required />
        <input name="price" type="number" placeholder="Fiyat (kuruş)" className="rounded border p-2" required />
        <input name="discountPrice" type="number" placeholder="İndirimli fiyat" className="rounded border p-2" />
        <input name="stock" type="number" placeholder="Stok" className="rounded border p-2" required />
        <textarea name="description" placeholder="Açıklama" className="rounded border p-2 md:col-span-3" required />
        <button className="rounded bg-sky-600 px-4 py-2 text-white md:col-span-3">Ürün Ekle</button>
      </form>

      <div className="overflow-x-auto card p-3">
        <table className="w-full text-sm">
          <thead><tr className="text-left"><th>Ad</th><th>Kategori</th><th>Fiyat</th><th>Stok</th><th>Durum</th><th>İşlem</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t">
                <td>{p.name}</td><td>{p.category.name}</td><td>{formatTry(p.discountPrice ?? p.price)}</td><td>{p.stock}</td><td>{p.isActive ? 'Aktif' : 'Pasif'}</td>
                <td>
                  <form action="/api/admin/products" method="post" className="inline-flex gap-1">
                    <input type="hidden" name="id" value={p.id} />
                    <button name="action" value="toggle" className="rounded border px-2">Aktif/Pasif</button>
                    <button name="action" value="delete" className="rounded border px-2 text-red-600">Sil</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}
