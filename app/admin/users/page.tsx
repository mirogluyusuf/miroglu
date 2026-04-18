import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/layout/page-shell';

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({ include: { _count: { select: { orders: true } } }, orderBy: { createdAt: 'desc' } });

  return (
    <PageShell>
      <h1 className="mb-4 text-2xl font-bold">Kullanıcılar</h1>
      <div className="card overflow-x-auto p-3">
        <table className="w-full text-sm">
          <thead><tr><th className="text-left">Ad</th><th className="text-left">E-posta</th><th className="text-left">Rol</th><th className="text-left">Sipariş</th></tr></thead>
          <tbody>{users.map((u) => <tr key={u.id} className="border-t"><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td><td>{u._count.orders}</td></tr>)}</tbody>
        </table>
      </div>
    </PageShell>
  );
}
