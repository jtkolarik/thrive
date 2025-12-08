// Supabase Edge Function: Weekly Digest
// Scheduled function to generate and send weekly parenting digests via email

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DigestContent {
  greeting: string;
  highlights: string[];
  insight: string;
  upcomingMilestones: string[];
  promptForNextWeek: string;
}

interface ResponseBody {
  processed: number;
  sent: number;
  errors: string[];
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

    // Get Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("Missing Resend API key");
    }

    let processed = 0;
    let sent = 0;
    const errors: string[] = [];

    // Query all profiles with digest_frequency = 'weekly'
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("digest_frequency", "weekly");

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({
          processed: 0,
          sent: 0,
          errors: ["No profiles found with weekly digest enabled"],
        } as ResponseBody),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calculate date range for past 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Process each profile
    for (const profile of profiles) {
      processed++;

      try {
        // Get children for this profile
        const { data: children, error: childrenError } = await supabase
          .from("children")
          .select("id, name, date_of_birth")
          .eq("profile_id", profile.id);

        if (childrenError || !children || children.length === 0) {
          errors.push(
            `No children found for profile ${profile.id} (${profile.email})`
          );
          continue;
        }

        // Process each child
        for (const child of children) {
          // Get entries from past 7 days
          const { data: entries, error: entriesError } = await supabase
            .from("entries")
            .select("content, created_at, tags, sentiment")
            .eq("child_id", child.id)
            .gte("created_at", sevenDaysAgo.toISOString())
            .order("created_at", { ascending: false });

          if (entriesError) {
            errors.push(
              `Failed to fetch entries for child ${child.id}: ${entriesError.message}`
            );
            continue;
          }

          // Skip if no entries this week
          if (!entries || entries.length === 0) {
            continue;
          }

          // Calculate child's age
          const birthDate = new Date(child.date_of_birth);
          const ageMonths = Math.floor(
            (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
          );
          const ageYears = Math.floor(ageMonths / 12);
          const remainingMonths = ageMonths % 12;

          let childAge = "";
          if (ageYears > 0) {
            childAge = `${ageYears} year${ageYears > 1 ? "s" : ""}`;
            if (remainingMonths > 0) {
              childAge += ` and ${remainingMonths} month${
                remainingMonths > 1 ? "s" : ""
              }`;
            }
          } else {
            childAge = `${ageMonths} month${ageMonths !== 1 ? "s" : ""}`;
          }

          // Prepare entries for GPT-4o
          const entriesJson = JSON.stringify(
            entries.map((e) => ({
              date: new Date(e.created_at).toLocaleDateString(),
              content: e.content,
              tags: e.tags,
              sentiment: e.sentiment,
            }))
          );

          // Generate digest content with GPT-4o
          const prompt = `Create a warm, personalized weekly digest for a parent.

CHILD: ${child.name}, ${childAge}
ENTRIES THIS WEEK: ${entriesJson}

Generate JSON with the following structure:
{
  "greeting": "Warm greeting addressing the parent by name and referencing their week",
  "highlights": ["3-5 key moments or patterns from the week"],
  "insight": "One thoughtful observation about their child's development or parenting journey",
  "upcomingMilestones": ["2-3 milestones to look forward to based on child's age"],
  "promptForNextWeek": "Encouraging prompt or question to inspire journaling next week"
}`;

          const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content:
                  "You are Thrive, a warm and supportive parenting companion. Create personalized weekly digests that celebrate moments, provide insights, and encourage continued journaling. Always respond with valid JSON only.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.7,
          });

          const digestText = completion.choices[0].message.content;
          if (!digestText) {
            errors.push(`No digest content generated for child ${child.id}`);
            continue;
          }

          const digestContent: DigestContent = JSON.parse(digestText);

          // Create digest record
          const { data: digestRecord, error: digestError } = await supabase
            .from("digests")
            .insert({
              profile_id: profile.id,
              child_id: child.id,
              type: "weekly",
              content: digestContent,
              sent_at: new Date().toISOString(),
            })
            .select()
            .single();

          if (digestError) {
            errors.push(
              `Failed to create digest record for child ${child.id}: ${digestError.message}`
            );
            continue;
          }

          // Format email HTML
          const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .section { margin-bottom: 25px; }
    .section-title { color: #667eea; font-size: 18px; font-weight: 600; margin-bottom: 10px; }
    .highlight { background: white; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #667eea; }
    .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">Your Weekly Digest</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${child.name}'s Week in Review</p>
    </div>
    <div class="content">
      <div class="section">
        <p>${digestContent.greeting}</p>
      </div>

      <div class="section">
        <div class="section-title">This Week's Highlights</div>
        ${digestContent.highlights.map((h) => `<div class="highlight">${h}</div>`).join("")}
      </div>

      <div class="section">
        <div class="section-title">A Parenting Insight</div>
        <p>${digestContent.insight}</p>
      </div>

      <div class="section">
        <div class="section-title">Upcoming Milestones to Watch For</div>
        <ul>
          ${digestContent.upcomingMilestones.map((m) => `<li>${m}</li>`).join("")}
        </ul>
      </div>

      <div class="section">
        <div class="section-title">For Next Week</div>
        <p>${digestContent.promptForNextWeek}</p>
      </div>

      <div class="footer">
        <p>Keep thriving! 💜</p>
        <p><small>You're receiving this because you have weekly digests enabled in your Thrive settings.</small></p>
      </div>
    </div>
  </div>
</body>
</html>`;

          // Send email via Resend API
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${resendApiKey}`,
            },
            body: JSON.stringify({
              from: "Thrive <digest@thrive.app>",
              to: [profile.email],
              subject: `Your Weekly Digest: ${child.name}'s Week in Review`,
              html: emailHtml,
            }),
          });

          if (!emailResponse.ok) {
            const errorText = await emailResponse.text();
            errors.push(
              `Failed to send email to ${profile.email}: ${errorText}`
            );
            continue;
          }

          sent++;
        }
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        errors.push(`Error processing profile ${profile.id}: ${errorMsg}`);
      }
    }

    return new Response(
      JSON.stringify({
        processed,
        sent,
        errors,
      } as ResponseBody),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in weekly digest:", error);

    return new Response(
      JSON.stringify({
        processed: 0,
        sent: 0,
        errors: [
          error instanceof Error ? error.message : "Unknown error occurred",
        ],
      } as ResponseBody),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
