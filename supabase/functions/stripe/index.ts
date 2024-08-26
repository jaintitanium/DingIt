// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

  import { createClient } from 'jsr:@supabase/supabase-js@2'
  import { corsHeaders } from '../_shared/cors.ts'
  import { Database } from "../_shared/types.ts"
  import Stripe from "npm:stripe@^16.0.0"

  
  Deno.serve(async (req) => {
    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }
    let data = {}
    try {      
      const settings = await supabaseAdminClient.from('settings').select();
      const key = settings.data?.find((x) => x.key == 'STRIPE_KEY');
      const appUrl = settings.data?.find((x) => x.key == 'APP_URL');
      const subscriptionPrice = settings.data?.find((x) => x.key == 'STRIPE_SUBSCRIPTION_PRICE_ID');
      const stripe = new Stripe(key!.value, {
        apiVersion: "2024-06-20",
      })
      const userClient = createClient<Database>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
      )
      const authUser = (await userClient.auth.getUser()).data.user;
      if(authUser == null) {
        throw('Could not find user')
      }
      let userObj = (await userClient.from('user').select('*,service_member_user(*),service_provider_user(*)').eq('id', authUser.id ?? '').single()).data;
      
      const input = await req.json();
      if(input.action == 'onboard') {
        let newAccount = false;
        let serviceMemberUser = userObj?.service_member_user;
        if(serviceMemberUser?.stripe_account_id == null) {
          const acct = await stripe.accounts.create({
            business_type: 'individual',
            email: authUser.email,
            business_profile: {
              url: appUrl?.value + '/user/' + serviceMemberUser?.id
            },
            controller: {
              stripe_dashboard: {
                type: "express",
              },
              fees: {
                payer: "application"
              },
              losses: {
                payments: "application"
              },
            },
          })
          console.log(acct)
          serviceMemberUser = (await supabaseAdminClient.from('service_member_user').update({ stripe_account_id: acct.id }).eq('id', authUser.id).select().single()).data;
          console.log(serviceMemberUser)
          newAccount = true;
        }
        const link = await stripe.accountLinks.create({
          account: serviceMemberUser?.stripe_account_id ?? '',
          type: 'account_onboarding',
          return_url: appUrl?.value + '/settings/financial?delay=5000',
          refresh_url: appUrl?.value + '/settings/financial',
          collection_options: {
            fields: newAccount ? 'currently_due' : 'eventually_due'
          }
        })
        data = link.url;
      } else if(input.action == 'tip') {
        // Inputs Service Members and outputs a Payment Intent
        const reviewId = <string>input.review;
        const review = (await supabaseAdminClient.from('review').select('*,review_service_member(*,service_provider_member(*,service_member_user(*,user(*))))').eq('id', reviewId).single()).data;
        console.log(review)
        const lineItems = review?.review_service_member
          .filter((x) => x.tip != null)
          .map((x) => {
            return {
              amount: x.tip ?? 0,
              name: x.service_provider_member?.service_member_user?.user?.name ?? 'Team Member'
            };
          });
        console.log(lineItems)
        if(lineItems) {
          const checkout = await stripe.checkout.sessions.create({
            line_items: lineItems.map((x) => {
              return {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: 'Tip for ' + x.name,
                  },
                  unit_amount: Math.round(x.amount * 100),
                },
                quantity: 1,
              }
            }),
            payment_intent_data: {
              transfer_group: reviewId
            },
            mode: 'payment',
            success_url: appUrl?.value + '/review/' + reviewId,
          });
          console.log(checkout)
          if(checkout.url) {
            data = checkout.url;
          } else {
            throw('Could not create Checkout link')
          }
        } else {
          throw('Could not find Review');
        }
      } else if(input.action == 'getTransfers') {
        let serviceMemberUser = userObj?.service_member_user;
        if(serviceMemberUser?.onboarded && serviceMemberUser.stripe_account_id) {
          console.log(serviceMemberUser)
          const transfers = await stripe.transfers.list({
            destination: serviceMemberUser.stripe_account_id,
            starting_after: input.starting_after,
            limit: input.limit ?? 100
          });
          console.log(transfers)
          data = {
            transfers: transfers.data.map((x) => {
              return {
                id: x.transfer_group,
                amount: x.amount / 100,
                created_at: x.created,
              }
            }),
            has_more: transfers.has_more,
          };
        } else {
          data = {};
        }
      } else if(input.action == 'getSubscription') {
        let serviceProviderUser = userObj?.service_provider_user;
        if(serviceProviderUser?.active && serviceProviderUser.stripe_customer_id && serviceProviderUser.stripe_subscription_id) {
          console.log(serviceProviderUser)
          const sub = await stripe.subscriptions.retrieve(serviceProviderUser.stripe_subscription_id)
          console.log(sub)
          data = sub;
        } else {
          throw('Could not find Subscription');
        }
      } else if(input.action == 'createOrUpdateSubscription') {
        let serviceProviderUser = userObj?.service_provider_user;
        if(!serviceProviderUser) {
          serviceProviderUser = (await supabaseAdminClient.from('service_provider_user').insert({id: authUser.id, active: false}).select().single()).data;
        }
        if(serviceProviderUser?.stripe_customer_id == null || serviceProviderUser?.stripe_customer_id == undefined) {
          const stripeCustomer = await stripe.customers.create({
            email: authUser.email,
            name: userObj?.name,
          });
          serviceProviderUser = (await supabaseAdminClient.from('service_provider_user').update({stripe_customer_id: stripeCustomer.id}).eq('id', authUser.id).select().single()).data;
        }
        if(serviceProviderUser?.stripe_subscription_id) {
          data = await stripe.billingPortal.sessions.create({
            customer: serviceProviderUser.stripe_customer_id ?? '',
            return_url: `${appUrl?.value}/settings/financial?delay=5000`,
          });
        } else {
          const spCount = (await supabaseAdminClient.from('service_provider').select('count').eq('owner', authUser.id).single()).data;
          const checkout = await stripe.checkout.sessions.create({
            billing_address_collection: 'auto',
            line_items: [
              {
                price: subscriptionPrice!.value,
                // For metered billing, do not pass quantity
                quantity: Math.max(1, spCount?.count ?? 0),
        
              },
            ],
            customer: serviceProviderUser?.stripe_customer_id ?? undefined,
            mode: 'subscription',
            success_url: `${appUrl?.value}/settings/financial?delay=5000`,
            cancel_url: `${appUrl?.value}/settings/financial`,
          });
          serviceProviderUser = (await supabaseAdminClient.from('service_provider_user').update({stripe_subscription_id: checkout.subscription?.toString()}).eq('id', authUser.id).select().single()).data;
          data = checkout;
        }
      } else if(input.action == 'updateSubscriptionQty') {
        let serviceProviderUser = userObj?.service_provider_user;
        if(serviceProviderUser?.active && serviceProviderUser.stripe_customer_id && serviceProviderUser.stripe_subscription_id) {
          console.log(serviceProviderUser)
          // Count Service Providers and update Subscription if needed
        } else {
          data = {};
        }
      }
    
      
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    } catch (error) {
      console.log(error)
      return new Response(JSON.stringify(error), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
  })
  
  const supabaseAdminClient = createClient<Database>(
    // Supabase API URL - env var exported by default when deployed.
    Deno.env.get('SUPABASE_URL') ?? '',
    // Supabase API SERVICE ROLE KEY - env var exported by default when deployed.
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  /* To invoke locally:
  
    1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
    2. Make an HTTP request:
  
    curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/hello-world' \
      --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
      --header 'Content-Type: application/json' \
      --data '{"name":"Functions"}'
  
  */
  