import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const CreateThreadInput = z.object({
  title: z.string().optional(),
});

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateThreadInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: thread, error } = await supabase
      .from("threads")
      .insert({
        user_id: userId,
        title: data.title || "New Conversation",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { thread };
  });

export const getThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: threads, error } = await supabase
      .from("threads")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { threads: threads ?? [] };
  });

const GetThreadMessagesInput = z.object({
  threadId: z.string().uuid(),
});

export const getThreadMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GetThreadMessagesInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return { messages: messages ?? [] };
  });

const DeleteThreadInput = z.object({
  threadId: z.string().uuid(),
});

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DeleteThreadInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("threads")
      .delete()
      .eq("id", data.threadId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
    return { success: true };
  });
