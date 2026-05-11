-- ============================================================
-- Remon Developer — Инициализация базы данных
-- ============================================================

-- Права уже выданы через POSTGRES_USER в docker-compose
-- remon_user является владельцем remon_db

-- Пользователи
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  full_name VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(30) DEFAULT 'none' CHECK (status IN ('none', 'user', 'resident_premium', 'resident_business')),
  avatar_url TEXT,
  auth_provider VARCHAR(20) DEFAULT 'local',
  provider_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Проекты
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  class VARCHAR(50),
  address TEXT,
  description TEXT,
  price_from INTEGER,
  price_to INTEGER,
  deadline VARCHAR(100),
  image_url TEXT,
  gallery JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Квартиры
CREATE TABLE IF NOT EXISTS apartments (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  title VARCHAR(255),
  rooms VARCHAR(20),
  area DECIMAL(6,2),
  floor VARCHAR(20),
  price INTEGER,
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
  image_url TEXT,
  layout_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Квартиры пользователей (портфель)
CREATE TABLE IF NOT EXISTS user_apartments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  apartment_id INTEGER REFERENCES apartments(id) ON DELETE CASCADE,
  purchase_date DATE,
  build_status VARCHAR(100) DEFAULT 'В строительстве',
  payment_status VARCHAR(100) DEFAULT 'Активна',
  mortgage_payment INTEGER,
  next_payment_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Новости
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  content TEXT,
  excerpt TEXT,
  image_url TEXT,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Камеры
CREATE TABLE IF NOT EXISTS cameras (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  stream_url TEXT,
  thumbnail_url TEXT,
  location VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Сообщения чата
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_from_admin BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Refresh токены
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Токены сброса пароля через Telegram
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  telegram_id VARCHAR(50),
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
-- ============================================================
-- Начальные данные
-- ============================================================

-- Администратор (пароль: admin123)
INSERT INTO users (email, password_hash, full_name, phone, role, status)
VALUES (
  'admin@raemon.ru',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Администратор Remon',
  '+7 (3812) 20-30-40',
  'admin',
  'resident_business'
) ON CONFLICT (email) DO NOTHING;

-- Тестовый резидент (пароль: user123)
INSERT INTO users (email, password_hash, full_name, phone, role, status)
VALUES (
  'resident@raemon.ru',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Иванов Иван Иванович',
  '+7 (913) 123-45-67',
  'user',
  'resident_premium'
) ON CONFLICT (email) DO NOTHING;

-- Проекты
INSERT INTO projects (name, city, class, address, description, price_from, price_to, deadline, image_url)
VALUES
  (
    'Кварталы Карбышева',
    'Омск',
    'Business',
    'Левобережье, ул. Карбышева',
    'Масштабный жилой квартал на территории бывшего аэропорта. Умные технологии, закрытые дворы-парки, панорамное остекление.',
    5500000,
    24000000,
    'II кв. 2026',
    '/photos/Вид дома 1.jpg'
  ),
  (
    'Riverside HQ',
    'Тюмень',
    'Business',
    'Первая Набережная',
    'Флагманский проект в Тюмени. Вид на реку, дизайнерские лобби, умный дом.',
    8200000,
    35000000,
    'Сдан',
    '/photos/Вид дома 3.jpg'
  ),
  (
    'Grand Park',
    'Новосибирск',
    'Premium',
    'Ул. Гоголя, Центральный р-н',
    'Премиальный жилой комплекс в центре Новосибирска. Авторская архитектура, консьерж-сервис.',
    12500000,
    60000000,
    'IV кв. 2025',
    '/photos/Вид дома 2.jpg'
  )
ON CONFLICT DO NOTHING;

-- Квартиры
INSERT INTO apartments (project_id, title, rooms, area, floor, price, image_url, layout_url)
VALUES
  (1, 'Студия 28,4 м²', 'СТ', 28.4, '4/9', 5800000, '/photos/Вид дома 4.jpg', '/photos/Планировка 1.jpg'),
  (1, '1-комнатная 42,1 м²', '1К', 42.1, '7/9', 8900000, '/photos/Вид дома 5.jpg', '/photos/Планировка 2.jpg'),
  (1, '2-комнатная 64,8 м²', '2К', 64.8, '5/9', 13500000, '/photos/Вид дома 6.jpg', '/photos/Планировка 3.jpg'),
  (1, '3-комнатная 89,2 м²', '3К+', 89.2, '2/9', 18900000, '/photos/Крыша с камином.jpg', '/photos/Планировка 4.jpg'),
  (2, '1-комнатная 38,5 м²', '1К', 38.5, '8/17', 9200000, '/photos/Вид дома 2.jpg', '/photos/Планировка 1.jpg'),
  (2, '2-комнатная 58,3 м²', '2К', 58.3, '12/17', 15800000, '/photos/Вид дома 3.jpg', '/photos/Планировка 2.jpg'),
  (3, '2-комнатная 71,0 м²', '2К', 71.0, '6/12', 22000000, '/photos/Вид дома 1.jpg', '/photos/Планировка 3.jpg'),
  (3, '3-комнатная 95,5 м²', '3К+', 95.5, '9/12', 35000000, '/photos/Вид дома 4.jpg', '/photos/Планировка 4.jpg')
ON CONFLICT DO NOTHING;

-- Квартира тестового резидента
INSERT INTO user_apartments (user_id, apartment_id, purchase_date, build_status, payment_status, mortgage_payment, next_payment_date)
SELECT
  u.id,
  a.id,
  '2024-03-15',
  'В строительстве',
  'Ипотека активна',
  45850,
  '2025-08-01'
FROM users u, apartments a
WHERE u.email = 'resident@raemon.ru' AND a.title = '2-комнатная 64,8 м²'
ON CONFLICT DO NOTHING;

-- Новости
INSERT INTO news (title, content, excerpt, image_url, project_id, is_published)
VALUES
  (
    'Старт продаж второй очереди «Кварталов Карбышева»',
    'Мы рады сообщить об открытии продаж второй очереди нашего флагманского проекта в Омске. Доступны квартиры от студий до трёхкомнатных. Специальные условия для первых покупателей.',
    'Открыты продажи второй очереди. Специальные условия для первых покупателей.',
    '/photos/Вид дома 1.jpg',
    1,
    true
  ),
  (
    'Riverside HQ получил премию «Лучший жилой комплекс Тюмени 2024»',
    'Наш проект Riverside HQ был признан лучшим жилым комплексом Тюмени по версии независимой экспертной комиссии. Это подтверждение нашего стремления к качеству.',
    'Riverside HQ — лучший ЖК Тюмени 2024 по версии независимой комиссии.',
    '/photos/Вид дома 3.jpg',
    2,
    true
  ),
  (
    'Умный дом: новые возможности для резидентов',
    'Мы обновили приложение умного дома. Теперь доступно управление климатом, освещением и системой безопасности через единый интерфейс. Обновление доступно всем резидентам.',
    'Обновление приложения умного дома — новые возможности для резидентов.',
    '/photos/Вид дома 5.jpg',
    NULL,
    true
  )
ON CONFLICT DO NOTHING;

-- Камеры
INSERT INTO cameras (project_id, name, stream_url, thumbnail_url, location)
VALUES
  (1, 'Стройплощадка — Корпус А', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/photos/Вид дома 1.jpg', 'Главный въезд'),
  (1, 'Стройплощадка — Корпус Б', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/photos/Вид дома 2.jpg', 'Северная сторона'),
  (2, 'Riverside HQ — Лобби', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/photos/Вид дома 3.jpg', 'Главный вход'),
  (3, 'Grand Park — Двор', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '/photos/Вид дома 4.jpg', 'Внутренний двор')
ON CONFLICT DO NOTHING;
