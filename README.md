# Plataforma de Streaming Musical Ético

Monorepo para la plataforma de streaming orientada a artistas independientes.

## Documentación

- [Plan de Desarrollo](DOC-PLAN-DESARROLLO.md) — fases y reglas de negocio
- [Arquitectura](DOC-ARQUITECTURA.md) — estructura backend, frontend y monorepo
- [Resumen Ejecutivo Legal](DOC-EJECUTIVA-LEGAL.md)
- [Contrato API v1](docs/openapi-v1.yaml)

## Estructura del monorepo

```
apps/
  listener-web/     → Web oyente (escuchar, biblioteca) — Fase 3A
  listener-mobile/  → App oyente iOS/Android — Fase 3B
  artist-web/       → Portal artista + admin — Fase 2A/2B
packages/
  api-client/       → Schemas Zod + cliente HTTP compartido
  tsconfig/         → Configs TypeScript
backend/            → Spring Boot monolito modular
docs/               → OpenAPI
```

**Dos productos:** el oyente usa `listener-*`; el artista/admin usa `artist-web` (login y URL dedicados, estilo Spotify for Artists).

## Requisitos locales

- Docker y Docker Compose
- Java 21 + Maven 3.9+ (backend)
- Node.js 20+ y **pnpm** (frontend)
- Validación frontend con **Zod** (`@streaming/api-client`)

## Arranque rápido

```bash
cp .env.example .env
docker compose up -d

# Backend (recomendado: libera puerto previo automáticamente)
./scripts/run-backend.sh

# Frontend — dos terminales recomendadas
pnpm install
cp apps/artist-web/.env.example apps/artist-web/.env
cp apps/listener-web/.env.example apps/listener-web/.env

# En .env usa VITE_API_URL=/api/v1 (relativo). URL absoluta al backend causa CORS en local.

pnpm artist:dev          # Portal artista → http://localhost:5173
pnpm listener:web:dev    # Web oyente    → http://localhost:5174
```

| Servicio | URL | Quién |
|----------|-----|-------|
| API | http://localhost:8081/api/v1 | Todos |
| Swagger | http://localhost:8081/api/v1/docs | Dev |
| Portal artista | http://localhost:5173 | Artistas / Admin |
| Web oyente | http://localhost:5174 | Oyentes |

## CI en GitHub

El workflow `.github/workflows/ci.yml` ejecuta en cada push a `main`:

- **backend:** `mvn verify` (tests con H2 en memoria)
- **frontend:** `pnpm install` + typecheck

Si ves **CI fallido** en el repositorio:

1. Abre **Actions** → el run fallido → revisa qué job falló (backend o frontend).
2. Si ambos fallan en pocos segundos sin logs útiles, comprueba en **Settings → Actions** que GitHub Actions esté **habilitado** en el repo.
3. Reproduce localmente: `cd backend && mvn verify` y `pnpm api:typecheck && pnpm --filter artist-web typecheck && pnpm --filter listener-web typecheck`.

El badge rojo no afecta el desarrollo local; indica que el último push no pasó las comprobaciones automáticas.

## Modelo de regalías (resumen)

- Fondo mensual = ingresos netos de suscripciones premium.
- Reproducciones ponderadas: premium **1.0**, gratuito **0.25**.
- Tope máximo por artista: **20%** del fondo neto.
