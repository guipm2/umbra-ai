"use client";

import {
  TrendingUp,
  Users,
  FileText,
  Zap,
} from "lucide-react";

const stats = [
  {
    label: "Engajamento",
    value: "+23%",
    change: "vs. semana passada",
    trend: "up",
    icon: TrendingUp,
  },
  {
    label: "Seguidores",
    value: "12.4k",
    change: "+340 este mês",
    trend: "up",
    icon: Users,
  },
  {
    label: "Posts Gerados",
    value: "47",
    change: "12 pendentes",
    trend: "neutral",
    icon: FileText,
  },
  {
    label: "Score de IA",
    value: "94",
    change: "Excelente",
    trend: "up",
    icon: Zap,
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass rounded-xl p-4 transition-all hover:neon-glow group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-electric/10 group-hover:bg-electric/20 transition-colors">
              <stat.icon className="h-4 w-4 text-neon" />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground">{stat.value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
        </div>
      ))}
    </div>
  );
}
