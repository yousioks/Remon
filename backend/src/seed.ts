/**
 * seed.ts — обновляет пароли системных пользователей из переменных окружения.
 * Запускается автоматически при старте бэкенда.
 *
 * ENV-переменные:
 *   ADMIN_EMAIL         — email администратора (по умолчанию: admin@raemon.ru)
 *   ADMIN_PASSWORD      — пароль администратора (по умолчанию: admin123)
 *   RESIDENT_EMAIL      — email тестового резидента (по умолчанию: resident@raemon.ru)
 *   RESIDENT_PASSWORD   — пароль тестового резидента (по умолчанию: user123)
 */

import bcrypt from 'bcryptjs';
import pool from './db';

interface SeedUser {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: 'admin' | 'user';
  status: string;
}

export async function seedUsers(): Promise<void> {
  const users: SeedUser[] = [
    {
      email: process.env.ADMIN_EMAIL || 'admin@raemon.ru',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      full_name: 'Администратор Remon',
      phone: '+7 (3812) 20-30-40',
      role: 'admin',
      status: 'resident_business',
    },
    {
      email: process.env.RESIDENT_EMAIL || 'resident@raemon.ru',
      password: process.env.RESIDENT_PASSWORD || 'user123',
      full_name: 'Иванов Иван Иванович',
      phone: '+7 (913) 123-45-67',
      role: 'user',
      status: 'resident_premium',
    },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);

    // Upsert: создаём если нет, обновляем пароль если есть
    await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone, role, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, updated_at = NOW()`,
      [u.email, hash, u.full_name, u.phone, u.role, u.status]
    );

    console.log(`[seed] Пользователь ${u.email} (${u.role}) — пароль обновлён`);
  }
}
