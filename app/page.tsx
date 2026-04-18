import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { ProductCard } from '@/components/product-card';

export default async function HomePage() {
  const [featured, categories, banner] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true, isFeatured: true }, include: { category: true }, take: 8, orderBy: { createdAt: 'desc' } }),
    prisma.category.findMany({ where: { isActive: true }, take: 5 }),
    prisma.banner.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } })
  ]);

  return (
    <PageShell>
      <section className="card mb-6 bg-sky-600 p-6 text-white">
        <h1 className="text-2xl font-bold">Miroğlu Online Market</h1>
        <p className="mt-2 text-sm">Taze ürünler, hızlı teslimat, güvenli alışveriş.</p>
        {banner && <p className="mt-3 rounded bg-white/20 p-2 text-sm">{banner.title} - {banner.subtitle}</p>}
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Kategoriler</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {categories.map((c) => (
            <Link key={c.id} href={`/urunler?kategori=${c.slug}`} className="card p-4 text-center font-medium hover:border-sky-400">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Öne Çıkan Ürünler</h2>
          <Link href="/urunler" className="text-sm text-sky-700">Tümünü Gör</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </PageShell>
  );
}
