#!/usr/bin/env bash
set -euo pipefail

APP_NAME="no-skills-messagerie"
DOMAIN="no-skills.fr"
EMAIL="admin@no-skills.fr"
APP_DIR="/var/www/${APP_NAME}"
REPO_DIR="$(pwd)"
SERVICE_PORT="3000"
ADMIN_USER="${ADMIN_USER:-yupi}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Ce script doit être exécuté avec les privilèges administrateur." >&2
  exit 1
fi

echo "📦 Mise à jour des dépôts APT"
apt-get update -y
apt-get install -y curl git nginx certbot python3-certbot-nginx build-essential openssl rsync ufw

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
rsync -a --delete --exclude ".git" "${REPO_DIR}/" "${APP_DIR}/"
cd "${APP_DIR}"

pnpm install --frozen-lockfile
pnpm build
pnpm prune --prod

if [[ -f server/.env ]]; then
  echo "ℹ️ Fichier server/.env détecté, conservation des identifiants existants."
else
  if [[ -z "${ADMIN_PASSWORD}" ]]; then
    ADMIN_PASSWORD=$(openssl rand -base64 18)
    echo "🔑 Mot de passe administrateur généré: ${ADMIN_PASSWORD}"
  fi

  # Generate bcryptjs hash using Node.js
  cat > /tmp/hash_gen.mjs <<'HASHSCRIPT'
import bcrypt from 'bcryptjs';
const password = process.argv[1];
const hash = await bcrypt.hash(password, 10);
console.log(hash);
HASHSCRIPT

  ADMIN_HASH=$(node /tmp/hash_gen.mjs "${ADMIN_PASSWORD}")
  rm -f /tmp/hash_gen.mjs

  cat > server/.env <<EOF
ADMIN_USERNAME=${ADMIN_USER}
ADMIN_PASSWORD_HASH=${ADMIN_HASH}
EOF
  chmod 600 server/.env
fi

pm2 stop "${APP_NAME}" >/dev/null 2>&1 || true
pm2 delete "${APP_NAME}" >/dev/null 2>&1 || true
NODE_ENV=production PORT=${SERVICE_PORT} pm2 start dist/server/node-build.mjs \
  --name "${APP_NAME}" \
  --interpreter "$(command -v node)" \
  --update-env
pm2 save
env PATH="$PATH" pm2 startup systemd -u root --hp /root >/dev/null

cat >/etc/nginx/sites-available/${APP_NAME}.conf <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://127.0.0.1:${SERVICE_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\$host;
        proxy_cache_bypass \\$http_upgrade;
    }

    location /static/ {
        alias ${APP_DIR}/dist/spa/static/;
        expires 1y;
        add_header Cache-Control "public";
    }

    location /assets/ {
        alias ${APP_DIR}/dist/spa/assets/;
        expires 1y;
        add_header Cache-Control "public";
    }

    access_log /var/log/nginx/${APP_NAME}_access.log;
    error_log /var/log/nginx/${APP_NAME}_error.log;
}
NGINX

ln -sf /etc/nginx/sites-available/${APP_NAME}.conf /etc/nginx/sites-enabled/${APP_NAME}.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

if ! certbot certificates | grep -q "${DOMAIN}"; then
  echo "🔐 Demande de certificat Let's Encrypt"
  certbot --nginx --non-interactive --agree-tos -d "${DOMAIN}" -d "www.${DOMAIN}" -m "${EMAIL}"
else
  certbot renew --nginx --non-interactive
fi

ufw allow "Nginx Full" >/dev/null 2>&1 || true

chown -R www-data:www-data "${APP_DIR}"

systemctl enable nginx >/dev/null

echo "✅ Déploiement terminé. L'application est accessible sur https://${DOMAIN}"
