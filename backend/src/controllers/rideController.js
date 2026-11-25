import { prisma } from '../config/prisma.js';
import { estimatePrice, calculateDistance } from '../services/pricingService.js';
import { config } from '../config/env.js';
import { getIO } from '../sockets/index.js';

export const estimate = async (req, res, next) => {
  try {
    const { fromLat, fromLng, toLat, toLng, tariff } = req.body;
    const result = await estimatePrice({ fromLat, fromLng, toLat, toLng, tariff });
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
};

export const createRide = async (req, res, next) => {
  try {
    const { fromAddress, fromLat, fromLng, toAddress, toLat, toLng, tariff, paymentMethod, scheduledAt } = req.body;
    const estimateData = await estimatePrice({ fromLat, fromLng, toLat, toLng, tariff });

    const ride = await prisma.ride.create({
      data: {
        passengerId: req.user.id,
        fromAddress, fromLat, fromLng, toAddress, toLat, toLng,
        distance: estimateData.distance,
        duration: estimateData.duration,
        tariff: tariff || 'STANDARD',
        estimatedPrice: estimateData.price,
        paymentMethod: paymentMethod || 'CASH',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: 'SEARCHING',
      },
      include: { passenger: true }
    });

    // Haydovchilarga real-time yuborish
    const io = getIO();
    const drivers = await prisma.driver.findMany({
      where: { status: 'APPROVED', onlineStatus: 'ONLINE' },
      include: { user: true, vehicle: true }
    });

    drivers.forEach(d => {
      io.to(`driver_${d.id}`).emit('new_ride', {
        rideId: ride.id,
        from: fromAddress, to: toAddress,
        distance: ride.distance, price: ride.estimatedPrice,
        passenger: `${ride.passenger.firstName} ${ride.passenger.lastName}`,
      });
    });

    res.status(201).json({ success: true, ride });
  } catch (e) { next(e); }
};

export const acceptRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const driver = await prisma.driver.findUnique({ where: { userId: req.user.id } });
    if (!driver || driver.status !== 'APPROVED') {
      return res.status(403).json({ success: false, message: 'Haydovchi tasdiqlanmagan' });
    }
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride || ride.status !== 'SEARCHING') {
      return res.status(400).json({ success: false, message: 'Buyurtma mavjud emas yoki allaqachon qabul qilingan' });
    }

    const updated = await prisma.ride.update({
      where: { id: rideId },
      data: { driverId: driver.id, status: 'ACCEPTED' },
      include: { passenger: true, driver: { include: { user: true, vehicle: true } } }
    });

    await prisma.driver.update({ where: { id: driver.id }, data: { onlineStatus: 'ON_TRIP' } });

    getIO().to(`user_${ride.passengerId}`).emit('ride_accepted', {
      rideId, driver: {
        name: `${updated.driver.user.firstName} ${updated.driver.user.lastName}`,
        phone: updated.driver.user.phone,
        rating: updated.driver.rating,
        vehicle: updated.driver.vehicle,
      }
    });

    res.json({ success: true, ride: updated });
  } catch (e) { next(e); }
};

export const updateRideStatus = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const { status } = req.body;
    const valid = ['DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!valid.includes(status)) {
      return res.status(400).json({ success: false, message: 'Noto\'g\'ri status' });
    }

    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) return res.status(404).json({ success: false, message: 'Buyurtma topilmadi' });

    const data = { status };
    if (status === 'IN_PROGRESS') data.startedAt = new Date();
    if (status === 'COMPLETED') {
      data.completedAt = new Date();
      data.finalPrice = ride.estimatedPrice;
      data.commission = ride.estimatedPrice * config.commissionRate;
      data.paymentStatus = ride.paymentMethod === 'CASH' ? 'PAID' : 'PENDING';
    }

    const updated = await prisma.ride.update({ where: { id: rideId }, data });

    if (status === 'COMPLETED' && ride.driverId) {
      await prisma.driver.update({
        where: { id: ride.driverId },
        data: {
          onlineStatus: 'ONLINE',
          totalRides: { increment: 1 },
          totalEarnings: { increment: ride.estimatedPrice - data.commission },
          balance: { increment: ride.estimatedPrice - data.commission },
        }
      });
    }

    getIO().to(`user_${ride.passengerId}`).emit('ride_status', { rideId, status });
    res.json({ success: true, ride: updated });
  } catch (e) { next(e); }
};

export const myRides = async (req, res, next) => {
  try {
    const where = req.user.role === 'DRIVER'
      ? { driver: { userId: req.user.id } }
      : { passengerId: req.user.id };
    const rides = await prisma.ride.findMany({
      where, orderBy: { createdAt: 'desc' }, take: 50,
      include: {
        driver: { include: { user: true, vehicle: true } },
        passenger: true,
      }
    });
    res.json({ success: true, rides });
  } catch (e) { next(e); }
};

export const getRide = async (req, res, next) => {
  try {
    const ride = await prisma.ride.findUnique({
      where: { id: req.params.rideId },
      include: {
        driver: { include: { user: true, vehicle: true } },
        passenger: true,
      }
    });
    if (!ride) return res.status(404).json({ success: false, message: 'Topilmadi' });
    res.json({ success: true, ride });
  } catch (e) { next(e); }
};