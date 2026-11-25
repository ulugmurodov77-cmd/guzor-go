import { prisma } from '../config/prisma.js';

export const registerDriverInfo = async (req, res, next) => {
  try {
    const { brand, model, color, plateNumber, year, photo } = req.body;
    const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
    if (!driver) return res.status(404).json({ success: false, message: 'Haydovchi topilmadi' });

    const vehicle = await prisma.vehicle.upsert({
      where: { driverId: driver.id },
      update: { brand, model, color, plateNumber, year, photo },
      create: { driverId: driver.id, brand, model, color, plateNumber, year, photo },
    });
    res.json({ success: true, vehicle });
  } catch (e) { next(e); }
};

export const uploadDocument = async (req, res, next) => {
  try {
    const { type, fileUrl } = req.body;
    const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
    if (!driver) return res.status(404).json({ success: false, message: 'Haydovchi topilmadi' });

    const doc = await prisma.driverDocument.create({
      data: { driverId: driver.id, type, fileUrl }
    });
    res.json({ success: true, document: doc });
  } catch (e) { next(e); }
};

export const toggleOnline = async (req, res, next) => {
  try {
    const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
    if (!driver) return res.status(404).json({ success: false, message: 'Haydovchi topilmadi' });
    if (driver.status !== 'APPROVED') {
      return res.status(403).json({ success: false, message: 'Hujjatlaringiz hali tasdiqlanmagan' });
    }

    const { online } = req.body;
    const updated = await prisma.driver.update({
      where: { id: driver.id },
      data: { onlineStatus: online ? 'ONLINE' : 'OFFLINE' }
    });
    res.json({ success: true, onlineStatus: updated.onlineStatus });
  } catch (e) { next(e); }
};

export const updateLocation = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
    if (!driver) return res.status(404).json({ success: false, message: 'Topilmadi' });

    await prisma.driver.update({
      where: { id: driver.id },
      data: { currentLat: lat, currentLng: lng }
    });

    // Onlayn haydovchilar va admin jonli xarita uchun
    const { getIO } = await import('../sockets/index.js');
    getIO().to('admin_live').emit('driver_location', { driverId: driver.id, lat, lng });

    res.json({ success: true });
  } catch (e) { next(e); }
};

export const myStats = async (req, res, next) => {
  try {
    const driver = await prisma.driver.findUnique({
      where: { userId: req.user.id },
      include: { vehicle: true, documents: true, user: true }
    });
    if (!driver) return res.status(404).json({ success: false, message: 'Topilmadi' });

    const now = new Date();
    const dayStart = new Date(now.setHours(0, 0, 0, 0));
    const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(now); monthStart.setDate(1);

    const [dayRides, weekRides, monthRides] = await Promise.all([
      prisma.ride.findMany({ where: { driverId: driver.id, status: 'COMPLETED', completedAt: { gte: dayStart } } }),
      prisma.ride.findMany({ where: { driverId: driver.id, status: 'COMPLETED', completedAt: { gte: weekStart } } }),
      prisma.ride.findMany({ where: { driverId: driver.id, status: 'COMPLETED', completedAt: { gte: monthStart } } }),
    ]);

    const sum = (r) => r.reduce((s, x) => s + (x.finalPrice || 0), 0);

    res.json({
      success: true,
      driver,
      stats: {
        dayEarnings: sum(dayRides), dayRides: dayRides.length,
        weekEarnings: sum(weekRides), weekRides: weekRides.length,
        monthEarnings: sum(monthRides), monthRides: monthRides.length,
      }
    });
  } catch (e) { next(e); }
};

export const listDrivers = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = status ? { status } : {};
    const drivers = await prisma.driver.findMany({
      where, include: { user: true, vehicle: true, documents: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, drivers });
  } catch (e) { next(e); }
};

export const approveDriver = async (req, res, next) => {
  try {
    const { driverId } = req.params;
    const { status } = req.body; // APPROVED | REJECTED | BLOCKED
    const driver = await prisma.driver.update({
      where: { id: driverId },
      data: { status },
    });
    res.json({ success: true, driver });
  } catch (e) { next(e); }
};