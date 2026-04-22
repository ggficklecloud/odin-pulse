#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-/opt/odin-pulse}"
ENV_DIR="${ODIN_PULSE_RUNTIME_ENV_DIR:-/etc/odin-pulse}"
ODIN_PULSE_DOCKER_NETWORK="${ODIN_PULSE_DOCKER_NETWORK:-hfcloud_net}"
NGINX_AVAILABLE="/etc/nginx/sites-available/codego.eu.org.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/codego.eu.org.conf"

mkdir -p "${APP_DIR}" "${ENV_DIR}"
chmod 700 "${ENV_DIR}"

cp deploy/nginx/codego.eu.org.conf "${NGINX_AVAILABLE}"
ln -sf "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"

if [[ -f /etc/nginx/conf.d/biz.conf ]]; then
  perl -0pi -e 's/server_name\s+codego-shortlink\.internal;/server_name s.codego.eu.org codego-shortlink.internal;/g' /etc/nginx/conf.d/biz.conf
fi

if ! docker network inspect "${ODIN_PULSE_DOCKER_NETWORK}" >/dev/null 2>&1; then
  docker network create "${ODIN_PULSE_DOCKER_NETWORK}" >/dev/null
fi

nginx -t

echo "Server templates installed."
echo "Next steps:"
echo "1. Configure GitHub secret PROD_API_ENV from deploy/env/api.env.example"
echo "2. Configure GitHub secret PROD_WEB_ENV from deploy/env/web.env.example"
echo "3. Set GitHub vars DEPLOY_PATH=${APP_DIR} and ODIN_PULSE_RUNTIME_ENV_DIR=${ENV_DIR}"
echo "4. Ensure Docker, Docker Compose, and the self-hosted runner can manage ${ODIN_PULSE_DOCKER_NETWORK}"
echo "5. Run the Deploy workflow"
