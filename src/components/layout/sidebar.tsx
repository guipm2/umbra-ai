"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenTool,
  BrainCircuit,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  User,
  BarChart3,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Ghostwriter",
    href: "/dashboard/editor",
    icon: PenTool,
  },
  {
    label: "Brain",
    href: "/dashboard/brain",
    icon: BrainCircuit,
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
];

const bottomItems = [
  {
    label: "Configurações",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebar();
  const pathname = usePathname();

  const showLabels = !collapsed || mobileOpen;

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-electric/20 neon-glow">
          <Sparkles className="h-5 w-5 text-neon" />
        </div>
        {showLabels && (
          <span className="text-lg font-semibold tracking-tight text-foreground neon-text">
            Umbra AI
          </span>
        )}
        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground md:hidden"
          aria-label="Fechar menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4" role="navigation" aria-label="Menu principal">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-electric/15 text-neon neon-glow"
                  : "text-muted-foreground hover:bg-glass-hover hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive ? "text-neon" : "text-muted-foreground"
                )}
              />
              {showLabels && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border px-3 py-4 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-electric/15 text-neon"
                  : "text-muted-foreground hover:bg-glass-hover hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {showLabels && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* User profile */}
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 mt-2 bg-gradient-to-r from-white/5 to-transparent border border-white/5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-electric to-neon shadow-lg shadow-neon/20">
            <User className="h-5 w-5 text-white" />
          </div>
          {showLabels && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                Guilherme
              </p>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
                <p className="truncate text-[10px] font-medium text-neon tracking-wide uppercase">
                  Elite Plan
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col glass-strong transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen flex-col glass-strong transition-all duration-300 md:flex",
          collapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        {sidebarContent}

        {/* Collapse button (desktop only) */}
        <button
          onClick={toggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full glass border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </button>
      </aside>
    </>
  );
}
