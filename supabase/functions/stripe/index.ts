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
      let userObj = (await userClient.from('service_member_user').select('*').eq('id', authUser.id ?? '').single()).data;
      
      const input = await req.json();
      if(input.action == 'onboard') {
        if(userObj?.stripe_account_id == null) {
          const acct = await stripe.accounts.create({
            business_type: 'individual',
            email: authUser.email,
            type: 'express',
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
          userObj = (await supabaseAdminClient.from('service_member_user').update({ stripe_account_id: acct.id }).eq('id', authUser.id).select().single()).data;
          console.log(userObj)
        }
        const link = await stripe.accountLinks.create({
          account: userObj?.stripe_account_id ?? '',
          type: 'account_onboarding',
          return_url: appUrl?.value + '/settings/financial',
          refresh_url: appUrl?.value + '/settings/financial'
        })
        data = link.url;
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
  