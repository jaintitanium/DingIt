set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_service_provider_distance(id uuid, input_lat double precision, input_lng double precision)
 RETURNS double precision
 LANGUAGE sql
 IMMUTABLE
AS $function$
SELECT
	ST_Distance(
		location::geometry,
		ST_Point( input_lng, input_lat, 4326),
        true
	)/1609
FROM public.service_provider 
WHERE id = id
$function$
;


