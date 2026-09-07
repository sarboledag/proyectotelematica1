#!/usr/bin/env bash
# Publica el contenido de wiki/ en la wiki de GitHub del repositorio.
#
# Requisito previo (una sola vez): la wiki debe estar inicializada.
#   1. Abrir  https://github.com/sarboledag/proyectotelematica1/wiki
#   2. "Create the first page" -> escribir cualquier cosa -> "Save Page"
#
# Uso:  bash scripts/sync-wiki.sh
set -euo pipefail

WIKI_REMOTE="https://github.com/sarboledag/proyectotelematica1.wiki.git"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/wiki"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git clone "$WIKI_REMOTE" "$TMP" 2>/dev/null || {
  echo "No se pudo clonar la wiki. ¿Ya creaste la primera página en la web?" >&2
  exit 1
}

# Reemplazar el contenido por el de wiki/ (conservando .git).
find "$TMP" -maxdepth 1 -name '*.md' -delete
cp "$SRC"/*.md "$TMP"/

cd "$TMP"
git add -A
if git diff --cached --quiet; then
  echo "La wiki ya está al día."
  exit 0
fi
git commit -m "Sincronizar wiki desde wiki/ ($(date +%F))"
git push origin HEAD
echo "Wiki actualizada: https://github.com/sarboledag/proyectotelematica1/wiki"
