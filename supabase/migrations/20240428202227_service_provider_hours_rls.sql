drop policy "Enable read access for all users" on "public"."service_provider_hours";

drop policy "Owner can UPDATE" on "public"."service_provider_hours";

create policy "Enable read access for all users"
on "public"."service_provider_hours"
as permissive
for select
to authenticated, anon
using (true);


create policy "Owner can UPDATE"
on "public"."service_provider_hours"
as permissive
for update
to authenticated
using (true)
with check (( SELECT (service_provider.owner = auth.uid())
   FROM service_provider
  WHERE (service_provider.id = service_provider_hours.service_provider)));



