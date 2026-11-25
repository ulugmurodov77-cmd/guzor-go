import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { config } from './config/env.js';
import { initSocket } from './sockets/index.js';
import { errorHandler, notFound } from './middleware/error.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api/', limiter);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'GUZOR GO API ishlayapti 🚀', time: new Date() }));

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

const httpServer = createServer(app);
initSocket(httpServer);

httpServer.listen(config.port, () => {
  console.log(`\n🚀 GUZOR GO Backend ${config.port}-portda ishga tushdi`);
  console.log(`📍 http://localhost:${config.port}`);
  console.log(`🔧 Demo rejim: ${config.demoMode ? 'YOQILGAN' : "O'CHIRILGAN"}\n`);
});