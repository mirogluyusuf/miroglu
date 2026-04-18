import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { formatTry } from '@/lib/utils';

export default async function CartPage() {
  const user = await requireAuth();
  const items = await prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } });

  const subtotal = items.reduce((sum, item) => sum + (item.product.discountPrice ?? item.product.price) * item.quantity, 0);
  const discount = subtotal > 150000 ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold">Sepetim</h1>
      {items.length === 0 ? (
        <div className="card p-8 text-center">
          Sepetiniz boş. <Link href="/urunler" className="text-sky-600">Alışverişe başla</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {items.map((item) => (
              <div key={item.id} className="card flex items-center justify-between p-3">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-slate-500">{formatTry(item.product.discountPrice ?? item.product.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <form action="/api/cart" method="post">
                    <input type="hidden" name="productId" value={item.productId} />
                    <input type="hidden" name="action" value="decrease" />
                    <button className="rounded border px-2">-</button>
                  </form>
                  <span>{item.quantity}</span>
                  <form action="/api/cart" method="post">
                    <input type="hidden" name="productId" value={item.productId} />
                    <input type="hidden" name="action" value="increase" />
                    <button className="rounded border px-2">+</button>
                  </form>
                  <form action="/api/cart" method="post">
                    <input type="hidden" name="productId" value={item.productId} />
                    <input type="hidden" name="action" value="remove" />
                    <button className="rounded border px-2 text-red-600">Sil</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
          <div className="card h-fit p-4">
            <p>Ara Toplam: {formatTry(subtotal)}</p>
            <p>İndirim: -{formatTry(discount)}</p>
            <p className="mt-2 text-lg font-bold">Genel Toplam: {formatTry(total)}</p>
            <form action="/api/checkout" method="post" className="mt-4 space-y-2">
              <select name="paymentMethod" className="w-full rounded border p-2">
                <option value="KAPIDA_ODEME">Kapıda Ödeme</option>
                <option value="TEST_KART">Test Kart</option>
              </select>
              <button className="w-full rounded bg-sky-600 py-2 text-white">Siparişi Tamamla</button>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
