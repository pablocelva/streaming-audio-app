# Arquitectura del Proyecto

Documento de referencia para el desarrollo. Mantener alineado con el código.

---

## 1. Visión general del monorepo

Modelo **dos productos** (oyente + artista), como Spotify/Tidal:

```
streaming-audio-app/
├── apps/
│   ├── listener-web/        # Web oyente — escuchar, buscar, biblioteca (Fase 3A)
│   ├── listener-mobile/     # App oyente — Expo iOS/Android (Fase 3B)
│   └── artist-web/          # Portal artista + admin — subir, stats (Fase 2A/2B)
├── packages/
│   ├── api-client/          # Schemas Zod + cliente HTTP compartido
│   └── tsconfig/            # Configuraciones TypeScript base
├── backend/                 # Spring Boot — monolito modular (API única)
├── docs/                    # OpenAPI y documentación técnica
└── scripts/                 # Utilidades de desarrollo local (arranque backend)
```

| App | Puerto local | Rol | Producción (objetivo) |
|-----|--------------|-----|------------------------|
| `listener-web` | 5174 | `USER` | Dominio principal |
| `artist-web` | 5173 | `ARTIST`, `ADMIN` | `artistas.<dominio>` o `/portal` |
| `listener-mobile` | Expo | `USER` | App Store / Play Store |

**Futuro:** `artist-mobile` (gestión artista en móvil) — post-MVP.

**Gestor de paquetes frontend:** pnpm workspaces  
**Validación de datos frontend:** Zod (schemas en `@streaming/api-client`)

---

## 2. Backend — Monolito modular por dominio

### Principio

Un solo despliegue (monolito), organizado por **bounded contexts** con capas internas. No microservicios en MVP.

### Estructura de paquetes Java

```
com.streamingethico/
├── StreamingAudioApplication.java
├── shared/
│   ├── config/          # Security, OpenAPI, AppProperties, MinIO
│   ├── security/        # JWT, UserPrincipal, filtros
│   ├── domain/          # Enums y excepciones compartidas
│   ├── common/          # Utilidades (HashUtils)
│   └── web/             # GlobalExceptionHandler
└── modules/
    ├── auth/
    │   ├── api/             # Controllers + DTOs
    │   ├── application/       # Casos de uso (AuthService)
    │   ├── domain/          # Entidades de dominio
    │   └── infrastructure/  # Repositorios JPA
    ├── user/
    ├── artist/
    ├── catalog/
    ├── playback/
    ├── library/
    ├── storage/
    └── admin/
```

### Capas por módulo

| Capa | Responsabilidad | Ejemplo |
|------|-----------------|---------|
| `api` | HTTP, DTOs, validación de entrada | `AuthController`, `LoginRequest` |
| `application` | Orquestación, reglas de negocio | `AuthService`, `PlaybackValidationService` |
| `domain` | Entidades, invariantes | `User`, `PlaybackEvent` |
| `infrastructure` | BD, storage, adapters | `UserRepository`, `StorageService` |

### Reglas de dependencia (backend)

- `api` → `application` → `domain`
- `infrastructure` → `domain`
- `application` puede usar `infrastructure` y otros módulos vía sus servicios públicos
- `domain` **no importa** Spring ni JPA en ideal; en MVP las entidades usan JPA por pragmatismo
- `shared` es transversal; los módulos no dependen entre sí directamente en `domain`

### Evolución futura

- **Spring Modulith** cuando haya eventos entre módulos (`SongUploaded`, `PlaybackRecorded`)
- Extraer módulos solo bajo presión real de escala (p. ej. ingestión de plays)

---

## 3. Frontend — Feature-first (FSD-lite)

Misma filosofía en **cada app** (`listener-web`, `artist-web`, `listener-mobile`).  
**Prohibido** mezclar pantallas oyente y artista en la misma app.

### Estructura tipo `apps/<app>/src/`

```
src/
├── app/                    # Router, layouts, providers
├── features/               # Un caso de uso por carpeta
├── entities/               # Modelos UI reutilizables (song, album, artist)
└── shared/
    ├── api/                # Cliente HTTP (usa @streaming/api-client)
    ├── ui/
    └── lib/
```

