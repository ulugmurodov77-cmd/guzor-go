import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { config } from '../config/env.js';
import { sendSmsCode, verifySmsCode } from '../services/smsService.js';

const signToken = (user) => jwt.sign(
  { id: user.id, role: user.role },
  config.jwtSecret,
  { expiresIn: config.jwtExpiresIn }
);

const sanitize = (user) => ({
  id: user.id, firstName: user.firstName, lastName: user.lastName,
  phone: user.phone, role: user.role, avatar: user.avatar,
  isVerified: user.isVerified, language: user.language,
});

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, password, role } = req.body;
    const exists = await prisma.user.findUnique({ where: { phone } });
    if (exists) return res.status(400).json({ success: false, message: 'Bu telefon raqami ro\'yxatdan o\'tgan' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { firstName, lastName, phone, password: hashed, role: role || 'PASSENGER' }
    });

    if (user.role === 'DRIVER') {
      await prisma.driver.create({ data: { userId: user.id } });
    }

    await sendSmsCode(phone);
    const token = signToken(user);
    res.status(201).json({ success: true, message: 'Ro\'yxatdan o\'tdingiz. SMS kod yuborildi', token, user: sanitize(user) });
  } catch (e) { next(e); }
};

export const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) return res.status(401).json({ success: false, message: 'Telefon yoki parol noto\'g\'ri' });
    if (user.isBlocked) return res.status(403).json({ success: false, message: 'Hisobingiz bloklangan' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, message: 'Telefon yoki parol noto\'g\'ri' });

    const token = signToken(user);
    res.json({ success: true, token, user: sanitize(user) });
  } catch (e) { next(e); }
};

export const sendCode = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const result = await sendSmsCode(phone);
    res.json({ success: true, message: 'SMS kod yuborildi', demo: result.demo, code: result.demo ? result.code : undefined });
  } catch (e) { next(e); }
};

export const verifyCode = async (req, res, next) => {
  try {
    const { phone, code } = req.body;
    if (!verifySmsCode(phone, code)) {
      return res.status(400).json({ success: false, message: 'Kod noto\'g\'ri yoki muddati o\'tgan' });
    }
    await prisma.user.update({ where: { phone }, data: { isVerified: true } });
    res.json({ success: true, message: 'Telefon tasdiqlandi' });
  } catch (e) { next(e); }
};

export const me = async (req, res) => {
  res.json({ success: true, user: sanitize(req.user) });
};