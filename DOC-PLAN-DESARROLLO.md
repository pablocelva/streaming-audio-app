# Plan Maestro de Desarrollo: Plataforma de Streaming Musical Ético

## 1. Visión Técnica y Stack Tecnológico

El proyecto se desarrollará de forma iterativa utilizando Inteligencia Artificial asistida (Cursor) para acelerar la generación de código boilerplate y pruebas. La arquitectura prioriza la escalabilidad, la seguridad de los archivos de audio y la transparencia en los datos financieros.

### Stack Definido

- **Backend:** Java con Spring Boot (arquitectura modular, seguridad robusta, gestión transaccional).
- **Base de Datos:** PostgreSQL (integridad relacional para metadatos y transacciones financieras).
- **Frontend Web** (Panel Artista y Admin): React con TypeScript y Vite.
- **Aplicación Móvil MVP:** React Native con Expo (despliegue rápido en iOS y Android desde una sola base de código).
- **Almacenamiento de Audio:** Servicio de almacenamiento de objetos externo con CDN. MVP: **Cloudflare R2** o **AWS S3** (S3-compatible). No se almacenarán archivos binarios en la base de datos.
- **Pagos:** Stripe (modo prueba en desarrollo, producción en Fase 4).
- **API:** REST versionada (`/api/v1`) con contrato **OpenAPI 3** generado desde Spring Boot.
- **Repositorio:** Monorepo pnpm — `apps/web`, `apps/mobile`, `packages/api-client`, `backend/`.
- **CI/CD:** GitHub Actions (build + tests en cada PR desde Fase 1).
- **Entornos:** `local` → `staging` → `prod` (configurados desde Fase 1).

### Futuro (post-MVP)

- Migración del cliente Android a Kotlin Nativo para optimización de rendimiento.
- iOS se mantendrá en React Native o se evaluará especialista según evolución del proyecto.
- Colas asíncronas (RabbitMQ/Kafka) si el volumen de reproducciones lo exige.
- Motor de búsqueda dedicado (Elasticsearch) si PostgreSQL full-text no escala.

---

## 2. Reglas de Negocio Técnicas (Fuente de Verdad)

Estas reglas deben implementarse de forma consistente en backend, paneles y app móvil.

### 2.1 Modelo de ingresos

- **Plan Gratuito:** Acceso limitado (calidad de audio reducida, posible publicidad futura). No paga suscripción.
- **Plan Premium:** Cuota mensual fija. Financia el fondo de regalías tras descontar costes operativos.

### 2.2 Regalías: reproducciones ponderadas (premium pesa más)

**Decisión de producto:** Tanto oyentes gratuitos como premium generan reproducciones válidas para regalías, pero con **pesos distintos**. Las reproducciones premium influyen más en el reparto porque son quienes financian el fondo.

| Plan del oyente | Peso (`peso_regalias`) | Equivalencia |
|-----------------|------------------------|--------------|
| Premium         | **1.0**                | Referencia base |
| Gratuito        | **0.25**               | 4 plays gratis = 1 premium |

- El **fondo mensual** proviene exclusivamente de ingresos netos de suscripciones premium.
- El **porcentaje de participación** de cada artista se calcula sobre el **peso total** de reproducciones válidas, no sobre el conteo bruto.
- Las reproducciones gratuitas **sí cuentan** (descubrimiento y apoyo parcial al artista).
- Las reproducciones premium **valen más** (coherencia económica: quien paga, influye más).
- Pesos configurables vía `configuracion_sistema`: `PESO_REGALIAS_PREMIUM`, `PESO_REGALIAS_GRATIS`.

**Justificación ética:** Más justo que peso igual para todos (premium financia el fondo y merece mayor influencia) y más justo que ignorar plays gratuitos (el artista emergente no queda excluido). Ver `DOC-EJECUTIVA-LEGAL.md` sección 3.6.

### 2.3 Criterio de reproducción válida

