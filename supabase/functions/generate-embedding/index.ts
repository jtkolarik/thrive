// Supabase Edge Function: Generate Embedding
// Generates OpenAI embeddings for journal entries and stores them in the database

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  entryId: string;
  content: string;
}

interface ResponseBody {
  success: boolean;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize OpenAI client
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("Missing OpenAI API key");
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Parse request body
    const { entryId, content }: RequestBody = await req.json();

    if (!entryId || !content) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: entryId and content",
        } as ResponseBody),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate embedding using OpenAI
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: content,
    });

    const embedding = embeddingResponse.data[0].embedding;

    // Update the entry with the embedding
    const { error: updateError } = await supabase
      .from("entries")
      .update({ embedding })
      .eq("id", entryId);

    if (updateError) {
      throw new Error(`Failed to update entry: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
      } as ResponseBody),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating embedding:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      } as ResponseBody),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
