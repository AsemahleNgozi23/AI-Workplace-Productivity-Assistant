import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { researchTopic } from "@/lib/ai.functions";
import { Search, Lightbulb, Loader2, BookOpen, ArrowRightCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — AI Workplace Productivity Assistant" },
      { name: "description", content: "Research topics with AI summaries and insights." },
    ],
  }),
  component: ResearchAssistant,
});

type ResearchOutput = {
  summary: string;
  keyInsights: string[];
  recommendations: string[];
};

function ResearchAssistant() {
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<ResearchOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const researchFn = useServerFn(researchTopic);

  const handleResearch = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const output = await researchFn({ data: { topic } });
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
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400">
            <Search className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              AI Research Assistant
            </h1>
            <p className="text-sm text-muted-foreground">
              Summarize topics, extract insights, and get recommendations
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Research Topic</label>
            <Textarea
              placeholder="Enter a topic or paste an article to analyze..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={6}
              className="min-h-[140px] resize-y"
            />
          </div>

          <Button
            onClick={handleResearch}
            disabled={loading || !topic.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lightbulb className="mr-2 h-4 w-4" />
            )}
            Generate Research
          </Button>
        </div>

        {result && (
          <div className="mt-6 space-y-6">
            {/* Summary */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-violet-500" />
                <h2 className="text-sm font-semibold text-foreground">Summary</h2>
              </div>
              <Textarea
                value={result.summary}
                onChange={(e) => setResult({ ...result, summary: e.target.value })}
                rows={5}
                className="resize-y"
              />
            </div>

            {/* Key Insights */}
            {result.keyInsights.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-500" />
                  <h2 className="text-sm font-semibold text-foreground">Key Insights</h2>
                </div>
                <ul className="space-y-3">
                  {result.keyInsights.map((insight, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-0.5 shrink-0 text-[10px]">
                        {i + 1}
                      </Badge>
                      <span className="text-sm text-foreground leading-relaxed">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <ArrowRightCircle className="h-4 w-4 text-emerald-500" />
                  <h2 className="text-sm font-semibold text-foreground">Recommendations</h2>
                </div>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{rec}</span>
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
