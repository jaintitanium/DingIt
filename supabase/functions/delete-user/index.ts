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
    //   const input = await req.json(); // email, display_name, provider_id
      const data = {
        success: true
      }

      const userClient = createClient<Database>(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
      )
      const token = req.headers.get("Authorization")?.replace("Bearer ", "");
      const {
        data: { user },
      } = await supabaseAdminClient.auth.getUser(token);

      if(user == null) {
        throw "Could not find user";
      }
        
      const settings = await supabaseAdminClient.from('settings').select();
      const url = settings.data?.find((x) => x.key == 'APP_URL');

      // Soft Delete user in Auth
      const deleteResult = await supabaseAdminClient.auth.admin.deleteUser(
        user.id,
        true
      );
      if(deleteResult.error) {
        throw deleteResult.error;
      }

      // Rename user
      const renameResult = await supabaseAdminClient.from('user').update({
        name: "Deleted User " + user.id.substring(0,8),
        profile_path: null,
        thumbnail_path: null
      }).eq('id', user.id);
      if(renameResult.error) {
        throw renameResult.error;
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
