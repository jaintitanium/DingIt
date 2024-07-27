alter table "public"."service_provider_user" drop constraint "service_provider_user_id_fkey";

create table "public"."settings" (
    "key" text not null,
    "value" text not null
);


alter table "public"."settings" enable row level security;

alter table "public"."service_provider_user" add column "service_provider" uuid not null;

alter table "public"."service_provider_user" add column "user_id" uuid not null;

alter table "public"."service_provider_user" alter column "id" set default gen_random_uuid();

CREATE UNIQUE INDEX settings_pkey ON public.settings USING btree (key);

CREATE UNIQUE INDEX user_service_provider_unique ON public.service_provider_user USING btree (user_id, service_provider);

alter table "public"."settings" add constraint "settings_pkey" PRIMARY KEY using index "settings_pkey";

alter table "public"."service_provider_user" add constraint "service_provider_user_service_provider_fkey" FOREIGN KEY (service_provider) REFERENCES service_provider(id) not valid;

alter table "public"."service_provider_user" validate constraint "service_provider_user_service_provider_fkey";

alter table "public"."service_provider_user" add constraint "service_provider_user_user_id_fkey" FOREIGN KEY (user_id) REFERENCES "user"(id) not valid;

alter table "public"."service_provider_user" validate constraint "service_provider_user_user_id_fkey";

alter table "public"."service_provider_user" add constraint "user_service_provider_unique" UNIQUE using index "user_service_provider_unique";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_user_by_email(email_address text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
	IF auth.role() != 'service_role' THEN
		RAISE EXCEPTION 'Must be Admin to execute';
	END IF;
	RETURN (SELECT id FROM auth.users WHERE email = email_address LIMIT 1);
END;$function$
;

grant delete on table "public"."settings" to "anon";

grant insert on table "public"."settings" to "anon";

grant references on table "public"."settings" to "anon";

grant select on table "public"."settings" to "anon";

grant trigger on table "public"."settings" to "anon";

grant truncate on table "public"."settings" to "anon";

grant update on table "public"."settings" to "anon";

grant delete on table "public"."settings" to "authenticated";

grant insert on table "public"."settings" to "authenticated";

grant references on table "public"."settings" to "authenticated";

grant select on table "public"."settings" to "authenticated";

grant trigger on table "public"."settings" to "authenticated";

grant truncate on table "public"."settings" to "authenticated";

grant update on table "public"."settings" to "authenticated";

grant delete on table "public"."settings" to "service_role";

grant insert on table "public"."settings" to "service_role";

grant references on table "public"."settings" to "service_role";

grant select on table "public"."settings" to "service_role";

grant trigger on table "public"."settings" to "service_role";

grant truncate on table "public"."settings" to "service_role";

grant update on table "public"."settings" to "service_role";

create policy "Owner can DELETE"
on "public"."service_provider_user"
as permissive
for delete
to authenticated
using (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_user.service_provider)));


create policy "Owner can INSERT"
on "public"."service_provider_user"
as permissive
for insert
to authenticated
with check (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_user.service_provider)));


create policy "Owner can SELECT"
on "public"."service_provider_user"
as permissive
for select
to authenticated
using (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_user.service_provider)));


create policy "Owner can UPDATE"
on "public"."service_provider_user"
as permissive
for update
to authenticated
using (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_user.service_provider)))
with check (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_user.service_provider)));


create policy "Public can SELECT"
on "public"."service_provider_user"
as permissive
for select
to public
using (true);