### Reglas de dependencia (frontend)

```
app → features, entities, shared
features → entities, shared
entities → shared
shared → (nada interno)
```

- **Prohibido:** `features/A` importando `features/B` directamente
- **Zod obligatorio** para formularios y parseo de respuestas API
- Los schemas viven en `packages/api-client`

### `artist-web` — Portal artista/admin (Fase 2)

```
features/
  auth/                  # Login/registro ARTIST
  artist-declaration/
  upload-music/
  artist-stats/
  admin-verification/    # Fase 2B
```

### `listener-web` — Cliente oyente web (Fase 3A)

```
features/
  discover/              # Home, destacados
  search/
  player/                # Reproductor
  library/               # Favoritos, playlists
  auth/                  # Login/registro USER
```

### Stack

- React 19 + Vite + TypeScript
- react-router-dom
- react-hook-form + `@hookform/resolvers/zod`
- `@streaming/api-client`

---

## 4. Mobile oyente — `listener-mobile` (Fase 3B)

```
apps/listener-mobile/src/
├── app/
├── features/     # discover, search, player, library, auth
├── entities/
└── shared/       # reutiliza @streaming/api-client
```

Paridad funcional con `listener-web` en el MVP.

---

## 5. Paquete `@streaming/api-client`

Contrato tipado entre **todos** los clientes y el backend.

```
packages/api-client/src/
├── schemas/      # Zod: auth, user, artist, song, playback...
├── client.ts     # createApiClient(), ApiClientError
└── index.ts
```

**Regla:** Todo DTO que cruce el límite HTTP debe tener schema Zod aquí.

---

## 6. Mapeo backend ↔ clientes frontend

| Backend module | Cliente oyente (`listener-*`) | Portal artista (`artist-web`) |
|----------------|------------------------------|-------------------------------|
| `auth` + `user` | Registro/login `USER` | Registro/login `ARTIST` |
| `catalog` | Descubrir, buscar, stream URL | Subir álbumes/canciones |
| `playback` | Registrar escucha | — |
| `library` | Favoritos, playlists | — |
| `artist` | — | Declaración, perfil, stats |
| `admin` | — | Verificación, moderación |

---

## 7. Checklist por fase

### Fase 2A — `artist-web` (portal artista)

- [x] `features/auth`: registro artista completo con Zod
- [x] `features/artist-declaration`: firma no-IA
- [x] `features/upload-music`: crear álbum + subir canciones (multipart)
- [x] `features/artist-stats`: dashboard reproducciones (gratis vs premium, peso)
- [x] Enlace cruzado al producto oyente (`listener-web`)
- [ ] `entities/`, `shared/ui/`, tests E2E subida

### Fase 2B — `artist-web` (admin)

- [x] `features/admin-verification`: resumen global
- [x] Cola de verificación de artistas
- [x] Moderación: activar/suspender artistas y canciones

### Fase 3A — `listener-web` (oyente web)

- [x] `features/discover`: catálogo destacado
- [x] `features/search`
- [x] `features/player`: streaming con tier guest/free/premium
- [x] `features/library`: favoritos (requiere cuenta)
- [x] `features/auth`: registro/login USER
- [x] Escucha sin cuenta (preview 30s), cuenta gratis (completa), premium (alta calidad MVP)

### Fase 3B — `listener-mobile`

- [x] Scaffold Expo + expo-router
- [x] Paridad con 3A: inicio, búsqueda, biblioteca, login/registro
- [x] Reproductor `expo-av` con tier guest/free/premium
- [x] Background playback (config base; validar en dispositivo)

---

## 8. Scripts de desarrollo local

| Script | Uso |
|--------|-----|
| `scripts/run-backend.sh` | Arranca el backend |
| `scripts/stop-backend.sh` | Detiene el proceso en `API_PORT` |
| `scripts/status-backend.sh` | Comprueba si el backend ya está corriendo |

---

Ver también: [DOC-PLAN-DESARROLLO.md](DOC-PLAN-DESARROLLO.md), [docs/openapi-v1.yaml](docs/openapi-v1.yaml)
