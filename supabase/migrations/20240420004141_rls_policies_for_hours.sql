alter table "public"."product" drop constraint "product_owner_fkey";

alter table "public"."product" drop column "owner";

alter table "public"."product" add column "service_provider" uuid not null;

alter table "public"."product" add constraint "product_owner_fkey" FOREIGN KEY (service_provider) REFERENCES service_provider(id) not valid;

alter table "public"."product" validate constraint "product_owner_fkey";

create policy "Enable read access for all users"
on "public"."customer_user"
as permissive
for select
to public
using (true);


create policy "Owner can DELETE"
on "public"."product"
as permissive
for delete
to authenticated
using (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = product.service_provider)));


create policy "Owner can INSERT"
on "public"."product"
as permissive
for insert
to authenticated
with check (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = product.service_provider)));


create policy "Owner can UPDATE"
on "public"."product"
as permissive
for update
to authenticated
with check (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = product.service_provider)));


create policy "Owner can DELETE"
on "public"."service_provider_hours"
as permissive
for delete
to authenticated
using (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_hours.service_provider)));


create policy "Owner can INSERT"
on "public"."service_provider_hours"
as permissive
for insert
to authenticated
with check (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_hours.service_provider)));


create policy "Owner can UPDATE"
on "public"."service_provider_hours"
as permissive
for update
to authenticated
with check (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_hours.service_provider)));



