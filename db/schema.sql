-- PostgreSQL schema for category-scoped authenticated help desk sessions.
create type user_role as enum ('employee', 'agent', 'manager');
create type ticket_status as enum ('open', 'in_progress', 'waiting', 'resolved');

create table categories (
  category_id integer generated always as identity primary key,
  name text not null unique
);

create table users (
  user_id integer generated always as identity primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  role user_role not null default 'employee',
  category_id integer references categories(category_id),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint employee_category_required check (role <> 'employee' or category_id is not null)
);

create table tickets (
  ticket_id integer generated always as identity primary key,
  title text not null,
  description text not null,
  category_id integer not null references categories(category_id),
  status ticket_status not null default 'open',
  requester_id integer not null references users(user_id),
  assignee_id integer references users(user_id),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table comments (
  comment_id integer generated always as identity primary key,
  ticket_id integer not null references tickets(ticket_id) on delete cascade,
  author_id integer not null references users(user_id),
  body text not null,
  created_at timestamptz not null default now()
);

create table internal_notes (
  note_id integer generated always as identity primary key,
  ticket_id integer not null references tickets(ticket_id) on delete cascade,
  author_id integer not null references users(user_id),
  body text not null,
  created_at timestamptz not null default now()
);

create index tickets_category_id_idx on tickets(category_id);
create index users_category_id_idx on users(category_id);

insert into categories (name) values
  ('Hardware'), ('Software'), ('Access & accounts'), ('Network');

-- In production, authenticate with a password-hash verifier, then put the
-- authenticated user's category_id in the server-side session/JWT claims.
-- Employees use their assigned category scope:
-- select * from tickets where category_id = $1 and requester_id = $2;
-- Managers and technical agents have no category_id and may view all categories.