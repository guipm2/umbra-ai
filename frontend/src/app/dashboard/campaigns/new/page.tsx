"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/ui/stepper";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/auth-context";
import { Loader2, ChevronRight, ChevronLeft, Package, Users, UserCheck, Target } from "lucide-react";

const STEPS = [
    { id: 1, title: "Produto" },
    { id: 2, title: "Público" },
    { id: 3, title: "Expert" },
    { id: 4, title: "Configuração" }
];

export default function NewCampaignPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Data Sources
    const [products, setProducts] = useState<any[]>([]);
    const [audiences, setAudiences] = useState<any[]>([]);
    const [experts, setExperts] = useState<any[]>([]);

    // Selection State
    const [selectedProduct, setSelectedProduct] = useState<string>("");
    const [selectedAudience, setSelectedAudience] = useState<string>("");
    const [selectedExpert, setSelectedExpert] = useState<string>("");
    const [campaignName, setCampaignName] = useState("");
    const [objective, setObjective] = useState("Vendas Diretas");

    useEffect(() => {
        if (user) loadAssets();
    }, [user]);

    async function loadAssets() {
        // Load from Cache-First logic derived from AssetManager
        // For brevity, we load directly from LocalStorage if available, fallback to empty array (should assume user visited Assets page or we fetch fresh)

        // Products
        const cachedProducts = localStorage.getItem('aura_assets_products');
        if (cachedProducts) setProducts(JSON.parse(cachedProducts));
        else fetchTable('products', setProducts, 'aura_assets_products');

        // Audiences
        const cachedAudiences = localStorage.getItem('aura_assets_audiences');
        if (cachedAudiences) setAudiences(JSON.parse(cachedAudiences));
        else fetchTable('audiences', setAudiences, 'aura_assets_audiences');

        // Experts
        const cachedExperts = localStorage.getItem('aura_assets_experts');
        if (cachedExperts) setExperts(JSON.parse(cachedExperts));
        else fetchTable('experts', setExperts, 'aura_assets_experts');
    }

    async function fetchTable(table: string, setter: any, cacheKey: string) {
        const { data } = await supabase.from(table).select('*');
        if (data) {
            setter(data);
            localStorage.setItem(cacheKey, JSON.stringify(data));
        }
    }

    const handleNext = () => {
        if (currentStep === 1 && !selectedProduct) return alert("Selecione um produto");
        if (currentStep === 2 && !selectedAudience) return alert("Selecione um público");
        if (currentStep === 3 && !selectedExpert) return alert("Selecione um expert");

        if (currentStep < 4) setCurrentStep(curr => curr + 1);
        else handleFinish();
    };

    const handleFinish = async () => {
        if (!campaignName) return alert("Dê um nome para a campanha");

        setLoading(true);
        try {
            const { error } = await supabase.from('campaigns').insert([{
                user_id: user?.id,
                name: campaignName,
                product_id: selectedProduct,
                audience_id: selectedAudience,
                expert_id: selectedExpert,
                objective: objective,
                status: 'active'
            }]);

            if (error) throw error;

            // Clear Campaigns Cache to force refresh on list
            localStorage.removeItem('aura_campaigns');

            router.push('/dashboard/campaigns');
        } catch (error) {
            console.error(error);
            alert("Erro ao criar campanha");
        } finally {
            setLoading(false);
        }
    };

    const renderSelectionGrid = (items: any[], selectedId: string, onSelect: (id: string) => void, icon: any) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {items.map(item => (
                <div
                    key={item.id}
                    onClick={() => onSelect(item.id)}
                    className={`cursor-pointer rounded-xl p-5 border transition-all ${selectedId === item.id
                            ? "bg-neon/10 border-neon shadow-[0_0_15px_-5px_rgba(224,130,255,0.3)]"
                            : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                        }`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${selectedId === item.id ? "bg-neon text-black" : "bg-white/5 text-gray-400"}`}>
                            {icon}
                        </div>
                        <h3 className="font-semibold text-white truncate flex-1">{item.name}</h3>
                    </div>
                    {item.offer_description && <p className="text-xs text-gray-400 line-clamp-2">{item.offer_description}</p>}
                    {item.description && <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>}
                    {item.archetype && <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-300">{item.archetype}</span>}
                </div>
            ))}
            <div
                className="rounded-xl p-5 border border-dashed border-white/10 hover:border-white/30 hover:bg-white/5 flex flex-col items-center justify-center text-gray-500 cursor-pointer transition-all"
                onClick={() => router.push(`/dashboard/${STEPS[currentStep - 1].title.toLowerCase().replace('é', 'e')}s`)} // Naive routing hack, better explicit
            >
                <Plus className="h-6 w-6 mb-2" />
                <span className="text-sm">Criar Novo</span>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="mb-12">
                <h1 className="text-2xl font-bold text-white mb-8 text-center">Nova Campanha</h1>
                <Stepper steps={STEPS} currentStep={currentStep} />
            </div>

            <div className="glass rounded-2xl border border-white/5 p-8 min-h-[400px] flex flex-col">
                <div className="flex-1">
                    {currentStep === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-white mb-2">O que vamos vender?</h2>
                            <p className="text-gray-400">Selecione o produto ou serviço foco desta campanha.</p>
                            {renderSelectionGrid(products, selectedProduct, setSelectedProduct, <Package className="h-4 w-4" />)}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-white mb-2">Para quem é?</h2>
                            <p className="text-gray-400">Escolha o público-alvo principal.</p>
                            {renderSelectionGrid(audiences, selectedAudience, setSelectedAudience, <Users className="h-4 w-4" />)}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-white mb-2">Quem vai falar?</h2>
                            <p className="text-gray-400">Defina o especialista ou persona responsável pela comunicação.</p>
                            {renderSelectionGrid(experts, selectedExpert, setSelectedExpert, <UserCheck className="h-4 w-4" />)}
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300 max-w-lg mx-auto mt-8">
                            <div className="text-center mb-8">
                                <div className="h-16 w-16 bg-neon/20 rounded-full flex items-center justify-center mx-auto mb-4 text-neon shadow-[0_0_30px_-10px_rgba(224,130,255,0.5)]">
                                    <Target className="h-8 w-8" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Últimos Detalhes</h2>
                                <p className="text-gray-400">Dê uma identidade para sua campanha.</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase">Nome da Campanha</label>
                                    <input
                                        type="text"
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon/50 text-lg"
                                        placeholder="Ex: Lançamento Janeiro 2026"
                                        value={campaignName}
                                        onChange={e => setCampaignName(e.target.value)}
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-400 uppercase">Objetivo Principal</label>
                                    <select
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon/50"
                                        value={objective}
                                        onChange={e => setObjective(e.target.value)}
                                    >
                                        <option>Vendas Diretas</option>
                                        <option>Captação de Leads</option>
                                        <option>Branding / Autoridade</option>
                                        <option>Engajamento</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Navigation */}
                <div className="flex justify-between items-center pt-8 border-t border-white/5 mt-8">
                    <button
                        onClick={() => setCurrentStep(curr => Math.max(1, curr - 1))}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Voltar
                    </button>

                    <div className="flex gap-2">
                        {currentStep === 4 ? (
                            <button
                                onClick={handleFinish}
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-3 bg-neon text-black font-bold rounded-xl hover:bg-neon/90 transition-colors shadow-lg shadow-neon/20 hover:scale-105 active:scale-95"
                            >
                                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Finalizar Setup
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-6 py-2 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors"
                            >
                                Próximo
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import { Plus } from "lucide-react";
