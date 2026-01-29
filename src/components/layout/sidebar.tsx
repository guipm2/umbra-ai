"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
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
  Package,
  Users,
  UserCheck,
  Megaphone,
  Zap,
  Layers,
  Video,
  Image as ImageIcon,
  Mail,
  MessageSquare,
  Linkedin,
  Instagram,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { useAuth } from "@/components/auth/auth-context";

const navGroups = [
  {
    title: "Estratégia",
    items: [
      {
        label: "Produtos",
        href: "/dashboard/products",
        icon: Package,
      },
      {
        label: "Públicos",
        href: "/dashboard/audiences",
        icon: Users,
      },
      {
        label: "Especialistas",
        href: "/dashboard/experts",
        icon: UserCheck,
      },
    ]
  },
  {
    title: "Criação",
    items: [
      {
        label: "Copy Center",
        href: "/dashboard/copy-center",
        icon: Zap,
        subItems: [
          {
            label: "Anúncio UGC",
            href: "/dashboard/generator/ugc",
            icon: Video,
          },
          {
            label: "Anúncio Estático",
            href: "/dashboard/generator/static",
            icon: ImageIcon,
          },
          {
            label: "E-mails",
            href: "/dashboard/generator/email",
            icon: Mail,
          },
          {
            label: "Mensagens",
            href: "/dashboard/generator/messages",
            icon: MessageSquare,
          },
          {
            label: "LinkedIn",
            href: "/dashboard/editor?template=linkedin",
            icon: Linkedin,
          },
          {
            label: "Instagram",
            href: "/dashboard/editor?template=instagram",
            icon: Instagram,
          },
        ]
      },
      {
        label: "Minhas Copys",
        href: "/dashboard/my-copies", // Antigo "Brain" para outputs? Não, melhor manter separado
        icon: Layers,
      },
      {
        label: "Ghostwriter", // Legacy Editor
        href: "/dashboard/editor",
        icon: PenTool,
      },
    ]
  },
  {
    title: "Gestão",
    items: [
      {
        label: "Campanhas",
        href: "/dashboard/campaigns",
        icon: Megaphone,
      },
      {
        label: "Brain (Arquivos)",
        href: "/dashboard/brain",
        icon: BrainCircuit,
      },
      {
        label: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
      },
    ]
  }
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
  const { user, profile } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // Auto-expand menu based on current path
  useEffect(() => {
    navGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.subItems) {
          const isChildActive = item.subItems.some(sub => {
            const [base, query] = sub.href.split('?');
            if (base !== pathname) return false;
            if (query) {
              const params = new URLSearchParams(query);
              // @ts-ignore
              for (const [k, v] of params.entries()) {
                if (searchParams?.get(k) !== v) return false;
              }
            }
            return true;
          });
          const isSelfActive = pathname === item.href;

          if (isChildActive || isSelfActive) {
            setOpenMenus(prev => prev.includes(item.label) ? prev : [...prev, item.label]);
          }
        }
      });
    });
  }, [pathname, searchParams]);

  const toggleMenu = (label: string) => {
    setOpenMenus(prev =>
      prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

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
      <nav className="flex-1 space-y-6 px-3 py-4 overflow-y-auto custom-scrollbar" role="navigation" aria-label="Menu principal">
        {/* Dashboard Home */}
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
            pathname === "/dashboard"
              ? "bg-electric/15 text-neon neon-glow"
              : "text-muted-foreground hover:bg-glass-hover hover:text-foreground"
          )}
        >
          <LayoutDashboard className={cn("h-5 w-5 shrink-0", pathname === "/dashboard" ? "text-neon" : "text-muted-foreground")} />
          {showLabels && <span>Dashboard</span>}
        </Link>

        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {showLabels && (
              <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 mb-2">
                {group.title}
              </h4>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href;
              // @ts-ignore
              const hasSubItems = item.subItems && item.subItems.length > 0;
              // @ts-ignore
              const isOpen = openMenus.includes(item.label);
              // @ts-ignore
              const isChildActive = hasSubItems && item.subItems.some(sub => {
                const [base, query] = sub.href.split('?');
                if (base !== pathname) return false;
                if (query) {
                  const params = new URLSearchParams(query);
                  // @ts-ignore
                  for (const [k, v] of params.entries()) {
                    if (searchParams?.get(k) !== v) return false;
                  }
                }
                return true;
              });

              return (
                <div key={item.href} className="space-y-1">
                  <div className="relative flex items-center">
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 flex-1",
                        isActive || isChildActive
                          ? "bg-electric/15 text-neon neon-glow"
                          : "text-muted-foreground hover:bg-glass-hover hover:text-foreground"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0",
                          isActive || isChildActive ? "text-neon" : "text-muted-foreground"
                        )}
                      />
                      {showLabels && <span>{item.label}</span>}
                    </Link>

                    {hasSubItems && showLabels && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // @ts-ignore
                          toggleMenu(item.label);
                        }}
                        className={cn(
                          "absolute right-2 p-1 rounded-md hover:bg-white/10 transition-colors",
                          isOpen ? "text-neon" : "text-muted-foreground"
                        )}
                      >
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen ? "rotate-180" : "")} />
                      </button>
                    )}
                  </div>

                  {/* Sub-items */}
                  {/* @ts-ignore */}
                  {hasSubItems && isOpen && showLabels && (
                    <div className="ml-9 space-y-1 border-l border-white/10 pl-2 animate-in slide-in-from-top-2 fade-in duration-200">
                      {/* @ts-ignore */}
                      {item.subItems.map((sub) => {
                        const [base, query] = sub.href.split('?');
                        let isSubActive = base === pathname;

                        if (isSubActive && query) {
                          const params = new URLSearchParams(query);
                          // @ts-ignore
                          for (const [k, v] of params.entries()) {
                            if (searchParams?.get(k) !== v) {
                              isSubActive = false;
                              break;
                            }
                          }
                        }

                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "flex items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200",
                              isSubActive
                                ? "text-neon bg-neon/5"
                                : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                            <sub.icon className="h-3.5 w-3.5" />
                            <span>{sub.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
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
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-electric to-neon shadow-lg shadow-neon/20 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="User" className="h-full w-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">{profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}</span>
            )}
          </div>
          {showLabels && (
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Usuário"}
              </p>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-neon animate-pulse" />
                <p className="truncate text-[10px] font-medium text-neon tracking-wide uppercase">
                  {profile?.subscription_tier || "Starter"} Plan
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
