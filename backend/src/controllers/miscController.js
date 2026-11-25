import { prisma } from '../config/prisma.js';
import { estimatePrice } from '../services/pricingService.js';

// Promo tekshirish
export const validatePromo = async (req, res, next) => {
  try {
    const { code, amount } = req.body;
    const promo = await prisma.promoCode.findUnique({ where: { code } });
    if (!promo || !promo.isActive) {
      return res.status(404).json({ success: false, message: 'Promo-kod topilmadi' });
    }
    if (promo.validUntil && promo.validUntil < new Date()) {
      return res.status(400).json({ success: false, message: 'Promo-kod muddati o\'tgan' });
    }
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return res.status(400).json({ success: false, message: 'Promo-kod limiti tugagan' });
    }
    if (amount < promo.minAmount) {
      return res.status(400).json({ success: false, message: `Minimal summa: ${promo.minAmount} so'm` });
    }
    const discount = promo.type === 'PERCENT' ? amount * promo.discount / 100 : promo.discount;
    res.json({ success: true, discount: Math.round(discount), promo });
  } catch (e) { next(e); }
};

// Sevimli manzillar
export const listFavorites = async (req, res, next) => {
  try {
    const favorites = await prisma.favoriteAddress.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, favorites });
  } catch (e) { next(e); }
};

export const addFavorite = async (req, res, next) => {
  try {
    const { label, address, lat, lng } = req.body;
    const favorite = await prisma.favoriteAddress.create({
      data: { userId: req.user.id, label, address, lat, lng }
    });
    res.json({ success: true, favorite });
  } catch (e) { next(e); }
};

export const deleteFavorite = async (req, res, next) => {
  try {
    await prisma.favoriteAddress.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (e) { next(e); }
};

// Mahalliy bizneslar
export const listBusinesses = async (req, res, next) => {
  try {
    const { category } = req.query;
    const where = { isActive: true, ...(category && { category }) };
    const businesses = await prisma.business.findMany({ where, orderBy: { rating: 'desc' } });
    res.json({ success: true, businesses });
  } catch (e) { next(e); }
};

export const createBusiness = async (req, res, next) => {
  try {
    const business = await prisma.business.create({ data: req.body });
    res.json({ success: true, business });
  } catch (e) { next(e); }
};

// Kuryer
export const createCourier = async (req, res, next) => {
  try {
    const data = req.body;
    const courier = await prisma.courierOrder.create({
      data: { ...data, userId: req.user.id }
    });
    res.json({ success: true, courier });
  } catch (e) { next(e); }
};

export const listCouriers = async (req, res, next) => {
  try {
    const couriers = await prisma.courierOrder.findMany({
      where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, couriers });
  } catch (e) { next(e); }
};

// Sharh
export const createReview = async (req, res, next) => {
  try {
    const { rideId, rating, comment } = req.body;
    const ride = await prisma.ride.findUnique({ where: { id: rideId }, include: { driver: true } });
    if (!ride) return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });
    if (ride.status !== 'COMPLETED') return res.status(400).json({ success: false, message: 'Safar yakunlanmagan' });

    const review = await prisma.review.create({
      data: {
        rideId, authorId: req.user.id,
        targetId: ride.driver.userId,
        driverId: ride.driverId,
        rating, comment,
      }
    });

    if (ride.driverId) {
      const all = await prisma.review.findMany({ where: { driverId: ride.driverId } });
      const avg = all.reduce((s, r) => s + r.rating, 0) / all.length;
      await prisma.driver.update({ where: { id: ride.driverId }, data: { rating: avg } });
    }

    res.json({ success: true, review });
  } catch (e) { next(e); }
};

// Bildirishnomalar
export const listNotifications = async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id }, orderBy: { createdAt: 'desc' }, take: 100
    });
    res.json({ success: true, notifications });
  } catch (e) { next(e); }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ success: true });
  } catch (e) { next(e); }
};