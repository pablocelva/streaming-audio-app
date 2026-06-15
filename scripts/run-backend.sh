#!/usr/bin/env bash
# Arranca el backend (detiene instancia previa en el mismo puerto)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

if "$ROOT/scripts/status-backend.sh" >/dev/null 2>&1; then
  echo "Deteniendo instancia anterior..."
  "$ROOT/scripts/stop-backend.sh"
fi

echo "Arrancando backend..."
cd "$ROOT/backend"
exec mvn spring-boot:run
