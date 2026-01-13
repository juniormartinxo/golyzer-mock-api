# Changelog

Todas as alterações notáveis deste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [Unreleased]

### Adicionado

- Dockerfile com build multi-stage para execução em container
- docker-compose com volume para gravações e suporte a `.env` via `env_file`
- `.dockerignore` para reduzir o contexto de build
- Documentação de uso via Docker no README

## [1.2.0] - 2026-01-12

### Adicionado

- **Modo `force-record`**: novo modo de proxy que sempre sobrescreve gravações existentes
  - Script `pnpm dev:force-record`
- **Hash MD5 do body**: requisições POST/PUT/PATCH geram arquivos únicos baseados no payload
  - Permite gravar múltiplas queries diferentes para o mesmo endpoint
  - Exemplo: `query_fetch_POST_a1b2c3d4.json`
- Suporte a novas rotas no proxy:
  - `/v1/datasets`, `/v1/datasets/flat`, `/v1/datasets/preferences` → BASE_API
  - `/authorization/*` → GOLYZER_API

### Corrigido

- **Modo replay não funcionava**: refatorado `preHandler` para interceptar requisições corretamente
- **Rotas 404**: corrigido mapeamento de rotas que não eram reconhecidas pelo proxy
- **Rotas locais interceptando proxy**: modificadas rotas de auth e panels para permitir interceptação

### Alterado

- Gravações JSON agora são ignoradas pelo Git (contêm dados sensíveis)
- Mensagem de erro amigável quando gravação não existe em modo replay

### Arquivos Modificados

- `src/middleware/proxy.ts`: lógica refatorada para todos os modos
- `src/services/recorder.ts`: hash MD5 do body no nome do arquivo
- `src/types/proxy.ts`: adicionado tipo `force-record`
- `src/routes/auth.routes.ts`: handler catch-all para proxy
- `src/routes/panels.routes.ts`: handler catch-all para proxy
- `package.json`: script `dev:force-record`
- `.gitignore`: ignorar `recordings/**/*.json`

---

## [1.1.0] - 2026-01-11

### Adicionado

- **Recording Proxy**: sistema de proxy que captura responses da API real
  - Modo `record`: encaminha para API real e grava responses em `recordings/`
  - Modo `replay`: usa fixtures gravadas (funciona offline)
  - Modo `passthrough`: proxy transparente sem gravação
- Novos scripts npm: `dev:record`, `dev:replay`, `dev:passthrough`
- Arquivo `.env.example` com todas as variáveis de ambiente
- Novos arquivos:
  - `src/types/proxy.ts`: tipos e configuração do proxy
  - `src/services/recorder.ts`: serviço de gravação/leitura de fixtures
  - `src/middleware/proxy.ts`: middleware de proxy Fastify

### Alterado

- `src/server.ts`: registrado plugin de proxy
- `package.json`: adicionados scripts de proxy

---

## [1.0.0] - 2026-01-11

### Adicionado

- Servidor Fastify mock standalone
- Autenticação JWT mock (`/authentication`)
- Endpoints de usuário (`/me`)
- CRUD de painéis (`/panels`)
- Endpoints de gráficos customizados (`/charts`)
- Query engine mock (`/query/fetch`)
- Fixtures JSON para dados de exemplo
- Configuração Biome para linting/formatting
- Suporte a TypeScript com tsx
