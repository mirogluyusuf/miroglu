import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { formatTry } from '@/lib/utils';

export default async function AdminDashboard() {
  await requireAdmin();
  const [products, orders, users, lowStock, recent] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({ include: { items: true }, take: 5, orderBy: { createdAt: 'desc' } }),
    prisma.user.count(),
    prisma.product.findMany({ where: { stock: { lte: 10 } }, take: 5 }),
    prisma.order.aggregate({ _sum: { total: true } })
  ]);

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold">Admin Paneli</h1>
      <div className="mb-6 grid gap-3 md:grid-cols-4">
        <div className="card p-4"><p>Ürün</p><p className="text-2xl font-bold">{products}</p></div>
        <div className="card p-4"><p>Sipariş</p><p className="text-2xl font-bold">{orders.length}</p></div>
        <div className="card p-4"><p>Kullanıcı</p><p className="text-2xl font-bold">{users}</p></div>
        <div className="card p-4"><p>Ciro</p><p className="text-2xl font-bold">{formatTry(recent._sum.total || 0)}</p></div>
      </div>

      <div className="mb-5 flex gap-2 text-sm">
        <Link href="/admin/products" className="rounded border px-3 py-1">Ürün Yönetimi</Link>
        <Link href="/admin/categories" className="rounded border px-3 py-1">Kategori Yönetimi</Link>
        <Link href="/admin/orders" className="rounded border px-3 py-1">Sipariş Yönetimi</Link>
        <Link href="/admin/users" className="rounded border px-3 py-1">Kullanıcılar</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="mb-2 font-semibold">Son Siparişler</h2>
          <ul className="space-y-2 text-sm">
            {orders.map((o) => <li key={o.id}>{o.orderNo} - {formatTry(o.total)}</li>)}
          </ul>
        </div>
        <div className="card p-4">
          <h2 className="mb-2 font-semibold">Düşük Stok</h2>
          <ul className="space-y-2 text-sm">
            {lowStock.map((p) => <li key={p.id}>{p.name} ({p.stock})</li>)}
          </ul>
        </div>
      </div>
    </PageShell>
  );
}
