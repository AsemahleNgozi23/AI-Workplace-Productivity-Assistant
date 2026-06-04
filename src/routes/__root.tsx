import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { Sun, Moon } from "lucide-react";
import { ResponsibleAIDisclaimer } from "@/components/responsible-ai-disclaimer";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "AI Workplace Productivity Assistant" },
      { name: "description", content: "AI-powered tools to boost workplace productivity — email generation, meeting summaries, task planning, research, and intelligent chat." },
      { name: "author", content: "AI Workbench" },
      { property: "og:title", content: "AI Workplace Productivity Assistant" },
      { property: "og:description", content: "AI-powered tools to boost workplace productivity — email generation, meeting summaries, task planning, research, and intelligent chat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "AI Workplace Productivity Assistant" },
      { name: "twitter:description", content: "AI-powered tools to boost workplace productivity — email generation, meeting summaries, task planning, research, and intelligent chat." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/374f30ef-a34c-4d9b-99b7-f9e9e47124bc/id-preview-623ad796--118943aa-e206-447d-a353-757bcde28b1d.lovable.app-1780479630925.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/374f30ef-a34c-4d9b-99b7-f9e9e47124bc/id-preview-623ad796--118943aa-e206-447d-a353-757bcde28b1d.lovable.app-1780479630925.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppLayout />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AppLayout() {
  return (
    <div className="min-h-screen flex w-full" style={{ "--sidebar-width": "240px" } as React.CSSProperties}>
      <AppSidebar />
      <div className="ml-[var(--sidebar-width)] flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <h1 className="text-sm font-medium text-muted-foreground">
            AI Workplace Productivity Assistant
          </h1>
          <ThemeToggle />
        </header>
        <main className="flex-1 bg-background">
          <Outlet />
        </main>
        <ResponsibleAIDisclaimer />
      </div>
    </div>
  );
}
