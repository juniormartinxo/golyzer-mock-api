# Golyzer Mock API

Servidor Fastify standalone que simula as APIs usadas pelo Golyzer.

## Instalação

```bash
pnpm install
pnpm dev
```

Servidor padrão: `http://localhost:3001`

## Qualidade

```bash
pnpm lint
pnpm lint:fix
pnpm format
pnpm format:check
pnpm typecheck
pnpm test
pnpm test:watch
```

## Variáveis de Ambiente

- `PORT`: porta do servidor (padrão: 3001)
- `HOST`: host do servidor (padrão: 0.0.0.0)
- `JWT_SECRET`: chave secreta JWT para tokens mock
- `TOKEN_TTL`: tempo de vida do JWT (padrão: 1h)
- `MOCK_AUTH_REQUIRED`: defina como `false` para ignorar verificações de autenticação
- `MOCK_AUTH_USERNAME`: sobrescreve o usuário de login mock (padrão: fixture)
- `MOCK_AUTH_PASSWORD`: sobrescreve a senha de login mock (padrão: fixture)
- `PROXY_MODE`: modo do proxy (`record`, `replay`, `passthrough`)
- `BASE_API_URL`: URL real da BASE API (para record/passthrough)
- `GOLYZER_API_URL`: URL real da GOLYZER API (para record/passthrough)
- `DATA_API_URL`: URL real da DATA API (para record/passthrough)
- `RECORDINGS_DIR`: diretório para armazenar gravações (padrão: `recordings`)

## Proxy de Gravação

Captura respostas da API real automaticamente para gerar fixtures.

### Modos

| Modo | Descrição |
|------|-----------|
| `record` | Proxy para API real + salva respostas em `recordings/` |
| `replay` | Usa gravações salvas (modo offline) |
| `passthrough` | Apenas proxy, sem gravação |

### Uso

```bash
# Modo record: captura respostas da API real
pnpm dev:record

# Modo replay: usa fixtures salvas (padrão)
pnpm dev:replay

# Passthrough: proxy transparente
pnpm dev:passthrough
```

### Estrutura das Gravações

```
recordings/
├── base-api/
│   └── authentication_POST.json
├── golyzer-api/
│   ├── panels_GET.json
│   └── panels_{id}_GET.json
└── data-api/
    └── query_fetch_POST.json
```

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

## Usar com o Golyzer

Atualize o `.env.local` do Golyzer:

```bash
NEXT_PUBLIC_GOLYZER_API_URL="http://localhost:3001"
NEXT_PUBLIC_BASE_API_URL="http://localhost:3001"
NEXT_PUBLIC_DATA_API_URL="http://localhost:3001"
```

## Exemplo de Login

```bash
curl -X POST http://localhost:3001/authentication \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```
