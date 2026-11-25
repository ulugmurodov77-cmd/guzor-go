import { config } from '../config/env.js';

// Demo rejimda kodni konsolga chiqaramiz
const codes = new Map();

export const sendSmsCode = async (phone) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  codes.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  if (config.demoMode) {
    console.log(`📱 [DEMO SMS] ${phone} uchun kod: ${code}`);
    return { success: true, demo: true, code };
  }
  // Real provayder bu yerda ulanadi (Eskiz.uz va h.k.)
  return { success: true, demo: false };
};

export const verifySmsCode = (phone, code) => {
  const record = codes.get(phone);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    codes.delete(phone);
    return false;
  }
  if (record.code !== code) return false;
  codes.delete(phone);
  return true;
};