alter table "public"."review_service_member" add column "tip" real;

alter table "public"."review_service_member" add constraint "review_service_member_tip_check" CHECK ((tip > (0)::double precision)) not valid;

alter table "public"."review_service_member" validate constraint "review_service_member_tip_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.review_tip_total(review)
 RETURNS real
 LANGUAGE sql
AS $function$SELECT sum(review_service_member.tip) FROM review_service_member WHERE review = $1.id$function$
;


