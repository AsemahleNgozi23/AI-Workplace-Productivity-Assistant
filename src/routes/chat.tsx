import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getThreads, createThread, deleteThread } from "@/lib/threads.functions";
import { MessageSquare, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Chat — AI Workplace Productivity Assistant" },
      { name: "description", content: "Chat with your AI workplace productivity assistant." },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const fetchThreads = useServerFn(getThreads);
  const createThreadFn = useServerFn(createThread);
  const deleteThreadFn = useServerFn(deleteThread);

  const { data, isLoading } = useQuery({
    queryKey: ["threads"],
    queryFn: () => fetchThreads({}),
  });

  const threads = data?.threads ?? [];

  const handleNewThread = async () => {
    setCreating(true);
    try {
      const result = await createThreadFn({ data: {} });
      if (result.thread) {
        queryClient.invalidateQueries({ queryKey: ["threads"] });
        navigate({ to: "/chat/$threadId", params: { threadId: result.thread.id } });
      }
    } catch (e) {
      console.error(e);
    }
    setCreating(false);
  };

  const handleDelete = async (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await deleteThreadFn({ data: { threadId } });
      queryClient.invalidateQueries({ queryKey: ["threads"] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-112px)] flex-col">
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="mx-auto max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                AI Chatbot
              </h1>
              <p className="text-sm text-muted-foreground">
                Your intelligent workplace productivity companion
              </p>
            </div>
          </div>
          <Button onClick={handleNewThread} disabled={creating} size="sm">
            {creating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            New Chat
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : threads.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="mt-3 text-sm font-medium text-foreground">No conversations yet</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Start a new chat to get productivity assistance from AI.
              </p>
              <Button onClick={handleNewThread} className="mt-4" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Start New Chat
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-accent/50"
                >
                  <Link
                    to="/chat/$threadId"
                    params={{ threadId: thread.id }}
                    className="flex flex-1 items-center gap-3"
                  >
                    <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {thread.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(thread.updated_at).toLocaleDateString()} {" "}
                        {new Date(thread.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={(e) => handleDelete(thread.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    aria-label="Delete thread"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
