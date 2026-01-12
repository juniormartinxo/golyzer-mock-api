# Changelog

Todas as alterações notáveis deste projeto serão documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

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
