alter table "public"."user" add column "name" character varying not null;

create policy "Enable insert for users based on id"
on "public"."user"
as permissive
for insert
to public
with check ((((auth.jwt() ->> 'uid'::text))::uuid = id));


create policy "Enable read access for all users"
on "public"."user"
as permissive
for select
to public
using (true);


create policy "Enable update for users based on id"
on "public"."user"
as permissive
for update
to public
using ((((auth.jwt() ->> 'uid'::text))::uuid = id))
with check ((((auth.jwt() ->> 'uid'::text))::uuid = id));



