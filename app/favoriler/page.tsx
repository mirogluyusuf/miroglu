import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { formatTry } from '@/lib/utils';

export default async function FavoritesPage() {
  const user = await requireAuth();
  const favorites = await prisma.favorite.findMany({ where: { userId: user.id }, include: { product: true } });

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold">Favorilerim</h1>
      {favorites.length === 0 ? <div className="card p-8 text-center">Favori ürününüz yok.</div> : (
        <div className="grid gap-4 md:grid-cols-3">
          {favorites.map((f) => (
            <div key={f.id} className="card p-4">
              <a href={`/urunler/${f.product.slug}`} className="font-medium">{f.product.name}</a>
              <p className="text-sm text-slate-500">{formatTry(f.product.discountPrice ?? f.product.price)}</p>
              <form action="/api/favorites" method="post" className="mt-2">
                <input type="hidden" name="productId" value={f.productId} />
                <input type="hidden" name="action" value="remove" />
                <button className="rounded border px-3 py-1 text-sm">Favoriden Çıkar</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
