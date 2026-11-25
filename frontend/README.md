# 🚕 GUZOR GO — To'liq platforma

G'uzor tumani uchun zamonaviy taksi va mahalliy xizmatlar platformasi.

## 📋 Texnologiyalar

**Backend:** Node.js, Express, Prisma, PostgreSQL, Socket.IO, JWT
**Frontend:** React, Vite, Tailwind CSS, React Router, TanStack Query, Zustand, Leaflet

## 🚀 O'rnatish

### Talablar
- Node.js 18+
- PostgreSQL 14+
- npm yoki yarn

### 1. PostgreSQL tayyorlash
```bash
# PostgreSQL o'rnatilgan bo'lishi kerak
sudo -u postgres psql
CREATE DATABASE guzorgo;
CREATE USER guzor_user WITH PASSWORD 'guzor_pass';
GRANT ALL PRIVILEGES ON DATABASE guzorgo TO guzor_user;
\q