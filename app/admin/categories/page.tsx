import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';

export default async function AdminCategoriesPage() {
  await requireAdmin();
  const categories = await prisma.category.findMany({ include: { _count: { select: { products: true } } } });

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold">Kategori Yönetimi</h1>
      <form action="/api/admin/categories" method="post" className="card mb-4 grid gap-2 p-4 md:grid-cols-2">
        <input name="name" placeholder="Kategori adı" className="rounded border p-2" required />
        <input name="description" placeholder="Açıklama" className="rounded border p-2" />
        <button className="rounded bg-sky-600 px-4 py-2 text-white md:col-span-2">Kategori Ekle</button>
      </form>
      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="card flex items-center justify-between p-3">
            <div>{c.name} ({c._count.products} ürün)</div>
            <form action="/api/admin/categories" method="post">
              <input type="hidden" name="id" value={c.id} />
              <button name="action" value="delete" className="rounded border px-3 py-1 text-red-600">Sil</button>
            </form>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
