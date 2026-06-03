import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  FileText,
  CalendarDays,
  Search,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Overview of AI-powered productivity tools." },
    ],
  }),
  component: Dashboard,
});

const modules = [
  {
    title: "Smart Email Generator",
    description: "Compose professional emails with AI assistance. Choose your tone and recipient.",
    icon: Mail,
    url: "/email",
    color: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  },
  {
    title: "Meeting Notes Summarizer",
    description: "Transform raw meeting notes into structured summaries with decisions and action items.",
    icon: FileText,
    url: "/meetings",
    color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  },
  {
    title: "AI Task Planner",
    description: "Organize tasks into daily and weekly schedules with smart priority management.",
    icon: CalendarDays,
    url: "/planner",
    color: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
  },
  {
    title: "AI Research Assistant",
    description: "Summarize topics, extract key insights, and get actionable recommendations.",
    icon: Search,
    url: "/research",
    color: "bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
  },
  {
    title: "AI Chatbot",
    description: "Your intelligent workplace productivity companion. Ask anything.",
    icon: MessageSquare,
    url: "/chat",
    color: "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400",
  },
];

function Dashboard() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome to your AI-powered productivity workspace. Select a tool to get started.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Link
              key={module.title}
              to={module.url}
              className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:border-ring/50"
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${module.color}`}>
                  <module.icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{module.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {module.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Getting Started</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Each tool uses AI to help you be more productive. All outputs are editable so you can refine them before using. Start by selecting one of the tools above, or open the AI Chat for general workplace productivity questions.
          </p>
        </div>
      </div>
    </div>
  );
}
