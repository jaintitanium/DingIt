drop policy "Owner can UPDATE" on "public"."product";

create table "public"."product_price" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "order" smallint not null default '0'::smallint,
    "name" character varying not null default '16'::character varying,
    "price" money not null,
    "product" uuid
);


alter table "public"."product_price" enable row level security;

alter table "public"."product" add column "description" text;

alter table "public"."product" add column "display_name" text not null;

alter table "public"."product" add column "image_path" text;

alter table "public"."product" add column "order" smallint not null default '0'::smallint;

CREATE UNIQUE INDEX product_price_pkey ON public.product_price USING btree (id);

alter table "public"."product_price" add constraint "product_price_pkey" PRIMARY KEY using index "product_price_pkey";

alter table "public"."product_price" add constraint "public_product_price_product_fkey" FOREIGN KEY (product) REFERENCES product(id) not valid;

alter table "public"."product_price" validate constraint "public_product_price_product_fkey";

grant delete on table "public"."product_price" to "anon";

grant insert on table "public"."product_price" to "anon";

grant references on table "public"."product_price" to "anon";

grant select on table "public"."product_price" to "anon";

grant trigger on table "public"."product_price" to "anon";

grant truncate on table "public"."product_price" to "anon";

grant update on table "public"."product_price" to "anon";

grant delete on table "public"."product_price" to "authenticated";

grant insert on table "public"."product_price" to "authenticated";

grant references on table "public"."product_price" to "authenticated";

grant select on table "public"."product_price" to "authenticated";

grant trigger on table "public"."product_price" to "authenticated";

grant truncate on table "public"."product_price" to "authenticated";

grant update on table "public"."product_price" to "authenticated";

grant delete on table "public"."product_price" to "service_role";

grant insert on table "public"."product_price" to "service_role";

grant references on table "public"."product_price" to "service_role";

grant select on table "public"."product_price" to "service_role";

grant trigger on table "public"."product_price" to "service_role";

grant truncate on table "public"."product_price" to "service_role";

grant update on table "public"."product_price" to "service_role";

create policy "Owner can SELECT"
on "public"."product"
as permissive
for select
to authenticated
using (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = product.service_provider)));


create policy "Public can SELECT"
on "public"."product"
as permissive
for select
to public
using (true);


create policy "Owner can DELETE"
on "public"."product_price"
as permissive
for delete
to public
using (( SELECT (service_provider.owner = auth.uid())
   FROM (service_provider
     JOIN product ON ((product.service_provider = service_provider.id)))
  WHERE (product.id = product_price.product)));


create policy "Owner can INSERT"
on "public"."product_price"
as permissive
for insert
to public
with check (( SELECT (service_provider.owner = auth.uid())
   FROM (service_provider
     JOIN product ON ((product.service_provider = service_provider.id)))
  WHERE (product.id = product_price.product)));


create policy "Owner can SELECT"
on "public"."product_price"
as permissive
for select
to public
using (( SELECT (service_provider.owner = auth.uid())
   FROM (service_provider
     JOIN product ON ((product.service_provider = service_provider.id)))
  WHERE (product.id = product_price.product)));


create policy "Owner can UPDATE"
on "public"."product_price"
as permissive
for update
to public
using (( SELECT (service_provider.owner = auth.uid())
   FROM (service_provider
     JOIN product ON ((product.service_provider = service_provider.id)))
  WHERE (product.id = product_price.product)))
with check (( SELECT (service_provider.owner = auth.uid())
   FROM (service_provider
     JOIN product ON ((product.service_provider = service_provider.id)))
  WHERE (product.id = product_price.product)));


create policy "Public can SELECT"
on "public"."product_price"
as permissive
for select
to public
using (true);


create policy "Owner can UPDATE"
on "public"."product"
as permissive
for update
to authenticated
using (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = product.service_provider)))
with check (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = product.service_provider)));



