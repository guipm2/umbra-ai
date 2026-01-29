"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-context";
import { supabase } from "@/lib/supabase";
import { Loader2, MessageSquare, Copy, Check, Send } from "lucide-react";

export default function MessagesGeneratorPage() {
    const { user } = useAuth();

    // State
    const [context, setContext] = useState("");
    const [tone, setTone] = useState("Persuassivo e direto");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedMessages, setGeneratedMessages] = useState<any>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const handleGenerate = async () => {
        if (!context) return;

        setIsGenerating(true);
        try {
            const response = await fetch('http://localhost:8000/api/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    context: context,
                    tone: tone
                })
            });

            if (!response.ok) throw new Error("Erro na geração da IA");

            const data = await response.json();
            setGeneratedMessages(data);

        } catch (error) {
            console.error(error);
            alert("Erro ao gerar mensagens. Verifique o backend.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Save Logic
    const [isSaving, setIsSaving] = useState(false);

    // In messages page, we don't select a campaign, so we might save without campaign_id or use context
    // For consistency, we'll try to use a default or null campaign if not applicable.
    // However, the Messages page DOES NOT have campaign selector currently.
    // We will save with null campaign_id.

    const handleSave = async () => {
        if (!generatedMessages || !user) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from('generated_content').insert({
                user_id: user.id,
                campaign_id: null, // Messages tool is standalone in this version
                type: 'message',
                title: context.slice(0, 50) + '...',
                content: generatedMessages
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
                    <MessageSquare className="h-6 w-6 text-yellow-400" />
                    Gerador de Mensagens
                </h1>
                <p className="text-gray-400 mt-1">Crie scripts prontos para usar no WhatsApp, Direct ou SMS.</p>
            </div>

            <div className="flex flex-col xl:flex-row gap-8 h-full">

                {/* Configuration Panel */}
                <div className="w-full xl:w-[400px] shrink-0 space-y-6">
                    {/* Context Input */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block">1. Contexto e Objetivo</label>
                        <textarea
                            value={context}
                            onChange={(e) => setContext(e.target.value)}
                            placeholder="Ex: Cliente parou de responder após eu enviar o orçamento. Quero reativar a conversa sem parecer chato."
                            className="w-full h-40 bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-400/50 resize-none"
                        />
                    </div>

                    {/* Tone Selector */}
                    <div className="glass p-6 rounded-2xl border border-white/5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 block">2. Tom de Voz</label>
                        <select
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-yellow-400/50"
                        >
                            <option>Persuasivo e Direto</option>
                            <option>Amigável e Casual</option>
                            <option>Corporativo e Sério</option>
                            <option>Urgente e Escasso</option>
                            <option>Empático e Compreensivo</option>
                        </select>
                    </div>

                    {/* Action Button */}
                    <button
                        onClick={handleGenerate}
                        disabled={!context || isGenerating}
                        className="w-full py-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-yellow-400/20"
                    >
                        {isGenerating ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Escrevendo...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <Send className="h-5 w-5" />
                                Gerar Opções
                            </div>
                        )}
                    </button>
                </div>

                {/* Result Panel */}
                <div className="flex-1 min-w-0">
                    {generatedMessages ? (
                        <div className="grid gap-6">
                            <div className="flex justify-end mb-2">
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                    {isSaving ? "Salvando..." : "Salvar Conversa"}
                                </button>
                            </div>
                            {generatedMessages.variations.map((variation: any, index: number) => (
                                <div key={index} className="glass rounded-2xl border border-white/5 p-6 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-xs font-bold uppercase tracking-wider text-yellow-500 bg-yellow-400/10 px-3 py-1 rounded-full border border-yellow-400/20">
                                            {variation.label}
                                        </span>
                                        <button
                                            onClick={() => handleCopy(variation.text, index)}
                                            className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 text-xs"
                                        >
                                            {copiedIndex === index ? (
                                                <><Check className="h-3.5 w-3.5 text-green-400" /> Copiado</>
                                            ) : (
                                                <><Copy className="h-3.5 w-3.5" /> Copiar</>
                                            )}
                                        </button>
                                    </div>
                                    <div className="bg-black/30 rounded-lg p-4 rounded-tl-none border border-white/5 relative">
                                        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
                                            {variation.text}
                                        </p>

                                        {/* Chat tail effect */}
                                        <div className="absolute -top-[1px] -left-[8px] w-2 h-2">
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-black/30 fill-current">
                                                <path d="M8 0V8H0L8 0Z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="h-full rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-12 text-center opacity-50">
                            <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <MessageSquare className="h-10 w-10 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-500 mb-2">Central de Mensagens</h3>
                            <p className="text-gray-600 max-w-sm">
                                Descreva o cenário e a IA criará várias opções de abordagem para você.
                            </p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
