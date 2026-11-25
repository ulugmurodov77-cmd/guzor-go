import { prisma } from '../config/prisma.js';

// Haversine formula - km hisoblash
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const estimatePrice = async ({ fromLat, fromLng, toLat, toLng, tariff = 'STANDARD' }) => {
  const tariffConfig = await prisma.tariff.findUnique({ where: { type: tariff } });
  const fallback = { basePrice: 5000, pricePerKm: 2000, pricePerMin: 200, minPrice: 7000 };
  const t = tariffConfig || fallback;

  const distance = calculateDistance(fromLat, fromLng, toLat, toLng);
  const duration = Math.ceil((distance / 40) * 60); // 40 km/soat o'rtacha
  const price = Math.max(
    t.minPrice,
    t.basePrice + distance * t.pricePerKm + duration * (t.pricePerMin || 0)
  );

  return {
    distance: Math.round(distance * 100) / 100,
    duration,
    price: Math.round(price / 500) * 500, // 500 so'mga yaxlitlash
  };
};