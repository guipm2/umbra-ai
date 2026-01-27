"use client";

import { Menu, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { AiChatbox } from "@/components/chat/ai-chatbox";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  SidebarProvider,
  useSidebar,
} from "@/components/layout/sidebar-context";

function MobileHeader() {
  const { setMobileOpen } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border glass-strong px-4 md:hidden">
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-neon" />
        <span className="text-base font-semibold text-foreground neon-text">
          Aura AI
        </span>
      </div>
    </header>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-deep bg-grid-pattern">
      <Sidebar />
      <div
        className="flex min-h-screen flex-col transition-[margin] duration-300 max-md:ml-0"
        style={{ marginLeft: collapsed ? 72 : 240 }}
      >
        <MobileHeader />
        <main className="flex-1 p-4 md:p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <AiChatbox />
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
