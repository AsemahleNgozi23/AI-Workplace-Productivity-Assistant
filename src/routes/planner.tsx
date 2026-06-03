import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generatePlan } from "@/lib/ai.functions";
import { CalendarDays, Sparkles, Loader2, Clock, Target, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI Workplace Productivity Assistant" },
      { name: "description", content: "Generate daily and weekly schedules with AI." },
    ],
  }),
  component: TaskPlanner,
});

type PlanOutput = {
  dailySchedule: { time: string; task: string; priority: string }[];
  weeklySchedule: { day: string; tasks: string[] }[];
  priorities: string[];
};

function TaskPlanner() {
  const [tasks, setTasks] = useState("");
  const [result, setResult] = useState<PlanOutput | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePlanFn = useServerFn(generatePlan);

  const handleGenerate = async () => {
    if (!tasks.trim()) return;
    setLoading(true);
    try {
      const output = await generatePlanFn({ data: { tasks } });
      setResult(output);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const priorityColor = (p: string) => {
    const lower = p.toLowerCase();
    if (lower.includes("high") || lower.includes("urgent"))
      return "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800";
    if (lower.includes("medium"))
      return "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800";
    return "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800";
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              AI Task Planner
            </h1>
            <p className="text-sm text-muted-foreground">
              Generate daily and weekly schedules
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Your Tasks</label>
            <Textarea
              placeholder="List your tasks with priorities and deadlines...&#10;e.g.,&#10;- Finish Q3 report (High priority, due Friday)&#10;- Team standup (Daily)&#10;- Review design mockups (Medium, due Wednesday)"
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              rows={8}
              className="min-h-[180px] resize-y"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !tasks.trim()}
            className="w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Schedule
          </Button>
        </div>

        {result && (
          <div className="mt-6 space-y-6">
            {/* Priorities */}
            {result.priorities.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 text-rose-500" />
                  <h2 className="text-sm font-semibold text-foreground">Top Priorities</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.priorities.map((p, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {p}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Schedule */}
            {result.dailySchedule.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <h2 className="text-sm font-semibold text-foreground">Daily Schedule</h2>
                </div>
                <div className="space-y-2">
                  {result.dailySchedule.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-border/50 bg-background/50 px-3 py-2"
                    >
                      <span className="text-xs font-medium text-muted-foreground w-16 shrink-0">
                        {item.time}
                      </span>
                      <span className="flex-1 text-sm text-foreground">{item.task}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${priorityColor(item.priority)}`}
                      >
                        {item.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Schedule */}
            {result.weeklySchedule.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-500" />
                  <h2 className="text-sm font-semibold text-foreground">Weekly Schedule</h2>
                </div>
                <div className="space-y-4">
                  {result.weeklySchedule.map((day, i) => (
                    <div key={i}>
                      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {day.day}
                      </h3>
                      <ul className="space-y-1">
                        {day.tasks.map((task, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
