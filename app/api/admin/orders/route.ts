import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const form = await req.formData();
    const id = String(form.get('id'));
    const action = String(form.get('action') || 'update');

    if (action === 'cancel') {
      await prisma.order.update({ where: { id }, data: { status: OrderStatus.IPTAL_EDILDI } });
      return NextResponse.redirect(new URL('/admin/orders', req.url));
    }

    const status = String(form.get('status')) as OrderStatus;
    const note = String(form.get('note') || '');
    await prisma.order.update({ where: { id }, data: { status, note } });

    return NextResponse.redirect(new URL('/admin/orders', req.url));
  } catch {
    return NextResponse.redirect(new URL('/admin/orders?error=1', req.url));
  }
}
