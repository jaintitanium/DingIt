set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.review_rating(review)
 RETURNS double precision
 LANGUAGE sql
 STABLE
AS $function$

SELECT (avg(r.rating) + COALESCE(avg(rsm.rating), 0) + COALESCE(avg(rp.rating), 0))::float/
	((CASE WHEN avg(r.rating) IS NULL THEN 0 ELSE 1 END) + (CASE WHEN avg(rsm.rating) IS NULL THEN 0 ELSE 1 END) + (CASE WHEN avg(rp.rating) IS NULL THEN 0 ELSE 1 END))
FROM public.review as r
LEFT JOIN public.review_service_member AS rsm
	ON rsm.review = r.id
LEFT JOIN public.review_product AS rp
	ON rp.review = r.id
WHERE r.id = $1.id; 
$function$
;

CREATE OR REPLACE FUNCTION public.provider_rating(service_provider)
 RETURNS double precision
 LANGUAGE sql
 STABLE
AS $function$ SELECT avg(review_rating(review)) FROM review WHERE review.service_provider = $1.id; $function$
;


