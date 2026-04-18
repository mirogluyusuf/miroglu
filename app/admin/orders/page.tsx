import { OrderStatus } from '@prisma/client';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { formatTry } from '@/lib/utils';
import { orderStatusMap } from '@/lib/market';

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await prisma.order.findMany({ include: { user: true, items: true }, orderBy: { createdAt: 'desc' } });

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold">Sipariş Yönetimi</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{o.orderNo} - {o.user.name}</p>
              <span>{orderStatusMap[o.status]}</span>
            </div>
            <p className="text-sm">Toplam: {formatTry(o.total)}</p>
            <form action="/api/admin/orders" method="post" className="mt-2 flex gap-2">
              <input type="hidden" name="id" value={o.id} />
              <select name="status" defaultValue={o.status} className="rounded border p-1">
                {Object.values(OrderStatus).map((s) => <option key={s} value={s}>{orderStatusMap[s]}</option>)}
              </select>
              <input name="note" defaultValue={o.note ?? ''} className="rounded border p-1" placeholder="Not" />
              <button className="rounded bg-sky-600 px-3 py-1 text-white">Güncelle</button>
              <button name="action" value="cancel" className="rounded border px-3 py-1 text-red-600">İptal Et</button>
            </form>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
