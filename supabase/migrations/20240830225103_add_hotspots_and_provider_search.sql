alter table "public"."service_provider" add column "textsearchable_index_col" tsvector generated always as (to_tsvector('english'::regconfig, (((((((((COALESCE(display_name, ''::character varying))::text || ' '::text) || COALESCE(sub_title, ''::text)) || ' '::text) || COALESCE(address_1, ''::text)) || ' '::text) || COALESCE(city, ''::text)) || ' '::text) || COALESCE(state, ''::text)))) stored;

CREATE INDEX textsearch_idx ON public.service_provider USING gin (textsearchable_index_col);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_hotspots(input_lat double precision, input_lng double precision)
 RETURNS TABLE(id uuid, display_name text, sub_title text, distance real, header_image_path text, rating double precision)
 LANGUAGE sql
AS $function$SELECT id, 
	display_name, 
	sub_title, 
	ST_Distance(
		location::geometry,
		ST_Point( input_lng, input_lat, 4326),
        true
	)/1609 as distance, 
	header_image_path, 
	provider_rating(service_provider) as rating 
FROM public.service_provider
ORDER BY distance ASC
LIMIT 5$function$
;

CREATE OR REPLACE FUNCTION public.search_service_provider(search_text text, input_lat double precision, input_lng double precision)
 RETURNS TABLE(id uuid, display_name text, sub_title text, distance real, header_image_path text, rating double precision, city text, state text)
 LANGUAGE sql
AS $function$SELECT id, 
	display_name, 
	sub_title, 
	ST_Distance(
		location::geometry,
		ST_Point( input_lng, input_lat, 4326),
        true
	)/1609 as distance, 
	header_image_path,
	provider_rating(service_provider) as rating,
	city,
	state
FROM public.service_provider
WHERE textsearchable_index_col @@ plainto_tsquery(search_text)
ORDER BY distance ASC
LIMIT 20$function$
;


