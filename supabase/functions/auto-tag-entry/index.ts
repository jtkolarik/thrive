// Supabase Edge Function: Auto-Tag Entry
// Analyzes journal entries using GPT-4o to extract tags, sentiment, and detect milestones

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
  childAgeMonths: number;
}

interface AnalysisResult {
  tags: string[];
  sentiment: "positive" | "neutral" | "negative" | "mixed";
  summary: string | null;
  possibleMilestone: string | null;
}

interface ResponseBody {
  tags: string[];
  sentiment: string;
  summary: string | null;
  milestoneDetected: boolean;
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
    const { entryId, content, childAgeMonths }: RequestBody = await req.json();

    if (!entryId || !content || childAgeMonths === undefined) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: entryId, content, and childAgeMonths",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Build the analysis prompt
    const prompt = `Analyze this parenting journal entry and extract structured information.

Entry: """${content}"""
Child's age: ${childAgeMonths} months

Respond in JSON format:
{
  "tags": ["tag1", "tag2"],  // 2-5 relevant tags from: sleep, feeding, development, health, behavior, social, learning, milestone, funny, sweet, challenging
  "sentiment": "positive" | "neutral" | "negative" | "mixed",
  "summary": "One sentence summary if content > 100 words, else null",
  "possibleMilestone": "milestone name if this describes a developmental milestone, else null"
}`;

    // Call GPT-4o for analysis
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in child development and parenting. Analyze journal entries and extract structured information. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const analysisText = completion.choices[0].message.content;
    if (!analysisText) {
      throw new Error("No response from GPT-4o");
    }

    const analysis: AnalysisResult = JSON.parse(analysisText);

    // Update the entry with tags, sentiment, and summary
    const { error: updateError } = await supabase
      .from("entries")
      .update({
        tags: analysis.tags,
        sentiment: analysis.sentiment,
        summary: analysis.summary,
      })
      .eq("id", entryId);

    if (updateError) {
      throw new Error(`Failed to update entry: ${updateError.message}`);
    }

    let milestoneDetected = false;

    // If a milestone was detected, check if it exists and create child_milestone record
    if (analysis.possibleMilestone) {
      // Get the child_id from the entry
      const { data: entryData, error: entryError } = await supabase
        .from("entries")
        .select("child_id")
        .eq("id", entryId)
        .single();

      if (!entryError && entryData) {
        // Search for matching milestone
        const { data: milestoneData, error: milestoneError } = await supabase
          .from("milestones")
          .select("id")
          .ilike("name", `%${analysis.possibleMilestone}%`)
          .limit(1)
          .single();

        if (!milestoneError && milestoneData) {
          // Check if this child_milestone already exists
          const { data: existingMilestone } = await supabase
            .from("child_milestones")
            .select("id")
            .eq("child_id", entryData.child_id)
            .eq("milestone_id", milestoneData.id)
            .single();

          if (!existingMilestone) {
            // Create new child_milestone record
            const { error: createMilestoneError } = await supabase
              .from("child_milestones")
              .insert({
                child_id: entryData.child_id,
                milestone_id: milestoneData.id,
                achieved_at: new Date().toISOString(),
                entry_id: entryId,
                notes: `Detected from journal entry`,
              });

            if (!createMilestoneError) {
              milestoneDetected = true;
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        tags: analysis.tags,
        sentiment: analysis.sentiment,
        summary: analysis.summary,
        milestoneDetected,
      } as ResponseBody),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error auto-tagging entry:", error);

    return new Response(
      JSON.stringify({
        tags: [],
        sentiment: "neutral",
        summary: null,
        milestoneDetected: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      } as ResponseBody),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
