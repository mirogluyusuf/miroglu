import Link from 'next/link';
import { PageShell } from '@/components/layout/page-shell';

export default function SuccessPage() {
  return (
    <PageShell>
      <div className="mx-auto max-w-xl card p-8 text-center">
        <h1 className="text-2xl font-bold text-green-700">Siparişiniz Alındı 🎉</h1>
        <p className="mt-2">Siparişiniz başarıyla oluşturuldu. Durumu hesabınızdan takip edebilirsiniz.</p>
        <Link href="/hesabim/siparisler" className="mt-4 inline-block rounded bg-sky-600 px-4 py-2 text-white">Siparişlerime Git</Link>
      </div>
    </PageShell>
  );
}
