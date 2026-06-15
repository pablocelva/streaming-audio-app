# Web — Panel Artista y Admin

React + Vite + TypeScript + **pnpm** + **Zod**.

## Arquitectura (feature-first)

```
src/
  app/                 # Router, layouts, providers
  features/            # Casos de uso por pantalla
    auth/
    upload-music/
    artist-stats/
    artist-declaration/   (Fase 2A)
    admin-verification/   (Fase 2B)
  entities/            # Modelos de dominio UI (song, album, artist)
  shared/
    api/               # Cliente HTTP (usa @streaming/api-client)
    ui/                # Componentes reutilizables
    lib/               # Utilidades
```

## Reglas de dependencia

- `features` → puede importar `entities` y `shared`
- `entities` → solo `shared`
- `app` → `features`, `entities`, `shared`
- **Prohibido:** `features/A` importando `features/B` directamente (extraer a `entities` o `shared`)

## Arranque

```bash
# Desde la raíz del monorepo
pnpm install
cp apps/web/.env.example apps/web/.env
pnpm --filter web dev
```

## Paquetes compartidos

- `@streaming/api-client` — schemas Zod + cliente HTTP
