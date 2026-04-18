import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const products = await prisma.product.findMany({ where: { isActive: true }, include: { category: true }, take: 50 });
  return NextResponse.json(products);
}
