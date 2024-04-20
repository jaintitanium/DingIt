create policy "Give users access to own folder 1ufimg_0"
on "storage"."objects"
as permissive
for select
to public
using (((bucket_id = 'users'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "Give users access to own folder 1ufimg_1"
on "storage"."objects"
as permissive
for insert
to public
with check (((bucket_id = 'users'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "Give users access to own folder 1ufimg_2"
on "storage"."objects"
as permissive
for update
to public
using (((bucket_id = 'users'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "Give users access to own folder 1ufimg_3"
on "storage"."objects"
as permissive
for delete
to public
using (((bucket_id = 'users'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));


create policy "Give users access to service providers they own u9kc60_0"
on "storage"."objects"
as permissive
for update
to authenticated
using (((bucket_id = 'service_providers'::text) AND (( SELECT count(1) AS count
   FROM service_provider
  WHERE (((service_provider.id)::text = (storage.foldername(objects.name))[1]) AND (service_provider.owner = auth.uid()))) > 0)));


create policy "Give users access to service providers they own u9kc60_1"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (((bucket_id = 'service_providers'::text) AND (( SELECT count(1) AS count
   FROM service_provider
  WHERE (((service_provider.id)::text = (storage.foldername(objects.name))[1]) AND (service_provider.owner = auth.uid()))) > 0)));


create policy "Give users access to service providers they own u9kc60_2"
on "storage"."objects"
as permissive
for delete
to authenticated
using (((bucket_id = 'service_providers'::text) AND (( SELECT count(1) AS count
   FROM service_provider
  WHERE (((service_provider.id)::text = (storage.foldername(objects.name))[1]) AND (service_provider.owner = auth.uid()))) > 0)));



