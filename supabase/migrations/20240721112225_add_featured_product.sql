alter table "public"."service_provider" add column "featured_product" uuid;

alter table "public"."service_provider" add constraint "service_provider_featured_product_fkey" FOREIGN KEY (featured_product) REFERENCES product(id) ON DELETE SET NULL not valid;

alter table "public"."service_provider" validate constraint "service_provider_featured_product_fkey";


