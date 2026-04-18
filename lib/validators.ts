import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalıdır.'),
  email: z.string().email('Geçerli e-posta giriniz.'),
  password: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalıdır.')
    .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir.')
    .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir.')
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const addressSchema = z.object({
  title: z.string().min(2),
  fullName: z.string().min(2),
  phone: z.string().min(10),
  city: z.string().min(2),
  district: z.string().min(2),
  line1: z.string().min(5),
  postalCode: z.string().min(4),
  isDefault: z.boolean().optional()
});

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  categoryId: z.string().min(1),
  price: z.coerce.number().int().min(1),
  discountPrice: z.coerce.number().int().nullable().optional(),
  stock: z.coerce.number().int().min(0),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  imageUrl: z.string().min(1)
});
