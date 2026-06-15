# Arquitectura del Proyecto

Documento de referencia para el desarrollo. Mantener alineado con el código.

---

## 1. Visión general del monorepo

```
streaming-audio-app/
├── apps/
│   ├── web/                 # React + Vite — panel artista/admin
│   └── mobile/              # React Native + Expo — app oyente (Fase 3)
├── packages/
│   ├── api-client/          # Schemas Zod + cliente HTTP compartido
│   └── tsconfig/            # Configuraciones TypeScript base
├── backend/                 # Spring Boot — monolito modular
├── docs/                    # OpenAPI y documentación técnica
└── scripts/                 # Utilidades de mantenimiento
```

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

## 3. Frontend web — Feature-first (FSD-lite)

### Por qué no FSD estricto

FSD completo (`pages/widgets/features/entities/shared`) aporta más ceremonia de la necesaria para un panel artista + admin con equipo pequeño. Usamos **feature-first** con capas ligeras que capturan el 80% del beneficio.

### Estructura `apps/web/src/`

```
src/
├── app/                    # Shell: router, layouts, providers globales
│   ├── main.tsx
│   ├── App.tsx
│   ├── layouts/
│   └── routes/
├── features/               # Una carpeta por caso de uso / pantalla
│   ├── auth/
│   │   ├── ui/             # Componentes de la feature
│   │   └── model/          # Estado, hooks, lógica local
│   ├── upload-music/
│   ├── artist-stats/
│   ├── artist-declaration/ # Fase 2A
│   └── admin-verification/ # Fase 2B
├── entities/               # Modelos UI reutilizables (song, album, artist)
└── shared/
    ├── api/                # Instancia del cliente + funciones por dominio
    ├── ui/                 # Design system mínimo
    └── lib/                # Utilidades
```

### Reglas de dependencia (frontend)

```
app → features, entities, shared
features → entities, shared
entities → shared
shared → (nada interno)
```

- **Prohibido:** `features/upload-music` importando directamente de `features/auth`  
  → Extraer a `entities` o `shared`
- **Zod obligatorio** para formularios y parseo de respuestas API
- Los schemas viven en `packages/api-client`, no duplicados en cada feature

### Stack Fase 2A

- React 19 + Vite + TypeScript
- react-router-dom (navegación)
- react-hook-form + `@hookform/resolvers/zod` (formularios)
- `@streaming/api-client` (tipos + validación)

---

## 4. Mobile — Feature-first (Fase 3)

Misma filosofía que web, sin capas FSD adicionales:

```
apps/mobile/src/
├── app/
├── features/     # player, search, library, auth
├── entities/
└── shared/       # reutiliza @streaming/api-client
```

---

## 5. Paquete `@streaming/api-client`

Contrato tipado entre frontend y backend.

```
packages/api-client/src/
├── schemas/      # Zod: auth, user, artist, song, playback...
├── client.ts     # createApiClient(), ApiClientError
└── index.ts
```

**Regla:** Todo DTO que cruce el límite HTTP debe tener schema Zod aquí. El backend mantiene OpenAPI en `docs/openapi-v1.yaml`; los schemas Zod son el espejo en TypeScript.

---

## 6. Mapeo módulos backend ↔ features frontend

| Backend module | Feature web (Fase 2A/2B) |
|--------------|--------------------------|
| `auth` + `user` | `features/auth` |
| `artist` | `features/artist-declaration`, `features/artist-stats` |
| `catalog` + `storage` | `features/upload-music` |
| `playback` | `features/artist-stats` (visualización) |
| `admin` | `features/admin-verification` (Fase 2B) |

---

## 7. Fase 2A — Checklist de implementación

- [ ] `features/auth`: registro artista completo con Zod
- [ ] `features/artist-declaration`: firma no-IA
- [ ] `features/upload-music`: crear álbum + subir canciones (multipart)
- [ ] `features/artist-stats`: dashboard reproducciones (gratis vs premium, peso)
- [ ] `entities/`: componentes `SongCard`, `AlbumForm` si se reutilizan
- [ ] `shared/ui/`: inputs, botones, layout base
- [ ] Tests E2E mínimos del flujo de subida

---

## 8. Scripts de mantenimiento

| Script | Uso |
|--------|-----|
| `scripts/refactor-backend-packages.py` | Migración inicial a módulos (ya ejecutado) |
| `scripts/fix-backend-imports.py` | Corrección de imports tras refactor |
| `scripts/add-missing-imports.py` | Añade imports faltantes por tipo |

---

Ver también: [DOC-PLAN-DESARROLLO.md](DOC-PLAN-DESARROLLO.md), [docs/openapi-v1.yaml](docs/openapi-v1.yaml)
