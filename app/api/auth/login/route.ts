import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionCookie, verifyPassword } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const parsed = loginSchema.parse({ email: form.get('email'), password: form.get('password') });

    const user = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (!user) return NextResponse.redirect(new URL('/giris?error=notfound', req.url));

    const match = await verifyPassword(parsed.password, user.passwordHash);
    if (!match) return NextResponse.redirect(new URL('/giris?error=pass', req.url));

    await createSessionCookie({ userId: user.id, role: user.role, email: user.email });
    return NextResponse.redirect(new URL(user.role === 'ADMIN' ? '/admin' : '/', req.url));
  } catch {
    return NextResponse.redirect(new URL('/giris?error=validation', req.url));
  }
}
