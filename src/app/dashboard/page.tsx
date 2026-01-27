"use client";

import { Sparkles, Calendar, Bell } from "lucide-react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { VoiceAnalysisChart } from "@/components/dashboard/voice-analysis-chart";
import { ContentGrid } from "@/components/dashboard/content-grid";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie sua presença digital com inteligência
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Calendar className="h-4 w-4" />
            <span>Calendário</span>
          </button>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl glass text-muted-foreground hover:text-foreground transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-neon" />
            </span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Main content area */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Voice Analysis */}
        <div className="xl:col-span-1">
          <VoiceAnalysisChart />
        </div>

        {/* Quick Actions */}
        <div className="xl:col-span-2">
          <div className="glass rounded-2xl p-6">
            <h3 className="mb-4 text-base font-semibold text-foreground">
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                {
                  label: "Gerar Post LinkedIn",
                  desc: "Conteúdo otimizado",
                  gradient: "from-blue-500/20 to-electric/20",
                },
                {
                  label: "Criar Carrossel",
                  desc: "Instagram Stories",
                  gradient: "from-pink-500/20 to-electric/20",
                },
                {
                  label: "Analisar Perfil",
                  desc: "Scraping completo",
                  gradient: "from-electric/20 to-neon/20",
                },
                {
                  label: "Agendar Semana",
                  desc: "Calendário otimizado",
                  gradient: "from-neon/20 to-electric/20",
                },
              ].map((action) => (
                <button
                  key={action.label}
                  className={`flex flex-col items-start rounded-xl bg-gradient-to-br ${action.gradient} p-4 text-left transition-all hover:neon-glow`}
                >
                  <Sparkles className="mb-2 h-5 w-5 text-neon" />
                  <span className="text-sm font-medium text-foreground">
                    {action.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {action.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <ContentGrid />
    </div>
  );
}
