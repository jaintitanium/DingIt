revoke delete on table "public"."service_provider" from "anon";

revoke insert on table "public"."service_provider" from "anon";

revoke references on table "public"."service_provider" from "anon";

revoke select on table "public"."service_provider" from "anon";

revoke trigger on table "public"."service_provider" from "anon";

revoke truncate on table "public"."service_provider" from "anon";

revoke update on table "public"."service_provider" from "anon";

revoke delete on table "public"."service_provider" from "authenticated";

revoke insert on table "public"."service_provider" from "authenticated";

revoke references on table "public"."service_provider" from "authenticated";

revoke select on table "public"."service_provider" from "authenticated";

revoke trigger on table "public"."service_provider" from "authenticated";

revoke truncate on table "public"."service_provider" from "authenticated";

revoke update on table "public"."service_provider" from "authenticated";

revoke delete on table "public"."service_provider" from "service_role";

revoke insert on table "public"."service_provider" from "service_role";

revoke references on table "public"."service_provider" from "service_role";

revoke select on table "public"."service_provider" from "service_role";

revoke trigger on table "public"."service_provider" from "service_role";

revoke truncate on table "public"."service_provider" from "service_role";

revoke update on table "public"."service_provider" from "service_role";

alter table "public"."service_provider" drop constraint "service_provider_pkey";

drop index if exists "public"."service_provider_pkey";

drop table "public"."service_provider";


