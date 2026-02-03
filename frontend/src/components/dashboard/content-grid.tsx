"use client";

import { useState } from "react";
import { PostCard } from "./post-card";
import { cn } from "@/lib/utils";

type FilterType = "all" | "pending" | "published";

const mockPosts = [
  {
    id: "post-1",
    platform: "linkedin" as const,
    content:
      "A revolução da IA generativa não está apenas criando conteúdo — está redefinindo como pensamos sobre produtividade. Em 2025, as empresas que adotarem IA como copiloto estratégico terão uma vantagem competitiva massiva. Aqui estão 3 formas práticas de começar...",
    scheduledFor: "Amanhã, 09:00",
    status: "pending" as const,
  },
  {
    id: "post-2",
    platform: "instagram" as const,
    content:
      "5 ferramentas de IA que estou usando diariamente para aumentar minha produtividade em 3x. Thread completa no carrossel. Salva pra não perder!",
    scheduledFor: "Hoje, 18:30",
    status: "approved" as const,
  },
  {
    id: "post-3",
    platform: "linkedin" as const,
    content:
      "Ontem tive uma conversa fascinante sobre o futuro do trabalho remoto com líderes de tech. A conclusão? Não é sobre onde você trabalha, é sobre como você entrega valor. A cultura de resultados está substituindo a cultura de presença.",
    status: "published" as const,
    engagement: { likes: 234, comments: 45, shares: 12 },
  },
  {
    id: "post-4",
    platform: "instagram" as const,
    content:
      "De júnior a sênior em 2 anos. O segredo? Consistência > Talento. Todo dia eu dedico 1h para aprender algo novo. Esse carrossel mostra minha rotina completa de estudos.",
    scheduledFor: "Quinta, 12:00",
    status: "pending" as const,
  },
  {
    id: "post-5",
    platform: "linkedin" as const,
    content:
      "O maior erro que vejo em startups early-stage: focar em features antes de validar o problema. Depois de mentorar mais de 50 startups, posso dizer que 80% dos pivots acontecem porque o problema original não era real.",
    scheduledFor: "Sexta, 08:00",
    status: "pending" as const,
  },
  {
    id: "post-6",
    platform: "instagram" as const,
    content:
      "POV: Quando você descobre que pode automatizar 70% do seu marketing de conteúdo com IA. O futuro é agora. Link na bio para saber mais.",
    status: "published" as const,
    engagement: { likes: 892, comments: 67, shares: 34 },
  },
];

const filters: { label: string; value: FilterType }[] = [
  { label: "Todos", value: "all" },
  { label: "Pendentes", value: "pending" },
  { label: "Publicados", value: "published" },
];

export function ContentGrid() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filteredPosts = mockPosts.filter((post) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return post.status === "pending" || post.status === "approved";
    return post.status === "published";
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Conteúdo Gerado
          </h3>
          <p className="text-sm text-muted-foreground">
            {mockPosts.filter((p) => p.status === "pending").length} posts
            aguardando aprovação
          </p>
        </div>
        <div className="flex items-center gap-2">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                activeFilter === filter.value
                  ? "bg-electric/15 text-neon hover:bg-electric/25"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </div>
    </div>
  );
}
