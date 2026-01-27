
"use client";

import { motion } from "framer-motion";
import { Scan, Search, Wand2 } from "lucide-react";

export function ProcessSection() {
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center gap-16">

                    {/* Visual: Neon Magnifying Glass Concept */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2 relative"
                    >
                        <div className="relative aspect-square max-w-md mx-auto">
                            {/* Profile Card Mockup */}
                            <div className="absolute inset-x-8 inset-y-16 bg-white/5 rounded-2xl border border-white/10 p-6 backdrop-blur-md">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-16 w-16 rounded-full bg-white/10 animate-pulse" />
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 bg-white/10 rounded" />
                                        <div className="h-3 w-24 bg-white/5 rounded" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-3 w-full bg-white/5 rounded" />
                                    <div className="h-3 w-5/6 bg-white/5 rounded" />
                                    <div className="h-3 w-4/6 bg-white/5 rounded" />
                                </div>
                            </div>

                            {/* Magnifying Glass Overlay */}
                            <motion.div
                                animate={{
                                    x: [0, 40, 0],
                                    y: [0, -40, 0],
                                    rotate: [0, 5, 0]
                                }}
                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute inset-0 z-20 pointer-events-none"
                            >
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full border-2 border-neon bg-electric/10 backdrop-blur-sm shadow-[0_0_50px_rgba(224,130,255,0.2)] flex items-center justify-center">
                                    <Scan className="h-12 w-12 text-neon animate-pulse" />
                                </div>
                                <div className="absolute top-1/2 left-1/2 h-32 w-2 bg-gradient-to-b from-neon to-transparent origin-top rotate-45 translate-x-20 translate-y-20 opacity-50" />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Copy */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="w-full md:w-1/2"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <span className="p-2 rounded-lg bg-electric/20 text-neon">
                                <Search className="h-5 w-5" />
                            </span>
                            <span className="text-sm font-medium text-electric tracking-wider uppercase">Deep Scan</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Nós não apenas postamos. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neon">
                                Nós aprendemos quem você é.
                            </span>
                        </h2>

                        <p className="text-lg text-gray-400 leading-relaxed mb-8">
                            Através de um "Deep Scan" no seu perfil, nossa IA mapeia seu vocabulário, tom de voz e pilares de conteúdo.
                            O resultado? Uma presença digital que soa <strong className="text-white">100% como você</strong>,
                            mas com a eficiência da automação.
                        </p>

                        <ul className="space-y-4">
                            {[
                                "Análise de Arquétipos de Personalidade",
                                "Mapeamento de Tópicos de Autoridade",
                                "Detecção de Nuances de Escrita"
                            ].map((item) => (
                                <li key={item} className="flex items-center gap-3 text-gray-300">
                                    <Wand2 className="h-4 w-4 text-neon" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
