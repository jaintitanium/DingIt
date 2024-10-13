create table "public"."product" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "owner" uuid not null
);


alter table "public"."product" enable row level security;

create table "public"."review" (
    "id" uuid not null default gen_random_uuid(),
    "created_at" timestamp with time zone not null default now(),
    "owner" uuid not null,
    "service_provider" uuid not null
);


alter table "public"."review" enable row level security;

create table "public"."review_product" (
    "id" uuid not null default gen_random_uuid(),
    "review" uuid not null,
    "product" uuid not null
);


alter table "public"."review_product" enable row level security;

create table "public"."review_service_member" (
    "id" uuid not null default gen_random_uuid(),
    "review" uuid not null,
    "service_member" uuid not null
);


alter table "public"."review_service_member" enable row level security;

CREATE UNIQUE INDEX product_pkey ON public.product USING btree (id);

CREATE UNIQUE INDEX review_pkey ON public.review USING btree (id);

CREATE UNIQUE INDEX review_product_pkey ON public.review_product USING btree (id);

CREATE UNIQUE INDEX review_service_member_pkey ON public.review_service_member USING btree (id);

alter table "public"."product" add constraint "product_pkey" PRIMARY KEY using index "product_pkey";

alter table "public"."review" add constraint "review_pkey" PRIMARY KEY using index "review_pkey";

alter table "public"."review_product" add constraint "review_product_pkey" PRIMARY KEY using index "review_product_pkey";

alter table "public"."review_service_member" add constraint "review_service_member_pkey" PRIMARY KEY using index "review_service_member_pkey";

alter table "public"."product" add constraint "product_owner_fkey" FOREIGN KEY (owner) REFERENCES service_provider(id) not valid;

alter table "public"."product" validate constraint "product_owner_fkey";

alter table "public"."review" add constraint "review_owner_fkey" FOREIGN KEY (owner) REFERENCES customer_user(id) not valid;

alter table "public"."review" validate constraint "review_owner_fkey";

alter table "public"."review" add constraint "review_service_provider_fkey" FOREIGN KEY (service_provider) REFERENCES service_provider(id) not valid;

alter table "public"."review" validate constraint "review_service_provider_fkey";

alter table "public"."review_product" add constraint "review_product_product_fkey" FOREIGN KEY (product) REFERENCES product(id) not valid;

alter table "public"."review_product" validate constraint "review_product_product_fkey";

alter table "public"."review_product" add constraint "review_product_review_fkey" FOREIGN KEY (review) REFERENCES review(id) not valid;

alter table "public"."review_product" validate constraint "review_product_review_fkey";

alter table "public"."review_service_member" add constraint "review_service_member_review_fkey" FOREIGN KEY (review) REFERENCES review(id) not valid;

alter table "public"."review_service_member" validate constraint "review_service_member_review_fkey";

alter table "public"."review_service_member" add constraint "review_service_member_service_member_fkey" FOREIGN KEY (service_member) REFERENCES service_member_user(id) not valid;

alter table "public"."review_service_member" validate constraint "review_service_member_service_member_fkey";

grant delete on table "public"."product" to "anon";

grant insert on table "public"."product" to "anon";

grant references on table "public"."product" to "anon";

grant select on table "public"."product" to "anon";

grant trigger on table "public"."product" to "anon";

grant truncate on table "public"."product" to "anon";

grant update on table "public"."product" to "anon";

grant delete on table "public"."product" to "authenticated";

grant insert on table "public"."product" to "authenticated";

grant references on table "public"."product" to "authenticated";

grant select on table "public"."product" to "authenticated";

grant trigger on table "public"."product" to "authenticated";

grant truncate on table "public"."product" to "authenticated";

grant update on table "public"."product" to "authenticated";

grant delete on table "public"."product" to "service_role";

grant insert on table "public"."product" to "service_role";

grant references on table "public"."product" to "service_role";

grant select on table "public"."product" to "service_role";

grant trigger on table "public"."product" to "service_role";

grant truncate on table "public"."product" to "service_role";

grant update on table "public"."product" to "service_role";

grant delete on table "public"."review" to "anon";

grant insert on table "public"."review" to "anon";

grant references on table "public"."review" to "anon";

grant select on table "public"."review" to "anon";

grant trigger on table "public"."review" to "anon";

grant truncate on table "public"."review" to "anon";

grant update on table "public"."review" to "anon";

grant delete on table "public"."review" to "authenticated";

grant insert on table "public"."review" to "authenticated";

grant references on table "public"."review" to "authenticated";

grant select on table "public"."review" to "authenticated";

grant trigger on table "public"."review" to "authenticated";

grant truncate on table "public"."review" to "authenticated";

grant update on table "public"."review" to "authenticated";

grant delete on table "public"."review" to "service_role";

grant insert on table "public"."review" to "service_role";

grant references on table "public"."review" to "service_role";

grant select on table "public"."review" to "service_role";

grant trigger on table "public"."review" to "service_role";

grant truncate on table "public"."review" to "service_role";

grant update on table "public"."review" to "service_role";

grant delete on table "public"."review_product" to "anon";

grant insert on table "public"."review_product" to "anon";

grant references on table "public"."review_product" to "anon";

grant select on table "public"."review_product" to "anon";

grant trigger on table "public"."review_product" to "anon";

grant truncate on table "public"."review_product" to "anon";

grant update on table "public"."review_product" to "anon";

grant delete on table "public"."review_product" to "authenticated";

grant insert on table "public"."review_product" to "authenticated";

grant references on table "public"."review_product" to "authenticated";

grant select on table "public"."review_product" to "authenticated";

grant trigger on table "public"."review_product" to "authenticated";

grant truncate on table "public"."review_product" to "authenticated";

grant update on table "public"."review_product" to "authenticated";

grant delete on table "public"."review_product" to "service_role";

grant insert on table "public"."review_product" to "service_role";

grant references on table "public"."review_product" to "service_role";

grant select on table "public"."review_product" to "service_role";

grant trigger on table "public"."review_product" to "service_role";

grant truncate on table "public"."review_product" to "service_role";

grant update on table "public"."review_product" to "service_role";

grant delete on table "public"."review_service_member" to "anon";

grant insert on table "public"."review_service_member" to "anon";

grant references on table "public"."review_service_member" to "anon";

grant select on table "public"."review_service_member" to "anon";

grant trigger on table "public"."review_service_member" to "anon";

grant truncate on table "public"."review_service_member" to "anon";

grant update on table "public"."review_service_member" to "anon";

grant delete on table "public"."review_service_member" to "authenticated";

grant insert on table "public"."review_service_member" to "authenticated";

grant references on table "public"."review_service_member" to "authenticated";

grant select on table "public"."review_service_member" to "authenticated";

grant trigger on table "public"."review_service_member" to "authenticated";

grant truncate on table "public"."review_service_member" to "authenticated";

grant update on table "public"."review_service_member" to "authenticated";

grant delete on table "public"."review_service_member" to "service_role";

grant insert on table "public"."review_service_member" to "service_role";

grant references on table "public"."review_service_member" to "service_role";

grant select on table "public"."review_service_member" to "service_role";

grant trigger on table "public"."review_service_member" to "service_role";

grant truncate on table "public"."review_service_member" to "service_role";

grant update on table "public"."review_service_member" to "service_role";


