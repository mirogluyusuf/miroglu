import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const form = await req.formData();
    const productId = String(form.get('productId'));
    const action = String(form.get('action') || 'add');

    if (action === 'remove') {
      await prisma.favorite.deleteMany({ where: { userId: user.id, productId } });
    } else {
      await prisma.favorite.upsert({
        where: { userId_productId: { userId: user.id, productId } },
        create: { userId: user.id, productId },
        update: {}
      });
    }

    return NextResponse.redirect(new URL('/favoriler', req.url));
  } catch {
    return NextResponse.redirect(new URL('/giris', req.url));
  }
}
