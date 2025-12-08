// Supabase Edge Function: Chat Completion
// AI chat assistant with context from child entries and conversation history

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { OpenAI } from "https://deno.land/x/openai@v4.24.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  conversationId?: string;
  message: string;
  childId?: string;
  parentId: string;
}

interface ResponseBody {
  response: string;
  messageId: string;
  conversationId: string;
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
    const { conversationId, message, childId, parentId }: RequestBody =
      await req.json();

    if (!message || !parentId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: message and parentId",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let currentConversationId = conversationId;

    // Create new conversation if needed
    if (!currentConversationId) {
      const { data: newConversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          profile_id: parentId,
          child_id: childId || null,
          title: message.substring(0, 50), // First 50 chars as title
        })
        .select()
        .single();

      if (conversationError || !newConversation) {
        throw new Error(
          `Failed to create conversation: ${conversationError?.message}`
        );
      }

      currentConversationId = newConversation.id;
    }

    // Fetch last 20 messages from conversation
    const { data: previousMessages, error: messagesError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", currentConversationId)
      .order("created_at", { ascending: true })
      .limit(20);

    if (messagesError) {
      throw new Error(`Failed to fetch messages: ${messagesError.message}`);
    }

    // Prepare context
    let childContext = "";
    let relevantEntries = "";

    if (childId) {
      // Fetch child information
      const { data: childData, error: childError } = await supabase
        .from("children")
        .select("name, date_of_birth")
        .eq("id", childId)
        .single();

      if (!childError && childData) {
        const birthDate = new Date(childData.date_of_birth);
        const ageMonths = Math.floor(
          (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
        );
        const ageYears = Math.floor(ageMonths / 12);
        const remainingMonths = ageMonths % 12;

        let ageString = "";
        if (ageYears > 0) {
          ageString = `${ageYears} year${ageYears > 1 ? "s" : ""}`;
          if (remainingMonths > 0) {
            ageString += ` and ${remainingMonths} month${
              remainingMonths > 1 ? "s" : ""
            }`;
          }
        } else {
          ageString = `${ageMonths} month${ageMonths !== 1 ? "s" : ""}`;
        }

        childContext = `- Name: ${childData.name}\n- Age: ${ageString}`;

        // Perform semantic search on entries if we have embeddings
        // For now, just fetch recent entries
        const { data: entriesData, error: entriesError } = await supabase
          .from("entries")
          .select("content, created_at, tags")
          .eq("child_id", childId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (!entriesError && entriesData && entriesData.length > 0) {
          relevantEntries = entriesData
            .map((entry) => {
              const date = new Date(entry.created_at).toLocaleDateString();
              const tags = entry.tags ? ` [${entry.tags.join(", ")}]` : "";
              return `${date}${tags}: ${entry.content.substring(0, 200)}${
                entry.content.length > 200 ? "..." : ""
              }`;
            })
            .join("\n\n");
        }
      }
    }

    // Build system prompt
    const systemPrompt = `You are Thrive, a warm and knowledgeable parenting companion. You're chatting with a parent about their child.

${childContext ? `CHILD CONTEXT:\n${childContext}\n` : ""}
${
  relevantEntries
    ? `Recent entries:\n${relevantEntries}\n`
    : ""
}
GUIDELINES:
- Be empathetic, supportive, and non-judgmental
- Reference specific details from their entries when relevant
- For medical questions, always recommend consulting their pediatrician
- Celebrate wins and normalize challenges
- Keep responses concise but helpful (2-3 paragraphs max)`;

    // Build messages array for OpenAI
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    // Add previous messages
    if (previousMessages && previousMessages.length > 0) {
      messages.push(...previousMessages);
    }

    // Add current user message
    messages.push({ role: "user", content: message });

    // Save user message to database
    const { data: userMessage, error: userMessageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: currentConversationId,
        role: "user",
        content: message,
      })
      .select()
      .single();

    if (userMessageError) {
      throw new Error(
        `Failed to save user message: ${userMessageError.message}`
      );
    }

    // Call GPT-4o for completion
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantResponse = completion.choices[0].message.content;
    if (!assistantResponse) {
      throw new Error("No response from GPT-4o");
    }

    // Save assistant message to database
    const { data: assistantMessage, error: assistantMessageError } =
      await supabase
        .from("messages")
        .insert({
          conversation_id: currentConversationId,
          role: "assistant",
          content: assistantResponse,
        })
        .select()
        .single();

    if (assistantMessageError) {
      throw new Error(
        `Failed to save assistant message: ${assistantMessageError.message}`
      );
    }

    return new Response(
      JSON.stringify({
        response: assistantResponse,
        messageId: assistantMessage.id,
        conversationId: currentConversationId,
      } as ResponseBody),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in chat completion:", error);

    return new Response(
      JSON.stringify({
        response: "",
        messageId: "",
        conversationId: "",
        error: error instanceof Error ? error.message : "Unknown error occurred",
      } as ResponseBody),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
