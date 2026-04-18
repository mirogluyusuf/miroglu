import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const form = await req.formData();
    const productId = String(form.get('productId') || '');
    const action = String(form.get('action') || 'add');

    const product = await prisma.product.findFirst({ where: { id: productId, isActive: true } });
    if (!product) return NextResponse.redirect(new URL('/urunler?error=urun', req.url));

    const existing = await prisma.cartItem.findUnique({ where: { userId_productId: { userId: user.id, productId } } });

    if (action === 'remove') {
      await prisma.cartItem.deleteMany({ where: { userId: user.id, productId } });
    } else if (existing) {
      const nextQty = action === 'decrease' ? existing.quantity - 1 : existing.quantity + 1;
      if (nextQty <= 0) {
        await prisma.cartItem.delete({ where: { id: existing.id } });
      } else if (nextQty <= product.stock) {
        await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQty } });
      }
    } else {
      await prisma.cartItem.create({ data: { userId: user.id, productId, quantity: 1 } });
    }

    return NextResponse.redirect(new URL('/sepet', req.url));
  } catch {
    return NextResponse.redirect(new URL('/giris', req.url));
  }
}
