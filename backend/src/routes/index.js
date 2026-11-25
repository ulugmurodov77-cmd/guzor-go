import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { registerSchema, loginSchema, verifySmsSchema } from '../validators/authValidator.js';
import * as auth from '../controllers/authController.js';
import * as ride from '../controllers/rideController.js';
import * as driver from '../controllers/driverController.js';
import * as admin from '../controllers/adminController.js';
import * as misc from '../controllers/miscController.js';

const r = Router();

// ============ AUTH ============
r.post('/auth/register', (req, res, next) => {
  try { registerSchema.parse(req.body); next(); } catch (e) { next(e); }
}, auth.register);
r.post('/auth/login', (req, res, next) => {
  try { loginSchema.parse(req.body); next(); } catch (e) { next(e); }
}, auth.login);
r.post('/auth/send-code', auth.sendCode);
r.post('/auth/verify-code', (req, res, next) => {
  try { verifySmsSchema.parse(req.body); next(); } catch (e) { next(e); }
}, auth.verifyCode);
r.get('/auth/me', authenticate, auth.me);

// ============ RIDES ============
r.post('/rides/estimate', authenticate, ride.estimate);
r.post('/rides', authenticate, ride.createRide);
r.get('/rides/my', authenticate, ride.myRides);
r.get('/rides/:rideId', authenticate, ride.getRide);
r.post('/rides/:rideId/accept', authenticate, authorize('DRIVER'), ride.acceptRide);
r.patch('/rides/:rideId/status', authenticate, ride.updateRideStatus);

// ============ DRIVER ============
r.post('/driver/vehicle', authenticate, authorize('DRIVER'), driver.registerDriverInfo);
r.post('/driver/documents', authenticate, authorize('DRIVER'), driver.uploadDocument);
r.post('/driver/online', authenticate, authorize('DRIVER'), driver.toggleOnline);
r.post('/driver/location', authenticate, authorize('DRIVER'), driver.updateLocation);
r.get('/driver/stats', authenticate, authorize('DRIVER'), driver.myStats);

// ============ ADMIN ============
r.get('/admin/dashboard', authenticate, authorize('ADMIN'), admin.dashboard);
r.get('/admin/users', authenticate, authorize('ADMIN'), admin.listUsers);
r.patch('/admin/users/:userId/block', authenticate, authorize('ADMIN'), admin.blockUser);
r.get('/admin/rides', authenticate, authorize('ADMIN'), admin.listRides);
r.get('/admin/drivers', authenticate, authorize('ADMIN'), driver.listDrivers);
r.patch('/admin/drivers/:driverId/status', authenticate, authorize('ADMIN'), driver.approveDriver);
r.get('/admin/tariffs', authenticate, authorize('ADMIN'), admin.getTariffs);
r.patch('/admin/tariffs/:id', authenticate, authorize('ADMIN'), admin.updateTariff);
r.get('/admin/routes', authenticate, authorize('ADMIN'), admin.listRoutes);
r.post('/admin/routes', authenticate, authorize('ADMIN'), admin.createRoute);
r.get('/admin/promos', authenticate, authorize('ADMIN'), admin.listPromos);
r.post('/admin/promos', authenticate, authorize('ADMIN'), admin.createPromo);

// ============ MISC ============
r.post('/promo/validate', authenticate, misc.validatePromo);
r.get('/favorites', authenticate, misc.listFavorites);
r.post('/favorites', authenticate, misc.addFavorite);
r.delete('/favorites/:id', authenticate, misc.deleteFavorite);
r.get('/businesses', misc.listBusinesses);
r.post('/businesses', authenticate, authorize('ADMIN'), misc.createBusiness);
r.post('/couriers', authenticate, misc.createCourier);
r.get('/couriers/my', authenticate, misc.listCouriers);
r.post('/reviews', authenticate, misc.createReview);
r.get('/notifications', authenticate, misc.listNotifications);
r.patch('/notifications/:id/read', authenticate, misc.markNotificationRead);

export default r;