import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// GET /api/news
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT n.*, p.name as project_name, p.city
       FROM news n
       LEFT JOIN projects p ON n.project_id = p.id
       WHERE n.is_published = true
       ORDER BY n.created_at DESC
       LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/news/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT n.*, p.name as project_name, p.city
       FROM news n
       LEFT JOIN projects p ON n.project_id = p.id
       WHERE n.id = $1 AND n.is_published = true`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Новость не найдена' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
