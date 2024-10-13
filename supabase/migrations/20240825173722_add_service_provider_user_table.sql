create table "public"."service_provider_user" (
    "id" uuid not null,
    "stripe_customer_id" text,
    "active" boolean not null default false,
    "stripe_subscription_id" text
);


alter table "public"."service_provider_user" enable row level security;

CREATE UNIQUE INDEX service_provider_user_pkey1 ON public.service_provider_user USING btree (id);

alter table "public"."service_provider_user" add constraint "service_provider_user_pkey1" PRIMARY KEY using index "service_provider_user_pkey1";

alter table "public"."service_provider_user" add constraint "service_provider_user_id_fkey" FOREIGN KEY (id) REFERENCES "user"(id) not valid;

alter table "public"."service_provider_user" validate constraint "service_provider_user_id_fkey";

grant delete on table "public"."service_provider_user" to "anon";

grant insert on table "public"."service_provider_user" to "anon";

grant references on table "public"."service_provider_user" to "anon";

grant select on table "public"."service_provider_user" to "anon";

grant trigger on table "public"."service_provider_user" to "anon";

grant truncate on table "public"."service_provider_user" to "anon";

grant update on table "public"."service_provider_user" to "anon";

grant delete on table "public"."service_provider_user" to "authenticated";

grant insert on table "public"."service_provider_user" to "authenticated";

grant references on table "public"."service_provider_user" to "authenticated";

grant select on table "public"."service_provider_user" to "authenticated";

grant trigger on table "public"."service_provider_user" to "authenticated";

grant truncate on table "public"."service_provider_user" to "authenticated";

grant update on table "public"."service_provider_user" to "authenticated";

grant delete on table "public"."service_provider_user" to "service_role";

grant insert on table "public"."service_provider_user" to "service_role";

grant references on table "public"."service_provider_user" to "service_role";

grant select on table "public"."service_provider_user" to "service_role";

grant trigger on table "public"."service_provider_user" to "service_role";

grant truncate on table "public"."service_provider_user" to "service_role";

grant update on table "public"."service_provider_user" to "service_role";

create policy "Anyone can read"
on "public"."service_provider_user"
as permissive
for select
to public
using (true);



