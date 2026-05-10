import { Router, Response } from 'express';
import pool from '../db';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authMiddleware, adminMiddleware);

// ===== ПОЛЬЗОВАТЕЛИ =====

// GET /api/admin/users
router.get('/users', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT id, email, full_name, phone, role, status, auth_provider, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/admin/users/:id/status
router.put('/users/:id/status', async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;
  const allowed = ['none', 'user', 'resident_premium', 'resident_business'];
  if (!allowed.includes(status)) {
    res.status(400).json({ error: 'Недопустимый статус' });
    return;
  }
  try {
    const result = await pool.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, full_name, role, status',
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req: AuthRequest, res: Response): Promise<void> => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) {
    res.status(400).json({ error: 'Недопустимая роль' });
    return;
  }
  try {
    const result = await pool.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, full_name, role, status',
      [role, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/admin/users/:id/apartments
router.get('/users/:id/apartments', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT ua.*, a.title, a.rooms, a.area, a.floor, a.price, a.image_url,
              p.name as project_name, p.city
       FROM user_apartments ua
       JOIN apartments a ON ua.apartment_id = a.id
       JOIN projects p ON a.project_id = p.id
       WHERE ua.user_id = $1`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/admin/users/:id/apartments
router.post('/users/:id/apartments', async (req: AuthRequest, res: Response): Promise<void> => {
  const { apartment_id, purchase_date, build_status, payment_status, mortgage_payment, next_payment_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO user_apartments (user_id, apartment_id, purchase_date, build_status, payment_status, mortgage_payment, next_payment_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [req.params.id, apartment_id, purchase_date, build_status, payment_status, mortgage_payment, next_payment_date]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/admin/users/:userId/apartments/:id
router.delete('/users/:userId/apartments/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM user_apartments WHERE id = $1 AND user_id = $2', [req.params.id, req.params.userId]);
    res.json({ message: 'Удалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ===== КВАРТИРЫ =====

// GET /api/admin/apartments
router.get('/apartments', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT a.*, p.name as project_name, p.city
       FROM apartments a
       LEFT JOIN projects p ON a.project_id = p.id
       ORDER BY a.id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/admin/apartments
router.post('/apartments', async (req: AuthRequest, res: Response): Promise<void> => {
  const { project_id, title, rooms, area, floor, price, status, image_url, layout_url } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO apartments (project_id, title, rooms, area, floor, price, status, image_url, layout_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [project_id, title, rooms, area, floor, price, status || 'available', image_url, layout_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/admin/apartments/:id
router.put('/apartments/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { project_id, title, rooms, area, floor, price, status, image_url, layout_url, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE apartments SET project_id=$1, title=$2, rooms=$3, area=$4, floor=$5,
       price=$6, status=$7, image_url=$8, layout_url=$9, is_active=$10
       WHERE id=$11 RETURNING *`,
      [project_id, title, rooms, area, floor, price, status, image_url, layout_url, is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/admin/apartments/:id
router.delete('/apartments/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query('UPDATE apartments SET is_active = false WHERE id = $1', [req.params.id]);
    res.json({ message: 'Удалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ===== ПРОЕКТЫ =====

// GET /api/admin/projects
router.get('/projects', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/admin/projects
router.post('/projects', async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, city, class: cls, address, description, price_from, price_to, deadline, image_url } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO projects (name, city, class, address, description, price_from, price_to, deadline, image_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [name, city, cls, address, description, price_from, price_to, deadline, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/admin/projects/:id
router.put('/projects/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, city, class: cls, address, description, price_from, price_to, deadline, image_url, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE projects SET name=$1, city=$2, class=$3, address=$4, description=$5,
       price_from=$6, price_to=$7, deadline=$8, image_url=$9, is_active=$10
       WHERE id=$11 RETURNING *`,
      [name, city, cls, address, description, price_from, price_to, deadline, image_url, is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ===== НОВОСТИ =====

// GET /api/admin/news
router.get('/news', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT n.*, p.name as project_name FROM news n
       LEFT JOIN projects p ON n.project_id = p.id
       ORDER BY n.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/admin/news
router.post('/news', async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, excerpt, image_url, project_id, is_published } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO news (title, content, excerpt, image_url, project_id, is_published)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [title, content, excerpt, image_url, project_id || null, is_published || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/admin/news/:id
router.put('/news/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, content, excerpt, image_url, project_id, is_published } = req.body;
  try {
    const result = await pool.query(
      `UPDATE news SET title=$1, content=$2, excerpt=$3, image_url=$4,
       project_id=$5, is_published=$6, updated_at=NOW()
       WHERE id=$7 RETURNING *`,
      [title, content, excerpt, image_url, project_id || null, is_published, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/admin/news/:id
router.delete('/news/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM news WHERE id = $1', [req.params.id]);
    res.json({ message: 'Удалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ===== КАМЕРЫ =====

// GET /api/admin/cameras
router.get('/cameras', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT c.*, p.name as project_name, p.city
       FROM cameras c
       JOIN projects p ON c.project_id = p.id
       ORDER BY c.id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/admin/cameras
router.post('/cameras', async (req: AuthRequest, res: Response): Promise<void> => {
  const { project_id, name, stream_url, thumbnail_url, location } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO cameras (project_id, name, stream_url, thumbnail_url, location)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [project_id, name, stream_url, thumbnail_url, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// PUT /api/admin/cameras/:id
router.put('/cameras/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { project_id, name, stream_url, thumbnail_url, location, is_active } = req.body;
  try {
    const result = await pool.query(
      `UPDATE cameras SET project_id=$1, name=$2, stream_url=$3, thumbnail_url=$4,
       location=$5, is_active=$6 WHERE id=$7 RETURNING *`,
      [project_id, name, stream_url, thumbnail_url, location, is_active, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// DELETE /api/admin/cameras/:id
router.delete('/cameras/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await pool.query('DELETE FROM cameras WHERE id = $1', [req.params.id]);
    res.json({ message: 'Удалено' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ===== СООБЩЕНИЯ =====

// GET /api/admin/messages
router.get('/messages', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.full_name as user_name, u.email as user_email
       FROM messages m
       JOIN users u ON m.user_id = u.id
       ORDER BY m.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/admin/messages/user/:userId — чат с конкретным пользователем
router.get('/messages/user/:userId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.full_name as admin_name
       FROM messages m
       LEFT JOIN users u ON m.admin_id = u.id
       WHERE m.user_id = $1
       ORDER BY m.created_at ASC`,
      [req.params.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// POST /api/admin/messages/user/:userId/reply
router.post('/messages/user/:userId/reply', async (req: AuthRequest, res: Response): Promise<void> => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    res.status(400).json({ error: 'Сообщение не может быть пустым' });
    return;
  }
  try {
    const result = await pool.query(
      `INSERT INTO messages (user_id, admin_id, content, is_from_admin)
       VALUES ($1, $2, $3, true) RETURNING *`,
      [req.params.userId, req.user!.userId, content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ===== СТАТИСТИКА =====

// GET /api/admin/stats
router.get('/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [users, apartments, news, messages] = await Promise.all([
      pool.query(`SELECT status, COUNT(*) as count FROM users GROUP BY status`),
      pool.query(`SELECT status, COUNT(*) as count FROM apartments WHERE is_active=true GROUP BY status`),
      pool.query(`SELECT COUNT(*) as total, SUM(CASE WHEN is_published THEN 1 ELSE 0 END) as published FROM news`),
      pool.query(`SELECT COUNT(*) as total, SUM(CASE WHEN NOT is_read AND is_from_admin=false THEN 1 ELSE 0 END) as unread FROM messages`),
    ]);

    res.json({
      users: users.rows,
      apartments: apartments.rows,
      news: news.rows[0],
      messages: messages.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
