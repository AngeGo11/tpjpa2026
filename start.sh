#!/usr/bin/env bash
# Démarre HSQLDB (serveur), l’outil graphique HSQLDB, l’API REST (RestServer) et le frontend Vite.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

echo ">> Compilation Maven et copie des dépendances..."
mvn -q compile dependency:copy-dependencies

set -m
trap 'echo ""; echo ">> Arrêt des processus..."; kill 0 2>/dev/null || true; exit 130' INT TERM

echo ">> Serveur HSQLDB (run-hsqldb-server.sh)..."
bash "$ROOT/run-hsqldb-server.sh" &
sleep 2

echo ">> API REST (jpa.RestServer sur http://localhost:8080)..."
java -cp "target/classes:target/dependency/*" jpa.RestServer &

echo ">> DatabaseManager Swing (show-hsqldb.sh)..."
( cd "$ROOT/target/dependency" && bash "$ROOT/show-hsqldb.sh" ) &

echo ">> Frontend React (npm run dev dans frontend/)..."
( cd "$ROOT/frontend" && npm run dev ) &

echo ""
echo "Tout est lancé. Ctrl+C pour tout arrêter."
wait
