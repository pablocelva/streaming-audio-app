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
  web/              → React + Vite (panel artista/admin)
  mobile/           → React Native + Expo (Fase 3)
packages/
  api-client/       → Schemas Zod + cliente HTTP compartido
  tsconfig/         → Configs TypeScript
backend/            → Spring Boot monolito modular
docs/               → OpenAPI
```

## Requisitos locales

- Docker y Docker Compose
- Java 21 + Maven 3.9+ (backend)
- Node.js 20+ y **pnpm** (frontend)
- Validación frontend con **Zod** (`@streaming/api-client`)

## Arranque rápido

```bash
cp .env.example .env
docker compose up -d

# Backend
cd backend && mvn spring-boot:run

# Frontend (otra terminal, desde la raíz)
pnpm install
cp apps/web/.env.example apps/web/.env
pnpm web:dev
```

| Servicio | URL |
|----------|-----|
| API | http://localhost:8080/api/v1 |
| Swagger | http://localhost:8080/api/v1/docs |
| Panel web | http://localhost:5173 |

## Modelo de regalías (resumen)

- Fondo mensual = ingresos netos de suscripciones premium.
- Reproducciones ponderadas: premium **1.0**, gratuito **0.25**.
- Tope máximo por artista: **20%** del fondo neto.
