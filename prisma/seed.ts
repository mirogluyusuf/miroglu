import { PrismaClient, Role, PaymentMethod, OrderStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(value: string) {
  return value
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  const adminPass = await bcrypt.hash('Admin1234!', 10);
  const customerPass = await bcrypt.hash('Musteri1234!', 10);

  const admin = await prisma.user.create({
    data: { name: 'Market Admin', email: 'admin@market.local', passwordHash: adminPass, role: Role.ADMIN }
  });

  const customer = await prisma.user.create({
    data: { name: 'Ayşe Yılmaz', email: 'musteri@market.local', passwordHash: customerPass, role: Role.CUSTOMER }
  });

  const categories = ['Meyve & Sebze', 'Temel Gıda', 'İçecek', 'Atıştırmalık', 'Temizlik'];
  const categoryMap: Record<string, string> = {};

  for (const name of categories) {
    const c = await prisma.category.create({
      data: {
        name,
        slug: slugify(name),
        description: `${name} ürünleri`,
        isActive: true
      }
    });
    categoryMap[name] = c.id;
  }

  const products = [
    ['Domates', 'Meyve & Sebze', 4500, 3900, 30, true],
    ['Salatalık', 'Meyve & Sebze', 3200, null, 25, false],
    ['Patates', 'Meyve & Sebze', 2800, null, 80, false],
    ['Muz', 'Meyve & Sebze', 5900, 5400, 12, true],
    ['Elma', 'Meyve & Sebze', 4200, null, 14, true],
    ['Pirinç 1kg', 'Temel Gıda', 7200, 6500, 50, true],
    ['Makarna', 'Temel Gıda', 1900, null, 100, false],
    ['Ayçiçek Yağı 1L', 'Temel Gıda', 7800, 7300, 20, true],
    ['Un 2kg', 'Temel Gıda', 5300, null, 6, false],
    ['Toz Şeker 1kg', 'Temel Gıda', 4700, null, 40, false],
    ['Süt 1L', 'İçecek', 2600, null, 45, false],
    ['Ayran 1L', 'İçecek', 3400, 2900, 25, false],
    ['Meyve Suyu', 'İçecek', 5200, null, 18, true],
    ['Maden Suyu 6lı', 'İçecek', 3900, null, 33, false],
    ['Filtre Kahve 250g', 'İçecek', 12900, 10900, 5, true],
    ['Cips', 'Atıştırmalık', 3400, null, 28, false],
    ['Çikolata', 'Atıştırmalık', 2500, 2100, 60, false],
    ['Bisküvi', 'Atıştırmalık', 2200, null, 70, false],
    ['Kuruyemiş Karışık', 'Atıştırmalık', 9800, 8600, 9, true],
    ['Protein Bar', 'Atıştırmalık', 4100, null, 4, false],
    ['Bulaşık Deterjanı', 'Temizlik', 6900, 6200, 16, false],
    ['Çamaşır Suyu', 'Temizlik', 3700, null, 22, false],
    ['Yüzey Temizleyici', 'Temizlik', 4600, null, 0, false],
    ['Tuvalet Kağıdı 12li', 'Temizlik', 11900, 10300, 11, true]
  ] as const;

  const createdProducts = [] as { id: string; name: string; price: number; discountPrice: number | null }[];

  for (const [name, category, price, discountPrice, stock, featured] of products) {
    const p = await prisma.product.create({
      data: {
        name,
        slug: slugify(name),
        description: `${name} taze ve hızlı teslimatla kapınızda.`,
        categoryId: categoryMap[category],
        price,
        discountPrice,
        stock,
        isFeatured: featured,
        isActive: true,
        popularity: Math.floor(Math.random() * 100),
        imageUrl: '/images/product.svg'
      }
    });
    createdProducts.push({ id: p.id, name: p.name, price: p.price, discountPrice: p.discountPrice });
  }

  await prisma.address.createMany({
    data: [
      {
        userId: customer.id,
        title: 'Ev',
        fullName: 'Ayşe Yılmaz',
        phone: '05550000001',
        city: 'İstanbul',
        district: 'Kadıköy',
        line1: 'Moda Mah. Market Sok. No:12 D:4',
        postalCode: '34710',
        isDefault: true
      },
      {
        userId: customer.id,
        title: 'Ofis',
        fullName: 'Ayşe Yılmaz',
        phone: '05550000001',
        city: 'İstanbul',
        district: 'Ataşehir',
        line1: 'Barbaros Mah. Ofis Cd. No:18',
        postalCode: '34746',
        isDefault: false
      }
    ]
  });

  await prisma.favorite.createMany({
    data: [
      { userId: customer.id, productId: createdProducts[0].id },
      { userId: customer.id, productId: createdProducts[5].id },
      { userId: customer.id, productId: createdProducts[14].id }
    ]
  });

  await prisma.banner.create({
    data: {
      title: 'Hafta Sonu Sepette %10 İndirim',
      subtitle: '1500 TL ve üzeri siparişlerde otomatik uygulanır.',
      isActive: true
    }
  });

  await prisma.coupon.create({
    data: {
      code: 'HOSGELDIN10',
      discountRate: 10,
      isActive: true
    }
  });

  const address = await prisma.address.findFirstOrThrow({ where: { userId: customer.id, isDefault: true } });
  const orderProducts = [createdProducts[0], createdProducts[5], createdProducts[14]];
  const subtotal = orderProducts.reduce((sum, item) => sum + (item.discountPrice ?? item.price), 0);

  const order = await prisma.order.create({
    data: {
      orderNo: `SIP-${Date.now()}`,
      userId: customer.id,
      addressText: `${address.title}: ${address.line1} ${address.district}/${address.city}`,
      paymentMethod: PaymentMethod.KAPIDA_ODEME,
      status: OrderStatus.HAZIRLANIYOR,
      subtotal,
      discountTotal: Math.round(subtotal * 0.1),
      total: Math.round(subtotal * 0.9),
      note: 'Zile basmadan arayınız.'
    }
  });

  await prisma.orderItem.createMany({
    data: orderProducts.map((item) => {
      const unitPrice = item.discountPrice ?? item.price;
      return {
        orderId: order.id,
        productId: item.id,
        name: item.name,
        unitPrice,
        quantity: 1,
        total: unitPrice
      };
    })
  });

  console.log('Seed tamamlandı.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
