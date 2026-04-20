#!/usr/bin/env bash
set -euo pipefail

DEPLOY_PATH="${DEPLOY_PATH:-/opt/odin-pulse}"
REPO_URL="${REPO_URL:?REPO_URL is required}"
BRANCH="${BRANCH:-main}"
SYSTEMD_DIR="/etc/systemd/system"
NGINX_AVAILABLE="/etc/nginx/sites-available/codego.eu.org.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/codego.eu.org.conf"

if [[ ! -d "${DEPLOY_PATH}/.git" ]]; then
  mkdir -p "${DEPLOY_PATH}"
  git clone --branch "${BRANCH}" "${REPO_URL}" "${DEPLOY_PATH}"
fi

cd "${DEPLOY_PATH}"

git fetch origin "${BRANCH}"
git checkout "${BRANCH}"
git reset --hard "origin/${BRANCH}"

pnpm install --frozen-lockfile
pnpm --filter @odin-pulse/shared build
pnpm --filter @odin-pulse/api build
pnpm --filter @odin-pulse/web build

sed "s|/opt/odin-pulse|${DEPLOY_PATH}|g" deploy/systemd/odin-pulse-api.service > "${SYSTEMD_DIR}/odin-pulse-api.service"
sed "s|/opt/odin-pulse|${DEPLOY_PATH}|g" deploy/systemd/odin-pulse-web.service > "${SYSTEMD_DIR}/odin-pulse-web.service"
cp deploy/nginx/codego.eu.org.conf "${NGINX_AVAILABLE}"
ln -sf "${NGINX_AVAILABLE}" "${NGINX_ENABLED}"

if [[ -f /etc/nginx/conf.d/biz.conf ]]; then
  perl -0pi -e 's/server_name codego\.eu\.org;/server_name codego-shortlink.internal;/g' /etc/nginx/conf.d/biz.conf
fi

systemctl daemon-reload
nginx -t
systemctl restart odin-pulse-api
systemctl restart odin-pulse-web
systemctl reload nginx

echo "Deployment completed at $(date -Is)"
