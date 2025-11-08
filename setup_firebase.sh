#!/usr/bin/env bash
# setup_firebase.sh
# Configura variáveis EXPO_PUBLIC_* e (se houver app.json) expo.extra.firebase
# Use via: source ./setup_firebase.sh  (para manter as exports nesta sessão)

set -euo pipefail

# --------- Funções utilitárias ----------
need() {
  command -v "$1" >/dev/null 2>&1 || return 1
}

prompt_if_empty() {
  local var_name="$1"
  local prompt_msg="$2"
  local current_val="${!var_name:-}"

  if [ -z "${current_val}" ]; then
    read -rp "$prompt_msg: " input
    eval "$var_name=\"${input}\""
  fi
}

# --------- Parse de flags ----------
API_KEY="${EXPO_PUBLIC_FIREBASE_API_KEY:-${1:-}}"
AUTH_DOMAIN="${EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:-}"
PROJECT_ID="${EXPO_PUBLIC_FIREBASE_PROJECT_ID:-}"
STORAGE_BUCKET="${EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET:-}"
MSG_SENDER_ID="${EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:-}"
APP_ID="${EXPO_PUBLIC_FIREBASE_APP_ID:-}"

# Suporte a flags nomeadas
while [[ $# -gt 0 ]]; do
  case "$1" in
    --api-key) API_KEY="$2"; shift 2;;
    --auth-domain) AUTH_DOMAIN="$2"; shift 2;;
    --project-id) PROJECT_ID="$2"; shift 2;;
    --storage-bucket) STORAGE_BUCKET="$2"; shift 2;;
    --messaging-sender-id) MSG_SENDER_ID="$2"; shift 2;;
    --app-id) APP_ID="$2"; shift 2;;
    *) shift ;;
  esac
done

echo "=== Firebase • Expo setup ==="

# --------- Inputs (interativo se faltou algo) ----------
prompt_if_empty API_KEY "Informe apiKey"
prompt_if_empty AUTH_DOMAIN "Informe authDomain (ex: seu-projeto.firebaseapp.com)"
prompt_if_empty PROJECT_ID "Informe projectId (ex: seu-projeto)"
prompt_if_empty STORAGE_BUCKET "Informe storageBucket (ex: seu-projeto.appspot.com)"
prompt_if_empty MSG_SENDER_ID "Informe messagingSenderId (ex: 000000000000)"
prompt_if_empty APP_ID "Informe appId (ex: 1:000000000000:web:abcdef123456)"

# --------- Exportar variáveis na sessão atual ----------
export EXPO_PUBLIC_FIREBASE_API_KEY="$API_KEY"
export EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="$AUTH_DOMAIN"
export EXPO_PUBLIC_FIREBASE_PROJECT_ID="$PROJECT_ID"
export EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="$STORAGE_BUCKET"
export EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$MSG_SENDER_ID"
export EXPO_PUBLIC_FIREBASE_APP_ID="$APP_ID"

echo "→ Variáveis EXPO_PUBLIC_* exportadas nesta sessão."

# --------- Escrever .env.expo para reuso ----------
ENV_FILE=".env.expo"
cat > "$ENV_FILE" <<EOF
# Carregue com:  source $ENV_FILE
EXPO_PUBLIC_FIREBASE_API_KEY="$API_KEY"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="$AUTH_DOMAIN"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="$PROJECT_ID"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="$STORAGE_BUCKET"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$MSG_SENDER_ID"
EXPO_PUBLIC_FIREBASE_APP_ID="$APP_ID"
EOF

# Garantir ignore
if [ -f .gitignore ] && ! grep -qE '^\s*\.env(\.expo)?\s*$' .gitignore; then
  echo ".env.expo" >> .gitignore || true
fi

echo "→ Arquivo $ENV_FILE criado. (adicionado ao .gitignore se existia)."

# --------- Atualizar app.json (se existir) ----------
if [ -f app.json ]; then
  if ! need jq; then
    echo "OBS: 'jq' não encontrado. Pulei a atualização de app.json."
  else
    echo "→ Atualizando app.json (expo.extra.firebase)..."
    cp app.json app.json.bak

    # Se não houver "expo", cria estrutura mínima
    if ! jq -e '.expo' app.json >/dev/null; then
      tmp=$(mktemp)
      jq '. + {expo:{}}' app.json > "$tmp" && mv "$tmp" app.json
    fi

    # Se não houver "expo.extra", adiciona
    if ! jq -e '.expo.extra' app.json >/dev/null; then
      tmp=$(mktemp)
      jq '.expo += {extra:{}}' app.json > "$tmp" && mv "$tmp" app.json
    fi

    # Escreve firebase dentro de expo.extra
    tmp=$(mktemp)
    jq --arg apiKey "$API_KEY" \
       --arg authDomain "$AUTH_DOMAIN" \
       --arg projectId "$PROJECT_ID" \
       --arg storageBucket "$STORAGE_BUCKET" \
       --arg messagingSenderId "$MSG_SENDER_ID" \
       --arg appId "$APP_ID" \
       '.expo.extra.firebase = {
          apiKey: $apiKey,
          authDomain: $authDomain,
          projectId: $projectId,
          storageBucket: $storageBucket,
          messagingSenderId: $messagingSenderId,
          appId: $appId
        }' app.json > "$tmp" && mv "$tmp" app.json

    echo "→ app.json atualizado (backup em app.json.bak)."
  fi
else
  echo "OBS: app.json não encontrado. Se usar app.config.js, leia as variáveis do process.env (EXPO_PUBLIC_*)."
fi

echo "✅ Pronto!
- Vars públicas disponíveis: EXPO_PUBLIC_FIREBASE_*
- Recarregue no futuro com:  source .env.expo
- Rode sua app:  npx expo start
"
