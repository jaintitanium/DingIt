alter table "public"."review" drop constraint "review_owner_fkey";

alter table "public"."review" add constraint "review_owner_fkey" FOREIGN KEY (owner) REFERENCES "user"(id) not valid;

alter table "public"."review" validate constraint "review_owner_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.member_rating(service_provider_member)
 RETURNS double precision
 LANGUAGE sql
 STABLE
AS $function$ SELECT avg(review_service_member.rating) FROM review_service_member WHERE review_service_member.service_member = $1.id; $function$
;

CREATE OR REPLACE FUNCTION public.product_rating(product)
 RETURNS double precision
 LANGUAGE sql
 STABLE
AS $function$ SELECT avg(review_product.rating) FROM review_product WHERE review_product.product = $1.id; $function$
;

CREATE OR REPLACE FUNCTION public.provider_rating(service_provider)
 RETURNS double precision
 LANGUAGE sql
 STABLE
AS $function$ SELECT avg(review.rating) FROM review WHERE review.service_provider = $1.id; $function$
;

create policy "Anyone can select"
on "public"."review"
as permissive
for select
to public
using (true);


create policy "Users can create their own reviews"
on "public"."review"
as permissive
for insert
to public
with check ((owner = auth.uid()));


create policy "Anyone can select"
on "public"."review_product"
as permissive
for select
to public
using (true);


create policy "Owners of parent review can INSERT"
on "public"."review_product"
as permissive
for insert
to public
with check (( SELECT (review.owner = auth.uid())
   FROM review
  WHERE (review_product.review = review.id)));


create policy "Anyone can SELECT"
on "public"."review_service_member"
as permissive
for select
to public
using (true);


create policy "Owner of parent can insert"
on "public"."review_service_member"
as permissive
for insert
to public
with check (( SELECT (review.owner = auth.uid())
   FROM review
  WHERE (review_service_member.review = review.id)));



