"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { Loader2, Zap, LayoutTemplate, Copy, Image as ImageIcon, ChevronRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

function StaticAdGeneratorContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const preSelectedCampaignId = searchParams.get("campaignId");

    // Unified Hook used for Campaign Selector
    const { data: campaigns = [], loading: loadingCampaigns } = useCachedQuery({
        key: 'aura_campaigns', // Shared key! It will pick up cache from CampaignsPage if visited
        fetcher: async () => {
            const { data, error } = await supabase.from('campaigns').select('id, name').eq('status', 'active');
            if (error) throw error;
            return data || [];
        },
        initialData: [],
        enabled: !!user
    });

    // State
    const [selectedCampaign, setSelectedCampaign] = useState(preSelectedCampaignId || "");
    const [offer, setOffer] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedAd, setGeneratedAd] = useState<any>(null);

    // Update selected campaign if URL param changes
    useEffect(() => {
        if (preSelectedCampaignId) {
            setSelectedCampaign(preSelectedCampaignId);
        }
    }, [preSelectedCampaignId]);

    const handleGenerate = async () => {
        if (!selectedCampaign || !offer) return;

        setIsGenerating(true);
        try {
            const { data: fullCampaign } = await supabase
                .from('campaigns')
                .select('*, products(name), audiences(name)')
                .eq('id', selectedCampaign)
                .single();

            if (!fullCampaign) throw new Error("Detalhes da campanha não encontrados");

            const response = await fetch('http://localhost:8000/api/static-ad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: fullCampaign.products.name,
                    audience_name: fullCampaign.audiences.name,
                    offer: offer
                })
            });

            if (!response.ok) throw new Error("Erro na geração da IA");

            const data = await response.json();
            setGeneratedAd(data);

        } catch (error) {
            console.error(error);
            alert("Erro ao gerar anúncio. Verifique o backend.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Save Logic
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!generatedAd || !user || !selectedCampaign) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from('generated_content').insert({
                user_id: user.id,
                campaign_id: selectedCampaign,
                type: 'static',
                title: generatedAd.headline || 'Anúncio Estático',
                content: generatedAd
            });

            if (error) throw error;
            alert("Salvo com sucesso!");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="w-full max-w-[1800px] mx-auto p-6 md:p-8 animate-in fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <ImageIcon className="h-6 w-6 text-pink-400" />
                    Gerador de Anúncios Estáticos
                </h1>
                <p className="text-gray-400 mt-1">Crie copy otimizada para banners do Instagram, Facebook e Google.</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 h-full">

                {/* Configuration Panel */}
                <div className="w-full xl:w-[400px] shrink-0 space-y-6">
                    {/* Campaign Selector */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block">1. Selecione a Campanha</label>
                        {loadingCampaigns ? (
                            <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                        ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {campaigns.map(camp => (
                                    <div
                                        key={camp.id}
                                        onClick={() => setSelectedCampaign(camp.id)}
                                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${selectedCampaign === camp.id
                                            ? "bg-pink-500/10 border-pink-500 text-white"
                                            : "bg-black/20 border-white/5 text-gray-400 hover:bg-white/5"
                                            }`}
                                    >
                                        <span className="font-medium">{camp.name}</span>
                                        {selectedCampaign === camp.id && <ChevronRight className="h-4 w-4 text-pink-500" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Offer Input */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block">2. Qual a Oferta e/ou Objetivo?</label>
                        <textarea
                            value={offer}
                            onChange={(e) => setOffer(e.target.value)}
                            placeholder="Ex: 50% de desconto na primeira compra. Foco em urgência."
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-pink-500/50 resize-none"
                        />
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!selectedCampaign || !offer || isGenerating}
                        className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-pink-500/20"
                    >
                        {isGenerating ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Criando Anúncio...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Zap className="h-5 w-5" />
                                Gerar Anúncio
                            </div>
                        )}
                    </button>
                </div>

                {/* Result Panel */}
                <div className="flex-1 min-w-0">
                    {generatedAd ? (
                        <div className="glass rounded-2xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-8">
                            <div className="p-6 border-b border-white/10 bg-black/40 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-white">Anúncio Gerado</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 hover:bg-pink-500/20 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                                    >
                                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                                        {isSaving ? "Salvando..." : "Salvar"}
                                    </button>
                                    <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors" title="Copiar tudo">
                                        <Copy className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 grid gap-8">
                                {/* Visual Ad Preview Mock */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                        <ImageIcon className="h-4 w-4" />
                                        Sugestão Visual
                                    </h3>
                                    <div className="bg-black/40 rounded-xl p-6 border border-white/10 border-dashed">
                                        <p className="text-gray-300 italic leading-relaxed">
                                            "{generatedAd.image_suggestion}"
                                        </p>
                                    </div>
                                </div>

                                {/* Copy Content */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2">Headline</h3>
                                        <div className="text-xl font-bold text-white font-heading leading-tight">
                                            {generatedAd.headline}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Legenda / Texto Principal</h3>
                                        <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                                            {generatedAd.body}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Call to Action (CTA)</h3>
                                        <span className="inline-block px-4 py-2 bg-white/10 rounded-lg text-white font-medium text-sm border border-white/10">
                                            {generatedAd.cta}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-12 text-center opacity-50">
                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <LayoutTemplate className="h-10 w-10 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-500 mb-2">Aguardando...</h3>
                            <p className="text-gray-600 max-w-sm">
                                Configure a campanha e a oferta para gerar seu anúncio.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default function StaticAdGeneratorPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="animate-spin text-neon" /></div>}>
            <StaticAdGeneratorContent />
        </Suspense>
    )
}
