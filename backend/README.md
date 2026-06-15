# Backend — Spring Boot API (Monolito Modular)

API REST `/api/v1`. Arquitectura por dominios con capas internas.

## Estructura

```
src/main/java/com/streamingethico/
├── shared/                    # Config, seguridad, utilidades
└── modules/
    ├── auth/                  # api / application / domain / infrastructure
    ├── user/
    ├── artist/
    ├── catalog/
    ├── playback/
    ├── library/
    ├── storage/
    └── admin/
```

Ver [DOC-ARQUITECTURA.md](../DOC-ARQUITECTURA.md) para reglas de dependencia.

## Arranque

```bash
docker compose up -d   # desde la raíz (opcional si usas PostgreSQL local)
cp .env.example .env   # edita POSTGRES_* y API_PORT si hace falta

# Recomendado: detiene instancia previa y arranca
./scripts/run-backend.sh

# O manual
cd backend && mvn spring-boot:run
```

**Puerto ocupado** (`Port XXXX was already in use`): ya hay un backend corriendo.

```bash
./scripts/stop-backend.sh
```

- API: http://localhost:8081/api/v1 (o el valor de `API_PORT` en `.env`)
- Swagger: http://localhost:8081/api/v1/docs

## Tests

```bash
mvn test
```
