#!/usr/bin/env bash
# Compile le backend, démarre HSQLDB le temps d'exécuter JpaTest (schéma + données de démo),
# puis arrête le serveur. Les fichiers restent dans data/.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

require_cmd() {
	if ! command -v "$1" >/dev/null 2>&1; then
		echo "Erreur : la commande « $1 » est introuvable (requis pour ce projet)." >&2
		exit 1
	fi
}

require_cmd java
require_cmd mvn

HSQL_PID=""

cleanup() {
	if [[ -n "$HSQL_PID" ]] && kill -0 "$HSQL_PID" 2>/dev/null; then
		echo ">> Arrêt du serveur HSQLDB (pid $HSQL_PID)..."
		kill "$HSQL_PID" 2>/dev/null || true
		wait "$HSQL_PID" 2>/dev/null || true
	fi
}

trap cleanup EXIT INT TERM

echo ">> Répertoire data/ (fichiers HSQLDB)..."
mkdir -p "$ROOT/data"

echo ">> Maven : compile + copie des dépendances..."
mvn -q compile dependency:copy-dependencies

HSQL_JAR="$ROOT/target/dependency/hsqldb-2.7.2.jar"
if [[ ! -f "$HSQL_JAR" ]]; then
	echo "Erreur : JAR HSQLDB introuvable : $HSQL_JAR" >&2
	exit 1
fi

echo ">> Démarrage du serveur HSQLDB (depuis data/)..."
cd "$ROOT/data"
java -cp "$HSQL_JAR" org.hsqldb.Server &
HSQL_PID=$!
cd "$ROOT"

echo ">> Attente du démarrage du serveur HSQLDB..."
sleep 2

echo ">> Exécution de jpa.JpaTest (création du schéma Hibernate + données si tables vides)..."
java -cp "target/classes:target/dependency/*" jpa.JpaTest

trap - EXIT INT TERM
cleanup
HSQL_PID=""

echo ""
echo "Initialisation de la base terminée (fichiers dans data/)."
echo "Pour lancer l’API ensuite : bash run-hsqldb-server.sh (terminal séparé), puis"
echo "  java -cp \"target/classes:target/dependency/*\" jpa.RestServer"
