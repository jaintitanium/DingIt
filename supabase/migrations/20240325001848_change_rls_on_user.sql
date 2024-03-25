drop policy "Enable insert for users based on id" on "public"."user";

drop policy "Enable update for users based on id" on "public"."user";

create policy "Enable insert for users based on id"
on "public"."user"
as permissive
for insert
to public
with check ((((auth.jwt() ->> 'sub'::text))::uuid = id));


create policy "Enable update for users based on id"
on "public"."user"
as permissive
for update
to public
using ((((auth.jwt() ->> 'sub'::text))::uuid = id))
with check ((((auth.jwt() ->> 'sub'::text))::uuid = id));



