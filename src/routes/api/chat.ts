import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient } from "@supabase/supabase-js";

type ChatRequestBody = {
  messages?: unknown;
  threadId?: string;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, threadId } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        if (!threadId) {
          return new Response("Thread ID is required", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }

        // Auth check
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.replace("Bearer ", "");
        if (!token) {
          return new Response("Unauthorized", { status: 401 });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!supabaseUrl || !supabaseKey) {
          return new Response("Server misconfigured", { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });

        // Verify user owns the thread
        const { data: threadData, error: threadError } = await supabase
          .from("threads")
          .select("id")
          .eq("id", threadId)
          .single();

        if (threadError || !threadData) {
          return new Response("Thread not found", { status: 404 });
        }

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");
        const result = streamText({
          model,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
          onFinish: async ({ response }) => {
            try {
              const assistantMessages = response.messages;
              if (assistantMessages.length > 0) {
                const lastMsg = assistantMessages[assistantMessages.length - 1];
                await supabase.from("messages").insert({
                  thread_id: threadId,
                  role: lastMsg.role,
                  content:
                    lastMsg.content ??
                    lastMsg.parts.map((p) => (p.type === "text" ? p.text : "")).join(""),
                  parts: lastMsg.parts,
                });
              }
            } catch (e) {
              console.error("Failed to persist message:", e);
            }
          },
        });
      },
    },
  },
});
