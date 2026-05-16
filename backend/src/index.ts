import cluster from 'cluster';
import os from 'os';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import mistralWAF from './middleware/mistral-waf';
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import apartmentsRoutes from './routes/apartments';
import newsRoutes from './routes/news';
import projectsRoutes from './routes/projects';
import adminRoutes from './routes/admin';
import debugRoutes from './routes/debug';
import { seedUsers } from './seed';
import { sanitizeBody } from './utils/sanitize';

dotenv.config();
// Кластеризация: используем все CPU-ядра в production
if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  const numCPUs = os.cpus().length;
  console.log(`🚀 Master process ${process.pid} запускает ${numCPUs} воркеров`);
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker) => {
    console.log(`⚠️ Воркер ${worker.process.pid} упал — перезапускаем`);
    cluster.fork();
  });
} else {
  startServer();
}

function startServer() {
const app = express();
const PORT = process.env.PORT || 5000;

// Доверяем первому прокси (nginx) — необходимо для корректной работы rate-limit за reverse proxy
app.set('trust proxy', 1);

// Безопасность заголовков
app.use(helmet({ contentSecurityPolicy: false }));
// Gzip-сжатие ответов
app.use(compression());

app.use(cors({
  origin: ['http://localhost:3000', 'https://raemon.ru', 'https://www.raemon.ru'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── MISTRAL Defense WAF ────────────────────────────────────────────────
app.use(mistralWAF);

// ─── DOMPurify Input Sanitization ────────────────────────────────────────
app.use(sanitizeBody);

// Rate limiting: 200 запросов за 15 минут с одного IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много запросов, попробуйте позже' },
});

// Строгий лимит для авторизации: 50 попыток за 15 минут, успешные не считаются
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Слишком много попыток входа, попробуйте через 15 минут' },
});

app.use('/api/', generalLimiter);
// Публичные маршрутыapp.use('/api/auth', authLimiter, authRoutes);
app.use('/api/apartments', apartmentsRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/projects', projectsRoutes);

// Защищённые маршруты (требуют JWT)
app.use('/api/users', usersRoutes);

// Админ маршруты (требуют JWT + role=admin)
app.use('/api/admin', adminRoutes);

// Уязвимый debug endpoint (без авторизации — намеренно, для диплома)
app.use('/api/admin/debug', debugRoutes);

app.get('/', (_req, res) => {
  res.json({ message: 'Remon Developer API v1.0', pid: process.pid });
});

app.listen(PORT, async () => {
  console.log(`✅ Worker ${process.pid} запущен на порту ${PORT}`);
  // Обновляем пароли системных пользователей из ENV при каждом старте
  try {
    await seedUsers();
  } catch (err) {
    console.error('[seed] Ошибка обновления пользователей:', err);
  }
});}
