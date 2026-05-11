import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import https from 'https';
import crypto from 'crypto';
import pool from '../db';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { authMiddleware, AuthRequest } from '../middleware/auth';
// ─── OAuth helpers ──────────────────────────────────────────────────────────

/** Создаёт или обновляет OAuth-пользователя и возвращает токены */
async function upsertOAuthUser(params: {
  email: string;
  full_name: string;
  provider: string;
  provider_id: string;
  avatar_url?: string;
}) {
  const { email, full_name, provider, provider_id, avatar_url } = params;

  const existing = await pool.query(
    'SELECT * FROM users WHERE email = $1 OR (auth_provider = $2 AND provider_id = $3)',
    [email, provider, provider_id]
  );

  let user;
  if (existing.rows.length > 0) {
    // Обновляем данные
    const upd = await pool.query(
      `UPDATE users SET full_name = $1, avatar_url = $2, auth_provider = $3, provider_id = $4, updated_at = NOW()
       WHERE id = $5 RETURNING id, email, full_name, phone, role, status, avatar_url`,
      [full_name, avatar_url || null, provider, provider_id, existing.rows[0].id]
    );
    user = upd.rows[0];
  } else {
    // Создаём нового
    const ins = await pool.query(
      `INSERT INTO users (email, full_name, avatar_url, role, status, auth_provider, provider_id)
       VALUES ($1, $2, $3, 'user', 'none', $4, $5)
       RETURNING id, email, full_name, phone, role, status, avatar_url`,
      [email, full_name, avatar_url || null, provider, provider_id]
    );
    user = ins.rows[0];
  }

  const payload = { userId: user.id, email: user.email, role: user.role, status: user.status };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  await pool.query(
    'INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, expiresAt]
  );

  return { user, accessToken, refreshToken };
}

/** Простой GET-запрос через https */
function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}
const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, password, full_name, phone } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email и пароль обязательны' });
    return;
  }

  try {
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Пользователь с таким email уже существует' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status)
       VALUES ($1, $2, $3, $4, 'user', 'none')
       RETURNING id, email, full_name, phone, role, status, created_at`,
      [email, password_hash, full_name || null, phone || null]
    );

    const user = result.rows[0];
    const payload = { userId: user.id, email: user.email, role: user.role, status: user.status };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email и пароль обязательны' });
    return;
  }

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Неверный email или пароль' });
      return;
    }

    const user = result.rows[0];

    if (!user.password_hash) {
      res.status(401).json({ error: 'Этот аккаунт использует OAuth-вход' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Неверный email или пароль' });
      return;
    }

    const payload = { userId: user.id, email: user.email, role: user.role, status: user.status };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await pool.query(
      'INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    const { password_hash: _, ...safeUser } = user;
    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh токен не предоставлен' });
    return;
  }

  try {
    const payload = verifyRefreshToken(refreshToken);

    const session = await pool.query(
      'SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > NOW()',
      [refreshToken]
    );

    if (session.rows.length === 0) {
      res.status(401).json({ error: 'Сессия истекла' });
      return;
    }

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [payload.userId]);
    const user = userResult.rows[0];

    const newPayload = { userId: user.id, email: user.email, role: user.role, status: user.status };
    const newAccessToken = signAccessToken(newPayload);

    res.json({ accessToken: newAccessToken });
  } catch {
    res.status(401).json({ error: 'Недействительный refresh токен' });
  }
});

// POST /api/auth/logout
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await pool.query('DELETE FROM sessions WHERE refresh_token = $1', [refreshToken]);
  }
  res.json({ message: 'Выход выполнен' });
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, phone, role, status, avatar_url, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Пользователь не найден' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ─── VK OAuth ───────────────────────────────────────────────────────────────
// Шаг 1: Редирект на VK
// GET /api/auth/vk
router.get('/vk', (_req: Request, res: Response) => {
  const VK_APP_ID = process.env.VK_APP_ID || 'YOUR_VK_APP_ID';
  const REDIRECT_URI = process.env.OAUTH_REDIRECT_BASE || 'https://raemon.ru';
  const url = `https://oauth.vk.com/authorize?client_id=${VK_APP_ID}&display=page&redirect_uri=${REDIRECT_URI}/api/auth/vk/callback&scope=email&response_type=code&v=5.131`;
  res.redirect(url);
});

