create table if not exists odin_platform (
  platform_id text primary key,
  platform_name text not null,
  deleted smallint not null default 0,
  create_time timestamptz not null default now(),
  update_time timestamptz not null default now(),
  jwt_secret text not null default ''
);

drop index if exists idx_odin_platform_name;
create unique index if not exists uq_odin_platform_name_active
  on odin_platform (platform_name)
  where deleted = 0;

create table if not exists odin_union_user (
  union_id text primary key,
  email text,
  uni_user_nickname text not null default '',
  source integer not null default 1,
  wx_open_id text not null default '',
  github_id bigint,
  github_login_name text,
  github_name text,
  github_avatar_url text,
  google_id text,
  google_name text,
  google_family_name text,
  google_given_name text,
  google_email text,
  google_email_verified boolean,
  google_avatar_url text,
  deleted smallint not null default 0,
  create_time timestamptz not null default now(),
  update_time timestamptz not null default now()
);

create index if not exists idx_odin_union_user_email
  on odin_union_user (email);

create unique index if not exists uq_odin_union_user_email
  on odin_union_user (email)
  where deleted = 0 and email is not null and email <> '';

create index if not exists idx_odin_union_user_github_id
  on odin_union_user (github_id);

create unique index if not exists uq_odin_union_user_github_id
  on odin_union_user (github_id)
  where deleted = 0 and github_id is not null;

create index if not exists idx_odin_union_user_google_id
  on odin_union_user (google_id);

create unique index if not exists uq_odin_union_user_google_id
  on odin_union_user (google_id)
  where deleted = 0 and google_id is not null and google_id <> '';

create table if not exists odin_open_user (
  open_id text primary key,
  union_id text not null,
  platform_id text not null,
  open_user_nickname text not null default '',
  open_username text not null default '',
  open_user_password text not null default '',
  avatar text,
  source integer not null default 1,
  open_user_status smallint not null default 0,
  deleted smallint not null default 0,
  create_time timestamptz not null default now(),
  update_time timestamptz not null default now(),
  constraint fk_open_user_union_user
    foreign key (union_id) references odin_union_user(union_id) on delete cascade,
  constraint fk_open_user_platform
    foreign key (platform_id) references odin_platform(platform_id) on delete cascade
);

create index if not exists idx_odin_open_user_union_username
  on odin_open_user (union_id, open_username);

create index if not exists idx_odin_open_user_platform_union
  on odin_open_user (platform_id, union_id);

create unique index if not exists uq_odin_open_user_platform_union
  on odin_open_user (platform_id, union_id)
  where deleted = 0;

create index if not exists idx_odin_open_user_create_time
  on odin_open_user (create_time desc);

create table if not exists odin_email_verify (
  id bigint generated always as identity primary key,
  email text,
  platform_id text not null default '',
  code text,
  type integer,
  expire_time timestamptz,
  status integer,
  deleted integer not null default 0,
  create_time timestamptz not null default now(),
  update_time timestamptz not null default now()
);

create index if not exists idx_odin_email_verify_lookup
  on odin_email_verify (platform_id, email, status, type, id desc);

create table if not exists platform_oauth_setting (
  id integer generated always as identity primary key,
  platform_name text not null,
  oauth_platform text,
  client_id text,
  client_secret text,
  redirect_uri text,
  scope text,
  extend_params text,
  deleted smallint not null default 0,
  create_time timestamptz not null default now(),
  update_time timestamptz not null default now()
);

create unique index if not exists idx_platform_oauth_setting_platform_oauth
  on platform_oauth_setting (platform_name, oauth_platform);
