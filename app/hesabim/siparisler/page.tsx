import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';
import { formatTry } from '@/lib/utils';
import { orderStatusMap } from '@/lib/market';

export default async function MyOrdersPage() {
  const user = await requireAuth();
  const orders = await prisma.order.findMany({ where: { userId: user.id }, include: { items: true }, orderBy: { createdAt: 'desc' } });

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold">Siparişlerim</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{o.orderNo}</p>
              <span className="text-sm">{orderStatusMap[o.status]}</span>
            </div>
            <p className="text-sm text-slate-500">{new Date(o.createdAt).toLocaleString('tr-TR')}</p>
            <p className="mt-2">Toplam: {formatTry(o.total)}</p>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {o.items.map((i) => <li key={i.id}>{i.name} x {i.quantity}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
