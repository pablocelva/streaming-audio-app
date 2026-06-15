#!/usr/bin/env bash
# Detiene el backend si hay un proceso escuchando en API_PORT (.env)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
PORT="${API_PORT:-8081}"

if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC2046
  export $(grep -v '^#' "$ENV_FILE" | grep 'API_PORT' | xargs) || true
  PORT="${API_PORT:-8081}"
fi

echo "Buscando proceso en puerto $PORT..."

if command -v netstat >/dev/null 2>&1; then
  PIDS=$(netstat -ano | grep ":$PORT " | grep LISTENING | awk '{print $5}' | sort -u)
  if [[ -n "${PIDS:-}" ]]; then
    while read -r PID; do
      [[ -z "$PID" || "$PID" == "0" ]] && continue
      echo "Deteniendo PID $PID (puerto $PORT)"
      taskkill //PID "$PID" //F 2>/dev/null || kill -9 "$PID" 2>/dev/null || true
    done <<< "$PIDS"
    sleep 1
    if netstat -ano | grep ":$PORT " | grep -q LISTENING; then
      echo "ERROR: el puerto $PORT sigue ocupado"
      exit 1
    fi
    echo "Puerto $PORT libre"
  else
    echo "Ningún proceso en puerto $PORT"
  fi
else
  echo "netstat no disponible; cierra manualmente el proceso en puerto $PORT"
fi
