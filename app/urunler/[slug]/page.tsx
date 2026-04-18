import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { formatTry } from '@/lib/utils';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findFirst({ where: { slug: params.slug, isActive: true }, include: { category: true } });
  if (!product) return notFound();

  const similar = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    include: { category: true },
    take: 4
  });

  return (
    <PageShell>
      <div className="grid gap-6 md:grid-cols-2">
        <Image src={product.imageUrl} alt={product.name} width={800} height={600} className="w-full rounded-xl border bg-white" />
        <div className="space-y-4">
          <p className="text-sm text-slate-500">{product.category.name}</p>
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p>{product.description}</p>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-sky-700">{formatTry(product.discountPrice ?? product.price)}</span>
            {product.discountPrice && <span className="text-slate-400 line-through">{formatTry(product.price)}</span>}
          </div>
          <p className="text-sm">Stok: {product.stock > 0 ? `${product.stock} adet` : 'Tükendi'}</p>
          <div className="flex gap-2">
            <form action="/api/cart" method="post">
              <input type="hidden" name="productId" value={product.id} />
              <button className="rounded-lg bg-sky-600 px-4 py-2 text-white" disabled={product.stock <= 0}>Sepete Ekle</button>
            </form>
            <form action="/api/favorites" method="post">
              <input type="hidden" name="productId" value={product.id} />
              <button className="rounded-lg border px-4 py-2">Favorilere Ekle</button>
            </form>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="mb-3 text-lg font-semibold">Benzer Ürünler</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {similar.map((item) => (
            <a href={`/urunler/${item.slug}`} key={item.id} className="card p-3">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-slate-500">{formatTry(item.discountPrice ?? item.price)}</p>
            </a>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
