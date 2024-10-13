drop policy "Owner can DELETE" on "public"."service_provider_user";

drop policy "Owner can INSERT" on "public"."service_provider_user";

drop policy "Owner can SELECT" on "public"."service_provider_user";

drop policy "Owner can UPDATE" on "public"."service_provider_user";

drop policy "Public can SELECT" on "public"."service_provider_user";

revoke delete on table "public"."service_provider_user" from "anon";

revoke insert on table "public"."service_provider_user" from "anon";

revoke references on table "public"."service_provider_user" from "anon";

revoke select on table "public"."service_provider_user" from "anon";

revoke trigger on table "public"."service_provider_user" from "anon";

revoke truncate on table "public"."service_provider_user" from "anon";

revoke update on table "public"."service_provider_user" from "anon";

revoke delete on table "public"."service_provider_user" from "authenticated";

revoke insert on table "public"."service_provider_user" from "authenticated";

revoke references on table "public"."service_provider_user" from "authenticated";

revoke select on table "public"."service_provider_user" from "authenticated";

revoke trigger on table "public"."service_provider_user" from "authenticated";

revoke truncate on table "public"."service_provider_user" from "authenticated";

revoke update on table "public"."service_provider_user" from "authenticated";

revoke delete on table "public"."service_provider_user" from "service_role";

revoke insert on table "public"."service_provider_user" from "service_role";

revoke references on table "public"."service_provider_user" from "service_role";

revoke select on table "public"."service_provider_user" from "service_role";

revoke trigger on table "public"."service_provider_user" from "service_role";

revoke truncate on table "public"."service_provider_user" from "service_role";

revoke update on table "public"."service_provider_user" from "service_role";

alter table "public"."service_provider_user" drop constraint "service_provider_user_service_provider_fkey";

alter table "public"."service_provider_user" drop constraint "service_provider_user_user_id_fkey";

alter table "public"."service_provider_user" drop constraint "user_service_provider_unique";

alter table "public"."service_provider_user" drop constraint "service_provider_user_pkey";

drop index if exists "public"."service_provider_user_pkey";

drop index if exists "public"."user_service_provider_unique";

drop table "public"."service_provider_user";

create table "public"."service_provider_member" (
    "id" uuid not null default gen_random_uuid(),
    "service_member_id" uuid not null,
    "service_provider_id" uuid not null
);


alter table "public"."service_provider_member" enable row level security;

CREATE UNIQUE INDEX service_provider_user_pkey ON public.service_provider_member USING btree (id);

CREATE UNIQUE INDEX user_service_provider_unique ON public.service_provider_member USING btree (service_member_id, service_provider_id);

alter table "public"."service_provider_member" add constraint "service_provider_user_pkey" PRIMARY KEY using index "service_provider_user_pkey";

alter table "public"."service_provider_member" add constraint "service_provider_member_service_member_id_fkey" FOREIGN KEY (service_member_id) REFERENCES service_member_user(id) not valid;

alter table "public"."service_provider_member" validate constraint "service_provider_member_service_member_id_fkey";

alter table "public"."service_provider_member" add constraint "service_provider_member_service_provider_id_fkey" FOREIGN KEY (service_provider_id) REFERENCES service_provider(id) not valid;

alter table "public"."service_provider_member" validate constraint "service_provider_member_service_provider_id_fkey";

alter table "public"."service_provider_member" add constraint "user_service_provider_unique" UNIQUE using index "user_service_provider_unique";

grant delete on table "public"."service_provider_member" to "anon";

grant insert on table "public"."service_provider_member" to "anon";

grant references on table "public"."service_provider_member" to "anon";

grant select on table "public"."service_provider_member" to "anon";

grant trigger on table "public"."service_provider_member" to "anon";

grant truncate on table "public"."service_provider_member" to "anon";

grant update on table "public"."service_provider_member" to "anon";

grant delete on table "public"."service_provider_member" to "authenticated";

grant insert on table "public"."service_provider_member" to "authenticated";

grant references on table "public"."service_provider_member" to "authenticated";

grant select on table "public"."service_provider_member" to "authenticated";

grant trigger on table "public"."service_provider_member" to "authenticated";

grant truncate on table "public"."service_provider_member" to "authenticated";

grant update on table "public"."service_provider_member" to "authenticated";

grant delete on table "public"."service_provider_member" to "service_role";

grant insert on table "public"."service_provider_member" to "service_role";

grant references on table "public"."service_provider_member" to "service_role";

grant select on table "public"."service_provider_member" to "service_role";

grant trigger on table "public"."service_provider_member" to "service_role";

grant truncate on table "public"."service_provider_member" to "service_role";

grant update on table "public"."service_provider_member" to "service_role";

create policy "Everyone can SELECT"
on "public"."service_member_user"
as permissive
for select
to public
using (true);


create policy "Owner can DELETE"
on "public"."service_provider_member"
as permissive
for delete
to authenticated
using (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_member.service_provider_id)));


create policy "Owner can INSERT"
on "public"."service_provider_member"
as permissive
for insert
to authenticated
with check (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_member.service_provider_id)));


create policy "Owner can SELECT"
on "public"."service_provider_member"
as permissive
for select
to authenticated
using (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_member.service_provider_id)));


create policy "Owner can UPDATE"
on "public"."service_provider_member"
as permissive
for update
to authenticated
using (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_member.service_provider_id)))
with check (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_member.service_provider_id)));


create policy "Public can SELECT"
on "public"."service_provider_member"
as permissive
for select
to public
using (true);



