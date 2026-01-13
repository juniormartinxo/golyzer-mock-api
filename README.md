# Golyzer Mock API

Servidor Fastify standalone que simula as APIs usadas pelo Golyzer.

## Instalação

```bash
pnpm install
pnpm dev
```

Servidor padrão: `http://localhost:3001`

## Docker

### Build e execução

```bash
docker build -t golyzer-mock-api .
docker run --rm -p 3001:3001 \
  -v "$(pwd)/recordings:/app/recordings" \
  golyzer-mock-api
```

### Docker Compose

```bash
docker compose up --build
```

O `docker-compose.yaml` carrega variáveis do `.env`. Defina `PROXY_MODE` e as URLs reais quando precisar gravar fixtures.

Use `PROXY_MODE=record` e defina as URLs reais (`BASE_API_URL`, `GOLYZER_API_URL`, `DATA_API_URL`) quando quiser gravar novas fixtures.

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
- `PROXY_MODE`: modo do proxy (`record`, `force-record`, `replay`, `passthrough`)
- `BASE_API_URL`: URL real da BASE API (para record/passthrough)
- `GOLYZER_API_URL`: URL real da GOLYZER API (para record/passthrough)
- `DATA_API_URL`: URL real da DATA API (para record/passthrough)
- `RECORDINGS_DIR`: diretório para armazenar gravações (padrão: `recordings`)

## Proxy de Gravação

Captura respostas da API real automaticamente para gerar fixtures.

### Modos

| Modo | Descrição |
|------|-----------|
| `record` | Proxy para API real + salva respostas (usa existente se houver) |
| `force-record` | Proxy para API real + **sempre sobrescreve** gravações |
| `replay` | Usa gravações salvas (modo offline) |
| `passthrough` | Apenas proxy, sem gravação |

### Uso

```bash
# Modo record: captura respostas da API real (preserva existentes)
pnpm dev:record

# Modo force-record: sempre sobrescreve gravações
pnpm dev:force-record

# Modo replay: usa fixtures salvas (padrão)
pnpm dev:replay

# Passthrough: proxy transparente
pnpm dev:passthrough
```

### Estrutura das Gravações

As gravações são organizadas por API de destino. Para requisições POST/PUT/PATCH, um hash MD5 do body é incluído no nome do arquivo para distinguir payloads diferentes:

```
recordings/
├── base-api/
│   ├── authentication_POST.json
│   ├── authentication_POST_1d02daee.json  # hash do body
│   └── v1_datasets_GET.json
├── golyzer-api/
│   ├── panels_GET.json
│   ├── panels_{uuid}_GET.json
│   └── authorization_display-map_GET.json
└── data-api/
    ├── query_fetch_POST_a1b2c3d4.json  # hash do body
    └── query_fetch_POST_b5c6d7e8.json  # payload diferente
```

> **Nota:** Os arquivos JSON em `recordings/` contêm dados sensíveis e são ignorados pelo Git.

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
