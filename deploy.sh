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

  # Убиваем всё что может занимать порт 80
  docker ps -q | xargs -r docker stop 2>/dev/null || true

  # Запускаем временный nginx напрямую (без compose-зависимостей)
  # Используем HTTP-only конфиг — без SSL, сертификатов ещё нет
  echo "⏳ Запускаем временный nginx для получения сертификата..."
  docker run -d --name nginx-certbot-tmp \
    -p 80:80 \
    -v "$(pwd)/nginx/nginx.http.conf:/etc/nginx/nginx.conf:ro" \
    -v "$(pwd)/certbot/www:/var/www/certbot:ro" \
    nginx:alpine

  # Ждём пока nginx поднимется
  sleep 3

  # Проверяем что nginx слушает порт 80
  echo "🔍 Проверяем доступность порта 80..."
  if ! curl -sf --max-time 10 http://localhost/ > /dev/null 2>&1; then
    echo "❌ Nginx не отвечает на порту 80. Логи:"
    docker logs nginx-certbot-tmp
    docker rm -f nginx-certbot-tmp 2>/dev/null || true
    exit 1
  fi
  echo "✅ Nginx слушает порт 80"

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

  # Останавливаем временный nginx
  docker rm -f nginx-certbot-tmp

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
