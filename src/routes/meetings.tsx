import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { summarizeMeeting } from "@/lib/ai.functions";
import { FileText, Wand2, Loader2, ClipboardList, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI Workplace Productivity Assistant" },
      { name: "description", content: "Summarize meeting notes with AI." },
    ],
  }),
  component: MeetingNotes,
});

type MeetingOutput = {
  summary: string;
  decisions: string[];
  actionItems: { task: string; owner?: string }[];
  deadlines: { item: string; dueDate?: string }[];
};

function MeetingNotes() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<MeetingOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const summarizeFn = useServerFn(summarizeMeeting);

  const handleSummarize = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    try {
      const output = await summarizeFn({ data: { notes } });
      setResult(output);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Meeting Notes Summarizer
            </h1>
            <p className="text-sm text-muted-foreground">
              Transform raw notes into structured summaries
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Meeting Notes</label>
            <Textarea
              placeholder="Paste your meeting notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              className="min-h-[200px] resize-y"
            />
          </div>

          <Button
            onClick={handleSummarize}
            disabled={loading || !notes.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Summarize & Extract
          </Button>
        </div>

        {result && (
          <div className="mt-6 space-y-6">
            {/* Summary */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">Summary</h2>
              </div>
              <Textarea
                value={result.summary}
                onChange={(e) => setResult({ ...result, summary: e.target.value })}
                rows={4}
                className="resize-y"
              />
            </div>

            {/* Decisions */}
            {result.decisions.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <h2 className="text-sm font-semibold text-foreground">Key Decisions</h2>
                </div>
                <ul className="space-y-2">
                  {result.decisions.map((decision, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{decision}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Items */}
            {result.actionItems.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-blue-500" />
                  <h2 className="text-sm font-semibold text-foreground">Action Items</h2>
                </div>
                <ul className="space-y-2">
                  {result.actionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                      <span className="flex-1">{item.task}</span>
                      {item.owner && (
                        <Badge variant="secondary" className="text-xs">{item.owner}</Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deadlines */}
            {result.deadlines.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <h2 className="text-sm font-semibold text-foreground">Deadlines</h2>
                </div>
                <ul className="space-y-2">
                  {result.deadlines.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                      <span className="flex-1">{item.item}</span>
                      {item.dueDate && (
                        <Badge variant="outline" className="text-xs text-amber-600">
                          {item.dueDate}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
