import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  FileText,
  CalendarDays,
  Search,
  MessageSquare,
  Zap,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Meeting Notes", url: "/meetings", icon: FileText },
  { title: "Task Planner", url: "/planner", icon: CalendarDays },
  { title: "Research", url: "/research", icon: Search },
  { title: "AI Chat", url: "/chat", icon: MessageSquare },
];

export function AppSidebar() {
  const currentPath = useRouterState({
    select: (router) => router.location.pathname,
  });

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath === path || currentPath.startsWith(path + "/");
  };

  return (
    <div className="fixed inset-y-0 left-0 z-40 w-[var(--sidebar-width)] border-r border-sidebar-border-custom bg-sidebar-bg transition-all duration-300">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-sidebar-border-custom px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-sidebar-active">
              <Zap className="h-4 w-4 text-sidebar-active-text" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              AI Workbench
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.url);
              return (
                <li key={item.title}>
                  <Link
                    to={item.url}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-sidebar-active text-sidebar-active-text"
                        : "text-sidebar-text hover:bg-sidebar-hover hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border-custom px-4 py-3">
          <p className="text-[10px] leading-relaxed text-sidebar-text-muted">
            AI Workplace Productivity Assistant
            <br />
            Powered by Lovable AI
          </p>
        </div>
      </div>
    </div>
  );
}
