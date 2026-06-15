# Plataforma de Streaming Musical Ético

Monorepo para la plataforma de streaming orientada a artistas independientes.

## Documentación

- [Plan de Desarrollo](DOC-PLAN-DESARROLLO.md) — fuente de verdad técnica
- [Resumen Ejecutivo Legal](DOC-EJECUTIVA-LEGAL.md) — modelo de negocio y requisitos legales
- [Contrato API v1](docs/openapi-v1.yaml) — especificación OpenAPI

## Estructura del monorepo

```
backend/    → Spring Boot (API REST)
web/        → React + Vite (panel artista y admin)
mobile/     → React Native + Expo (app oyente)
docs/       → Contratos y documentación técnica
```

## Decisiones Fase 0

| Decisión | Elección MVP | Motivo |
|----------|--------------|--------|
| Object storage | **MinIO local** + **Cloudflare R2** en staging/prod | S3-compatible, sin egress fees en R2, MinIO para desarrollo local sin coste |
| Base de datos | PostgreSQL 16 | Integridad relacional, full-text básico |
| API | REST `/api/v1` | OpenAPI 3 como contrato entre clientes y backend |

## Requisitos locales

- Docker y Docker Compose
- Java 21 (Fase 1)
- Node.js 20+ (Fases 2 y 3)

## Arranque rápido (infra local)

```bash
cp .env.example .env
docker compose up -d
```

Servicios:
- PostgreSQL: `localhost:5432`
- MinIO (S3 API): `localhost:9000` — consola en `localhost:9001`

## Modelo de regalías (resumen)

- Fondo mensual = ingresos netos de suscripciones premium.
- Reproducciones válidas ponderadas: premium **1.0**, gratuito **0.25**.
- Tope máximo por artista: **20%** del fondo neto.
- Detalle completo en `DOC-PLAN-DESARROLLO.md` sección 2.
