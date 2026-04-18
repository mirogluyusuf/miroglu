import { NextResponse } from 'next/server';
import { PaymentMethod } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const form = await req.formData();
    const paymentMethod = String(form.get('paymentMethod')) as PaymentMethod;

    const [items, address] = await Promise.all([
      prisma.cartItem.findMany({ where: { userId: user.id }, include: { product: true } }),
      prisma.address.findFirst({ where: { userId: user.id, isDefault: true } })
    ]);

    if (!address || items.length === 0) return NextResponse.redirect(new URL('/sepet?error=adres', req.url));

    for (const item of items) {
      if (item.product.stock < item.quantity) {
        return NextResponse.redirect(new URL('/sepet?error=stok', req.url));
      }
    }

    const subtotal = items.reduce((sum, i) => sum + (i.product.discountPrice ?? i.product.price) * i.quantity, 0);
    const discountTotal = subtotal > 150000 ? Math.round(subtotal * 0.1) : 0;
    const total = subtotal - discountTotal;

    const order = await prisma.order.create({
      data: {
        orderNo: `SIP-${Date.now()}`,
        userId: user.id,
        addressText: `${address.title}: ${address.line1} ${address.district}/${address.city}`,
        paymentMethod,
        subtotal,
        discountTotal,
        total,
        items: {
          create: items.map((i) => {
            const unitPrice = i.product.discountPrice ?? i.product.price;
            return {
              productId: i.productId,
              name: i.product.name,
              unitPrice,
              quantity: i.quantity,
              total: unitPrice * i.quantity
            };
          })
        }
      }
    });

    await prisma.$transaction([
      ...items.map((i) =>
        prisma.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.quantity }, popularity: { increment: 1 } } })
      ),
      prisma.cartItem.deleteMany({ where: { userId: user.id } })
    ]);

    return NextResponse.redirect(new URL(`/siparis-basarili?no=${order.orderNo}`, req.url));
  } catch {
    return NextResponse.redirect(new URL('/sepet?error=checkout', req.url));
  }
}
