drop function if exists "public"."get_hotspots"(input_lat double precision, input_lng double precision);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_hotspots(input_lat double precision, input_lng double precision)
 RETURNS TABLE(id uuid, display_name text, sub_title text, distance real, header_image_path text, header_thumbnail_path text, rating double precision)
 LANGUAGE sql
AS $function$
SELECT id, 
	display_name, 
	sub_title, 
	ST_Distance(
		location::geometry,
		ST_Point( input_lng, input_lat, 4326),
        true
	)/1609 as distance, 
	header_image_path,
	header_thumbnail_path,
	provider_rating(service_provider) as rating 
FROM public.service_provider
ORDER BY distance ASC
LIMIT 5
$function$
;


