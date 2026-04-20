#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-/opt/odin-pulse}"
SYSTEMD_DIR="/etc/systemd/system"
ENV_DIR="/etc/odin-pulse"
NGINX_AVAILABLE="/etc/nginx/sites-available/codego.eu.org.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/codego.eu.org.conf"

mkdir -p "${APP_DIR}" "${ENV_DIR}"

if [[ ! -f "${ENV_DIR}/api.env" ]]; then
  cp deploy/env/api.env.example "${ENV_DIR}/api.env"
  echo "Created ${ENV_DIR}/api.env. Fill real secrets before starting services."
fi

if [[ ! -f "${ENV_DIR}/web.env" ]]; then
  cp deploy/env/web.env.example "${ENV_DIR}/web.env"
  echo "Created ${ENV_DIR}/web.env."
fi

sed "s|/opt/odin-pulse|${APP_DIR}|g" deploy/systemd/odin-pulse-api.service > "${SYSTEMD_DIR}/odin-pulse-api.service"
sed "s|/opt/odin-pulse|${APP_DIR}|g" deploy/systemd/odin-pulse-web.service > "${SYSTEMD_DIR}/odin-pulse-web.service"

cp deploy/nginx/codego.eu.org.conf "${NGINX_AVAILABLE}"
ln -sf "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"

if [[ -f /etc/nginx/conf.d/biz.conf ]]; then
  perl -0pi -e 's/server_name codego\.eu\.org;/server_name codego-shortlink.internal;/g' /etc/nginx/conf.d/biz.conf
fi

systemctl daemon-reload
nginx -t
systemctl enable odin-pulse-api odin-pulse-web

echo "Server templates installed."
echo "Next steps:"
echo "1. Fill ${ENV_DIR}/api.env and ${ENV_DIR}/web.env"
echo "2. Ensure codego.eu.org points to this host"
echo "3. systemctl start odin-pulse-api odin-pulse-web"
echo "4. systemctl reload nginx"
