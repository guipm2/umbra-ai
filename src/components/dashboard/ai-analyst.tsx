"use client";

import { useState } from "react";
import { Sparkles, Search, Globe, ArrowRight } from "lucide-react";
import { askAnalyst } from "@/actions/analytics";
import { cn } from "@/lib/utils";

export function AIAnalyst() {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!query) return;
        setLoading(true);
        setResult("");

        const response = await askAnalyst(query);

        setLoading(false);
        if (response.success && response.analysis) {
            setResult(response.analysis);
        } else {
            setResult("Erro ao conectar com o Analista. Verifique o backend.");
        }
    };

    const suggestions = [
        "Quais as tendências de IA para 2026?",
        "Melhores horários para postar nas redes",
        "Analise o crescimento do TikTok vs Instagram",
        "Veja o que está em alta hoje",
        "Quais as melhores ferramentas de IA?",
        "Como usar IA para criar conteúdos?"
    ];

    return (
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-white">AI Market Analyst</h3>
                    <p className="text-xs text-gray-400">Pesquisa em tempo real na web</p>
                </div>
            </div>

            <div className="space-y-3">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                        placeholder="Pergunte sobre tendências, dados ou mercado..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !query}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 disabled:opacity-50 transition-colors"
                    >
                        {loading ? <Sparkles className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    </button>
                </div>

                {!result && !loading && (
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((s) => (
                            <button
                                key={s}
                                onClick={() => setQuery(s)}
                                className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {result && (
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/5 animate-in fade-in slide-in-from-bottom-2">
                    <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                        <Sparkles className="h-3 w-3" /> Análise Gerada
                    </h4>
                    <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed text-sm">
                        <p className="whitespace-pre-line">{result}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
