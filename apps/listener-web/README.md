# Web oyente — Escuchar música

Cliente **oyente** en navegador: descubrir, buscar, reproducir y biblioteca.

Equivalente web de la app móvil. Inspiración: spotify.com / tidal.com.

**No confundir con** `apps/artist-web` (portal artista/admin).

## Arquitectura (feature-first)

```
src/
  app/           # Router, layout oyente, barra de reproducción
  features/
    discover/    # Home, destacados
    search/
    player/      # Reproductor (Fase 3A)
    library/     # Favoritos, playlists
    auth/        # Login/registro USER
  entities/
  shared/
```

## Arranque

```bash
pnpm install
cp apps/listener-web/.env.example apps/listener-web/.env
pnpm listener:web:dev
```

## Modos de escucha

| Modo | Requisito | Qué puede hacer |
|------|-----------|-----------------|
| **Sin cuenta** | Ninguno | Preview 30s por canción |
| **Gratis** | Registro `/register` | Canción completa, favoritos, plays cuentan (peso 0.25) |
| **Premium** | Suscripción activa | Canción completa, calidad alta (MVP: mismo archivo; Stripe en Fase 4) |

Ver [docs/PREMIUM-DEV.md](docs/PREMIUM-DEV.md) para simular premium en local.

| URL local | Puerto |
|-----------|--------|
| Oyente web | http://localhost:5174 |
| Portal artista | http://localhost:5173 (`artist-web`) |

## Producción (objetivo)

- Oyente: dominio principal (`streamingetico.com`)
- Artistas: subdominio o ruta dedicada (`artistas.streamingetico.com` o `/portal`)
