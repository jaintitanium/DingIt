create policy "Owner has complete control"
on "public"."service_provider"
as permissive
for all
to public
using ((owner = auth.uid()));



