import Image from 'next/image';
import Link from 'next/link';
import { formatTry } from '@/lib/utils';

export function ProductCard({ product }: { product: any }) {
  const current = product.discountPrice ?? product.price;
  return (
    <article className="card overflow-hidden">
      <Link href={`/urunler/${product.slug}`}>
        <Image src={product.imageUrl} alt={product.name} width={800} height={600} className="h-40 w-full object-cover" />
      </Link>
      <div className="space-y-2 p-3">
        <Link href={`/urunler/${product.slug}`} className="line-clamp-1 font-semibold">{product.name}</Link>
        <p className="text-xs text-slate-500">{product.category.name}</p>
        <div className="flex items-center gap-2">
          <span className="font-bold text-sky-700">{formatTry(current)}</span>
          {product.discountPrice && <span className="text-xs line-through text-slate-400">{formatTry(product.price)}</span>}
        </div>
      </div>
    </article>
  );
}
