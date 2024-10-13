create table "public"."service_provider_hours" (
    "id" uuid not null default gen_random_uuid(),
    "service_provider" uuid not null,
    "day_of_week" smallint not null default '0'::smallint,
    "open_time" time without time zone not null,
    "close_time" time without time zone not null
);


alter table "public"."service_provider_hours" enable row level security;

alter table "public"."service_provider" add column "header_image" uuid;

alter table "public"."service_provider" add column "timezone" text;

CREATE UNIQUE INDEX service_provider_hours_pkey ON public.service_provider_hours USING btree (id);

alter table "public"."service_provider_hours" add constraint "service_provider_hours_pkey" PRIMARY KEY using index "service_provider_hours_pkey";

alter table "public"."service_provider" add constraint "service_provider_header_image_fkey" FOREIGN KEY (header_image) REFERENCES storage.objects(id) not valid;

alter table "public"."service_provider" validate constraint "service_provider_header_image_fkey";

alter table "public"."service_provider_hours" add constraint "service_provider_hours_service_provider_fkey" FOREIGN KEY (service_provider) REFERENCES service_provider(id) not valid;

alter table "public"."service_provider_hours" validate constraint "service_provider_hours_service_provider_fkey";

grant delete on table "public"."service_provider_hours" to "anon";

grant insert on table "public"."service_provider_hours" to "anon";

grant references on table "public"."service_provider_hours" to "anon";

grant select on table "public"."service_provider_hours" to "anon";

grant trigger on table "public"."service_provider_hours" to "anon";

grant truncate on table "public"."service_provider_hours" to "anon";

grant update on table "public"."service_provider_hours" to "anon";

grant delete on table "public"."service_provider_hours" to "authenticated";

grant insert on table "public"."service_provider_hours" to "authenticated";

grant references on table "public"."service_provider_hours" to "authenticated";

grant select on table "public"."service_provider_hours" to "authenticated";

grant trigger on table "public"."service_provider_hours" to "authenticated";

grant truncate on table "public"."service_provider_hours" to "authenticated";

grant update on table "public"."service_provider_hours" to "authenticated";

grant delete on table "public"."service_provider_hours" to "service_role";

grant insert on table "public"."service_provider_hours" to "service_role";

grant references on table "public"."service_provider_hours" to "service_role";

grant select on table "public"."service_provider_hours" to "service_role";

grant trigger on table "public"."service_provider_hours" to "service_role";

grant truncate on table "public"."service_provider_hours" to "service_role";

grant update on table "public"."service_provider_hours" to "service_role";

create policy "Enable read access for all users"
on "public"."service_provider"
as permissive
for select
to public
using (true);


create policy "Enable read access for all users"
on "public"."service_provider_hours"
as permissive
for select
to public
using (true);



