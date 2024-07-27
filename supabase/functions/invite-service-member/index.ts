// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

  import { decodeBase64 } from "https://deno.land/std/encoding/base64.ts";
  import { createClient } from 'jsr:@supabase/supabase-js@2'
  import { corsHeaders } from '../_shared/cors.ts'
  import { verify } from "https://deno.land/x/djwt@v3.0.2/mod.ts";
  import { Database } from "../_shared/types.ts"
  
  Deno.serve(async (req) => {
    // This is needed if you're planning to invoke your function from a browser.
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }
    try {
      const input = await req.json(); // email, display_name, provider_id
      const data = {
        success: true
      }

      const userClient = createClient<Database>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
      )
      const settings = await supabaseAdminClient.from('settings').select();
      const url = settings.data?.find((x) => x.key == 'APP_URL');

      // Check permissions
      const id = (await userClient.auth.getUser()).data.user;
      const service_provider = (await userClient.from('service_provider').select().eq('owner', id!.id).eq('id', input.provider_id));
      if(service_provider.error) {
        throw (service_provider.error);
      }

      // Look for existing user
      let currentId: string | null | undefined = (await supabaseAdminClient.rpc('get_user_by_email', {email_address: input.email})).data;
      if(currentId == null) {
        // Create User
        const service_member = await supabaseAdminClient.auth.admin.inviteUserByEmail(input.email, {
          redirectTo: url?.value
        });
        console.log(service_member)
        if(service_member.error?.code == 'email_exists') {
          supabaseAdminClient.auth.getUserIdentities()
          console.log(service_member.error)
        }
        currentId = service_member.data?.user?.email;
      }
      if(currentId == null || currentId == undefined) {
        throw({message: 'Could not find or create User'});
      }

      const currentUser = (await supabaseAdminClient.from('user').select().eq('id', currentId).single()).data;
      console.log(currentUser)
      if(currentUser == null) {
        await supabaseAdminClient.from('user').insert({ id: currentId, name: input.display_name});
      }

      // Create service_member_user entry
      let result = await userClient.from('service_provider_user').insert({
        user_id: currentId,
        service_provider: input.provider_id
      });
      console.log(result)
      if(result.error) {
        throw result.error;
      }

      // Send email
    
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
  