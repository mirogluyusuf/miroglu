import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { ProductCard } from '@/components/product-card';

export default async function ProductsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const page = Number(searchParams.page || '1');
  const take = 12;
  const skip = (page - 1) * take;

  const where: any = { isActive: true };
  if (searchParams.q) where.name = { contains: searchParams.q };
  if (searchParams.kategori) where.category = { slug: searchParams.kategori, isActive: true };
  if (searchParams.stokta === '1') where.stock = { gt: 0 };
  if (searchParams.min || searchParams.max) {
    where.price = {};
    if (searchParams.min) where.price.gte = Number(searchParams.min) * 100;
    if (searchParams.max) where.price.lte = Number(searchParams.max) * 100;
  }

  const orderBy: any =
    searchParams.sirala === 'fiyat_artan'
      ? { price: 'asc' }
      : searchParams.sirala === 'fiyat_azalan'
        ? { price: 'desc' }
        : searchParams.sirala === 'populer'
          ? { popularity: 'desc' }
          : { createdAt: 'desc' };

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, orderBy, skip, take }),
    prisma.product.count({ where }),
    prisma.category.findMany({ where: { isActive: true } })
  ]);

  const hasMore = page * take < total;

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold">Ürünler</h1>
      <form className="card mb-6 grid gap-3 p-4 md:grid-cols-6">
        <input name="q" placeholder="Ürün ara" defaultValue={searchParams.q} className="rounded border p-2" />
        <select name="kategori" defaultValue={searchParams.kategori} className="rounded border p-2">
          <option value="">Tüm kategoriler</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <input name="min" placeholder="Min TL" defaultValue={searchParams.min} className="rounded border p-2" />
        <input name="max" placeholder="Max TL" defaultValue={searchParams.max} className="rounded border p-2" />
        <select name="sirala" defaultValue={searchParams.sirala} className="rounded border p-2">
          <option value="yeni">Yeni eklenen</option>
          <option value="fiyat_artan">Fiyat artan</option>
          <option value="fiyat_azalan">Fiyat azalan</option>
          <option value="populer">Popüler</option>
        </select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="stokta" value="1" defaultChecked={searchParams.stokta === '1'} /> Sadece stokta</label>
        <button className="rounded bg-sky-600 px-4 py-2 text-white">Filtrele</button>
      </form>

      {products.length === 0 ? (
        <div className="card p-8 text-center">Aradığınız kriterlerde ürün bulunamadı.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}

      <div className="mt-6 flex justify-center gap-2">
        {page > 1 && <a className="rounded border px-4 py-2" href={`?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}>Önceki</a>}
        {hasMore && <a className="rounded border px-4 py-2" href={`?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}>Daha Fazla</a>}
      </div>
    </PageShell>
  );
}
