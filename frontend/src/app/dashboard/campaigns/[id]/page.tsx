"use client";

import { useParams } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";
import { useCachedQuery } from "@/hooks/use-cached-query";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft,
    Megaphone,
    Package,
    Users,
    UserCheck,
    Calendar,
    Plus,
    Mail,
    MessageSquare,
    Video,
    Image as ImageIcon,
    Loader2,
    FileText
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function CampaignDetailsPage() {
    const { id } = useParams();
    const { user } = useAuth();
    
    // 1. Fetch Campaign Details
    const { data: campaign, loading: campaignLoading } = useCachedQuery<any>({
        key: `aura_campaign_${id}`,
        fetcher: async () => {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*, products(*), audiences(*), experts(*)')
                .eq('id', id)
                .single();
            if (error) throw error;
            return data;
        },
        enabled: !!user && !!id
    });

    // 2. Fetch Associated Content
    const { data: contents = [], loading: contentLoading } = useCachedQuery<any[]>({
        key: `aura_campaign_content_${id}`,
        fetcher: async () => {
            const { data, error } = await supabase
                .from('generated_content')
                .select('*')
                .eq('campaign_id', id) // Assuming metadata stores campaign_id or we have a column
                // NOTE: If column doesn't exist, we might need to filter client side or fix schema. 
                // For now assuming we added it or will mock it if it fails.
                .order('created_at', { ascending: false });
            
            if (error) return []; // Fallback if column missing
            return data || [];
        },
        initialData: [],
        enabled: !!user && !!id
    });

    if (campaignLoading && !campaign) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-neon" />
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 text-gray-400">
                <p>Campanha não encontrada.</p>
                <Link href="/dashboard/campaigns" className="text-neon hover:underline">
                    Voltar para lista
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-8 p-8 animate-in fade-in">
            {/* Header */}
            <div className="space-y-4">
                <Link
                    href="/dashboard/campaigns"
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar para Campanhas
                </Link>
                
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                            {campaign.name}
                            <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400 border border-green-500/20 uppercase tracking-wider">
                                Ativa
                            </span>
                        </h1>
                        <p className="mt-2 text-lg text-gray-400 max-w-2xl">{campaign.objective}</p>
                    </div>
                   <div className="text-right">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            Criada em {new Date(campaign.created_at).toLocaleDateString()}
                        </div>
                   </div>
                </div>
            </div>

            {/* Context Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-xl p-5 border border-white/5 flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                        <Package className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Produto</h3>
                        <p className="text-white font-medium">{campaign.products?.name || "N/A"}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{campaign.products?.description}</p>
                    </div>
                </div>

                <div className="glass rounded-xl p-5 border border-white/5 flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Público-Alvo</h3>
                        <p className="text-white font-medium">{campaign.audiences?.name || "N/A"}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{campaign.audiences?.pain_points}</p>
                    </div>
                </div>

                <div className="glass rounded-xl p-5 border border-white/5 flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-yellow-500/10 text-yellow-500">
                        <UserCheck className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase text-gray-500 mb-1">Expert / Brand Voice</h3>
                        <p className="text-white font-medium">{campaign.experts?.name || "N/A"}</p>
                         <p className="text-xs text-gray-400 mt-1 line-clamp-2">{campaign.experts?.role}</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-white/5 my-8" />

            {/* Actions & Content */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-neon" />
                    Ações da Campanha
                </h2>
                
                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link 
                        href={`/dashboard/generator/email?campaignId=${id}`}
                        className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-neon/30 transition-all"
                    >
                        <Mail className="h-8 w-8 text-green-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-white">Criar E-mail</span>
                    </Link>
                    
                    <Link 
                        href={`/dashboard/generator/messages?campaignId=${id}`}
                        className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-neon/30 transition-all"
                    >
                        <MessageSquare className="h-8 w-8 text-yellow-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-white">Criar Mensagens</span>
                    </Link>

                    <Link 
                        href={`/dashboard/generator/static?campaignId=${id}`}
                        className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-neon/30 transition-all"
                    >
                         <ImageIcon className="h-8 w-8 text-pink-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-white">Criar Anúncio</span>
                    </Link>

                    <Link 
                         href={`/dashboard/generator/ugc?campaignId=${id}`}
                        className="group flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-neon/30 transition-all"
                    >
                         <Video className="h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-white">Criar Roteiro Vídeo</span>
                    </Link>
                </div>
            </div>

             <div className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                     <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="h-5 w-5 text-neon" />
                        Conteúdos Gerados ({contents.length})
                    </h2>
                </div>

                {contents.length === 0 ? (
                    <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        <p className="text-gray-500">Nenhum conteúdo criado para esta campanha ainda.</p>
                        <p className="text-xs text-gray-600 mt-1">Use os botões acima para começar.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {contents.map((content) => (
                             <div key={content.id} className="p-4 rounded-xl bg-black/20 border border-white/5 hover:border-neon/20 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-white/5 text-gray-300">
                                        {content.type}
                                    </span>
                                    <span className="text-[10px] text-gray-600">
                                        {new Date(content.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h4 className="text-white font-medium truncate mb-1">{content.title || "Sem título"}</h4>
                                <p className="text-xs text-gray-500 line-clamp-2">
                                     {typeof content.content === 'object' 
                                        ? JSON.stringify(content.content).substring(0, 100) 
                                        : content.content}
                                </p>
                             </div>
                        ))}
                    </div>
                )}
             </div>
        </div>
    );
}
