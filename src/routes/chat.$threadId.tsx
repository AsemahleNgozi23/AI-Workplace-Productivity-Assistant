import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { getThreadMessages } from "@/lib/threads.functions";
import { getThreads } from "@/lib/threads.functions";
import { useState, useEffect, useRef } from "react";
import {
  Send,
  Loader2,
  User,
  Bot,
  ArrowLeft,
  MessageSquare,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/chat/$threadId")({
  head: () => ({
    meta: [
      { title: "Chat — AI Workplace Productivity Assistant" },
      { name: "description", content: "Chat with your AI workplace productivity assistant." },
    ],
  }),
  component: ChatThread,
});

function ChatThread() {
  const { threadId } = Route.useParams();
  const fetchMessages = useServerFn(getThreadMessages);
  const fetchThreads = useServerFn(getThreads);
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: threadsData } = useQuery({
    queryKey: ["threads"],
    queryFn: () => fetchThreads({}),
  });

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", threadId],
    queryFn: () => fetchMessages({ data: { threadId } }),
  });

  const initialMessages: UIMessage[] =
    messagesData?.messages?.map((m) => {
      const parts: UIMessage["parts"] = Array.isArray(m.parts)
        ? (m.parts as UIMessage["parts"])
        : [{ type: "text", text: m.content }];
      return {
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        parts,
        createdAt: new Date(m.created_at),
      };
    }) ?? [];

  const chatTransport = new DefaultChatTransport({ api: "/api/chat" });

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport: chatTransport,
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input.trim() });
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const threadTitle =
    threadsData?.threads?.find((t) => t.id === threadId)?.title ?? "Chat";

  return (
    <div className="flex h-[calc(100vh-112px)] flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          <Link
            to="/chat"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-medium text-foreground">{threadTitle}</h2>
            <p className="text-xs text-muted-foreground">{threadId.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {messagesLoading && messages.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <Bot className="mx-auto h-10 w-10 text-muted-foreground/50" />
              <h3 className="mt-3 text-sm font-medium text-foreground">
                Start a conversation
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Ask about productivity tips, workplace strategies, or anything else.
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const text = message.parts
                .map((part) => (part.type === "text" ? part.text : ""))
                .join("");

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`group relative max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <button
                        onClick={() => handleCopy(text, message.id)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground transition-opacity"
                        aria-label="Copy message"
                      >
                        {copiedId === message.id ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}

                    {message.role === "user" ? (
                      <p>{text}</p>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>{text}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isLoading && messages.length > 0 && messages[messages.length - 1].role !== "assistant" && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking...
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-6 py-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-3xl flex items-end gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your workplace productivity assistant..."
            rows={1}
            className="min-h-[44px] max-h-32 resize-none rounded-xl"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="h-11 w-11 shrink-0 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
