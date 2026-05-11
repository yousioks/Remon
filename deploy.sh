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

# Первый запуск: получаем SSL-сертификат
if [ ! -d "certbot/conf/live/raemon.ru" ]; then
  echo "🔐 Получаем SSL-сертификат Let's Encrypt..."

  # Запускаем nginx только для HTTP (для верификации домена)
  docker compose -f docker-compose.prod.yml up -d nginx certbot

  # Ждём пока nginx поднимется
  sleep 5

  # Получаем сертификат
    docker run --rm \
      -v /var/www/remon/certbot/conf:/etc/letsencrypt \
      -v /var/www/remon/certbot/www:/var/www/certbot \
      certbot/certbot certonly \
      --webroot \
      --webroot-path=/var/www/certbot \
      --email admin@raemon.ru \
      --agree-tos \
      --no-eff-email \
      -d raemon.ru \
      -d www.raemon.ru

  echo "✅ SSL-сертификат получен!"
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
