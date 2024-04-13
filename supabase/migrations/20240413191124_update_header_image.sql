alter table "public"."service_provider" drop constraint "service_provider_header_image_fkey";

alter table "public"."service_provider" drop column "header_image";

alter table "public"."service_provider" add column "header_image_path" text;