// Шаг 2: Callback от VK
// GET /api/auth/vk/callback?code=...
router.get('/vk/callback', async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query;
  const VK_APP_ID = process.env.VK_APP_ID || 'YOUR_VK_APP_ID';
  const VK_APP_SECRET = process.env.VK_APP_SECRET || 'YOUR_VK_APP_SECRET';
  const REDIRECT_URI = process.env.OAUTH_REDIRECT_BASE || 'https://raemon.ru';
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://raemon.ru';

  try {
    const tokenUrl = `https://oauth.vk.com/access_token?client_id=${VK_APP_ID}&client_secret=${VK_APP_SECRET}&redirect_uri=${REDIRECT_URI}/api/auth/vk/callback&code=${code}`;
    const tokenData = JSON.parse(await httpsGet(tokenUrl));

    if (!tokenData.access_token) {
      res.redirect(`${FRONTEND_URL}/login?error=vk_auth_failed`);
      return;
    }

    const userUrl = `https://api.vk.com/method/users.get?user_ids=${tokenData.user_id}&fields=photo_200&access_token=${tokenData.access_token}&v=5.131`;
    const userData = JSON.parse(await httpsGet(userUrl));
    const vkUser = userData.response[0];

    const { user, accessToken, refreshToken } = await upsertOAuthUser({
      email: tokenData.email || `vk_${tokenData.user_id}@vk.local`,
      full_name: `${vkUser.first_name} ${vkUser.last_name}`,
      provider: 'vk',
      provider_id: String(tokenData.user_id),
      avatar_url: vkUser.photo_200,
    });

    res.redirect(`${FRONTEND_URL}/cabinet?token=${accessToken}&refresh=${refreshToken}`);
  } catch (err) {
    console.error('VK OAuth error:', err);
    res.redirect(`${FRONTEND_URL}/login?error=vk_auth_failed`);
  }
});

// ─── Яндекс OAuth ───────────────────────────────────────────────────────────
// GET /api/auth/yandex
router.get('/yandex', (_req: Request, res: Response) => {
  const YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID || 'YOUR_YANDEX_CLIENT_ID';
  const url = `https://oauth.yandex.ru/authorize?response_type=code&client_id=${YANDEX_CLIENT_ID}`;
  res.redirect(url);
});

