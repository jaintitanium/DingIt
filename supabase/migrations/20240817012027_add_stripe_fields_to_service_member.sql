alter table "public"."service_member_user" add column "onboarded" boolean not null default false;

alter table "public"."service_member_user" add column "stripe_account_id" text;


