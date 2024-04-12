create extension if not exists "btree_gist" with schema "extensions";

create extension if not exists "postgis" with schema "extensions";


alter table "public"."service_provider" add column "address_1" text;

alter table "public"."service_provider" add column "address_2" text;

alter table "public"."service_provider" add column "city" text;

alter table "public"."service_provider" add column "location" geography(Point,4326);

alter table "public"."service_provider" add column "owner" uuid not null;

alter table "public"."service_provider" add column "phone_number" text;

alter table "public"."service_provider" add column "postal_code" text;

alter table "public"."service_provider" add column "state" text;

alter table "public"."service_provider" add column "sub_title" text;

alter table "public"."service_provider" add column "website" text;

CREATE INDEX service_provider_geo_index ON public.service_provider USING gist (location);

alter table "public"."service_provider" add constraint "service_provider_owner_fkey" FOREIGN KEY (owner) REFERENCES "user"(id) not valid;

alter table "public"."service_provider" validate constraint "service_provider_owner_fkey";


