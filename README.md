# Miroğlu Market (Next.js + Prisma + SQLite)

Türkçe arayüzlü, müşteri ve admin paneli içeren tam çalışan online market uygulaması.

## Teknolojiler
- Next.js 14 (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- Zod doğrulama
- bcryptjs parola hashleme
- jose ile JWT + httpOnly cookie oturum yönetimi

## Kurulum
1. `npm install`
2. `.env.example` dosyasını kopyalayıp `.env` oluşturun.
3. `npm run db:push`
4. `npm run seed`
5. `npm run dev`
6. Tarayıcı: `http://localhost:3000`

## .env Açıklaması
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-change-me"
COOKIE_NAME="market_session"
```

## Varsayılan Giriş Bilgileri
- Admin: `admin@market.local` / `Admin1234!`
- Müşteri: `musteri@market.local` / `Musteri1234!`

## Geliştirme Komutları
- `npm run dev` -> geliştirme
- `npm run lint` -> lint kontrolü
- `npm run db:push` -> veritabanı şemasını uygular
- `npm run seed` -> örnek veri üretir
- `npm run db:studio` -> Prisma Studio

## Production
- `npm run build`
- `npm run start`

## Bilinen Sınırlamalar
- Ödeme sistemi dış servis bağlamaz, test amaçlıdır.
- Kargo entegrasyonu yoktur.
- Görseller yerel placeholder olarak kullanılır.

## Gelecek Geliştirmeler
- Kupon yönetimi UI ekranı
- Gelişmiş rapor ekranları
- E-posta bildirimleri
- Çoklu dil desteği
