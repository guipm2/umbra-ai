
"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, FileText, Sparkles, BrainCircuit, Trash2, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/auth-context";
import { useCachedQuery } from "@/hooks/use-cached-query";

export default function BrainPage() {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    // Unified Hook for Voice
    const { data: voiceDescription, refresh: refreshVoice } = useCachedQuery<string>({
        key: 'aura_brain_voice',
        fetcher: async () => {
            // Simulate Fetch (Placeholder for Phase 2 Integration)
            await new Promise(r => setTimeout(r, 500));
            return "Meu tom é profissional mas acessível...";
        },
        initialData: "",
        enabled: !!user
    });

    // Unified Hook for Files
    const { data: files = [], refresh: refreshFiles, setData: setFiles } = useCachedQuery<any[]>({
        key: 'aura_brain_files',
        fetcher: async () => {
            // Simulate Fetch (Placeholder for Phase 2 Integration)
            await new Promise(r => setTimeout(r, 500));
            return [
                { name: "Brand_Guidelines_2025.pdf", size: "2.4 MB", type: "PDF" },
                { name: "Best_Posts_LinkedIn.docx", size: "145 KB", type: "DOC" },
            ];
        },
        initialData: [],
        enabled: !!user
    });

    const [localVoice, setLocalVoice] = useState("");

    useEffect(() => {
        if (voiceDescription) setLocalVoice(voiceDescription);
    }, [voiceDescription]);

    const handleSaveVoice = async () => {
        // Update Cache
        localStorage.setItem('aura_brain_voice', localVoice);
        await refreshVoice();
        alert("Voz salva! (Localmente)");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8000/api/brain/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Falha no upload");

            const result = await response.json();
            if (result.status === "error") throw new Error(result.message);

            // Add to local list for immediate feedback
            const newFile = {
                name: file.name,
                size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                type: file.name.split('.').pop()?.toUpperCase() || "FILE"
            };

            // Update cache/state
            const currentFiles = files || [];
            setFiles([newFile, ...currentFiles]);

            alert(`Arquivo processado com sucesso: ${result.message}`);

        } catch (error: any) {
            console.error(error);
            alert(`Erro ao enviar arquivo: ${error.message}`);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-xl bg-electric/20 flex items-center justify-center">
                    <BrainCircuit className="h-6 w-6 text-neon" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">Brain Center</h1>
                    <p className="text-sm text-gray-400">Gerencie o conhecimento e a personalidade da sua IA.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Voice Section */}
                <div className="space-y-6">
                    <section className="glass p-6 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 mb-4 text-neon">
                            <Sparkles className="h-4 w-4" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider">Definição de Voz</h2>
                        </div>
                        <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                            Descreva como você quer que a IA soe. Cole exemplos de textos seus ou descreva seus traços de personalidade.
                        </p>
                        <textarea
                            className="w-full h-48 bg-black/50 border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-neon/50 transition-colors resize-none leading-relaxed"
                            value={localVoice}
                            onChange={(e) => setLocalVoice(e.target.value)}
                            placeholder="Ex: Eu escrevo de forma direta, uso emojis com moderação..."
                        />
                        <div className="flex justify-end mt-4">
                            <button onClick={handleSaveVoice} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors">
                                Salvar Alterações
                            </button>
                        </div>
                    </section>
                </div>

                {/* Knowledge Base Section */}
                <div className="space-y-6">
                    <section className="glass p-6 rounded-2xl border border-white/5 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2 text-blue-400">
                                <FileText className="h-4 w-4" />
                                <h2 className="text-sm font-semibold uppercase tracking-wider">Base de Conhecimento</h2>
                            </div>
                            <span className="text-xs text-gray-500">{files.length} arquivos</span>
                        </div>

                        {/* Upload Area */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-neon/30 hover:bg-white/5 transition-all mb-6 group"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileUpload}
                                accept=".pdf,.doc,.docx,.txt,.md"
                            />
                            <div className="h-10 w-10 rounded-full bg-white/5 group-hover:bg-neon/10 flex items-center justify-center mb-3 transition-colors">
                                {uploading ? (
                                    <Loader2 className="h-5 w-5 text-neon animate-spin" />
                                ) : (
                                    <Upload className="h-5 w-5 text-gray-400 group-hover:text-neon" />
                                )}
                            </div>
                            <p className="text-sm font-medium text-white group-hover:text-neon transition-colors">
                                {uploading ? "Processando..." : "Clique para fazer upload"}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT (Max 10MB)</p>
                        </div>

                        {/* Files List */}
                        <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-200 truncate max-w-[200px]">{file.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase">{file.type} • {file.size}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
