#!/usr/bin/env bash
# Muestra si el backend ya está corriendo y responde
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
PORT="${API_PORT:-8081}"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' "$ENV_FILE" | grep 'API_PORT' | xargs) || true
  PORT="${API_PORT:-8081}"
fi

PID=""
if command -v netstat >/dev/null 2>&1; then
  PID=$(netstat -ano | grep ":$PORT " | grep LISTENING | awk '{print $5}' | head -1)
fi

if [[ -n "${PID:-}" && "$PID" != "0" ]]; then
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/api/v1/catalog/featured" 2>/dev/null || echo "000")
  echo "Backend ACTIVO en puerto $PORT (PID $PID) — API: HTTP $HTTP_CODE"
  echo "No ejecutes 'mvn spring-boot:run' otra vez; usa ./scripts/stop-backend.sh para reiniciar."
  exit 0
fi

echo "Backend NO está corriendo en puerto $PORT"
echo "Arranca con: ./scripts/run-backend.sh"
exit 1
