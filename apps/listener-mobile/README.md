# App oyente móvil (Expo)

Cliente **oyente** iOS/Android — paridad con `listener-web` (Fase 3B).

## Requisitos

- Node 20+, pnpm
- [Expo Go](https://expo.dev/go) en el teléfono **o** emulador Android/iOS
- Backend corriendo (`./scripts/run-backend.sh`)

## Configuración

```bash
# Desde la raíz del monorepo
pnpm install
cp apps/listener-mobile/.env.example apps/listener-mobile/.env
```

Edita `EXPO_PUBLIC_API_URL` según dónde corre la app:

| Entorno | URL API |
|---------|---------|
| Emulador Android | `http://10.0.2.2:8081/api/v1` |
| Simulador iOS | `http://localhost:8081/api/v1` |
| Dispositivo físico | `http://TU_IP_LAN:8081/api/v1` |

> En móvil no hay proxy Vite: la app llama **directo** al backend (sin CORS en apps nativas).

## Arranque

> El servidor de desarrollo de Expo usa el puerto **8082** (el backend usa 8081).

```bash
pnpm listener:mobile:dev
# o
cd apps/listener-mobile && pnpm start
```

- Pulsa `a` (Android) o `i` (iOS) en la terminal de Expo
- O escanea el QR con Expo Go (misma red Wi‑Fi; usa IP LAN en `.env`)

### Si falla al arrancar

| Error | Solución |
|-------|----------|
| `expo-asset cannot be found` | `cd apps/listener-mobile && npx expo install expo-asset expo-font` y luego `pnpm install` en la raíz |
| Puerto 8082 ocupado | Cierra otra instancia de Expo o usa `expo start --port 8083` |
| La app carga pero no hay datos | Revisa `EXPO_PUBLIC_API_URL` con la IP LAN del PC (no `10.0.2.2` en teléfono físico) |

## Modos de escucha

| Modo | Comportamiento |
|------|----------------|
| Sin cuenta | Preview 30 s |
| Gratis | Canción completa + favoritos |
| Premium | Completa + badge alta calidad |

Ver `apps/listener-web/docs/PREMIUM-DEV.md` para simular premium en BD.

## Estructura

```
app/              # Rutas expo-router (tabs + login/register)
src/
  features/       # auth, player
  entities/       # SongRow
  shared/         # api, storage, listener-tier
```

## Background audio

`expo-av` está configurado con `staysActiveInBackground: true`. Prueba en dispositivo real; el comportamiento exacto depende de iOS/Android.
