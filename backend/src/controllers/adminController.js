import { prisma } from '../config/prisma.js';

export const dashboard = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const [
      totalUsers, totalDrivers, onlineDrivers,
      todayOrders, completedOrders, cancelledOrders,
      todayRevenue, monthRevenue
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'PASSENGER' } }),
      prisma.driver.count(),
      prisma.driver.count({ where: { onlineStatus: 'ONLINE' } }),
      prisma.ride.count({ where: { createdAt: { gte: today } } }),
      prisma.ride.count({ where: { status: 'COMPLETED' } }),
      prisma.ride.count({ where: { status: 'CANCELLED' } }),
      prisma.ride.aggregate({ _sum: { finalPrice: true }, where: { status: 'COMPLETED', completedAt: { gte: today } } }),
      prisma.ride.aggregate({ _sum: { finalPrice: true }, where: { status: 'COMPLETED', completedAt: { gte: monthStart } } }),
    ]);

    const totalCommission = await prisma.ride.aggregate({
      _sum: { commission: true }, where: { status: 'COMPLETED' }
    });

    // Oxirgi 7 kun grafigi
    const chart = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const count = await prisma.ride.count({ where: { createdAt: { gte: d, lt: next } } });
      chart.push({ date: d.toISOString().slice(0, 10), count });
    }

    res.json({
      success: true,
      stats: {
        totalUsers, totalDrivers, onlineDrivers,
        todayOrders, completedOrders, cancelledOrders,
        todayRevenue: todayRevenue._sum.finalPrice || 0,
        monthRevenue: monthRevenue._sum.finalPrice || 0,
        totalCommission: totalCommission._sum.commission || 0,
      },
      chart,
    });
  } catch (e) { next(e); }
};

export const listUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { driver: true }
    });
    res.json({ success: true, users: users.map(u => ({ ...u, password: undefined })) });
  } catch (e) { next(e); }
};

export const blockUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isBlocked } = req.body;
    const user = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked },
    });
    res.json({ success: true, user: { ...user, password: undefined } });
  } catch (e) { next(e); }
};

export const listRides = async (req, res, next) => {
  try {
    const rides = await prisma.ride.findMany({
      orderBy: { createdAt: 'desc' }, take: 200,
      include: {
        passenger: true,
        driver: { include: { user: true, vehicle: true } },
      }
    });
    res.json({ success: true, rides });
  } catch (e) { next(e); }
};

export const getTariffs = async (req, res, next) => {
  try {
    const tariffs = await prisma.tariff.findMany();
    res.json({ success: true, tariffs });
  } catch (e) { next(e); }
};

export const updateTariff = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { basePrice, pricePerKm, pricePerMin, minPrice, isActive } = req.body;
    const tariff = await prisma.tariff.update({
      where: { id },
      data: { basePrice, pricePerKm, pricePerMin, minPrice, isActive }
    });
    res.json({ success: true, tariff });
  } catch (e) { next(e); }
};

export const listRoutes = async (req, res, next) => {
  try {
    const routes = await prisma.route.findMany({ orderBy: { fromCity: 'asc' } });
    res.json({ success: true, routes });
  } catch (e) { next(e); }
};

export const createRoute = async (req, res, next) => {
  try {
    const route = await prisma.route.create({ data: req.body });
    res.json({ success: true, route });
  } catch (e) { next(e); }
};

export const createPromo = async (req, res, next) => {
  try {
    const promo = await prisma.promoCode.create({ data: req.body });
    res.json({ success: true, promo });
  } catch (e) { next(e); }
};

export const listPromos = async (req, res, next) => {
  try {
    const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, promos });
  } catch (e) { next(e); }
};