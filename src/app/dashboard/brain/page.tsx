
"use client";

import { useState } from "react";
import { Upload, FileText, Sparkles, BrainCircuit, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function BrainPage() {
    const [voiceDescription, setVoiceDescription] = useState(
        "Meu tom é profissional mas acessível, focado em tecnologia e inovação. Gosto de usar analogias simples para explicar conceitos complexos. Evito jargões excessivos."
    );

    const [files, setFiles] = useState([
        { name: "Brand_Guidelines_2025.pdf", size: "2.4 MB", type: "PDF" },
        { name: "Best_Posts_LinkedIn.docx", size: "145 KB", type: "DOC" },
    ]);

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
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

                {/* Left Column: Voice & Persona */}
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
                            value={voiceDescription}
                            onChange={(e) => setVoiceDescription(e.target.value)}
                            placeholder="Ex: Eu escrevo de forma direta, uso emojis com moderação..."
                        />
                        <div className="flex justify-end mt-4">
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-white transition-colors">
                                Salvar Alterações
                            </button>
                        </div>
                    </section>

                    <section className="glass p-6 rounded-2xl border border-white/5">
                        <h3 className="text-sm font-semibold text-white mb-4">Arquétipos Detectados</h3>
                        <div className="flex flex-wrap gap-2">
                            {['O Sábio (Tech)', 'O Explorador', 'Tom: Otimista'].map(tag => (
                                <div key={tag} className="px-3 py-1 bg-electric/20 border border-electric/30 rounded-full text-xs text-electric">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Knowledge Base */}
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
                        <div className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all group mb-6">
                            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <Upload className="h-6 w-6 text-gray-400 group-hover:text-white" />
                            </div>
                            <p className="text-sm font-medium text-white">Clique para fazer upload</p>
                            <p className="text-xs text-gray-500 mt-1">PDF, DOCX, TXT (Max 10MB)</p>
                        </div>

                        {/* File List */}
                        <div className="flex-1 space-y-3">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group hover:border-white/10 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <FileText className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-200">{file.name}</p>
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
