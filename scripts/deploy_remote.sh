#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/odin-pulse}"
REPO_URL="${REPO_URL:?REPO_URL is required}"
BRANCH="${BRANCH:-main}"
ODIN_PULSE_RUNTIME_ENV_DIR="${ODIN_PULSE_RUNTIME_ENV_DIR:-/etc/odin-pulse}"
ODIN_PULSE_DOCKER_NETWORK="${ODIN_PULSE_DOCKER_NETWORK:-hfcloud_net}"
ODIN_PULSE_COMPOSE_PROJECT="${ODIN_PULSE_COMPOSE_PROJECT:-odin-pulse}"
ODIN_PULSE_API_PORT="${ODIN_PULSE_API_PORT:-3101}"
ODIN_PULSE_WEB_PORT="${ODIN_PULSE_WEB_PORT:-3100}"
ODIN_PULSE_API_ENV_FILE="${ODIN_PULSE_API_ENV_FILE:-${ODIN_PULSE_RUNTIME_ENV_DIR}/api.env}"
ODIN_PULSE_WEB_ENV_FILE="${ODIN_PULSE_WEB_ENV_FILE:-${ODIN_PULSE_RUNTIME_ENV_DIR}/web.env}"
ODIN_PULSE_IMAGE_TAG="${ODIN_PULSE_IMAGE_TAG:-latest}"
NGINX_AVAILABLE="/etc/nginx/sites-available/codego.eu.org.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/codego.eu.org.conf"
COMPOSE_FILE="deploy/compose/docker-compose.prod.yml"

if [[ ! -d "${DEPLOY_PATH}/.git" ]]; then
  mkdir -p "${DEPLOY_PATH}"
  git clone --branch "${BRANCH}" "${REPO_URL}" "${DEPLOY_PATH}"
fi

cd "${DEPLOY_PATH}"

git fetch origin "${BRANCH}"
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  git switch "${BRANCH}"
else
  git switch --track -c "${BRANCH}" "origin/${BRANCH}"
fi
git pull --ff-only origin "${BRANCH}"

mkdir -p "${ODIN_PULSE_RUNTIME_ENV_DIR}"

for env_file in "${ODIN_PULSE_API_ENV_FILE}" "${ODIN_PULSE_WEB_ENV_FILE}"; do
  if [[ ! -s "${env_file}" ]]; then
    echo "Missing runtime env file: ${env_file}" >&2
    exit 1
  fi
  chmod 600 "${env_file}"
done

if ! docker network inspect "${ODIN_PULSE_DOCKER_NETWORK}" >/dev/null 2>&1; then
  docker network create "${ODIN_PULSE_DOCKER_NETWORK}" >/dev/null
fi

cp deploy/nginx/codego.eu.org.conf "${NGINX_AVAILABLE}"
ln -sf "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"

if [[ -f /etc/nginx/conf.d/biz.conf ]]; then
  perl -0pi -e 's/server_name codego\.eu\.org;/server_name codego-shortlink.internal;/g' /etc/nginx/conf.d/biz.conf
fi

nginx -t

if command -v systemctl >/dev/null 2>&1; then
  for service in odin-pulse-api odin-pulse-web; do
    if systemctl list-unit-files "${service}.service" >/dev/null 2>&1; then
      systemctl stop "${service}" || true
      systemctl disable "${service}" || true
    fi
  done
fi

export COMPOSE_PROJECT_NAME="${ODIN_PULSE_COMPOSE_PROJECT}"
export ODIN_PULSE_API_ENV_FILE
export ODIN_PULSE_WEB_ENV_FILE
export ODIN_PULSE_DOCKER_NETWORK
export ODIN_PULSE_API_PORT
export ODIN_PULSE_WEB_PORT
export ODIN_PULSE_IMAGE_TAG

docker compose -f "${COMPOSE_FILE}" config >/dev/null
docker compose -f "${COMPOSE_FILE}" build --pull
docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans

if command -v systemctl >/dev/null 2>&1; then
  systemctl reload nginx
else
  nginx -s reload
fi
docker compose -f "${COMPOSE_FILE}" ps

echo "Deployment completed at $(date -Is)"
