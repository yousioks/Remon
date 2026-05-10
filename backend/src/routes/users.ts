import { Router, Response } from 'express';
import pool from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/users/me/apartments — квартиры пользователя
router.get('/me/apartments', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT ua.*, a.title, a.rooms, a.area, a.floor, a.image_url, a.layout_url,
              p.name as project_name, p.city, p.address
       FROM user_apartments ua
       JOIN apartments a ON ua.apartment_id = a.id
       JOIN projects p ON a.project_id = p.id
       WHERE ua.user_id = $1`,
      [req.user!.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/users/me/cameras — доступные камеры
router.get('/me/cameras', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT c.*, p.name as project_name, p.city
       FROM cameras c
       JOIN projects p ON c.project_id = p.id
       WHERE c.is_active = true
       ORDER BY p.city, c.name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/users/me/messages — история чата
router.get('/me/messages', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.full_name as admin_name
       FROM messages m
       LEFT JOIN users u ON m.admin_id = u.id
       WHERE m.user_id = $1
       ORDER BY m.created_at ASC`,
      [req.user!.userId]
    );

    // Отмечаем сообщения от админа как прочитанные
    await pool.query(
      `UPDATE messages SET is_read = true
       WHERE user_id = $1 AND is_from_admin = true AND is_read = false`,
      [req.user!.userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/users/me/messages — отправить сообщение менеджеру
router.post('/me/messages', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Сообщение не может быть пустым' });
    return;
  }

  try {
    const result = await pool.query(
      `INSERT INTO messages (user_id, content, is_from_admin)
       VALUES ($1, $2, false)
       RETURNING *`,
      [req.user!.userId, content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/users/me — обновить профиль
router.put('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { full_name, phone } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET full_name = $1, phone = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, email, full_name, phone, role, status, avatar_url`,
      [full_name, phone, req.user!.userId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
