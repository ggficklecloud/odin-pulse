#!/usr/bin/env bash
set -euo pipefail

MYSQL_CONTAINER="${MYSQL_CONTAINER:-mysql}"
MYSQL_DATABASE="${MYSQL_DATABASE:-hfcloud_dev}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:?MYSQL_PASSWORD is required}"

PG_CONTAINER="${PG_CONTAINER:-timescaledb}"
PG_DATABASE="${PG_DATABASE:-quant_db}"
PG_USER="${PG_USER:-odin}"
PG_SCHEMA="${PG_SCHEMA:-public}"

PUBLIC_WEB_ORIGIN="${PUBLIC_WEB_ORIGIN:-https://codego.eu.org}"
TRUNCATE_FIRST="${TRUNCATE_FIRST:-true}"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "${TMP_DIR}"' EXIT

mysql_query() {
  local sql="$1"
  docker exec "${MYSQL_CONTAINER}" sh -lc \
    "MYSQL_PWD='${MYSQL_PASSWORD}' mysql --default-character-set=utf8mb4 -u'${MYSQL_USER}' -D'${MYSQL_DATABASE}' --batch --raw --skip-column-names -e \"${sql}\""
}

pg_exec() {
  local sql="$1"
  docker exec "${PG_CONTAINER}" psql -U "${PG_USER}" -d "${PG_DATABASE}" -v ON_ERROR_STOP=1 -c "${sql}"
}

pg_copy() {
  local table="$1"
  local columns="$2"
  local file="$3"

  if [[ ! -s "${file}" ]]; then
    return 0
  fi

  docker exec -i "${PG_CONTAINER}" psql -U "${PG_USER}" -d "${PG_DATABASE}" -v ON_ERROR_STOP=1 -c \
    "\\copy ${PG_SCHEMA}.${table} (${columns}) from stdin with (format text, delimiter E'\t', null '\\N')" < "${file}"
}

docker exec -i "${PG_CONTAINER}" psql -U "${PG_USER}" -d "${PG_DATABASE}" < /root/code/db/postgres/001_auth.sql

if [[ "${TRUNCATE_FIRST}" == "true" ]]; then
  pg_exec "truncate table ${PG_SCHEMA}.odin_open_user, ${PG_SCHEMA}.odin_union_user, ${PG_SCHEMA}.odin_email_verify, ${PG_SCHEMA}.platform_oauth_setting, ${PG_SCHEMA}.odin_platform restart identity cascade"
fi

mysql_query "select platform_id, platform_name, deleted, ifnull(date_format(create_time, '%Y-%m-%d %H:%i:%s'), '\\\\N'), ifnull(date_format(update_time, '%Y-%m-%d %H:%i:%s'), '\\\\N'), ifnull(jwt_secret, '') from odin_platform" > "${TMP_DIR}/odin_platform.tsv"
pg_copy "odin_platform" "platform_id, platform_name, deleted, create_time, update_time, jwt_secret" "${TMP_DIR}/odin_platform.tsv"

mysql_query "select union_id, ifnull(email, '__NULL__'), ifnull(uni_user_nickname, ''), ifnull(source, 1), ifnull(wx_open_id, ''), ifnull(github_id, '__NULL__'), ifnull(github_login_name, '__NULL__'), ifnull(github_name, '__NULL__'), ifnull(github_avatar_url, '__NULL__'), ifnull(google_id, '__NULL__'), ifnull(google_name, '__NULL__'), ifnull(google_family_name, '__NULL__'), ifnull(google_given_name, '__NULL__'), ifnull(google_email, '__NULL__'), ifnull(google_email_verified, '__NULL__'), ifnull(google_avatar_url, '__NULL__'), ifnull(deleted, 0), ifnull(date_format(create_time, '%Y-%m-%d %H:%i:%s'), '__NULL__'), ifnull(date_format(update_time, '%Y-%m-%d %H:%i:%s'), '__NULL__') from odin_union_user" > "${TMP_DIR}/odin_union_user.tsv"
sed -i 's/__NULL__/\\N/g' "${TMP_DIR}/odin_union_user.tsv"
pg_copy "odin_union_user" "union_id, email, uni_user_nickname, source, wx_open_id, github_id, github_login_name, github_name, github_avatar_url, google_id, google_name, google_family_name, google_given_name, google_email, google_email_verified, google_avatar_url, deleted, create_time, update_time" "${TMP_DIR}/odin_union_user.tsv"

