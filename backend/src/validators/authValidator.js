import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(2, 'Ism kamida 2 ta harf'),
  lastName: z.string().min(2, 'Familiya kamida 2 ta harf'),
  phone: z.string().regex(/^\+998\d{9}$/, 'Telefon formati: +998XXXXXXXXX'),
  password: z.string().min(6, 'Parol kamida 6 ta belgi'),
  role: z.enum(['PASSENGER', 'DRIVER']).optional(),
});

export const loginSchema = z.object({
  phone: z.string().regex(/^\+998\d{9}$/, 'Telefon formati noto\'g\'ri'),
  password: z.string().min(1, 'Parol kiritilishi shart'),
});

export const verifySmsSchema = z.object({
  phone: z.string(),
  code: z.string().length(6, 'Kod 6 xonali'),
});