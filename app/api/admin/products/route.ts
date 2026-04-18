import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { productSchema } from '@/lib/validators';
import { slugify } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const form = await req.formData();
    const action = String(form.get('action') || 'create');
    const id = String(form.get('id') || '');

    if (action === 'delete' && id) {
      await prisma.product.delete({ where: { id } });
      return NextResponse.redirect(new URL('/admin/products', req.url));
    }

    if (action === 'toggle' && id) {
      const p = await prisma.product.findUniqueOrThrow({ where: { id } });
      await prisma.product.update({ where: { id }, data: { isActive: !p.isActive } });
      return NextResponse.redirect(new URL('/admin/products', req.url));
    }

    const parsed = productSchema.parse({
      name: form.get('name'),
      description: form.get('description'),
      categoryId: form.get('categoryId'),
      price: form.get('price'),
      discountPrice: form.get('discountPrice') || null,
      stock: form.get('stock'),
      imageUrl: form.get('imageUrl'),
      isActive: true,
      isFeatured: false
    });

    await prisma.product.create({
      data: {
        ...parsed,
        slug: `${slugify(parsed.name)}-${Date.now().toString().slice(-4)}`
      }
    });

    return NextResponse.redirect(new URL('/admin/products', req.url));
  } catch {
    return NextResponse.redirect(new URL('/admin/products?error=1', req.url));
  }
}
