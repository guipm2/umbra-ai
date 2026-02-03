"use client";

import { useState, useEffect } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import Image from "next/image";

const voiceData = [
  { trait: "Técnico", value: 82, fullMark: 100 },
  { trait: "Amigável", value: 45, fullMark: 100 },
  { trait: "Persuasivo", value: 68, fullMark: 100 },
  { trait: "Formal", value: 72, fullMark: 100 },
  { trait: "Criativo", value: 55, fullMark: 100 },
  { trait: "Analítico", value: 90, fullMark: 100 },
];

export function VoiceAnalysisChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="glass rounded-2xl p-6 neon-glow">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Análise de Voz
          </h3>
          <p className="text-sm text-muted-foreground">
            Personality Radar do seu tom de escrita
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-electric/15 overflow-hidden relative group">
          <Image
            src="/assets/3d/personality_radar_icon.png"
            alt="Radar de Personalidade"
            fill
            className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
          />
        </div>
      </div>

      <div className="h-[280px] w-full">
        {!mounted ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Carregando gráfico...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={voiceData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid
                stroke="rgba(157, 80, 187, 0.15)"
                strokeDasharray="3 3"
              />
              <PolarAngleAxis
                dataKey="trait"
                tick={{
                  fill: "#888888",
                  fontSize: 12,
                  fontWeight: 500,
                }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(20, 16, 28, 0.9)",
                  border: "1px solid rgba(157, 80, 187, 0.3)",
                  borderRadius: "8px",
                  backdropFilter: "blur(12px)",
                  color: "#EAEAEA",
                  fontSize: "13px",
                }}
                formatter={(value) => [`${value}%`, "Score"]}
              />
              <Radar
                name="Tom de Voz"
                dataKey="value"
                stroke="#9D50BB"
                strokeWidth={2}
                fill="#9D50BB"
                fillOpacity={0.15}
                dot={{
                  r: 4,
                  fill: "#E082FF",
                  stroke: "#9D50BB",
                  strokeWidth: 2,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top traits */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[...voiceData]
          .sort((a, b) => b.value - a.value)
          .slice(0, 3)
          .map((item) => (
            <div
              key={item.trait}
              className="rounded-lg bg-muted px-3 py-2 text-center"
            >
              <p className="text-xs text-muted-foreground">{item.trait}</p>
              <p className="text-sm font-semibold text-neon">{item.value}%</p>
            </div>
          ))}
      </div>
    </div>
  );
}
