create table "public"."service_provider" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "display_name" character varying not null
);


alter table "public"."service_provider" enable row level security;

CREATE UNIQUE INDEX service_provider_pkey ON public.service_provider USING btree (id);

alter table "public"."service_provider" add constraint "service_provider_pkey" PRIMARY KEY using index "service_provider_pkey";

grant delete on table "public"."service_provider" to "anon";

grant insert on table "public"."service_provider" to "anon";

grant references on table "public"."service_provider" to "anon";

grant select on table "public"."service_provider" to "anon";

grant trigger on table "public"."service_provider" to "anon";

grant truncate on table "public"."service_provider" to "anon";

grant update on table "public"."service_provider" to "anon";

grant delete on table "public"."service_provider" to "authenticated";

grant insert on table "public"."service_provider" to "authenticated";

grant references on table "public"."service_provider" to "authenticated";

grant select on table "public"."service_provider" to "authenticated";

grant trigger on table "public"."service_provider" to "authenticated";

grant truncate on table "public"."service_provider" to "authenticated";

grant update on table "public"."service_provider" to "authenticated";

grant delete on table "public"."service_provider" to "service_role";

grant insert on table "public"."service_provider" to "service_role";

grant references on table "public"."service_provider" to "service_role";

grant select on table "public"."service_provider" to "service_role";

grant trigger on table "public"."service_provider" to "service_role";

grant truncate on table "public"."service_provider" to "service_role";

grant update on table "public"."service_provider" to "service_role";


