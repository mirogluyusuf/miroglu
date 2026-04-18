import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, requireAuth, verifyPassword } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    const form = await req.formData();
    const currentPassword = String(form.get('currentPassword') || '');
    const newPassword = String(form.get('newPassword') || '');

    if (newPassword.length < 8) return NextResponse.redirect(new URL('/hesabim?error=weak', req.url));

    const dbUser = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!valid) return NextResponse.redirect(new URL('/hesabim?error=current', req.url));

    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } });
    return NextResponse.redirect(new URL('/hesabim?ok=1', req.url));
  } catch {
    return NextResponse.redirect(new URL('/giris', req.url));
  }
}