Una reproducción cuenta para regalías si cumple **todas** estas condiciones:

1. El oyente escuchó al menos **30 segundos** o el **80% de la duración** de la canción (lo que sea menor).
2. No es un evento duplicado fraudulento (misma canción + mismo usuario en ventana de 30 segundos).
3. La canción y el artista están activos y verificados en el momento del play.

El plan del oyente determina el **peso** de la reproducción (sección 2.2) pero **no afecta** si es válida o no.

### 2.4 Distribución pro-rata con tope del 20% por artista

**Decisión de producto:** Ningún artista puede recibir más del **20% del fondo neto distribuible** en un periodo mensual. Esto evita que un artista viral concentre la mayor parte de los ingresos y favorece una comunidad de independientes más equilibrada.

**Algoritmo mensual:**

1. Calcular `fondo_neto` = ingresos brutos premium − costes operativos − comisiones de pago.
2. Sumar `total_peso` = Σ peso de todas las reproducciones válidas (premium × 1.0 + gratis × 0.25).
3. Por cada artista, calcular `peso_artista` = Σ pesos de sus reproducciones válidas.
4. Calcular `share_bruto = (peso_artista / total_peso) × fondo_neto`.
5. Aplicar tope: `share_final = min(share_bruto, fondo_neto × 0.20)`.
6. Si hay excedente por topes (`fondo_neto − suma(share_final)`), **redistribuirlo proporcionalmente** entre los artistas que no alcanzaron el tope, repitiendo hasta agotar el fondo o que todos estén topados.
7. Registrar desglose transparente en `transacciones_mensuales` (reproducciones gratis/premium, peso, share bruto, tope, share final).

**Nota legal:** El tope del 20% debe reflejarse en el contrato de licencia con artistas. Es configurable vía parámetro de sistema (`TOPE_ARTISTA_PORCENTAJE = 0.20`) para ajustarlo sin redeploy.

### 2.5 Roles y permisos (RBAC)

Los roles son independientes del plan de suscripción:

| Rol | Permisos |
|-----|----------|
| `USER` | Escuchar música, biblioteca, favoritos, playlists |
| `ARTIST` | Todo lo anterior + subir catálogo, ver estadísticas y regalías propias |
| `ADMIN` | Verificación de artistas, moderación, gestión de pagos, métricas globales |

Un usuario puede tener varios roles (ej.: `USER` + `ARTIST`). La suscripción (`gratis`/`premium`) es una entidad separada.

---

## 3. Hoja de Ruta de Desarrollo por Fases

### Fase 0: Decisiones y Contratos (1–2 días)

**Objetivo:** Cerrar definiciones antes de escribir código productivo.

- Validar reglas de regalías de la sección 2 con el documento legal.
- Definir contrato OpenAPI v1 (endpoints, DTOs, códigos de error).
- Elegir proveedor de storage definitivo para MVP (R2 o S3).
- Configurar monorepo pnpm (`apps/`, `packages/`), `.env.example`, Docker Compose local.
- Documentar arquitectura en `DOC-ARQUITECTURA.md`.
- Documentar formatos de audio aceptados (ver sección 5).

### Fase 1: Cimientos, Base de Datos y Backend Core

**Objetivo:** API funcional con auth, catálogo, subida segura y registro de reproducciones.

- Proyecto Spring Boot modular: `auth`, `catalog`, `playback`, `storage`.
- Esquema PostgreSQL completo (sección 4) con migraciones Flyway/Liquibase.
- Auth: JWT (access 15 min) + refresh token (7 días) con tabla de revocación.
- RBAC con roles `USER`, `ARTIST`, `ADMIN`.
- Subida de archivos: validación de formato/tamaño, almacenamiento en object storage, metadatos en BD.
- URLs pre-firmadas con expiración corta (1 hora) para streaming.
- Endpoint de registro de reproducción con validación de criterios (sección 2.3).
- OpenAPI publicado en `/api/v1/docs`.
- Tests unitarios de auth, validación de plays y permisos.
- CI: build + tests en GitHub Actions.

