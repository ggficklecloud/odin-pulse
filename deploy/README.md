# Production Deployment

Odin Pulse production deployment now keeps host `nginx` in place and runs only `web` + `api` in Docker.

## Runtime Shape

- `nginx` stays on the host and proxies to `127.0.0.1:3100` for web and `127.0.0.1:3101` for api.
- `web` and `api` are built from this repo with Docker and started by `docker compose`.
- Both app containers join the existing external Docker network `hfcloud_net`.
- `api` reaches PostgreSQL / Redis / Elasticsearch through Docker-network hostnames on `hfcloud_net`, not `127.0.0.1`.
- MySQL is not part of the runtime path.

## Files

- `apps/web/Dockerfile`
- `apps/api/Dockerfile`
- `deploy/compose/docker-compose.prod.yml`
- `deploy/nginx/codego.eu.org.conf`
- `scripts/install_server.sh`
- `scripts/deploy_remote.sh`
- `.github/workflows/deploy.yml`

## GitHub Configuration

Required GitHub Secrets:

- `PROD_API_ENV`: full production contents for `/etc/odin-pulse/api.env`
- `PROD_WEB_ENV`: full production contents for `/etc/odin-pulse/web.env`

Required GitHub Variables:

- None. The workflow has safe defaults.

Recommended GitHub Variables:

- `DEPLOY_PATH=/opt/odin-pulse`
- `ODIN_PULSE_RUNTIME_ENV_DIR=/etc/odin-pulse`

Optional GitHub Variables:

- `ODIN_PULSE_DOCKER_NETWORK=hfcloud_net`
- `ODIN_PULSE_COMPOSE_PROJECT=odin-pulse`
- `ODIN_PULSE_API_PORT=3101`
- `ODIN_PULSE_WEB_PORT=3100`

## Secret Contents

`PROD_API_ENV` should contain the complete api runtime env blob. Recommended production shape:

```dotenv
API_HOST=0.0.0.0
API_PORT=3101
CORS_ORIGIN=https://codego.eu.org
POSTGRES_HOST=<existing-postgres-dns-name-on-hfcloud_net>
POSTGRES_PORT=5432
POSTGRES_USER=<postgres-user>
POSTGRES_PASSWORD=<postgres-password>
POSTGRES_DATABASE=quant_db
POSTGRES_SCHEMA=public
POSTGRES_SSL=false
POSTGRES_POOL_MAX=10
REDIS_HOST=<existing-redis-dns-name-on-hfcloud_net>
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>
REDIS_DATABASE=2
SESSION_COOKIE_NAME=JSESSIONID
SESSION_TTL_SECONDS=1296000
SESSION_SECURE=true
SESSION_SAME_SITE=lax
AUTH_ENABLED=true
AUTH_PLATFORM_NAME=odin
AUTH_DEFAULT_PASSWORD=<set-explicitly>
AUTH_ADMIN_EMAILS=<comma-separated-admin-emails>
SMTP_HOST=<smtp-host>
SMTP_PORT=587
SMTP_USER=<smtp-user>
SMTP_PASSWORD=<smtp-password>
SMTP_FROM=<smtp-from-address>
ES_NODE=http://<existing-elasticsearch-dns-name-on-hfcloud_net>:9200
ES_USERNAME=<elasticsearch-username>
ES_PASSWORD=<elasticsearch-password>
ES_INDEX=finance_news
FETCH_INTERVAL_MS=120000
REFRESH_GUARD_MS=60000
SCHEDULE_ENABLED=true
```

`PROD_WEB_ENV` should contain the complete web runtime env blob:

```dotenv
API_BASE_URL=http://api:3101
```

Notes:

- `API_BASE_URL` is server-side only. Browser requests use the same-origin `/api` path via host `nginx`.
- Keep the PostgreSQL / Redis / Elasticsearch hostnames aligned with the existing middleware container aliases on `hfcloud_net`.
- Do not store any live credentials in tracked files. Only the GitHub secrets should contain real values.

## Rollout

Server bootstrap:

```bash
chmod +x scripts/install_server.sh scripts/deploy_remote.sh
sudo ./scripts/install_server.sh /opt/odin-pulse
```

Deployment flow:

1. GitHub Actions writes `PROD_API_ENV` and `PROD_WEB_ENV` to `/etc/odin-pulse/api.env` and `/etc/odin-pulse/web.env`.
2. `scripts/deploy_remote.sh` updates the deploy checkout safely with `git pull --ff-only`.
3. The deploy script stops and disables the legacy `odin-pulse-api` / `odin-pulse-web` systemd units so ports `3100/3101` are free.
4. `docker compose -f deploy/compose/docker-compose.prod.yml build --pull`
5. `docker compose -f deploy/compose/docker-compose.prod.yml up -d --remove-orphans`
6. Host `nginx` is validated and reloaded.

## Validation

Useful commands:

```bash
pnpm typecheck
pnpm lint
pnpm build
ODIN_PULSE_API_ENV_FILE=$PWD/deploy/env/api.env.example \
ODIN_PULSE_WEB_ENV_FILE=$PWD/deploy/env/web.env.example \
docker compose -f deploy/compose/docker-compose.prod.yml config
```

## Caveats

- The first Docker rollout will intentionally stop the legacy systemd app units to avoid port conflicts.
- `web` talks to `api` over the compose network using `http://api:3101`.
- `api` must use the real middleware DNS names on `hfcloud_net`; do not leave localhost values in production.
- If any middleware container lacks a stable alias on `hfcloud_net`, fix that before switching production traffic.

