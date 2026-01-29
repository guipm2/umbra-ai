"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { Loader2, Mail, Send, Copy, ChevronRight, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function EmailGeneratorPage() {
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);

    // State
    const [selectedCampaign, setSelectedCampaign] = useState("");
    const [objective, setObjective] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState<any>(null);

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
        const { data } = await supabase.from('campaigns').select('id, name').eq('status', 'active');
        if (data) {
            setCampaigns(data);
            localStorage.setItem('aura_campaigns', JSON.stringify(data));
        }
        setLoadingCampaigns(false);
    }

    const handleGenerate = async () => {
        if (!selectedCampaign || !objective) return;

        setIsGenerating(true);
        try {
            const { data: fullCampaign } = await supabase
                .from('campaigns')
                .select('*, products(name), audiences(name)')
                .eq('id', selectedCampaign)
                .single();

            if (!fullCampaign) throw new Error("Detalhes da campanha não encontrados");

            const response = await fetch('http://localhost:8000/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_name: fullCampaign.products.name,
                    audience_name: fullCampaign.audiences.name,
                    objective: objective
                })
            });

            if (!response.ok) throw new Error("Erro na geração da IA");

            const data = await response.json();
            setGeneratedEmail(data);

        } catch (error) {
            console.error(error);
            alert("Erro ao gerar e-mail. Verifique o backend.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Save Logic
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!generatedEmail || !user || !selectedCampaign) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from('generated_content').insert({
                user_id: user.id,
                campaign_id: selectedCampaign,
                type: 'email',
                title: generatedEmail.subject_line || 'E-mail Marketing',
                content: generatedEmail
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
                    <Mail className="h-6 w-6 text-green-400" />
                    Marketing por E-mail
                </h1>
                <p className="text-gray-400 mt-1">Gere sequências de alta conversão, newsletters e emails de boas-vindas.</p>
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
                                            ? "bg-green-500/10 border-green-500 text-white"
                                            : "bg-black/20 border-white/5 text-gray-400 hover:bg-white/5"
                                            }`}
                                    >
                                        <span className="font-medium">{camp.name}</span>
                                        {selectedCampaign === camp.id && <ChevronRight className="h-4 w-4 text-green-500" />}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Objective Input */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block">2. Qual o Objetivo do E-mail?</label>
                        <textarea
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            placeholder="Ex: E-mail de boas vindas após cadastro, oferecendo o lead magnet."
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-green-500/50 resize-none"
                        />
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!selectedCampaign || !objective || isGenerating}
                        className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-green-500/20"
                    >
                        {isGenerating ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Escrevendo E-mail...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Send className="h-5 w-5" />
                                Gerar E-mail
                            </div>
                        )}
                    </button>
                </div>

                {/* Result Panel */}
                <div className="flex-1 min-w-0">
                    {generatedEmail ? (
                        <div className="glass rounded-2xl border border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-8">
                            {/* Inbox Preview Header */}
                            <div className="bg-white text-black p-6 border-b border-gray-200">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shrink-0">
                                            A
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <h3 className="font-bold text-lg truncate pr-4">{generatedEmail.subject_line}</h3>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">10:42 AM</span>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">
                                                <span className="font-semibold">Aura AI</span> &lt;noreply@aura.ai&gt;
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 truncate">
                                                {generatedEmail.preheader}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Email Body */}
                            <div className="bg-white text-gray-900 p-8 min-h-[400px]">
                                <div className="prose prose-slate max-w-none">
                                    <ReactMarkdown>
                                        {generatedEmail.body_content}
                                    </ReactMarkdown>
                                </div>

                                <div className="mt-8 text-center">
                                    <a href="#" className="inline-block px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors no-underline">
                                        {generatedEmail.cta_button}
                                    </a>
                                </div>
                            </div>

                            {/* Copy Actions */}
                            <div className="bg-black/80 p-4 flex justify-end gap-3 backdrop-blur-md border-t border-white/10">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 mr-auto"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    {isSaving ? "Salvando..." : "Salvar na Biblioteca"}
                                </button>
                                <button className="px-4 py-2 rounded-lg border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                                    <Copy className="h-4 w-4" /> Copiar Assunto
                                </button>
                                <button className="px-4 py-2 rounded-lg border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex items-center gap-2">
                                    <Copy className="h-4 w-4" /> Copiar Corpo
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-12 text-center opacity-50">
                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <Mail className="h-10 w-10 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-500 mb-2">Editor de E-mail</h3>
                            <p className="text-gray-600 max-w-sm">
                                Preencha o objetivo ao lado para gerar um e-mail otimizado para sua audiência.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