// GET /api/auth/yandex/callback?code=...
router.get('/yandex/callback', async (req: Request, res: Response): Promise<void> => {
  const { code } = req.query;
  const YANDEX_CLIENT_ID = process.env.YANDEX_CLIENT_ID || 'YOUR_YANDEX_CLIENT_ID';
  const YANDEX_CLIENT_SECRET = process.env.YANDEX_CLIENT_SECRET || 'YOUR_YANDEX_CLIENT_SECRET';
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://raemon.ru';

  try {
    // Получаем токен через POST
    const tokenResponse = await new Promise<string>((resolve, reject) => {
      const body = `grant_type=authorization_code&code=${code}&client_id=${YANDEX_CLIENT_ID}&client_secret=${YANDEX_CLIENT_SECRET}`;
      const options = {
        hostname: 'oauth.yandex.ru',
        path: '/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      };
      const request = https.request(options, (r) => {
        let data = '';
        r.on('data', (chunk) => { data += chunk; });
        r.on('end', () => resolve(data));
      });
      request.on('error', reject);
      request.write(body);
      request.end();
    });

    const tokenData = JSON.parse(tokenResponse);
    if (!tokenData.access_token) {
      res.redirect(`${FRONTEND_URL}/login?error=yandex_auth_failed`);
      return;
    }

    const userInfoUrl = `https://login.yandex.ru/info?format=json&oauth_token=${tokenData.access_token}`;
    const userInfo = JSON.parse(await httpsGet(userInfoUrl));

    const { user, accessToken, refreshToken } = await upsertOAuthUser({
      email: userInfo.default_email || `yandex_${userInfo.id}@yandex.local`,
      full_name: userInfo.real_name || userInfo.display_name || 'Пользователь',
      provider: 'yandex',
      provider_id: String(userInfo.id),
      avatar_url: userInfo.default_avatar_id
        ? `https://avatars.yandex.net/get-yapic/${userInfo.default_avatar_id}/islands-200`
        : undefined,
    });

    res.redirect(`${FRONTEND_URL}/cabinet?token=${accessToken}&refresh=${refreshToken}`);
  } catch (err) {
    console.error('Yandex OAuth error:', err);
    res.redirect(`${FRONTEND_URL}/login?error=yandex_auth_failed`);
  }
});

// ─── Telegram OAuth ──────────────────────────────────────────────────────────
// Telegram Login Widget отправляет данные на этот endpoint
// POST /api/auth/telegram
// Body: { id, first_name, last_name, username, photo_url, auth_date, hash }
router.post('/telegram', async (req: Request, res: Response): Promise<void> => {
  // TODO: Вставьте токен вашего Telegram-бота в переменную окружения TELEGRAM_BOT_TOKEN
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  if (!BOT_TOKEN) {
    res.status(503).json({ error: 'Telegram-бот не настроен. Укажите TELEGRAM_BOT_TOKEN в .env' });
    return;
  }

  const { id, first_name, last_name, username, photo_url, auth_date, hash } = req.body;

  if (!id || !hash) {
    res.status(400).json({ error: 'Неверные данные Telegram' });
    return;
  }

  try {
    // Верификация подписи Telegram
    const crypto = await import('crypto');
    const secretKey = crypto.createHash('sha256').update(BOT_TOKEN).digest();
    const dataCheckString = Object.entries({ auth_date, first_name, id, last_name, photo_url, username })
      .filter(([, v]) => v !== undefined && v !== null)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    if (computedHash !== hash) {
      res.status(401).json({ error: 'Неверная подпись Telegram' });
      return;
    }

    // Проверяем что данные не старше 24 часов
    if (Date.now() / 1000 - Number(auth_date) > 86400) {
      res.status(401).json({ error: 'Данные авторизации устарели' });
      return;
    }

    const { user, accessToken, refreshToken } = await upsertOAuthUser({
      email: `tg_${id}@telegram.local`,
      full_name: [first_name, last_name].filter(Boolean).join(' ') || username || 'Telegram User',
      provider: 'telegram',
      provider_id: String(id),
      avatar_url: photo_url,
    });

    res.json({ user, accessToken, refreshToken });
  } catch (err) {
    console.error('Telegram OAuth error:', err);
    res.status(500).json({ error: 'Ошибка авторизации через Telegram' });
  }
});

// ─── Восстановление пароля через Telegram ───────────────────────────────────

/** Отправляет сообщение пользователю через Telegram Bot API */
function sendTelegramMessage(botToken: string, chatId: string, text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' });
    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${botToken}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.ok) resolve();
        else reject(new Error(parsed.description || 'Telegram API error'));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// POST /api/auth/forgot-password
// Body: { email }
// Ищет пользователя по email, проверяет что у него есть telegram_id (provider_id при auth_provider='telegram'),
// генерирует токен и отправляет ссылку в Telegram
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: 'Email обязателен' });
    return;
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://raemon.ru';

  // Всегда возвращаем одинаковый ответ — не раскрываем существование email
  const successMsg = { message: 'Если аккаунт с таким email существует и привязан к Telegram, вы получите сообщение с инструкцией.' };

  try {
    const result = await pool.query(
      `SELECT id, email, full_name, auth_provider, provider_id
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      res.json(successMsg);
      return;
    }

    const user = result.rows[0];

    // Ищем telegram_id: либо пользователь зарегистрирован через Telegram,
    // либо у него есть telegram_id в отдельном поле (если добавим позже)
    let telegramId: string | null = null;
    if (user.auth_provider === 'telegram' && user.provider_id) {
      telegramId = user.provider_id;
    }

    if (!telegramId) {
      // Пользователь не привязан к Telegram — отвечаем тем же сообщением
      res.json(successMsg);
      return;
    }

    if (!BOT_TOKEN) {
      res.status(503).json({ error: 'Telegram-бот не настроен на сервере' });
      return;
    }

    // Генерируем безопасный токен
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 минут

    // Удаляем старые токены этого пользователя
    await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

    // Сохраняем новый токен
    await pool.query(
      'INSERT INTO password_reset_tokens (user_id, token, telegram_id, expires_at) VALUES ($1, $2, $3, $4)',
      [user.id, token, telegramId, expiresAt]
    );

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
    const name = user.full_name ? user.full_name.split(' ')[0] : 'Резидент';

    await sendTelegramMessage(
      BOT_TOKEN,
      telegramId,
      `👋 <b>${name}</b>, вы запросили сброс пароля на Remon Developer.\n\n` +
      `🔗 Перейдите по ссылке для создания нового пароля:\n${resetUrl}\n\n` +
      `⏰ Ссылка действительна <b>30 минут</b>.\n\n` +
      `Если вы не запрашивали сброс пароля — просто проигнорируйте это сообщение.`
    );

    res.json(successMsg);
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/auth/reset-password
// Body: { token, password }
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400).json({ error: 'Токен и новый пароль обязательны' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT prt.id, prt.user_id, prt.used, prt.expires_at
       FROM password_reset_tokens prt
       WHERE prt.token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      res.status(400).json({ error: 'Недействительная или устаревшая ссылка' });
      return;
    }

    const resetToken = result.rows[0];

    if (resetToken.used) {
      res.status(400).json({ error: 'Эта ссылка уже была использована' });
      return;
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      res.status(400).json({ error: 'Срок действия ссылки истёк. Запросите новую.' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);

    // Обновляем пароль
    await pool.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [password_hash, resetToken.user_id]
    );

    // Помечаем токен как использованный
    await pool.query(
      'UPDATE password_reset_tokens SET used = true WHERE id = $1',
      [resetToken.id]
    );

    // Инвалидируем все сессии пользователя
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [resetToken.user_id]);

    res.json({ message: 'Пароль успешно изменён. Войдите с новым паролем.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/auth/reset-password/verify?token=...
// Проверяет валидность токена (для фронтенда)
router.get('/reset-password/verify', async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query;

  if (!token) {
    res.status(400).json({ valid: false, error: 'Токен не указан' });
    return;
  }

  try {
    const result = await pool.query(
      `SELECT id, used, expires_at FROM password_reset_tokens WHERE token = $1`,
      [token]
    );

    if (result.rows.length === 0) {
      res.json({ valid: false, error: 'Недействительная ссылка' });
      return;
    }

    const t = result.rows[0];

    if (t.used) {
      res.json({ valid: false, error: 'Ссылка уже использована' });
      return;
    }

    if (new Date(t.expires_at) < new Date()) {
      res.json({ valid: false, error: 'Срок действия ссылки истёк' });
      return;
    }

    res.json({ valid: true });
  } catch (err) {
    console.error('Verify reset token error:', err);
    res.status(500).json({ valid: false, error: 'Ошибка сервера' });
  }
});

export default router;
