import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'guzor_go_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  demoMode: process.env.DEMO_MODE === 'true',
  mapboxToken: process.env.MAPBOX_TOKEN || '',
  commissionRate: 0.15, // 15% platforma komissiyasi
};