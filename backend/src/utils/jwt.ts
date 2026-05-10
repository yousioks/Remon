import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret';

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  status: string;
}

export function signAccessToken(payload: JwtPayload): string {
  // Долгая сессия — 7 дней, чтобы пользователи не перелогинивались
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function signRefreshToken(payload: JwtPayload): string {
  // Refresh-токен живёт 90 дней
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '90d' });
}
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_REFRESH_SECRET) as JwtPayload;
}
