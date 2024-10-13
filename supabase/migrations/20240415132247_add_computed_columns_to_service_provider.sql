alter table "public"."service_provider" add column "lat" double precision generated always as (st_y((location)::geometry)) stored;

alter table "public"."service_provider" add column "lng" double precision generated always as (st_x((location)::geometry)) stored;


