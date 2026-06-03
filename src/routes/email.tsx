import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateEmail } from "@/lib/ai.functions";
import { Mail, Send, Copy, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI Workplace Productivity Assistant" },
      { name: "description", content: "Generate professional emails with AI." },
    ],
  }),
  component: EmailGenerator,
});

function EmailGenerator() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("Formal");
  const [result, setResult] = useState<{ subject: string; body: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateEmailFn = useServerFn(generateEmail);

  const handleGenerate = async () => {
    if (!purpose.trim() || !recipient.trim()) return;
    setLoading(true);
    try {
      const output = await generateEmailFn({
        data: { purpose, recipient, tone: tone as "Formal" | "Friendly" | "Persuasive" },
      });
      setResult(output);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Smart Email Generator
            </h1>
            <p className="text-sm text-muted-foreground">
              Compose professional emails with AI assistance
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Purpose</label>
              <Input
                placeholder="e.g., Request project deadline extension"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Recipient</label>
              <Input
                placeholder="e.g., John Doe, Project Manager"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Tone</label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Formal">Formal</SelectItem>
                <SelectItem value="Friendly">Friendly</SelectItem>
                <SelectItem value="Persuasive">Persuasive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !purpose.trim() || !recipient.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Generate Email
          </Button>
        </div>

        {result && (
          <div className="mt-6 space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Generated Email</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerate}>
                  <RefreshCw className="mr-2 h-3.5 w-3.5" />
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? (
                    <CheckCircle2 className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="mr-2 h-3.5 w-3.5" />
                  )}
                  Copy
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Subject</label>
              <Input value={result.subject} onChange={(e) => setResult({ ...result, subject: e.target.value })} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Body</label>
              <Textarea
                value={result.body}
                onChange={(e) => setResult({ ...result, body: e.target.value })}
                rows={12}
                className="min-h-[200px] resize-y"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
