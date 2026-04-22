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
ODIN_PULSE_IMAGE_RETENTION="${ODIN_PULSE_IMAGE_RETENTION:-3}"
NGINX_AVAILABLE="/etc/nginx/sites-available/codego.eu.org.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/codego.eu.org.conf"
COMPOSE_FILE="deploy/compose/docker-compose.prod.yml"

log() {
  printf '[deploy] %s\n' "$*"
}

wait_for_container_health() {
  local container="$1"
  local attempts="${2:-24}"
  local sleep_seconds="${3:-5}"
  local state

  for ((i=1; i<=attempts; i++)); do
    state="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$container" 2>/dev/null || true)"
    case "$state" in
      healthy|running)
        log "$container is $state"
        return 0
        ;;
      unhealthy|exited|dead)
        log "$container is $state"
        docker logs --tail 100 "$container" || true
        return 1
        ;;
      *)
        log "waiting for $container health ($i/$attempts): ${state:-missing}"
        sleep "$sleep_seconds"
        ;;
    esac
  done

  log "timed out waiting for $container"
  docker logs --tail 100 "$container" || true
  return 1
}

cleanup_old_images() {
  local repo="$1"
  local keep="$2"
  mapfile -t images < <(docker images "$repo" --format '{{.Repository}}:{{.Tag}}' | grep -v ':<none>$' || true)
  if ((${#images[@]} <= keep)); then
    return 0
  fi

  mapfile -t keep_images < <(printf '%s\n' \
    "${repo}:${ODIN_PULSE_IMAGE_TAG}" \
    $(docker ps --format '{{.Image}}' | grep "^${repo}:" || true) | awk 'NF' | sort -u)

  mapfile -t removable < <(docker images "$repo" --format '{{.Repository}}:{{.Tag}} {{.CreatedAt}}' \
    | sort -rk2 \
    | awk '{print $1}')

  local kept=0
  for image in "${removable[@]}"; do
    if printf '%s\n' "${keep_images[@]}" | grep -Fxq "$image"; then
      continue
    fi
    kept=$((kept + 1))
    if (( kept > keep )); then
      log "removing old image tag $image"
      docker image rm "$image" || true
    fi
  done
}

if [[ ! -d "${DEPLOY_PATH}/.git" ]]; then
  mkdir -p "${DEPLOY_PATH}"
  git clone --branch "${BRANCH}" "${REPO_URL}" "${DEPLOY_PATH}"
fi

cd "${DEPLOY_PATH}"

log "syncing repository to origin/${BRANCH}"
git fetch origin "${BRANCH}"
if git show-ref --verify --quiet "refs/heads/${BRANCH}"; then
  git switch "${BRANCH}"
else
  git switch --track -c "${BRANCH}" "origin/${BRANCH}"
fi
git reset --hard "origin/${BRANCH}"
git clean -fd

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
  perl -0pi -e 's/server_name\s+codego-shortlink\.internal;/server_name s.codego.eu.org codego-shortlink.internal;/g' /etc/nginx/conf.d/biz.conf
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

log "validating compose configuration"
docker compose -f "${COMPOSE_FILE}" config >/dev/null

log "building images"
docker compose -f "${COMPOSE_FILE}" build --pull

log "starting containers"
docker compose -f "${COMPOSE_FILE}" up -d --remove-orphans

wait_for_container_health "${ODIN_PULSE_COMPOSE_PROJECT}-api-1"
wait_for_container_health "${ODIN_PULSE_COMPOSE_PROJECT}-web-1"

if command -v systemctl >/dev/null 2>&1; then
  systemctl reload nginx
else
  nginx -s reload
fi

log "final compose status"
docker compose -f "${COMPOSE_FILE}" ps

cleanup_old_images 'odin-pulse-api' "${ODIN_PULSE_IMAGE_RETENTION}"
cleanup_old_images 'odin-pulse-web' "${ODIN_PULSE_IMAGE_RETENTION}"

echo "Deployment completed at $(date -Is)"