### Fase 2A: Panel Artista Web (React + TypeScript)

**Objetivo:** Que los artistas gestionen su catálogo y vean estadísticas sin depender aún de pagos reales.

**Ubicación:** `apps/web/` — arquitectura **feature-first** (ver `DOC-ARQUITECTURA.md`).

**Stack:** React 19 + Vite + TypeScript + **pnpm** + **Zod** (`@streaming/api-client`).

**Estructura de features a implementar:**

| Feature | Endpoints API | Prioridad |
|---------|---------------|-----------|
| `features/auth` | `/auth/login`, `/auth/register/artist` | Alta — login ya scaffolded |
| `features/artist-declaration` | `/artists/me/declaration` | Alta |
| `features/upload-music` | `/albums`, `/albums/{id}/songs` | Alta |
| `features/artist-stats` | `/artists/me/stats` | Media |

**Tareas:**

- Completar registro de artista con validación Zod.
- Formulario de subida: crear álbum + subir canciones (multipart, `durationSeconds`).
- Dashboard: reproducciones totales, desglose gratis/premium, peso acumulado, top canciones.
- Firma de declaración de no-IA (checkbox + versión documento).
- Extraer componentes reutilizables a `entities/` y `shared/ui/` según necesidad.
- Tests E2E mínimos del flujo de subida.

### Fase 2B: Panel Admin Web

**Objetivo:** Operación interna mínima de la plataforma.

**Ubicación:** `apps/web/src/features/admin-verification/` (misma app, rutas protegidas con rol `ADMIN`).
- Gestión de estados: activar/suspender artista o canción.
- Dashboard global: usuarios registrados, reproducciones del mes, ingresos pendientes.
- Solo accesible con rol `ADMIN`.

### Fase 3: Aplicación Móvil MVP (React Native + Expo)

**Objetivo:** App funcional para escuchar música.

- Proyecto Expo en `mobile/`.
- Pantallas: Home (destacados), Búsqueda (PostgreSQL `ILIKE` en MVP), Reproductor (play/pause/siguiente/anterior/progreso), Biblioteca (favoritos + playlists básicas).
- Background playback (**riesgo técnico elevado** — priorizar pruebas en iOS y Android desde el inicio del sprint).
- Streaming vía URLs firmadas desde la API.
- Login/registro de usuario (`USER`). Suscripción premium con UI preparada; integración Stripe diferida a Fase 4.
- Tests en dispositivo real del reproductor y reproducciones.

### Fase 4: Pagos, Regalías y Producción

**Objetivo:** Modelo de negocio real, liquidación mensual y despliegue.

- Integración Stripe: checkout, webhooks, ciclo de vida de suscripción (alta, renovación, cancelación, fallo de pago).
- Job programado (día 1 de cada mes): cálculo de regalías con tope 20% y redistribución (sección 2.4).
- Panel artista: desglose financiero mensual (share bruto, tope, share final, estado de pago).
- Panel admin: aprobación y marcado de pagos a artistas.
- Seguridad: rate limiting, protección anti-fraude en plays, URLs sin exposición permanente.
- Pruebas de carga en streaming y escritura de reproducciones.
- Despliegue staging + producción (servidor, BD, CDN, variables de entorno).
- Tests de integración del algoritmo de regalías (casos borde documentados en sección 6).

### Fase 5: Futuro y Escalamiento (Pendiente)

- Migración del cliente Android a Kotlin Nativo.
- Algoritmos de recomendación avanzados.
- Particionamiento de tabla `Reproducciones` por fecha.
- Colas asíncronas para ingestión de plays a alto volumen.
- Motor de búsqueda dedicado si es necesario.

---

## 4. Esquema de Base de Datos (PostgreSQL)

Diseño relacional normalizado. UUIDs como PK salvo donde se indica BIGINT para alto volumen.

