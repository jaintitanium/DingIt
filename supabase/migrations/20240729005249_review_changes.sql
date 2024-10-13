alter table "public"."review_service_member" drop constraint "review_service_member_service_member_fkey";

alter table "public"."review" drop column "overall_rating";

alter table "public"."review" add column "description" text not null;

alter table "public"."review" add column "rating" real not null;

alter table "public"."review_product" add column "description" text not null;

alter table "public"."review_product" add column "rating" real not null;

alter table "public"."review_service_member" add column "description" text;

alter table "public"."review_service_member" add column "rating" real not null;

alter table "public"."review_service_member" add constraint "review_service_member_service_member_fkey" FOREIGN KEY (service_member) REFERENCES service_provider_member(id) not valid;

alter table "public"."review_service_member" validate constraint "review_service_member_service_member_fkey";


