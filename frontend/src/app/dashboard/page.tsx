
"use client";

import { Sparkles, Calendar, Bell, ArrowUpRight, Clock, CheckCircle2 } from "lucide-react";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { VoiceAnalysisChart } from "@/components/dashboard/voice-analysis-chart";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400">
            Visão geral da sua autoridade digital.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
            <Calendar className="h-4 w-4" />
            <span>Calendário</span>
          </button>
          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-neon animate-pulse" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* Left Column: Voice Analysis + Quick Actions */}
        <div className="xl:col-span-2 space-y-6">
          {/* Section 1: Quick Create */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link href="/dashboard/editor?template=linkedin" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-blue-600/10 to-blue-900/10 p-6 transition-all hover:border-blue-500/30 hover:shadow-[0_0_20px_-10px_rgba(59,130,246,0.5)]">
              <div className="absolute top-4 right-4 opacity-50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight className="h-5 w-5 text-blue-400" />
              </div>
              <div className="mb-4 h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Gerar Post LinkedIn</h3>
              <p className="text-sm text-gray-400">Criar conteúdo viral com base em tendências.</p>
            </Link>

            <Link href="/dashboard/editor?template=instagram" className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-pink-600/10 to-purple-900/10 p-6 transition-all hover:border-pink-500/30 hover:shadow-[0_0_20px_-10px_rgba(236,72,153,0.5)]">
              <div className="absolute top-4 right-4 opacity-50 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight className="h-5 w-5 text-pink-400" />
              </div>
              <div className="mb-4 h-10 w-10 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Criar Carrossel</h3>
              <p className="text-sm text-gray-400">Roteiro visual para Instagram Stories/Reels.</p>
            </Link>
          </div>

          {/* Activity Feed */}
          <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-white">Atividade Recente</h3>
              <Link href="/dashboard/history" className="text-xs text-neon hover:text-neon/80 transition-colors">
                Ver tudo
              </Link>
            </div>
            <div className="space-y-4">
              {[
                { title: "Post: O Futuro da IA", type: "LinkedIn", status: "Agendado", time: "Hoje, 14:00", icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10" },
                { title: "Thread: React 19", type: "Twitter", status: "Publicado", time: "Ontem, 09:30", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-400/10" },
                { title: "Carrossel: Dicas de UX", type: "Instagram", status: "Rascunho", time: "2 dias atrás", icon: PenTool, color: "text-gray-400", bg: "bg-gray-400/10" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer border border-transparent hover:border-white/5">
                  <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${item.bg} ${item.color}`}>
                    <item.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-200 truncate group-hover:text-white transition-colors">{item.title}</h4>
                    <p className="text-xs text-gray-500">{item.type} • {item.time}</p>
                  </div>
                  <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/5 text-gray-400 border border-white/5">
                    {item.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics Chart + Tips */}
        <div className="xl:col-span-1 space-y-6">
          <VoiceAnalysisChart />

          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-electric/5 to-transparent p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <h3 className="relative text-sm font-semibold text-white mb-3">Dica do Dia</h3>
            <p className="relative text-sm text-gray-400 leading-relaxed mb-4">
              Posts com perguntas no final têm <span className="text-neon font-medium">40% mais engajamento</span>. Tente terminar seu próximo post com "E você, concorda?"
            </p>
            <button className="relative w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-medium text-white transition-all">
              Aplicar no próximo post
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Temporary Icon for Draft
function PenTool(props: { className?: string }) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 19l7-7 3 3-7 7-3-3z" />
      <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="M2 2l7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  )
}
