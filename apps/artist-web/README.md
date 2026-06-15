# Portal artista y admin

Cliente **artista** (y operación **admin**) en navegador: subir catálogo, estadísticas, declaración no-IA, verificación.

Inspiración: Spotify for Artists / TIDAL for Artists — **región y login dedicados**, separados del producto oyente.

**No confundir con** `apps/listener-web` (escuchar música).

## Arquitectura (feature-first)

```
src/
  app/                 # Router, layouts, providers
  features/
    auth/              # Login/registro ARTIST
    upload-music/
    artist-stats/
    artist-declaration/
    admin-verification/   (Fase 2B)
  entities/
  shared/
```

## Arranque

```bash
pnpm install
cp apps/artist-web/.env.example apps/artist-web/.env
pnpm artist:dev
```

| URL local | Puerto |
|-----------|--------|
| Portal artista | http://localhost:5173 |
| Oyente web | http://localhost:5174 (`listener-web`) |

## Panel admin (Fase 2B)

Rutas protegidas con rol `ADMIN`:

| Ruta | Función |
|------|---------|
| `/admin` | Resumen global (usuarios, plays del mes, pendientes) |
| `/admin/verification` | Verificar artistas nuevos |
| `/admin/moderation` | Activar/suspender artistas y canciones |

Ver [docs/ADMIN-DEV.md](docs/ADMIN-DEV.md) para crear un usuario admin en local.

- Portal artista: `artistas.<dominio>` o ruta `/portal`
- Solo roles `ARTIST` y `ADMIN`; redirección si entra un oyente sin permisos
