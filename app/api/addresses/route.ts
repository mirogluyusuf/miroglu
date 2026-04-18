import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { addressSchema } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const form = await req.formData();
    const action = String(form.get('action') || 'create');

    if (action === 'delete') {
      const id = String(form.get('id'));
      await prisma.address.deleteMany({ where: { id, userId: user.id } });
      return NextResponse.redirect(new URL('/hesabim/adresler', req.url));
    }

    const parsed = addressSchema.parse({
      title: form.get('title'),
      fullName: form.get('fullName'),
      phone: form.get('phone'),
      city: form.get('city'),
      district: form.get('district'),
      line1: form.get('line1'),
      postalCode: form.get('postalCode')
    });

    await prisma.address.create({ data: { ...parsed, userId: user.id } });
    return NextResponse.redirect(new URL('/hesabim/adresler', req.url));
  } catch {
    return NextResponse.redirect(new URL('/hesabim/adresler?error=1', req.url));
  }
}