### Tabla: `usuarios`

- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE, NOT NULL)
- `password_hash` (VARCHAR, NOT NULL)
- `nombre_completo` (VARCHAR)
- `fecha_registro` (TIMESTAMP)
- `activo` (BOOLEAN, DEFAULT true)

### Tabla: `roles` + `usuario_roles` (RBAC)

- `roles`: `id`, `nombre` (ENUM: `USER`, `ARTIST`, `ADMIN`)
- `usuario_roles`: `usuario_id` (FK), `rol_id` (FK) — UNIQUE(usuario_id, rol_id)

### Tabla: `suscripciones`

- `id` (UUID, PK)
- `usuario_id` (UUID, FK → usuarios, UNIQUE)
- `plan` (ENUM: `gratis`, `premium`)
- `estado` (ENUM: `activa`, `cancelada`, `vencida`, `pendiente`)
- `fecha_inicio` (TIMESTAMP)
- `fecha_vencimiento` (TIMESTAMP, NULLABLE)
- `stripe_customer_id` (VARCHAR, NULLABLE)
- `stripe_subscription_id` (VARCHAR, NULLABLE)

### Tabla: `refresh_tokens`

- `id` (UUID, PK)
- `usuario_id` (UUID, FK)
- `token_hash` (VARCHAR, NOT NULL)
- `expira_en` (TIMESTAMP)
- `revocado` (BOOLEAN, DEFAULT false)

### Tabla: `artistas`

- `id` (UUID, PK)
- `usuario_id` (UUID, FK → usuarios, UNIQUE)
- `nombre_artistico` (VARCHAR, NOT NULL)
- `biografia` (TEXT)
- `url_imagen_perfil` (VARCHAR)
- `verificado` (BOOLEAN, DEFAULT false)
- `activo` (BOOLEAN, DEFAULT true)
- `datos_bancarios_encriptados` (TEXT, NULLABLE)

### Tabla: `declaraciones_artista` (trazabilidad legal no-IA)

- `id` (UUID, PK)
- `artista_id` (UUID, FK)
- `aceptada` (BOOLEAN, NOT NULL)
- `fecha_firma` (TIMESTAMP)
- `ip_firma` (VARCHAR)
- `version_documento` (VARCHAR, ej: `v1.0`)

### Tabla: `albumes`

- `id` (UUID, PK)
- `artista_id` (UUID, FK)
- `titulo` (VARCHAR, NOT NULL)
- `anio_lanzamiento` (INTEGER)
- `url_portada` (VARCHAR)
- `genero` (VARCHAR)
- `activo` (BOOLEAN, DEFAULT true)
- `fecha_subida` (TIMESTAMP)

### Tabla: `canciones`

- `id` (UUID, PK)
- `album_id` (UUID, FK)
- `titulo` (VARCHAR, NOT NULL)
- `duracion_segundos` (INTEGER)
- `ruta_archivo_storage` (VARCHAR)
- `hash_archivo` (VARCHAR, UNIQUE — integridad y anti-duplicados)
- `orden_en_album` (INTEGER)
- `es_explicito` (BOOLEAN)
- `activo` (BOOLEAN, DEFAULT true)
- `fecha_subida` (TIMESTAMP)

### Tabla: `reproducciones` (alto volumen — índices desde día 1)

- `id` (BIGINT, PK, autoincremental)
- `cancion_id` (UUID, FK)
- `usuario_id` (UUID, FK)
- `artista_id` (UUID, FK — desnormalizado para agregaciones rápidas)
- `fecha_reproduccion` (TIMESTAMP, DEFAULT NOW)
- `duracion_escuchada_segundos` (INTEGER)
- `plan_usuario` (ENUM: `gratis`, `premium`)
- `peso_regalias` (DECIMAL — 1.0 si premium, 0.25 si gratis; según sección 2.2)
- `origen` (ENUM: `web`, `ios`, `android`)
- `es_valida_regalias` (BOOLEAN — calculado al insertar según sección 2.3)
- `session_id` (VARCHAR — anti-fraude)

