#!/bin/bash
# ============================================================
# Remon Developer — Скрипт деплоя на сервер
# Запускать на сервере после git pull
# ============================================================

set -e

echo "🚀 Начинаем деплой Remon Developer..."

# Проверяем наличие .env
if [ ! -f .env ]; then
  echo "❌ Файл .env не найден!"
  echo "   Скопируйте .env.example в .env и заполните значения:"
  echo "   cp .env.example .env && nano .env"
  exit 1
fi

# Создаём папки для certbot если не существуют
mkdir -p certbot/conf certbot/www

# Проверяем наличие SSL-сертификата
if [ ! -f "certbot/conf/live/raemon.ru/fullchain.pem" ]; then
  echo "🔐 Получаем SSL-сертификат Let's Encrypt..."

  # Останавливаем всё что могло остаться с прошлого запуска
  docker compose -f docker-compose.prod.yml down 2>/dev/null || true

  # Подменяем nginx.conf на HTTP-only версию (без SSL — сертификатов ещё нет)
  cp nginx/nginx.conf nginx/nginx.conf.bak
  cp nginx/nginx.http.conf nginx/nginx.conf

  # Запускаем только nginx (он теперь без SSL — стартует нормально)
  docker compose -f docker-compose.prod.yml up -d nginx

  # Ждём пока nginx поднимется и начнёт слушать порт 80
  echo "⏳ Ждём запуска nginx..."
  sleep 5

  # Проверяем статус контейнеров
  echo "📊 Статус контейнеров:"
  docker compose -f docker-compose.prod.yml ps

  # Проверяем логи nginx
  echo "📝 Логи nginx:"
  docker compose -f docker-compose.prod.yml logs nginx

  # Проверяем что nginx слушает порт 80
  echo "🔍 Проверяем доступность порта 80..."
  if ! curl -s --max-time 5 http://localhost/.well-known/acme-challenge/test > /dev/null 2>&1; then
    echo "⚠️  Порт 80 не отвечает"
    exit 1
  fi

  # Получаем сертификат через webroot
  docker run --rm \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@raemon.ru \
    --agree-tos \
    --no-eff-email \
    -d raemon.ru \
    -d www.raemon.ru

  # Восстанавливаем полный nginx.conf с SSL
  cp nginx/nginx.conf.bak nginx/nginx.conf
  rm nginx/nginx.conf.bak

  # Останавливаем временный nginx
  docker compose -f docker-compose.prod.yml down

  echo "✅ SSL-сертификат получен!"
else
  echo "✅ SSL-сертификат уже существует"
fi

# Собираем и запускаем все сервисы
echo "🔨 Собираем образы..."
docker compose -f docker-compose.prod.yml build --no-cache

echo "▶️  Запускаем контейнеры..."
docker compose -f docker-compose.prod.yml up -d

echo "⏳ Ждём запуска базы данных..."
sleep 10

echo "📊 Статус контейнеров:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Деплой завершён!"
echo "   Сайт доступен по адресу: https://raemon.ru"
echo ""
echo "📋 Полезные команды:"
echo "   Логи:    docker compose -f docker-compose.prod.yml logs -f"
echo "   Стоп:    docker compose -f docker-compose.prod.yml down"
echo "   Рестарт: docker compose -f docker-compose.prod.yml restart"
