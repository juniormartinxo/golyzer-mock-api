# Golyzer Mock API

Standalone Fastify server that mocks the APIs used by Golyzer.

## Setup

```bash
pnpm install
pnpm dev
```

Default server: `http://localhost:3001`

## Quality

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:watch
```

## Environment

- `PORT`: server port (default: 3001)
- `HOST`: server host (default: 0.0.0.0)
- `JWT_SECRET`: JWT secret for mock tokens
- `TOKEN_TTL`: JWT TTL (default: 1h)
- `MOCK_AUTH_REQUIRED`: set to `false` to bypass auth checks

## Endpoints

- `POST /authentication`
- `GET /authentication/refresh-token/:token`
- `GET /me`
- `GET /panels`
- `POST /panels`
- `GET /panels/:id`
- `PUT /panels/:id`
- `DELETE /panels/:id`
- `PUT /panels/:id/images`
- `GET /charts/models/custom`
- `POST /charts/models/custom`
- `DELETE /charts/models/custom/:id`
- `PATCH /charts/models/custom/rename/:id`
- `GET /charts/most-used`
- `POST /query/fetch`

## Use with Golyzer

Update the Golyzer `.env.local`:

```bash
NEXT_PUBLIC_GOLYZER_API_URL="http://localhost:3001"
NEXT_PUBLIC_BASE_API_URL="http://localhost:3001"
NEXT_PUBLIC_DATA_API_URL="http://localhost:3001"
```

## Sample login

```bash
curl -X POST http://localhost:3001/authentication \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```
