import { Router, Response, Request } from 'express';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth';
import path from 'path';
import fs from 'fs';

const router = Router();
const uploadDir = path.join(__dirname, '../../uploads');
const settingsPath = path.join(uploadDir, 'global-media.json');
const pageBlocksPath = path.join(uploadDir, 'page-blocks.json');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const getPageBlocks = () => {
  try {
    if (fs.existsSync(pageBlocksPath)) {
      return JSON.parse(fs.readFileSync(pageBlocksPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading page-blocks.json:', e);
  }
  return {};
};

// Helper function to read settings
const getSettings = () => {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading global-media.json:', e);
  }
  return { url: null, type: null };
};

// GET /api/settings/global-media
router.get('/global-media', (req: Request, res: Response) => {
  res.json(getSettings());
});

// POST /api/settings/global-media (Admin only)
router.post('/global-media', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  const { url, type } = req.body;
  try {
    fs.writeFileSync(settingsPath, JSON.stringify({ url, type }, null, 2));
    res.json({ success: true, url, type });
  } catch (e) {
    console.error('Error writing global-media.json:', e);
    res.status(500).json({ error: 'Ошибка сохранения настроек' });
  }
});

// DELETE /api/settings/global-media (Admin only)
router.delete('/global-media', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify({ url: null, type: null }, null, 2));
    res.json({ success: true });
  } catch (e) {
    console.error('Error deleting global-media.json:', e);
    res.status(500).json({ error: 'Ошибка сброса настроек' });
  }
});

// GET /api/settings/page-blocks
router.get('/page-blocks', (req: Request, res: Response) => {
  res.json(getPageBlocks());
});

// POST /api/settings/page-blocks/:blockId (Admin only)
router.post('/page-blocks/:blockId', authMiddleware, adminMiddleware, (req: AuthRequest, res: Response) => {
  const { blockId } = req.params;
  const { url, type } = req.body;
  try {
    const blocks = getPageBlocks();
    blocks[blockId] = { url, type };
    fs.writeFileSync(pageBlocksPath, JSON.stringify(blocks, null, 2));
    res.json({ success: true, block: blocks[blockId] });
  } catch (e) {
    console.error('Error writing page-blocks.json:', e);
    res.status(500).json({ error: 'Ошибка сохранения блоков' });
  }
});

export default router;
