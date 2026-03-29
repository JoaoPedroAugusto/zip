-- Create schemas and tables
create table "public"."partners" (
  "id" uuid references auth.users not null primary key,
  "name" text not null,
  "email" text unique not null,
  "quota_percentage" numeric default 0.0,
  "total_invested" numeric default 0.0,
  "payment_status" text default 'PENDENTE',
  "role" text default 'socio',
  "phone" text,
  "join_date" date default now(),
  "monthly_contribution" numeric default 0.0
);

create table "public"."cash_flow" (
  "id" uuid default gen_random_uuid() primary key,
  "date" date not null,
  "type" text not null,
  "category" text not null,
  "value" numeric not null,
  "responsible" text not null,
  "receipt_link" text,
  "description" text,
  "created_at" timestamp with time zone default now()
);

create table "public"."flocks" (
  "id" uuid default gen_random_uuid() primary key,
  "start_date" date not null,
  "initial_quantity" integer not null,
  "current_quantity" integer not null,
  "accumulated_mortality" integer default 0,
  "average_weight" numeric default 0.0,
  "daily_feed_consumption" numeric default 0.0,
  "expected_sale_date" date,
  "status" text default 'ATIVO',
  "total_feed_consumed" numeric default 0.0,
  "total_weight_gain" numeric default 0.0,
  "breed" text,
  "batch_cost" numeric default 0.0,
  "created_at" timestamp with time zone default now()
);

create table "public"."goals" (
  "id" integer primary key default 1,
  "monthly_goal" numeric default 0.0,
  "collected_value" numeric default 0.0,
  "projected_roi" numeric default 0.0,
  "realized_roi" numeric default 0.0
);

create table "public"."market_alerts" (
  "id" uuid default gen_random_uuid() primary key,
  "date" date not null,
  "title" text not null,
  "description" text,
  "impact" text,
  "source" text,
  "created_at" timestamp with time zone default now()
);

create table "public"."notifications" (
  "id" uuid default gen_random_uuid() primary key,
  "date" timestamp with time zone default now(),
  "title" text not null,
  "message" text not null,
  "read_by" jsonb default '[]'::jsonb, -- array of user ids who read it
  "type" text,
  "exclude_user_id" text
);

create table "public"."settings" (
  "user_id" uuid references auth.users not null primary key,
  "dark_mode" boolean default false,
  "language" text default 'pt-BR'
);

-- Row Level Security (RLS) setup

-- Enable RLS
alter table "public"."partners" enable row level security;
alter table "public"."cash_flow" enable row level security;
alter table "public"."flocks" enable row level security;
alter table "public"."goals" enable row level security;
alter table "public"."market_alerts" enable row level security;
alter table "public"."notifications" enable row level security;
alter table "public"."settings" enable row level security;

-- Everyone authenticated can see, modify (for now) to speed up MVP
create policy "Enable all access for authenticated users to partners" on "public"."partners" for all to authenticated using (true);
create policy "Enable all access for authenticated users to cash flow" on "public"."cash_flow" for all to authenticated using (true);
create policy "Enable all access for authenticated users to flocks" on "public"."flocks" for all to authenticated using (true);
create policy "Enable all access for authenticated users to goals" on "public"."goals" for all to authenticated using (true);
create policy "Enable all access for authenticated users to market alerts" on "public"."market_alerts" for all to authenticated using (true);
create policy "Enable all access for authenticated users to notifications" on "public"."notifications" for all to authenticated using (true);
create policy "Enable all access for authenticated users to settings own data" on "public"."settings" for all to authenticated using (auth.uid() = user_id);

-- Initialize single data entry for goals if not exists
insert into public.goals (id, monthly_goal, collected_value, projected_roi, realized_roi) values (1, 0, 0, 0, 0) on conflict (id) do nothing;