mysql_query "select open_id, union_id, platform_id, ifnull(open_user_nickname, ''), ifnull(open_username, ''), ifnull(open_user_password, ''), ifnull(avatar, '__NULL__'), ifnull(source, 1), ifnull(open_user_status, 1), ifnull(deleted, 0), ifnull(date_format(create_time, '%Y-%m-%d %H:%i:%s'), '__NULL__'), ifnull(date_format(update_time, '%Y-%m-%d %H:%i:%s'), '__NULL__') from odin_open_user" > "${TMP_DIR}/odin_open_user.tsv"
sed -i 's/__NULL__/\\N/g' "${TMP_DIR}/odin_open_user.tsv"
pg_copy "odin_open_user" "open_id, union_id, platform_id, open_user_nickname, open_username, open_user_password, avatar, source, open_user_status, deleted, create_time, update_time" "${TMP_DIR}/odin_open_user.tsv"

mysql_query "select id, ifnull(email, '__NULL__'), platform_id, code, type, ifnull(date_format(expire_time, '%Y-%m-%d %H:%i:%s'), '__NULL__'), status, ifnull(deleted, 0), ifnull(date_format(create_time, '%Y-%m-%d %H:%i:%s'), '__NULL__'), ifnull(date_format(update_time, '%Y-%m-%d %H:%i:%s'), '__NULL__') from odin_email_verify" > "${TMP_DIR}/odin_email_verify.tsv"
sed -i 's/__NULL__/\\N/g' "${TMP_DIR}/odin_email_verify.tsv"
pg_copy "odin_email_verify" "id, email, platform_id, code, type, expire_time, status, deleted, create_time, update_time" "${TMP_DIR}/odin_email_verify.tsv"
pg_exec "select setval(pg_get_serial_sequence('${PG_SCHEMA}.odin_email_verify', 'id'), coalesce((select max(id) from ${PG_SCHEMA}.odin_email_verify), 1), true)"

mysql_query "select id, platform_name, oauth_platform, ifnull(client_id, '__NULL__'), ifnull(client_secret, '__NULL__'), case when oauth_platform = 'github' then '${PUBLIC_WEB_ORIGIN}/oauth/github-callback' when oauth_platform = 'google' then '${PUBLIC_WEB_ORIGIN}/oauth/google-callback' else ifnull(redirect_uri, '__NULL__') end, ifnull(scope, '__NULL__'), ifnull(extend_params, '__NULL__'), ifnull(deleted, 0), ifnull(date_format(create_time, '%Y-%m-%d %H:%i:%s'), '__NULL__'), ifnull(date_format(update_time, '%Y-%m-%d %H:%i:%s'), '__NULL__') from platform_oauth_setting" > "${TMP_DIR}/platform_oauth_setting.tsv"
sed -i 's/__NULL__/\\N/g' "${TMP_DIR}/platform_oauth_setting.tsv"
pg_copy "platform_oauth_setting" "id, platform_name, oauth_platform, client_id, client_secret, redirect_uri, scope, extend_params, deleted, create_time, update_time" "${TMP_DIR}/platform_oauth_setting.tsv"
pg_exec "select setval(pg_get_serial_sequence('${PG_SCHEMA}.platform_oauth_setting', 'id'), coalesce((select max(id) from ${PG_SCHEMA}.platform_oauth_setting), 1), true)"

echo "Auth data migrated from MySQL(${MYSQL_DATABASE}) to PostgreSQL(${PG_DATABASE})."
