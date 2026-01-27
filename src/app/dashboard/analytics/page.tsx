
"use client";

import { VoiceAnalysisChart } from "@/components/dashboard/voice-analysis-chart";
import { AIAnalyst } from "@/components/dashboard/ai-analyst";
import { TrendingUp, Users, Eye, ArrowUp, Calendar } from "lucide-react";

// Mock Data for a new chart (Bar Chart simulation using Tailwind)
function EngagementChart() {
    const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    const values = [40, 65, 45, 90, 75, 55, 60]; // Percentage height

    return (
        <div className="w-full h-64 flex items-end justify-between gap-2 pt-8">
            {values.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full relative bg-white/5 rounded-t-lg overflow-hidden h-full flex items-end hover:bg-white/10 transition-colors cursor-pointer">
                        <div
                            style={{ height: `${val}%` }}
                            className="w-full bg-electric/50 group-hover:bg-neon/60 transition-all relative border-t border-white/20"
                        >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-white bg-black/80 px-2 py-1 rounded border border-white/10">
                                {val}k
                            </div>
                        </div>
                    </div>
                    <span className="text-xs text-gray-500">{days[i]}</span>
                </div>
            ))}
        </div>
    );
}

export default function AnalyticsPage() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Analytics</h1>
                    <p className="text-sm text-gray-400">Deep dive nos seus dados de performance.</p>
                </div>
                <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                    {['7D', '30D', '3M', '1Y'].map((period, i) => (
                        <button key={period} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${i === 1 ? 'bg-electric text-white' : 'text-gray-400 hover:text-white'}`}>
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: "Crescimento de Seguidores", value: "+1,240", sub: "vs. mês anterior", trend: "+12%", icon: Users, color: "text-blue-400" },
                    { label: "Impressões Totais", value: "85.4k", sub: "vs. mês anterior", trend: "+5.4%", icon: Eye, color: "text-purple-400" },
                    { label: "Taxa de Engajamento", value: "4.8%", sub: "Média do setor: 2.1%", trend: "+0.8%", icon: TrendingUp, color: "text-neon" },
                ].map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-2xl border border-white/5 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                                <ArrowUp className="h-3 w-3" />
                                {stat.trend}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                            <p className="text-sm text-gray-400">{stat.label}</p>
                            <p className="text-xs text-gray-500 mt-2 border-t border-white/5 pt-2">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Main Engagement Chart */}
                <div className="glass p-6 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-white">Engajamento Semanal</h3>
                        <button className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> Exportar Dados
                        </button>
                    </div>
                    <EngagementChart />
                </div>

                {/* Voice Analysis Radar */}
                {/* Voice Analysis Radar */}
                <div className="h-full space-y-6">
                    <AIAnalyst />
                    <VoiceAnalysisChart />
                </div>
            </div>
        </div>
    );
}
