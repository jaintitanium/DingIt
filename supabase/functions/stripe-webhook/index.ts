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
    try {
      const settings = await supabaseAdminClient.from('settings').select();
      const key = settings.data?.find((x) => x.key == 'STRIPE_WEBHOOK_SECRET');
      const stripe = new Stripe(key!.value, {
        apiVersion: "2024-06-20",
      })

      const signature = req.headers.get('Stripe-Signature');

      const body = await req.text();
      let event;
      try {
        event = await stripe.webhooks.constructEventAsync(
          body,
          signature!,
          key!.value,
          undefined
        );
      } catch (err) {
        console.log(`❌ Error message: ${err.message}`);
        return new Response(err.message, {status: 400});
      }

      if(event.type === 'charge.succeeded') {
        event.data.object.payment_intent;
      } else if(event.type === 'account.updated') {
        console.log('account.updated for ' + event.data.object.id)
        console.log(event.data)
        if(event.data.object.charges_enabled) {
          await supabaseAdminClient.from('service_member_user').update({ onboarded: true }).eq('stripe_account_id', event.data.object.id);
        }
      } else if(event.type === 'capability.updated') {
        console.log('capability.updated for ' + event.data.object.account)
        console.log(event.data)
        if(event.data.object.status == 'active') {
          await supabaseAdminClient.from('service_member_user').update({ onboarded: true }).eq('stripe_account_id', event.data.object.account);
        }
      } else {
        console.warn(`❌ Unhandled event type: ${event.type}`);
      }
    
      const data = {
        success: true
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
  