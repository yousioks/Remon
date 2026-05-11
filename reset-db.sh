#!/bin/bash
# ============================================================
# Сброс / восстановление базы данных Remon
# Запускать на сервере: bash reset-db.sh [--soft]
#
# --soft  — не удалять том, только сбросить пароль и применить
#           init.sql вручную (если том уже существует)
# (без флага) — полный сброс: удалить том и пересоздать БД
# ============================================================
set -e

DB_USER="${POSTGRES_USER:-remon_user}"
DB_PASS="${POSTGRES_PASSWORD:-remon_pass}"
DB_NAME="${POSTGRES_DB:-remon_db}"

if [[ "$1" == "--soft" ]]; then
  echo "🔧 Мягкий режим: сбрасываем пароль без удаления данных..."
  docker compose up -d db
  echo "⏳ Ждём запуска PostgreSQL (15 сек)..."
  sleep 15

  echo "🔑 Меняем пароль пользователя ${DB_USER} через trust-режим..."
  # Временно отключаем аутентификацию, чтобы не зависеть от текущего пароля в БД
  docker compose exec db sed -i 's/scram-sha-256/trust/g' /var/lib/postgresql/data/pg_hba.conf
  docker compose exec db psql -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT pg_reload_conf();" 2>/dev/null || true
  sleep 2
  docker compose exec db psql -U "${DB_USER}" -d "${DB_NAME}" -c "ALTER USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
  # Возвращаем scram-sha-256
  docker compose exec db sed -i 's/trust/scram-sha-256/g' /var/lib/postgresql/data/pg_hba.conf
  docker compose exec db psql -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT pg_reload_conf();" 2>/dev/null || true
  sleep 1

  echo "📋 Применяем init.sql (CREATE TABLE IF NOT EXISTS — безопасно)..."
  docker compose exec -T db psql -U "${DB_USER}" -d "${DB_NAME}" < init.sql

  echo "🚀 Запускаем все сервисы..."
  docker compose up -d

  echo "✅ Готово! Проверяем подключение..."
  sleep 5
  docker compose exec db psql -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT COUNT(*) FROM users;" \
    && echo "✅ БД работает корректно!" || echo "❌ Ошибка подключения к БД"
else
  echo "⚠️  ПОЛНЫЙ СБРОС: все данные будут удалены!"
  echo "Останавливаем контейнеры..."
  docker compose down

  echo "🗑️  Удаляем том postgres_data..."
  docker volume rm remon_postgres_data 2>/dev/null \
    || docker volume rm "$(docker volume ls -q | grep postgres_data)" 2>/dev/null \
    || true

  echo "🚀 Запускаем контейнеры (БД инициализируется из init.sql)..."
  docker compose up -d

  echo "⏳ Ждём готовности БД (30 сек)..."
  sleep 30

  echo "✅ Проверяем подключение к БД..."
  docker compose exec db psql -U "${DB_USER}" -d "${DB_NAME}" -c "SELECT COUNT(*) FROM users;" \
    && echo "✅ БД работает корректно!" || echo "❌ Ошибка подключения к БД"
fi

echo ""
echo "📋 Последние логи БД:"
docker compose logs db --tail=20
