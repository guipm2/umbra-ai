"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { Loader2, Smartphone, Video, Sparkles, ChevronRight, Copy, Check, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

// Video Styles Mock
const VIDEO_STYLES = [
    { id: 'review', icon: Sparkles, title: "Review Sincero", description: "Avaliação direta do produto mostrando pros e contras.", color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: 'vlog', icon: Smartphone, title: "Mini Vlog", description: "Rotina ou 'um dia comigo' usando o produto organicamente.", color: "text-purple-400", bg: "bg-purple-400/10" },
    { id: 'unboxing', icon: Video, title: "Unboxing + ASMR", description: "Abertura da caixa com foco sensorial e detalhes visuais.", color: "text-pink-400", bg: "bg-pink-400/10" },
    { id: 'tutorial', icon: PlayCircle, title: "Tutorial Rápido", description: "Passo a passo 'How-to' resolvendo um problema específico.", color: "text-green-400", bg: "bg-green-400/10" },
];

export default function UGCGeneratorPage() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);

    // State
    const [selectedCampaign, setSelectedCampaign] = useState("");
    const [selectedStyle, setSelectedStyle] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedScript, setGeneratedScript] = useState<any>(null);

    // Cache-First Campaign Fetch
    useEffect(() => {
        if (user) {
            const cached = localStorage.getItem('aura_campaigns');
            if (cached) {
                setCampaigns(JSON.parse(cached));
                setLoadingCampaigns(false);
            }
            fetchCampaigns();
        }
    }, [user]);

    async function fetchCampaigns() {
        // Silent update
        const { data } = await supabase.from('campaigns').select('id, name').eq('status', 'active');
        if (data) {
            setCampaigns(data);
            localStorage.setItem('aura_campaigns', JSON.stringify(data));
        }
        setLoadingCampaigns(false);
    }

    const handleGenerate = async () => {
        if (!selectedCampaign || !selectedStyle) return;

        setIsGenerating(true);
        try {
            // 1. Get Campaign Details
            const campaignFn = campaigns.find(c => c.id === selectedCampaign);
            if (!campaignFn) throw new Error("Campanha não encontrada");

            // We need the names, not just IDs. 
            // In a real optimized scenario, we would have these in the campaign object or fetch them.
            // For now, let's fetch the details to be sure.
            const { data: fullCampaign } = await supabase
                .from('campaigns')
                .select('*, products(name), audiences(name), experts(name)')
                .eq('id', selectedCampaign)
                .single();

            if (!fullCampaign) throw new Error("Detalhes da campanha não encontrados");

            // 2. Call AI Backend
            const response = await fetch('http://localhost:8000/api/ugc', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: fullCampaign.products.name,
                    audience_name: fullCampaign.audiences.name,
                    expert_name: fullCampaign.experts.name,
                    style: VIDEO_STYLES.find(s => s.id === selectedStyle)?.title || "Viral"
                })
            });

            if (!response.ok) throw new Error("Erro na geração da IA");

            const data = await response.json();
            setGeneratedScript(data);

        } catch (error) {
            console.error(error);
            alert("Erro ao gerar roteiro. Verifique se o Backend está rodando.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="w-full max-w-[1800px] mx-auto p-6 md:p-8 animate-in fade-in">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Smartphone className="h-6 w-6 text-neon" />
                        Gerador de UGC
                    </h1>
                    <p className="text-gray-400 mt-1">Crie roteiros autênticos para TikTok e Reels baseados nas suas campanhas.</p>
                </div>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 h-full">

                {/* Configuration Panel - Fixed Width */}
                <div className="w-full xl:w-[400px] shrink-0 space-y-6">
                    {/* Campaign Selector */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block">1. Selecione a Campanha</label>
                        {loadingCampaigns ? (
                            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                        ) : (
                            <div className="space-y-2">
                                {campaigns.map(camp => (
                                    <div
                                        key={camp.id}
                                        onClick={() => setSelectedCampaign(camp.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${selectedCampaign === camp.id
                                            ? "bg-neon/10 border-neon text-white"
                                            : "bg-black/20 border-white/5 text-gray-400 hover:bg-white/5"
                                            }`}
                                    >
                                        <span className="font-medium">{camp.name}</span>
                                        {selectedCampaign === camp.id && <ChevronRight className="h-4 w-4 text-neon" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Style Selector */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block">2. Estilo do Vídeo</label>
                        <div className="grid grid-cols-1 gap-3">
                            {VIDEO_STYLES.map(style => (
                                <div
                                    key={style.id}
                                    onClick={() => setSelectedStyle(style.id)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedStyle === style.id
                                        ? "bg-neon/10 border-neon"
                                        : "bg-black/20 border-white/5 hover:bg-white/5"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-md flex items-center justify-center ${style.bg} ${style.color}`}>
                                            <style.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className={`text-sm font-bold ${selectedStyle === style.id ? 'text-white' : 'text-gray-300'}`}>{style.title}</h4>
                                            <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{style.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!selectedCampaign || !selectedStyle || isGenerating}
                        className="w-full py-4 bg-neon text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_20px_-5px_rgba(224,130,255,0.4)]"
                    >
                        {isGenerating ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Criando Roteiro...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                Gerar Roteiro
                            </div>
                        )}
                    </button>
                </div>

                {/* Result Panel - Fluid Width */}
                <div className="flex-1 min-w-0">
                    {generatedScript ? (
                        <div className="glass rounded-2xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-8">
                            <div className="p-6 border-b border-white/10 bg-black/40 flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-white mb-1">{generatedScript.title}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-400">
                                        <span className="bg-neon/20 text-neon px-2 py-0.5 rounded textxs font-mono">HOOK</span>
                                        "{generatedScript.hook}"
                                    </div>
                                </div>
                                <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors">
                                    <Copy className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 border-b border-white/10">
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase w-1/2">Visual (O que se vê)</th>
                                            <th className="p-4 text-xs font-bold text-gray-500 uppercase w-1/2">Áudio (O que se fala)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {generatedScript.scenes.map((scene: any, idx: number) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-sm text-gray-300 align-top leading-relaxed border-r border-white/5">
                                                    <span className="text-xs font-mono text-gray-600 block mb-1">Cena {idx + 1}</span>
                                                    {scene.visual}
                                                </td>
                                                <td className="p-4 text-sm text-white font-medium align-top leading-relaxed text-shadow">
                                                    "{scene.audio}"
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-4 bg-black/40 border-t border-white/10 flex justify-end gap-3">
                                <button className="px-4 py-2 rounded-lg border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                                    Regerar (Tentar Outro)
                                </button>
                                <button className="px-4 py-2 rounded-lg bg-electric text-white text-xs font-medium hover:bg-electric/80 transition-colors shadow-lg shadow-electric/20">
                                    Salvar na Biblioteca
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-12 text-center opacity-50">
                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Smartphone className="h-10 w-10 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-500 mb-2">Aguardando Configuração</h3>
                            <p className="text-gray-600 max-w-sm">
                                Selecione uma campanha e um estilo ao lado para gerar seu roteiro de vídeo viral.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
