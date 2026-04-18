import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSessionCookie, hashPassword } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const parsed = registerSchema.parse({
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password')
    });

    const exists = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (exists) return NextResponse.redirect(new URL('/kayit?error=email', req.url));

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        passwordHash: await hashPassword(parsed.password)
      }
    });

    await createSessionCookie({ userId: user.id, role: user.role, email: user.email });
    return NextResponse.redirect(new URL('/', req.url));
  } catch {
    return NextResponse.redirect(new URL('/kayit?error=validation', req.url));
  }
}
