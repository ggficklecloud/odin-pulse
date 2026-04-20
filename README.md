# Odin Pulse

一期目标是先落一个可扩展业务门户里的新闻聚合模块，而不是做成一次性的纯新闻站。

当前实现包含：

- `apps/web`: Next.js 16 + TypeScript 前端，首页预留后续业务入口，`/news` 提供新闻检索与浏览。
- `apps/api`: Fastify + TypeScript 后端，复刻 `FinanceNewsService#scheduledFetch` 的核心行为，每 2 分钟抓取多源新闻并写入 Elasticsearch；同时已接入 PostgreSQL + Redis 的认证会话基础设施。
- `deploy`: systemd、nginx 和 GitHub Actions 发布所需模板。
- `packages/shared`: 前后端共享的新闻类型与模块常量。
- `design-system/odin-pulse`: 通过 `ui-ux-pro-max` 生成并持久化的设计系统文档。

## 当前接入的数据基础设施

- Elasticsearch: `http://127.0.0.1:9200`
- Index: `finance_news`
- PostgreSQL / TimescaleDB: `127.0.0.1:5432`
- PostgreSQL Database: `quant_db`
- Redis: `127.0.0.1:6379`

说明：

- 当前新闻模块已经调整为 ES-only，不再写 MySQL。
- 后续如果有关系型数据需求，统一走 PostgreSQL / TimescaleDB，不再继续扩展 MySQL。
- 认证相关数据已经规划/迁移到 PostgreSQL，session 使用 Redis 管理。

## 已接入的新闻源

- 华尔街见闻快讯
- 华尔街见闻新闻流
- 金十数据
- 36 氪快讯
- 财联社
- 澎湃新闻
- 凤凰网

## 启动方式

先安装依赖：

```bash
pnpm install
```

启动前端和后端：

```bash
pnpm dev
```

开发默认地址：

- Web: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:3001](http://localhost:3001)

生产默认端口：

- Web: `127.0.0.1:3100`
- API: `127.0.0.1:3101`

推荐发布入口：

- 前端入口：`https://codego.eu.org`
- 后端入口：不单独暴露子域名，直接由 Nginx 在同域反代 `/api` 和 `/finance` 到 `127.0.0.1:3101`

这样做的原因很直接：

- 不需要额外申请/维护 `api.codego.eu.org`
- 避免 CORS
- 前端和后端可以统一走 Cloudflare / Nginx

## 发布结构

仓库里已经包含以下发布资源：

- [deploy/nginx/codego.eu.org.conf](/root/code/deploy/nginx/codego.eu.org.conf)
- [deploy/systemd/odin-pulse-api.service](/root/code/deploy/systemd/odin-pulse-api.service)
- [deploy/systemd/odin-pulse-web.service](/root/code/deploy/systemd/odin-pulse-web.service)
- [scripts/install_server.sh](/root/code/scripts/install_server.sh)
- [scripts/deploy_remote.sh](/root/code/scripts/deploy_remote.sh)
- [deploy.yml](/root/code/.github/workflows/deploy.yml)
- [ci.yml](/root/code/.github/workflows/ci.yml)

发布策略：

- GitHub 仓库公开
- 敏感配置只放服务器 `/etc/odin-pulse/*.env`
- Deploy workflow 跑在当前服务器上的 self-hosted runner
- 推送到 `main` 后，Actions 在本机执行拉取、构建、重启服务
- 如果服务器上存在历史遗留的 `codego.eu.org` Nginx 站点，安装/发布脚本会自动把该冲突入口挪开，避免抢占新站点的 443 server_name

## GitHub Variables

需要配置的 GitHub Variables：

- `DEPLOY_PATH`

默认建议：

- `DEPLOY_PATH=/opt/odin-pulse`

## 服务器初始化

首次在服务器执行：

```bash
chmod +x scripts/install_server.sh scripts/deploy_remote.sh
sudo ./scripts/install_server.sh /opt/odin-pulse
```

然后编辑：

- `/etc/odin-pulse/api.env`
- `/etc/odin-pulse/web.env`

其中：

- `api.env` 放 ES 等敏感连接信息
- `api.env` 也预留了 PostgreSQL 连接参数，供后续用户数据、收藏、配置等关系型业务使用
- `api.env` 同时承载 Redis session、SMTP、管理员邮箱白名单等认证运行时配置
- `web.env` 生产环境建议写：

```bash
API_BASE_URL=http://127.0.0.1:3101
NEXT_PUBLIC_API_BASE_URL=/api
```

## Self-hosted Runner

当前发布已经切到 self-hosted runner，原因是 GitHub 托管 runner 无法稳定直连这台服务器的 SSH 端口。

优点：

- 不需要把 SSH 私钥放到 GitHub Secrets
- 部署直接在源站本机执行
- 防火墙和外网 SSH 可达性不再阻塞发布

## 常用命令

```bash
pnpm typecheck
pnpm build
pnpm --filter @odin-pulse/api dev
pnpm --filter @odin-pulse/web dev
```

## API 概览

- `GET /health`
- `GET /api/v1/news`
- `GET /api/v1/news/stats`
- `POST /api/v1/news/refresh`
- `POST /api/v1/news/sync`
- `POST /api/v1/auth/email-verify/send`
- `POST /api/v1/auth/email-verify/login`
- `POST /api/v1/auth/email-verify/login-by-password`
- `GET /api/v1/auth/github-oauth-url`
- `GET /api/v1/auth/google-oauth-url`
- `POST /api/v1/auth/github-callback`
- `POST /api/v1/auth/google-callback`
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/user/get-user-info`
- `POST /api/v1/user/update-user-info`

兼容保留了老风格入口：

- `GET /finance/news`
- `GET /finance/news/refresh`
- `GET /finance/news/sync`

## 环境变量

示例文件：

- [apps/api/.env.example](/root/code/apps/api/.env.example)
- [apps/web/.env.example](/root/code/apps/web/.env.example)

当前已经预留 PostgreSQL 连接配置，但新闻模块本身仍然只写 ES。

## Auth Migration

认证迁移目标：

- 用户表：`odin_union_user`
- 平台用户表：`odin_open_user`
- OAuth 设置：`platform_oauth_setting`
- 邮箱验证码：`odin_email_verify`
- 平台表：`odin_platform`

PostgreSQL 建表脚本：

- [001_auth.sql](/root/code/db/postgres/001_auth.sql)

本地迁移脚本：

- [migrate_auth_mysql_to_pg.sh](/root/code/scripts/migrate_auth_mysql_to_pg.sh)

说明：

- GitHub / Google 的 `client_id`、`client_secret` 不写入代码仓库
- 它们作为数据库数据或运行时环境存在
- 迁移脚本会把 OAuth 回调地址更新为 `https://codego.eu.org/oauth/github-callback` 和 `https://codego.eu.org/oauth/google-callback`
- 第三方平台控制台也必须同步允许这两个新回调地址，否则登录不会成功

## 设计系统

来自 `ui-ux-pro-max` 的产物已落盘：

- [MASTER.md](/root/code/design-system/odin-pulse/MASTER.md)
- [news-home.md](/root/code/design-system/odin-pulse/pages/news-home.md)

当前界面遵循的方向：

- 企业门户而不是纯内容站
- Navy / Gold 主色
- `Poppins` 标题 + `Open Sans` 正文
- Soft UI Evolution 的轻层次感和可访问性约束
