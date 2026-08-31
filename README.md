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

### Docker

Сначала запустите backend, затем:

```bash
docker compose up -d --build
```

## Переменные окружения

Файл `.env` в корне проекта.

| Переменная     | Описание                                     |
| -------------- | -------------------------------------------- |
| `PORT`         | Порт приложения                              |
| `NODE_ENV`     | Режим работы: `development` или `production` |
| `API_URL`      | URL REST API для браузера и SSR              |
| `HELPDESK_URL` | URL панели helpdesk                          |

## Скрипты

| Команда           | Описание               |
| ----------------- | ---------------------- |
| `npm run dev`     | Dev-сервер (порт 3003) |
| `npm run build`   | Production-сборка      |
| `npm run preview` | Просмотр сборки        |
| `npm run lint`    | ESLint                 |
