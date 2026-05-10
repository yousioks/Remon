import { Router, Request, Response } from 'express';
import pool from '../db';

const router = Router();

// GET /api/apartments — список с фильтрацией
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { city, rooms, price_min, price_max, project_id } = req.query;

  let query = `
    SELECT a.*, p.name as project_name, p.city, p.class as project_class
    FROM apartments a
    JOIN projects p ON a.project_id = p.id
    WHERE a.is_active = true
  `;
  const params: (string | number)[] = [];
  let idx = 1;

  if (city) {
    query += ` AND p.city = $${idx++}`;
    params.push(city as string);
  }
  if (rooms) {
    query += ` AND a.rooms = $${idx++}`;
    params.push(rooms as string);
  }
  if (price_min) {
    query += ` AND a.price >= $${idx++}`;
    params.push(Number(price_min));
  }
  if (price_max) {
    query += ` AND a.price <= $${idx++}`;
    params.push(Number(price_max));
  }
  if (project_id) {
    query += ` AND a.project_id = $${idx++}`;
    params.push(Number(project_id));
  }

  query += ' ORDER BY a.price ASC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// GET /api/apartments/:id
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(
      `SELECT a.*, p.name as project_name, p.city, p.address, p.class as project_class
       FROM apartments a
       JOIN projects p ON a.project_id = p.id
       WHERE a.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Квартира не найдена' });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