**Índices:** `(fecha_reproduccion)`, `(artista_id, fecha_reproduccion)`, `(cancion_id)`, `(usuario_id, cancion_id, fecha_reproduccion)`.

**Nota:** Particionamiento por fecha en Fase 5 si el volumen lo requiere.

### Tabla: `favoritos`

- `usuario_id` (FK), `cancion_id` (FK) — PK compuesta

### Tabla: `playlists` + `playlist_canciones`

- `playlists`: `id`, `usuario_id`, `nombre`, `fecha_creacion`
- `playlist_canciones`: `playlist_id`, `cancion_id`, `orden` — PK compuesta

### Tabla: `pagos_suscripcion` (historial de ingresos)

- `id` (UUID, PK)
- `usuario_id` (UUID, FK)
- `monto` (DECIMAL)
- `moneda` (VARCHAR, ej: `USD`, `EUR`)
- `fecha_pago` (TIMESTAMP)
- `stripe_payment_id` (VARCHAR)
- `estado` (ENUM: `exitoso`, `fallido`, `reembolsado`)

### Tabla: `periodos_regalias` (fondo mensual)

- `id` (UUID, PK)
- `periodo_mes` (INTEGER, 1–12)
- `periodo_anio` (INTEGER) — UNIQUE(periodo_mes, periodo_anio)
- `ingresos_brutos` (DECIMAL)
- `costes_operativos` (DECIMAL)
- `comisiones_pago` (DECIMAL)
- `fondo_neto` (DECIMAL)
- `total_reproducciones_validas` (BIGINT — conteo bruto, informativo)
- `total_peso_regalias` (DECIMAL — suma de pesos, usado en el cálculo)
- `peso_premium` (DECIMAL, DEFAULT 1.0 — snapshot del parámetro vigente)
- `peso_gratis` (DECIMAL, DEFAULT 0.25 — snapshot del parámetro vigente)
- `tope_artista_porcentaje` (DECIMAL, DEFAULT 0.20)
- `excedente_redistribuido` (DECIMAL)
- `fecha_calculo` (TIMESTAMP)
- `estado` (ENUM: `calculado`, `cerrado`, `pagado`)

### Tabla: `transacciones_mensuales` (liquidación por artista)

- `id` (UUID, PK)
- `periodo_id` (UUID, FK → periodos_regalias)
- `artista_id` (UUID, FK)
- `total_reproducciones` (BIGINT — conteo bruto)
- `reproducciones_premium` (BIGINT)
- `reproducciones_gratis` (BIGINT)
- `peso_total` (DECIMAL — peso acumulado del artista)
- `porcentaje_participacion` (DECIMAL, ej: 0.05 — sobre peso, no sobre conteo)
- `monto_bruto` (DECIMAL — antes del tope)
- `tope_aplicado` (BOOLEAN)
- `monto_final` (DECIMAL — después del tope y redistribución)
- `estado_pago` (ENUM: `pendiente`, `pagado`, `fallido`)
- `fecha_pago` (TIMESTAMP, NULLABLE)

— UNIQUE(`periodo_id`, `artista_id`)

### Tabla: `configuracion_sistema`

- `clave` (VARCHAR, PK — ej: `TOPE_ARTISTA_PORCENTAJE`, `PESO_REGALIAS_PREMIUM`, `PESO_REGALIAS_GRATIS`)
- `valor` (VARCHAR)
- `descripcion` (TEXT)

---

## 5. Especificaciones Técnicas MVP

