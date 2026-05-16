# Remon Developer Site

Сайт агентства недвижимости на Next.js 15, React 19, TypeScript, TailwindCSS. Содержит намеренные уязвимости для демонстрации защиты MISTRAL Defense Agent.

## Запуск

```bash
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

## Защита

- **MISTRAL WAF** (`backend/src/middleware/mistral-waf.ts`) — обнаруживает SQLi, XSS, Path Traversal, Command Injection, DDoS, brute-force, массовое присвоение ролей. Отправляет атаки на MISTRAL Server.
- **DOMPurify** (`backend/src/utils/sanitize.ts`, `frontend/src/lib/sanitize.ts`) — очистка пользовательского ввода от XSS.
- **Rate limiting** — 200 req/15min общий, 50 req/15min для auth.
- **Helmet** — security headers.

## Структура

```
.
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   └── mistral-waf.ts
│   │   ├── routes/
│   │   └── utils/
│   │       ├── jwt.ts
│   │       └── sanitize.ts
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
├── nginx/
├── docker-compose.yml
└── docker-compose.prod.yml
```
