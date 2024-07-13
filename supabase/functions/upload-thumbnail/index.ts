// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import {
  ImageMagick,
  initializeImageMagick,
  initialize,
  MagickGeometry,
  MagickFormat,
} from "https://deno.land/x/imagemagick_deno@0.0.26/mod.ts";
import { decodeBase64 } from "https://deno.land/std/encoding/base64.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const form = await req.formData();
    const path = form.get('path');
    await initialize();
    const data = {
      image_path: path + '.webp',
      thumbnail_path: path + '_thumb.webp'
    }
    const file = form.get('file') as File;
    const originalImage = await (file).arrayBuffer();
    console.log('Converting')
    const modifiedImage = await modifyImage(new Uint8Array(originalImage));
  
    // console.log('Uploading Original')
    // const upload = await supabaseAdminClient.storage
    //   .from('service_providers')
    //   .upload(data.image_path, webpImage, {
    //     contentType: file.type,
    //     upsert: true,
    //   });
    // if(upload.error) throw (upload.error);

    console.log('Uploading Thumbnail')
    const thumb_upload = await supabaseAdminClient.storage
      .from('service_providers')
      .upload(data.thumbnail_path, modifiedImage, {
        contentType: 'image/*',
        upsert: true,
      });
    if(thumb_upload.error) throw (thumb_upload.error);
  
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

function modifyImage(
  imageBuffer: Uint8Array,
) {
  return new Promise<Uint8Array>((resolve) => {
    ImageMagick.read(imageBuffer, (image) => {
      image.resize(new MagickGeometry(150));
      image.write((data) => resolve(data));
      return;
    });
  });
}
const supabaseAdminClient = createClient(
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
