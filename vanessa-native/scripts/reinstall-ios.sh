#!/usr/bin/env bash
#
# Compila o app e instala no iPhone conectado por cabo.
#
#   ./scripts/reinstall-ios.sh           instala por cima, mantendo os dados do app
#   ./scripts/reinstall-ios.sh --wipe    desinstala antes, apagando todos os dados
#
# Para forcar um aparelho especifico: UDID=00008101-... ./scripts/reinstall-ios.sh

set -euo pipefail

BUNDLE_ID="com.davi.mdmr"
SCHEME="mdmr"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE="$ROOT/iosApp/mdmr.xcworkspace"
DERIVED="$ROOT/build/ios-device"
APP="$DERIVED/Build/Products/Debug-iphoneos/$SCHEME.app"

wipe=false
if [[ "${1:-}" == "--wipe" ]]; then
  wipe=true
elif [[ -n "${1:-}" ]]; then
  echo "Argumento desconhecido: $1 (use --wipe ou nada)" >&2
  exit 2
fi

# O xcodebuild exige o UDID de hardware, que nao e o mesmo identificador que o
# `devicectl list devices` mostra na coluna Identifier -- por isso o JSON.
if [[ -z "${UDID:-}" ]]; then
  json="$(mktemp)"
  trap 'rm -f "$json"' EXIT
  xcrun devicectl list devices --json-output "$json" >/dev/null
  UDID="$(python3 -c '
import json, sys
devices = json.load(open(sys.argv[1]))["result"]["devices"]
paired = [d for d in devices
          if d["connectionProperties"]["tunnelState"] != "unavailable"]
if not paired:
    sys.exit("Nenhum iPhone conectado. Ligue o cabo e desbloqueie o aparelho.")
print(paired[0]["hardwareProperties"]["udid"])
' "$json")"
fi

echo "==> Aparelho: $UDID"

echo "==> Compilando"
xcodebuild -workspace "$WORKSPACE" -scheme "$SCHEME" -configuration Debug \
  -destination "id=$UDID" -derivedDataPath "$DERIVED" \
  -allowProvisioningUpdates build

if [[ "$wipe" == true ]]; then
  echo "==> Desinstalando (os dados locais serao perdidos)"
  xcrun devicectl device uninstall app --device "$UDID" "$BUNDLE_ID" || true
fi

echo "==> Instalando"
xcrun devicectl device install app --device "$UDID" "$APP"

echo "==> Abrindo"
if ! xcrun devicectl device process launch --device "$UDID" "$BUNDLE_ID"; then
  echo
  echo "Instalado, mas nao consegui abrir sozinho (o iPhone costuma estar bloqueado)."
  echo "Desbloqueie o aparelho e toque no app."
fi
