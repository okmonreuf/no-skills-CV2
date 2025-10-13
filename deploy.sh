#!/usr/bin/env bash
set -euo pipefail

APP_NAME="no-skills-messagerie"
DOMAIN="no-skills.fr"
EMAIL="admin@no-skills.fr"
APP_DIR="/var/www/${APP_NAME}"
REPO_DIR="$(pwd)"
SERVICE_PORT="3000"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Ce script doit être exécuté avec les privilèges administrateur." >&2
  exit 1
fi

echo "📦 Mise à jour des dépôts APT"
apt-get update -y
apt-get install -y curl git nginx certbot python3-certbot-nginx build-essential openssl rsync

if ! command -v node >/dev/null 2>&1; then
  echo "⚙️ Installation de Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi

echo "🧰 Activation de pnpm et installation des dépendances"
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@10.14.0 --activate
npm install -g pm2

mkdir -p "${APP_DIR}"
rsync -a --delete "${REPO_DIR}/" "${APP_DIR}/"
cd "${APP_DIR}"

pnpm install --frozen-lockfile
pnpm build

ADMIN_HASH=$(openssl passwd -6 "1616Dh!dofly")
cat > server/.env <<EOF
ADMIN_USERNAME=yupi
ADMIN_PASSWORD_HASH=${ADMIN_HASH}
EOF
chmod 600 server/.env

pm2 stop "${APP_NAME}" >/dev/null 2>&1 || true
pm2 delete "${APP_NAME}" >/dev/null 2>&1 || true
pm2 start dist/server/node-build.mjs --name "${APP_NAME}" --interpreter "$(command -v node)"
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null

cat >/etc/nginx/sites-available/${APP_NAME} <<NGINX
server {
    listen 80;
    server_name ${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:${SERVICE_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_cache_bypass \\$http_upgrade;
    }

    location /static/ {
        root ${APP_DIR}/dist/spa;
    }

    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;
}
NGINX

ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/${APP_NAME}
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

if ! certbot certificates | grep -q "${DOMAIN}"; then
  echo "🔐 Demande de certificat Let's Encrypt"
  certbot --nginx --non-interactive --agree-tos -d "${DOMAIN}" -m "${EMAIL}"
fi

echo "✅ Déploiement terminé. L'application est accessible sur https://${DOMAIN}"