| Tema | Decisión MVP |
|------|--------------|
| Formatos de audio | MP3 y AAC (`.mp3`, `.m4a`). FLAC en fase posterior. |
| Tamaño máximo por archivo | 50 MB |
| Calidad free vs premium | Free: 128 kbps (transcodificación futura). Premium: original subido. |
| Duración mínima canción | 30 segundos |
| URL firmada | Expiración 1 hora. Renovación bajo demanda desde la API. |
| Búsqueda | PostgreSQL `ILIKE` + índice en `canciones.titulo` y `artistas.nombre_artistico` |
| Pagos | Stripe Checkout + webhooks. PayPal evaluado post-MVP. |
| Datos personales | Preparar campos para cumplimiento GDPR (exportación y borrado — implementación en Fase 4). |

---

## 6. Casos de Prueba del Algoritmo de Regalías

El servicio de cálculo mensual debe tener tests automatizados para:

1. **Cero reproducciones:** fondo_neto se registra; ninguna transacción de artista.
2. **Un solo artista:** recibe el 100% del fondo (bajo el tope del 20% solo si supera ese umbral de participación relativa — con un artista, recibe todo).
3. **Dos artistas 70/30:** reparto proporcional sin topes si ambos quedan bajo 20% del fondo.
4. **Artista viral (>20%):** tope aplicado; excedente redistribuido al resto.
5. **Todos topados:** cada artista recibe exactamente 20%; excedente residual (si lo hay) queda como `excedente_no_distribuido` en `periodos_regalias`.
6. **Ponderación:** 4 reproducciones gratis (peso 0.25) = 1 premium (peso 1.0) en el cálculo.
7. **Artista solo con audiencia gratis:** recibe share proporcional a su peso, no queda excluido.
8. **Artista con mezcla free/premium:** el desglose en `transacciones_mensuales` refleja ambos conteos y el peso total.
9. **Reproducción inválida** (< 30 s): excluida del conteo y del peso.
10. **Cambio de pesos mid-periodo:** los pesos se snapshotan en `periodos_regalias` al cerrar el periodo; cada reproducción guarda su `peso_regalias` al momento del play.

---

## 7. Instrucciones Específicas para Implementación con Cursor

- **Seguridad primero:** Validar toda entrada de usuario. URLs de audio nunca públicas ni permanentes; siempre pre-firmadas con expiración corta desde el backend.
- **Manejo de archivos:** El backend no hace proxy del stream. Devuelve URL pre-firmada; el cliente (React/React Native) descarga directo desde CDN/object storage.
- **Concurrencia:** Escritura directa en PostgreSQL para MVP con índices adecuados. Evaluar colas en Fase 5.
- **Transparencia:** Todo cálculo de regalías debe ser reproducible: guardar inputs del periodo en `periodos_regalias` y desglose por artista en `transacciones_mensuales`.
- **Pesos y tope:** Implementar como parámetros configurables (`PESO_REGALIAS_PREMIUM`, `PESO_REGALIAS_GRATIS`, `TOPE_ARTISTA_PORCENTAJE`). La redistribución de excedente debe ser determinista y documentada en logs.
- **Testing:** Cada fase incluye tests antes de cerrar el sprint. El algoritmo de regalías es crítico: cobertura de todos los casos de la sección 6.

---

## 8. Riesgos Técnicos Conocidos

| Riesgo | Fase | Mitigación |
|--------|------|------------|
| Background playback en Expo | 3 | Probar en dispositivos reales desde la primera semana; tener fallback sin background si bloquea el MVP |
| Fraude en reproducciones | 1/4 | `session_id`, ventana anti-duplicado, rate limiting por IP/usuario |
| Tabla `reproducciones` crece rápido | 1+ | Índices desde día 1; particionamiento planificado en Fase 5 |
| Topes + redistribución compleja | 4 | Tests exhaustivos (sección 6); lógica en servicio aislado `RoyaltyCalculationService` |
| Contrato legal (tope 20% + ponderación) | 0/4 | Alinear con `DOC-EJECUTIVA-LEGAL.md` antes de producción |

---

Este documento es la **fuente única de verdad** para iniciar el desarrollo paso a paso.
