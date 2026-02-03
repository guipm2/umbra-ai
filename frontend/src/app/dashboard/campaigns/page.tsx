"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Megaphone, ArrowRight, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/auth-context";
import { useCachedQuery } from "@/hooks/use-cached-query";

export default function CampaignsPage() {
    const { user } = useAuth();

    // Unified Hook
    const { data: campaigns = [], loading } = useCachedQuery({
        key: 'aura_campaigns',
        fetcher: async () => {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*, products(name), audiences(name), experts(name)')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        },
        initialData: [],
        enabled: !!user
    });

    // Removed manual state
    // const [campaigns, setCampaigns] = useState<any[]>([]);
    // const [loading, setLoading] = useState(true);

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-8 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Megaphone className="h-6 w-6 text-neon" />
                        Minhas Campanhas
                    </h1>
                    <p className="text-gray-400 mt-1">Gerencie suas campanhas de marketing ativas.</p>
                </div>
                <Link
                    href="/dashboard/campaigns/new"
                    className="flex items-center gap-2 px-6 py-2 bg-neon text-black font-bold rounded-lg hover:bg-neon/90 transition-colors shadow-lg shadow-neon/20"
                >
                    <Plus className="h-4 w-4" />
                    Nova Campanha
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-neon" />
                </div>
            ) : campaigns.length === 0 ? (
                <div className="text-center p-12 glass rounded-2xl border border-white/5 flex flex-col items-center">
                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                        <Megaphone className="h-8 w-8 text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhuma campanha criada</h3>
                    <p className="text-gray-400 max-w-md mx-auto mb-6">Comece criando sua primeira campanha para gerar conteúdos focados.</p>
                    <Link
                        href="/dashboard/campaigns/new"
                        className="px-6 py-2 bg-neon/10 text-neon border border-neon/20 rounded-lg hover:bg-neon/20 transition-colors"
                    >
                        Criar Agora
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map(camp => (
                        <Link
                            key={camp.id}
                            href={`/dashboard/campaigns/${camp.id}`}
                            className="glass group relative rounded-2xl border border-white/5 p-6 hover:border-neon/30 transition-all hover:bg-white/5 flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-10 w-10 rounded-lg bg-electric/20 flex items-center justify-center text-neon">
                                    <Megaphone className="h-5 w-5" />
                                </div>
                                <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                                    Ativa
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-neon transition-colors">{camp.name}</h3>
                            <p className="text-sm text-gray-400 line-clamp-2 flex-grow mb-6">{camp.objective}</p>

                            <div className="space-y-2 border-t border-white/5 pt-4">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Produto</span>
                                    <span className="text-gray-300">{camp.products?.name}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Público</span>
                                    <span className="text-gray-300">{camp.audiences?.name}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
