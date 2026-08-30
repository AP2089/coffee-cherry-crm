# Coffee Cherry CRM

Админ-панель для управления товарами, заказами и контактами.

**Стек:** Nuxt 3, Vue 3, Pinia, Tailwind CSS

## Требования

- Node.js >= 20
- Запущенный [backend](../backend) на порту `3001`

## Запуск

```bash
npm install
npm run dev
```

Приложение: http://localhost:3003

## Переменные окружения

Файл `.env` в корне проекта.

| Переменная | Описание |
| ---------- | -------- |
| `NUXT_PUBLIC_API_URL` | URL REST API для браузера (CRUD товаров, заказов, контактов) |
| `NUXT_API_URL` | URL API для SSR-запросов на сервере Nuxt |
| `NUXT_PUBLIC_HELPDESK_URL` | URL панели helpdesk (ссылки из CRM в поддержку) |

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер (порт 3003) |
| `npm run build` | Production-сборка |
| `npm run preview` | Просмотр сборки |
| `npm run lint` | ESLint |
