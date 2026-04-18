import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { slugify } from '@/lib/utils';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const form = await req.formData();
    const action = String(form.get('action') || 'create');

    if (action === 'delete') {
      const id = String(form.get('id'));
      const count = await prisma.product.count({ where: { categoryId: id } });
      if (count === 0) await prisma.category.delete({ where: { id } });
      return NextResponse.redirect(new URL('/admin/categories', req.url));
    }

    const name = String(form.get('name') || '');
    const description = String(form.get('description') || '');
    await prisma.category.create({ data: { name, slug: `${slugify(name)}-${Date.now().toString().slice(-4)}`, description } });

    return NextResponse.redirect(new URL('/admin/categories', req.url));
  } catch {
    return NextResponse.redirect(new URL('/admin/categories?error=1', req.url));
  }
}
