"use client";

import { TrendingUp, Users, Eye, MousePointerClick } from "lucide-react";

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[
        {
          label: "Impressões Totais",
          value: "142.5K",
          change: "+12.5%",
          trend: "up",
          icon: Eye,
          color: "text-blue-400",
          bg: "bg-blue-400/10",
        },
        {
          label: "Engajamento",
          value: "8.2K",
          change: "+5.2%",
          trend: "up",
          icon: MousePointerClick,
          color: "text-neon",
          bg: "bg-neon/10",
        },
        {
          label: "Seguidores",
          value: "12.8K",
          change: "+2.1%",
          trend: "up",
          icon: Users,
          color: "text-purple-400",
          bg: "bg-purple-400/10",
        },
        {
          label: "Viral Score Médio",
          value: "85/100",
          change: "+4pts",
          trend: "up",
          icon: TrendingUp,
          color: "text-green-400",
          bg: "bg-green-400/10",
        },
      ].map((stat) => (
        <div
          key={stat.label}
          className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/5 p-6 transition-all hover:bg-white/10"
        >
          <div className="flex items-center justify-between">
            <div className={`rounded-xl p-2.5 ${stat.bg} ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
              <TrendingUp className="h-3 w-3" />
              {stat.change}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>

          {/* Decorative Gradient */}
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-all group-hover:bg-white/10" />
        </div>
      ))}
    </div>
  );
}
