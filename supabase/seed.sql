-- Local development seed for DingIt.
--
-- Test login accounts:
--   owner@dingit.local    / Password123!
--   customer@dingit.local / Password123!
--   member@dingit.local   / Password123!
-- Fake restaurant employees:
--   {restaurant-slug}.employee1@example.test / Password123!
--   {restaurant-slug}.employee2@example.test / Password123!

create extension if not exists "pgcrypto" with schema "extensions";

do $$
declare
  owner_id uuid := '11111111-1111-4111-8111-111111111111';
  customer_id uuid := '22222222-2222-4222-8222-222222222222';
  member_id uuid := '33333333-3333-4333-8333-333333333333';
  seeded_provider_id uuid := '44444444-4444-4444-8444-444444444444';
  product_1_id uuid := '55555555-5555-4555-8555-555555555551';
  product_2_id uuid := '55555555-5555-4555-8555-555555555552';
  provider_member_id uuid := '66666666-6666-4666-8666-666666666666';
  review_id uuid := '77777777-7777-4777-8777-777777777777';
  restaurant record;
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values
    (
      '00000000-0000-0000-0000-000000000000',
      owner_id,
      'authenticated',
      'authenticated',
      'owner@dingit.local',
      extensions.crypt('Password123!', extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      customer_id,
      'authenticated',
      'authenticated',
      'customer@dingit.local',
      extensions.crypt('Password123!', extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    ),
    (
      '00000000-0000-0000-0000-000000000000',
      member_id,
      'authenticated',
      'authenticated',
      'member@dingit.local',
      extensions.crypt('Password123!', extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      false,
      '',
      '',
      '',
      ''
    )
  on conflict (id) do update
    set email = excluded.email,
        encrypted_password = excluded.encrypted_password,
        email_confirmed_at = excluded.email_confirmed_at,
        updated_at = now();

  insert into auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values
    (
      owner_id,
      owner_id,
      'owner@dingit.local',
      jsonb_build_object('sub', owner_id::text, 'email', 'owner@dingit.local'),
      'email',
      now(),
      now(),
      now()
    ),
    (
      customer_id,
      customer_id,
      'customer@dingit.local',
      jsonb_build_object('sub', customer_id::text, 'email', 'customer@dingit.local'),
      'email',
      now(),
      now(),
      now()
    ),
    (
      member_id,
      member_id,
      'member@dingit.local',
      jsonb_build_object('sub', member_id::text, 'email', 'member@dingit.local'),
      'email',
      now(),
      now(),
      now()
    )
  on conflict (provider, provider_id) do update
    set user_id = excluded.user_id,
        identity_data = excluded.identity_data,
        updated_at = now();

  insert into public."user" (id, name)
  values
    (owner_id, 'DingIt Owner'),
    (customer_id, 'DingIt Customer'),
    (member_id, 'DingIt Team Member')
  on conflict (id) do update
    set name = excluded.name;

  insert into public.customer_user (id)
  values (customer_id)
  on conflict (id) do nothing;

  insert into public.service_member_user (id, onboarded, stripe_account_id)
  values (member_id, true, 'acct_local_demo_member')
  on conflict (id) do update
    set onboarded = excluded.onboarded,
        stripe_account_id = excluded.stripe_account_id;

  insert into public.service_provider_user (id, active, stripe_customer_id, stripe_subscription_id)
  values (owner_id, true, 'cus_local_demo_owner', 'sub_local_demo_owner')
  on conflict (id) do update
    set active = excluded.active,
        stripe_customer_id = excluded.stripe_customer_id,
        stripe_subscription_id = excluded.stripe_subscription_id;

  insert into public.service_provider (
    id,
    display_name,
    sub_title,
    owner,
    address_1,
    city,
    state,
    postal_code,
    phone_number,
    website,
    timezone,
    location
  )
  values (
    seeded_provider_id,
    'DingIt Demo Cafe',
    'Local seeded service provider',
    owner_id,
    '100 Demo Street',
    'Seattle',
    'WA',
    '98101',
    '206-555-0100',
    'https://app.2dingit.com',
    'America/Los_Angeles',
    st_setsrid(st_makepoint(-122.3321, 47.6062), 4326)::geography
  )
  on conflict (id) do update
    set display_name = excluded.display_name,
        sub_title = excluded.sub_title,
        owner = excluded.owner,
        address_1 = excluded.address_1,
        city = excluded.city,
        state = excluded.state,
        postal_code = excluded.postal_code,
        phone_number = excluded.phone_number,
        website = excluded.website,
        timezone = excluded.timezone,
        location = excluded.location;

  insert into public.service_provider_hours (service_provider, day_of_week, open_time, close_time)
  values
    (seeded_provider_id, 1, '09:00', '17:00'),
    (seeded_provider_id, 2, '09:00', '17:00'),
    (seeded_provider_id, 3, '09:00', '17:00'),
    (seeded_provider_id, 4, '09:00', '17:00'),
    (seeded_provider_id, 5, '09:00', '17:00')
  on conflict do nothing;

  insert into public.product (id, service_provider, display_name, description, "order")
  values
    (product_1_id, seeded_provider_id, 'House Service', 'A seeded demo service for local testing.', 1),
    (product_2_id, seeded_provider_id, 'Premium Service', 'A higher-value seeded demo service.', 2)
  on conflict (id) do update
    set display_name = excluded.display_name,
        description = excluded.description,
        "order" = excluded."order";

  insert into public.product_price (product, name, price)
  values
    (product_1_id, 'Standard', '$12.00'::money),
    (product_2_id, 'Premium', '$24.00'::money)
  on conflict do nothing;

  update public.service_provider
  set featured_product = product_1_id
  where id = seeded_provider_id;

  insert into public.service_provider_member (id, service_provider_id, service_member_id)
  values (provider_member_id, seeded_provider_id, member_id)
  on conflict (id) do update
    set service_provider_id = excluded.service_provider_id,
        service_member_id = excluded.service_member_id;

  insert into public.review (id, owner, service_provider, rating, description)
  values (
    review_id,
    customer_id,
    seeded_provider_id,
    5,
    'Seeded local review for validating the app.'
  )
  on conflict (id) do update
    set owner = excluded.owner,
        service_provider = excluded.service_provider,
        rating = excluded.rating,
        description = excluded.description;

  insert into public.review_product (review, product, rating, description)
  values (review_id, product_1_id, 5, 'Seeded product review.')
  on conflict do nothing;

  insert into public.review_service_member (review, service_member, rating, description, tip)
  values (review_id, provider_member_id, 5, 'Seeded team member review.', 5.00)
  on conflict do nothing;

  insert into public.monthly_spotlight ("order", service_provider, service_provider_member)
  values
    (1, seeded_provider_id, null),
    (2, null, provider_member_id)
  on conflict do nothing;

  insert into public.settings (key, value)
  values
    ('APP_URL', 'http://localhost:8080/'),
    ('USE_FREE_MODE', 'true'),
    ('STRIPE_SUBSCRIPTION_PRICE_ID', 'price_local_demo_paid'),
    ('STRIPE_SUBSCRIPTION_PRICE_ID_FREE', 'price_local_demo_free'),
    ('STRIPE_KEY', 'sk_test_local_placeholder'),
    ('STRIPE_WEBHOOK_SECRET', 'whsec_local_placeholder')
  on conflict (key) do update
    set value = excluded.value;

  create temporary table seed_cupertino_restaurants (
    slug text primary key,
    display_name text not null,
    sub_title text not null,
    address_1 text not null,
    city text not null,
    state text not null,
    postal_code text not null,
    phone_number text,
    website text,
    lat double precision not null,
    lng double precision not null,
    employee_one text not null,
    employee_two text not null
  ) on commit drop;

  insert into seed_cupertino_restaurants (
    slug,
    display_name,
    sub_title,
    address_1,
    city,
    state,
    postal_code,
    phone_number,
    website,
    lat,
    lng,
    employee_one,
    employee_two
  )
  values
    ('koi-palace-contempo', 'Koi Palace Contempo', 'Modern Chinese dim sum, seafood, and tea house', '19369 Stevens Creek Blvd #100', 'Cupertino', 'CA', '95014', '408-849-8888', 'https://www.koipalacecontempo.com/', 37.3220, -122.0116, 'Avery Chen', 'Morgan Lee'),
    ('eureka-cupertino', 'Eureka! Cupertino', 'American restaurant and bar', '19369 Stevens Creek Blvd', 'Cupertino', 'CA', '95014', '669-266-6752', 'https://eurekarestaurantgroup.com/', 37.3222, -122.0119, 'Jordan Miller', 'Casey Nguyen'),
    ('rio-adobe', 'Rio Adobe Southwest Cafe', 'Southwest style Mexican food', '10525 South De Anza Blvd #100', 'Cupertino', 'CA', '95014', '408-873-1600', 'https://rioadobe.com/', 37.3154, -122.0321, 'Riley Garcia', 'Taylor Brooks'),
    ('harumi-sushi', 'Harumi Sushi', 'Casual sushi restaurant', '19754 Stevens Creek Blvd', 'Cupertino', 'CA', '95014', '408-973-9985', null, 37.3235, -122.0186, 'Jamie Tanaka', 'Parker Singh'),
    ('bel-cool-tasty-pot', 'Bel Cool Tasty Pot', 'Sichuan-style hot pot and dry pot', '10851 N Wolfe Rd', 'Cupertino', 'CA', '95014', '408-253-3998', null, 37.3350, -122.0152, 'Drew Wang', 'Quinn Patel'),
    ('lei-garden', 'Lei Garden', 'Dim sum and Asian specialties', '10125 Bandley Dr', 'Cupertino', 'CA', '95014', '408-996-3838', 'https://www.leigarden.us/', 37.3239, -122.0352, 'Skyler Wong', 'Devon Kim'),
    ('lazy-dog-cupertino', 'Lazy Dog Restaurant & Bar', 'American comfort food restaurant and bar', '19359 Stevens Creek Blvd', 'Cupertino', 'CA', '95014', null, 'https://www.lazydogrestaurants.com/', 37.3222, -122.0107, 'Alex Rivera', 'Sam Carter'),
    ('dosateria', 'Dosateria', 'Indian dosa and casual dining', '20955 Stevens Creek Blvd', 'Cupertino', 'CA', '95014', '408-257-7000', null, 37.3229, -122.0414, 'Nico Shah', 'Robin Iyer'),
    ('pacific-catch-cupertino', 'Pacific Catch Cupertino', 'West Coast fish house', '19399 Stevens Creek Blvd', 'Cupertino', 'CA', '95014', '408-899-2604', 'https://pacificcatch.com/locations/cupertino/', 37.3225, -122.0127, 'Harper Rao', 'Elliot Kapoor'),
    ('alexanders-steakhouse', 'Alexander''s Steakhouse Cupertino', 'Fine dining steakhouse', '19379 Stevens Creek Blvd', 'Cupertino', 'CA', '95014', '408-446-2222', 'https://alexanderssteakhouse.com/cupertino/', 37.3224, -122.0118, 'Cameron Stone', 'Reese Foster');

  for restaurant in
    select * from seed_cupertino_restaurants
  loop
    declare
      restaurant_id uuid := md5('dingit:provider:' || restaurant.slug)::uuid;
      product_a_id uuid := md5('dingit:product:' || restaurant.slug || ':signature')::uuid;
      product_b_id uuid := md5('dingit:product:' || restaurant.slug || ':lunch')::uuid;
      review_seed_id uuid := md5('dingit:review:' || restaurant.slug)::uuid;
      employee_names text[] := array[restaurant.employee_one, restaurant.employee_two];
      employee_name text;
      employee_index integer := 0;
      employee_id uuid;
      employee_email text;
      provider_member_seed_id uuid;
    begin
      insert into public.service_provider (
        id,
        display_name,
        sub_title,
        owner,
        address_1,
        city,
        state,
        postal_code,
        phone_number,
        website,
        timezone,
        location
      )
      values (
        restaurant_id,
        restaurant.display_name,
        restaurant.sub_title,
        owner_id,
        restaurant.address_1,
        restaurant.city,
        restaurant.state,
        restaurant.postal_code,
        restaurant.phone_number,
        restaurant.website,
        'America/Los_Angeles',
        st_setsrid(st_makepoint(restaurant.lng, restaurant.lat), 4326)::geography
      )
      on conflict (id) do update
        set display_name = excluded.display_name,
            sub_title = excluded.sub_title,
            owner = excluded.owner,
            address_1 = excluded.address_1,
            city = excluded.city,
            state = excluded.state,
            postal_code = excluded.postal_code,
            phone_number = excluded.phone_number,
            website = excluded.website,
            timezone = excluded.timezone,
            location = excluded.location;

      insert into public.service_provider_hours (service_provider, day_of_week, open_time, close_time)
      values
        (restaurant_id, 1, '11:00', '21:00'),
        (restaurant_id, 2, '11:00', '21:00'),
        (restaurant_id, 3, '11:00', '21:00'),
        (restaurant_id, 4, '11:00', '21:00'),
        (restaurant_id, 5, '11:00', '22:00'),
        (restaurant_id, 6, '11:00', '22:00'),
        (restaurant_id, 7, '11:00', '21:00');

      insert into public.product (id, service_provider, display_name, description, "order")
      values
        (product_a_id, restaurant_id, 'Signature Item', 'Seeded menu item for local Cupertino restaurant testing.', 1),
        (product_b_id, restaurant_id, 'Lunch Special', 'Seeded lunch item for local Cupertino restaurant testing.', 2)
      on conflict (id) do update
        set display_name = excluded.display_name,
            description = excluded.description,
            "order" = excluded."order";

      insert into public.product_price (product, name, price)
      values
        (product_a_id, 'Regular', '$18.00'::money),
        (product_b_id, 'Lunch', '$14.00'::money);

      update public.service_provider
      set featured_product = product_a_id
      where id = restaurant_id;

      insert into public.review (id, owner, service_provider, rating, description)
      values (
        review_seed_id,
        customer_id,
        restaurant_id,
        5,
        'Seeded Cupertino restaurant review for local testing.'
      )
      on conflict (id) do update
        set owner = excluded.owner,
            service_provider = excluded.service_provider,
            rating = excluded.rating,
            description = excluded.description;

      foreach employee_name in array employee_names
      loop
        employee_index := employee_index + 1;
        employee_id := md5('dingit:employee:' || restaurant.slug || ':' || employee_index::text)::uuid;
        employee_email := restaurant.slug || '.employee' || employee_index::text || '@example.test';
        provider_member_seed_id := md5('dingit:provider-member:' || restaurant.slug || ':' || employee_index::text)::uuid;

        insert into auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          created_at,
          updated_at,
          raw_app_meta_data,
          raw_user_meta_data,
          is_super_admin,
          confirmation_token,
          email_change,
          email_change_token_new,
          recovery_token
        )
        values (
          '00000000-0000-0000-0000-000000000000',
          employee_id,
          'authenticated',
          'authenticated',
          employee_email,
          extensions.crypt('Password123!', extensions.gen_salt('bf')),
          now(),
          now(),
          now(),
          '{"provider":"email","providers":["email"]}'::jsonb,
          '{}'::jsonb,
          false,
          '',
          '',
          '',
          ''
        )
        on conflict (id) do update
          set email = excluded.email,
              encrypted_password = excluded.encrypted_password,
              email_confirmed_at = excluded.email_confirmed_at,
              updated_at = now();

        insert into auth.identities (
          id,
          user_id,
          provider_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        )
        values (
          employee_id,
          employee_id,
          employee_email,
          jsonb_build_object('sub', employee_id::text, 'email', employee_email),
          'email',
          now(),
          now(),
          now()
        )
        on conflict (provider, provider_id) do update
          set user_id = excluded.user_id,
              identity_data = excluded.identity_data,
              updated_at = now();

        insert into public."user" (id, name)
        values (employee_id, employee_name)
        on conflict (id) do update
          set name = excluded.name;

        insert into public.service_member_user (id, onboarded, stripe_account_id)
        values (employee_id, true, 'acct_local_' || restaurant.slug || '_' || employee_index::text)
        on conflict (id) do update
          set onboarded = excluded.onboarded,
              stripe_account_id = excluded.stripe_account_id;

        insert into public.service_provider_member (id, service_provider_id, service_member_id)
        values (provider_member_seed_id, restaurant_id, employee_id)
        on conflict (id) do update
          set service_provider_id = excluded.service_provider_id,
              service_member_id = excluded.service_member_id;

        insert into public.review_service_member (review, service_member, rating, description, tip)
        values (review_seed_id, provider_member_seed_id, 5, 'Seeded employee review for local testing.', 3.00 + employee_index);
      end loop;

      insert into public.review_product (review, product, rating, description)
      values (review_seed_id, product_a_id, 5, 'Seeded restaurant product review.');
    end;
  end loop;
end $$;
